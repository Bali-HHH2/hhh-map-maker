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
import Form from './components/Form.vue'
import {computed, onBeforeMount, onMounted, ref} from "vue";
import getHairLine from "./utils/getHairLine";
import convert from 'geo-coordinates-parser'

const mapParameters = ref()
// const formSubmitted = ref()

// const onFormSubmit = (formData: any) => {
//   console.log(formData);
//   mapParameters.value = formData
//   // formSubmitted.value = true
// }

const hairLine = ref()
const filteredHareLine = computed(() => hairLine.value?.slice(1))
const currentRunInfo = computed(() => {
  const currentRun = hairLine?.value[0]
  const coordinates = () => {
    const converted = convert(currentRun[5])
    console.log(converted);
    return [converted.verbatimLongitude, converted.verbatimLatitude]
  }
  return {
    number: currentRun[0],
    date: currentRun[1],
    hares: currentRun[2],
    googleMapsLink: `https://google.com/maps/place/${coordinates()[1]},${coordinates()[0]}`,
    occasion: currentRun[3],
    runSiteName: currentRun[4],
    coordinates: coordinates(),
    filteredHareLine: filteredHareLine.value,
    startTime: currentRun[6],
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
