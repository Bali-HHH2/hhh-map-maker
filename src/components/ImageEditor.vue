<template>
  <div class="image-editor-container" :class="{ 'no-interact': !(editable && isMoving) }">
    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as fabric from "fabric"; // v6

const MAX_IMAGE_SIDE = 1200;

const props = defineProps<{
  editable: boolean
  images?: object
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isMoving = ref<boolean>(false);

// Fabric canvas instance
let fabricCanvas: fabric.Canvas | null = null;

// Component lifecycle
onMounted(async () => {
  await nextTick();
  initializeCanvas();
  setupResizeObserver();
  if (props.images) {
    await fabricCanvas?.loadFromJSON(props.images);
    fabricCanvas?.requestRenderAll();
  }
});

onUnmounted(() => {
  if (fabricCanvas) {
    fabricCanvas.dispose();
  }
});

// Initialize Fabric.js canvas
const initializeCanvas = (): void => {
  if (!canvasRef.value) return;

  const w = document.querySelector(".image-editor-container")?.parentElement?.clientWidth;
  const h = document.querySelector(".image-editor-container")?.parentElement?.clientHeight;

  fabricCanvas = new fabric.Canvas(canvasRef.value, {
    backgroundColor: null,
    selection: true,
    preserveObjectStacking: true,
    height: h,
    width: w
  });

  // Set initial canvas size
  resizeCanvas();

  // Configure object controls
  fabric.Object.prototype.set({
    cornerColor: "#2563eb",
    cornerStyle: "circle",
    borderColor: "#2563eb",
    cornerSize: 8,
    transparentCorners: false,
    borderScaleFactor: 2
  });
};

// Resize canvas to fill parent container
const resizeCanvas = (): void => {
  if (!fabricCanvas || !canvasRef.value) return;

  const container = canvasRef.value.parentElement;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();

  fabricCanvas.setDimensions({
    width: containerRect.width,
    height: containerRect.height
  });

  fabricCanvas.renderAll();
};

// Setup resize observer to handle container size changes
const setupResizeObserver = (): void => {
  if (!canvasRef.value) return;

  const container = canvasRef.value.parentElement;
  if (!container) return;

  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });

  resizeObserver.observe(container);
};

const addImages = async (files: FileList) => {
  const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
  await Promise.all(images.map(loadImage));
  isMoving.value = true;
};

// Shrinks big photos so the saved edits stay small.
const shrinkToDataUrl = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.85);
};

// Load and add image to canvas
const loadImage = async (file: File) => {
  const image = await fabric.Image.fromURL(await shrinkToDataUrl(file));
  if (!fabricCanvas) return;

  // Scale image to fit reasonably on canvas
  const canvasWidth = fabricCanvas.getWidth();
  const canvasHeight = fabricCanvas.getHeight();
  const maxSize = Math.min(canvasWidth, canvasHeight) * 0.3;

  const scale = Math.min(
    maxSize / (image.width || 1),
    maxSize / (image.height || 1)
  );

  image.set({
    scaleX: scale,
    scaleY: scale,
    left: Math.random() * (canvasWidth * 0.5),
    top: Math.random() * (canvasHeight * 0.5)
  });

  // Add the image to canvas
  fabricCanvas.add(image);
  fabricCanvas.setActiveObject(image);
  fabricCanvas.renderAll();
};

const toggleMoving = () => {
  isMoving.value = !isMoving.value;
  if (isMoving.value) return;
  fabricCanvas?.discardActiveObject();
  fabricCanvas?.renderAll();
};

// Clear all objects from canvas
const clearCanvas = (): void => {
  if (!fabricCanvas) return;
  fabricCanvas.clear();
  fabricCanvas.set("backgroundColor", "transparent").requestRenderAll();
};

defineExpose({
  isMoving,
  addImages,
  toggleMoving,
  clearCanvas,
  getCanvasData: () => fabricCanvas?.toJSON()
});
</script>

<style scoped>
.image-editor-container {
  z-index: 99999999999999;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-interact {
  pointer-events: none;
}

.canvas-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
}

canvas {
  background: transparent;
  display: block;
  border-radius: 8px;
  width: 100%;
  height: 100%;
}
</style>
