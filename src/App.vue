<template>
  <button class="print-button" @click="print">Print Map</button>
  <button class="past-map-button" @click="showPreviousRuns = !showPreviousRuns">
    View Past Maps
  </button>
  <button ref="copyDetailsButton" class="copy-details-button" @click="onCopyToClipboard">
    Copy Run Info
  </button>
  <HareLine
    v-if="showPreviousRuns"
    :hare-line="fullHairLine"
    :showing-previous-runs="true"
    :on-click-previous-run="onClickPreviousRun"
    @close="showPreviousRuns = false"
  />
  <Page
    v-if="hairLine && !showPreviousRuns"
    :currentRunInfo="currentRunInfo"
    :mismanagement="mismanagement"
  />
  <div class="loading" v-else>
    <h1>Loading...</h1>
  </div>
</template>

<script setup lang="ts">
import Page from './components/Page.vue'
import { onBeforeMount, ref } from 'vue'
import getHareLine from './utils/getHareLine'
import { subDays } from 'date-fns'
import { currentRun, formRunObject } from './utils/currentRun'
import HareLine from './components/HareLine.vue'
import copyRunDetailsToClipboard from './utils/create-copy-text'
import delay from "./utils/delay";

const print = () => window.print()

const fullHairLine = ref()
const hairLine = ref()
const showPreviousRuns = ref()
const currentRunInfo = ref()
const mismanagement = ref()
const copyDetailsButton = ref()

const onClickPreviousRun = (run: string[]) => {
  if (!showPreviousRuns.value) return
  currentRunInfo.value = formRunObject(run, fullHairLine)
  showPreviousRuns.value = false
}

const onCopyToClipboard = async () => {
  await copyRunDetailsToClipboard(currentRunInfo.value)
  copyDetailsButton.value.style.backgroundColor = 'green'
  await delay(1000)
  copyDetailsButton.value.style.backgroundColor = 'unset'
}

onBeforeMount(async () => {
  const unfilteredHareLine = await getHareLine()
  // Mismanagement is on 1F on the hareline sheet
  mismanagement.value = unfilteredHareLine?.[0]?.[5] || undefined
  fullHairLine.value = unfilteredHareLine.filter(
    (e: string[]) =>
      // First items needs to be a run number, and the rest need to be present to be a valid run.
      parseInt(e[0]) && e[1] && e[2] && e[3] && e[5]
  )
  hairLine.value = unfilteredHareLine.filter(
    (value: string[]) =>
      parseInt(value[0]) > 1500 &&
      value[2] &&
      new Date(value?.[1]) >= subDays(new Date(), 1)
  )
  currentRunInfo.value = currentRun(hairLine)
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

html,
body {
  height: 100%;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100%;
  .loading {
    text-align: center;
  }
  .print-button,
  .past-map-button,
  .copy-details-button {
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;
    z-index: 100;
    margin: 10px;
  }
  .past-map-button {
    right: 0;
    left: unset;
    width: auto;
  }
  .copy-details-button {
    bottom: unset;
    top: 0;
    @media screen and (max-width: 800px) {
      display: none;
    }
  }
}
</style>
