<template>
<!--  <img alt="Vue logo" src="./assets/logo.png" />-->
<!--  <Form-->
<!--    v-if="!formSubmitted"-->
<!--    :on-form-submit="onFormSubmit"-->
<!--  />-->
  <button class="print-button" @click="print">Print Map</button>
  <Page
    v-if="hairLine"
    :currentRunInfo="currentRunInfo"
  />
  <div class="loading" v-else>
    <h1>
      Loading...
    </h1>
  </div>
</template>

<script setup lang="ts">
import Page from './components/Page.vue'
// import Form from './components/Form.vue'
import {computed, onBeforeMount, onMounted, ref} from "vue";
import getHairLine from "./utils/getHairLine";
import convert from 'geo-coordinates-parser'

const print = () => window.print()

const hairLine = ref()
const filteredHareLine = computed(() => hairLine.value?.slice(1))
const currentRunInfo = computed(() => {
  const currentRun = hairLine?.value[0]
  const coordinates = () => {
    if (!currentRun[5]) return null
    const converted = convert(currentRun[5])
    return [converted.verbatimLongitude, converted.verbatimLatitude]
  }
  const number = currentRun[0] || '?'
  const date = currentRun[1] || '?'
  const hares = currentRun[2] || '?'
  const googleMapsLink = currentRun[5] ? `https://www.google.com/maps/search/?api=1&query=${coordinates()[1]},${coordinates()[0]}` : '#'
  const occasion = currentRun[3] || '?'
  const runSiteName = currentRun[4] || 'Waiting on hares...'
  const startTime = currentRun[6] || '?'
  document.title = `BHHH2 Run #${number} - ${runSiteName}`
  return {
    number,
    date,
    hares,
    googleMapsLink,
    occasion,
    runSiteName,
    coordinates: coordinates(),
    filteredHareLine: filteredHareLine.value,
    startTime,
  }
})

onBeforeMount(async () => {
  hairLine.value = await getHairLine()
})
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');

html, body {
  background-color: #2c2c2c;
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
  .print-button {
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
}
</style>
