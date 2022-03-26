<template>
<!--  <img alt="Vue logo" src="./assets/logo.png" />-->
  <Page
    v-if="mapParameters"
    :mapParameters="mapParameters"
  />
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Page from './components/Page.vue'
import {onMounted, ref} from "vue";

const mapParameters = ref()

onMounted(() => {
  const mapParams = new URLSearchParams(window.location.search)
  if (mapParams.get('coords')) {
    mapParameters.value = {
      coords: mapParams.get('coords'),
      googleMaps: mapParams.get('googleMaps'),
      runsiteName: mapParams.get('runsiteName'),
      hare: mapParams.get('hare'),
    };
  }
  console.log(mapParameters.value, 'runsite found!');
});
</script>

<style>
html, body {
  background-color: #2c2c2c;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
