<template>
<!--  <img alt="Vue logo" src="./assets/logo.png" />-->
  <Form
    v-if="!formSubmitted"
    :on-form-submit="onFormSubmit"
  />
  <Page
    v-if="mapParameters && formSubmitted"
    :mapParameters="mapParameters"
  />
</template>

<script setup lang="ts">
import Page from './components/Page.vue'
import Form from './components/Form.vue'
import { onMounted, ref } from "vue";

const mapParameters = ref()
const formSubmitted = ref()

// onMounted(() => {
//   const mapParams = new URLSearchParams(window.location.search)
//   if (mapParams.get('coords')) {
//     mapParameters.value = {
//       coords: mapParams.get('coords'),
//       googleMaps: mapParams.get('googleMaps'),
//       runsiteName: mapParams.get('runsiteName'),
//       hare: mapParams.get('hare'),
//     };
//   }
//   console.log(mapParameters.value, 'runsite found!');
// });

const onFormSubmit = (formData: any) => {
  console.log(formData);
  mapParameters.value = formData
  formSubmitted.value = true
}
</script>

<style>
html, body {
  background-color: #2c2c2c;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
