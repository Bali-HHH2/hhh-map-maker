<template>
  <button v-show="!isReady && !showCtrls" @click="showCtrls = true" class="add-images-btn">
    Add images
  </button>
  <div class="image-editor-container" :class="{ 'is-done': isReady || isReady && !showCtrls }">
    <!-- File input for adding images -->
    <div class="controls">
      <div v-show="!isReady && showCtrls">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          @change="handleFileUpload"
          class="file-input"
        />
        <button @click="triggerFileInput" class="upload-btn">
          Select Images
        </button>
        <button @click="clearCanvas" class="clear-btn">
          Clear All
        </button>
        <button @click="onReady" class="done-btn">
          Done
        </button>
      </div>
    </div>

    <!-- Fabric.js canvas container -->
    <div class="canvas-container">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as fabric from "fabric"; // v6

// Template refs
const canvasRef = ref<HTMLCanvasElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isReady = ref<boolean>(false);
const showCtrls = ref<boolean>(false);

// Fabric canvas instance
let fabricCanvas: fabric.Canvas | null = null;

// Component lifecycle
onMounted(async () => {
  await nextTick();
  initializeCanvas();
  setupResizeObserver();
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

// Trigger file input click
const triggerFileInput = (): void => {
  fileInput.value?.click();
};

// Handle file upload
const handleFileUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || !fabricCanvas) return;

  Array.from(files).forEach(async (file) => {
    if (file.type.startsWith("image/")) {
      await loadImage(file);
    }
  });

  // Clear the input so the same file can be selected again
  target.value = "";
};

// Load and add image to canvas
const loadImage = async (file: File) => {
  const reader = new FileReader();

  reader.onload = async (e) => {
    const imageUrl = e.target?.result as string;

    const image = await fabric.Image.fromURL(imageUrl, {}, {});
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

  reader.readAsDataURL(file);
};

const onReady = () => {
  isReady.value = true;
  fabricCanvas?.discardActiveObject()
  fabricCanvas?.renderAll()
};

// Clear all objects from canvas
const clearCanvas = (): void => {
  if (!fabricCanvas) return;
  fabricCanvas.clear();
  fabricCanvas.set("backgroundColor", "transparent").requestRenderAll();
};

// Expose methods if needed by parent components
defineExpose({
  clearCanvas,
  getCanvasData: () => fabricCanvas?.toJSON(),
  loadCanvasData: (data: any) => {
    if (fabricCanvas) {
      fabricCanvas.loadFromJSON(data, fabricCanvas.renderAll.bind(fabricCanvas));
    }
  }
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

.is-done {
  pointer-events: none;
}

.controls {
  transform: translate(-300px);
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.file-input {
  display: none;
}

.add-images-btn,
.done-btn,
.upload-btn,
.clear-btn {
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upload-btn:hover,
.clear-btn:hover {
  background: #1d4ed8;
}

.clear-btn {
  background: #dc2626;
}

.clear-btn:hover {
  background: #b91c1c;
}

.done-btn {
  background: green;
}

.add-images-btn {
  position: absolute;
  left: -20%
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
