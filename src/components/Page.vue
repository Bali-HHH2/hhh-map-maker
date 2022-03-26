<template>
  <div class="A4">
    <div>{{mapParameters.runsiteName}}</div>
    <div>{{mapParameters.coords}}</div>
    <div>{{mapParameters.googleMaps}}</div>
    <div>{{mapParameters.hare}}</div>
    <Map v-if="mapParameters.coords" :map-coords="mapParameters.coords"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Map from "./Map.vue";

interface mapParameters {
  coords: string,
  googleMaps: string,
  runsiteName: string,
  hare: string,
}

defineProps<{ mapParameters: mapParameters }>()
</script>

<style scoped>
.A4 {
  background: white;
  width: 21cm;
  height: 29.7cm;
  display: block;
  margin: 0 auto 0.5cm;
  box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
}
@media print {
  body, .A4 {
    margin: 0;
    box-shadow: none;
  }
}
</style>
