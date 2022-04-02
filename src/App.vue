<template>
<!--  <img alt="Vue logo" src="./assets/logo.png" />-->
<!--  <Form-->
<!--    v-if="!formSubmitted"-->
<!--    :on-form-submit="onFormSubmit"-->
<!--  />-->
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

const hairLine = ref()
const filteredHareLine = computed(() => hairLine.value?.slice(1))
const currentRunInfo = computed(() => {
  const currentRun = hairLine?.value[0]
  const coordinates = () => {
    if (!currentRun[5]) return null
    const converted = convert(currentRun[5])
    return [converted.verbatimLongitude, converted.verbatimLatitude]
  }
  const number = currentRun[0] ?? '?'
  const date = currentRun[1] ?? '?'
  const hares = currentRun[2] ?? '?'
  const googleMapsLink = currentRun[5] ? `https://google.com/maps/place/${coordinates()[1]},${coordinates()[0]}` : '#'
  const occasion = currentRun[3] ?? '?'
  const runSiteName = currentRun[4] ?? '?'
  const startTime = currentRun[6] ?? '?'
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
}
</style>
