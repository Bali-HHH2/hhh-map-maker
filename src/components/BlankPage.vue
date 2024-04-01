<template>
  <div class="A4-container">
    <div v-show="isPrintMode" class="A4--canvas" ref="pageCanvas">
      <!--
          This div will contain a canvas that contains an image of the original interactive page below, it is only
          shown when the print button or shortcut are pressed, we do this because the PDF creator tries to vectorize
          the typewriter font we use and causes huge PDF file sizes. If we raster the whole div into an image first
          with html2canvas and print that to PDF, it will skip vectorization of the font and result in ~700kb vs ~10mb.
          These links aren't visible but are overlay links on top of the canvas so we can keep clickable links on the
          raster image
         -->
    </div>

    <div v-show="!isPrintMode" class="A4" ref="realPage">
      <Title>Example</Title>
      <hr />
      <div class="main-info main-info--blank">
        <p></p>
        <p></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Title from './Title.vue'
import { ref } from 'vue'
import delay from '../utils/delay'
import html2canvas from 'html2canvas'

// Data

const pageCanvas = ref()
const realPage = ref()
const isPrintMode = ref(false)

// Methods

const onBeforePrint = async () => {
  await delay(500)
  const canvas = await html2canvas(realPage.value, {
    backgroundColor: null,
    useCORS: true
  })
  pageCanvas.value.appendChild(canvas)
  isPrintMode.value = true // This hides the original interactive page and shows the imaged version
}

const onAfterPrint = async () => {
  isPrintMode.value = false
}

// Overwrite print function then call it after copying map div to image.
const _print = window.print
window.print = async function () {
  await onBeforePrint()
  _print()
}

// Remove the canvas and show the map again after printing.
window.onafterprint = function () {
  onAfterPrint()
}
</script>

<style scoped lang="scss">
@import '../style/Global.module.scss';

.A4-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 30px;

  @include mobile {
    padding: 0;
  }
}

.A4--canvas {
  @extend .A4;
}

.A4 {
  position: relative;
  background: white;
  width: 21cm;
  height: auto;
  display: block;
  margin: 0 auto;
  box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
  hr {
    width: 90%;
    border-top: 2px solid #0ca501;
  }
  @include mobile {
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
    .main-info {
      font-size: unset;
      margin: 0 18px;
    }
  }
}

.main-info {
  font-family: 'Special Elite', cursive;
  font-weight: 600;
  color: #0ca501;
}

.main-info {
  margin: 0 40px;
  padding-bottom: 40px;
  font-size: 20px;
  display: block;
  &--blank {
    display: block;
    text-align: left;
  }
}

@media print {
  body,
  .A4 {
    margin: 0;
    box-shadow: none;
  }
  .A4-container {
    padding: 0 !important;
  }
  .map,
  .map-container {
    height: 15.5cm !important;
  }
  .print-button,
  .past-map-button,
  .copy-details-button {
    display: none;
  }
}
</style>
