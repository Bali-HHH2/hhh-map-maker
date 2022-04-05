<template>
  <div v-if="mapCoords" id="map" class="map-container">
  </div>
  <div v-else class="map-container__no-map">
    <h3 v-if="!mapCoords">No map coordinates published yet...</h3>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, toRefs} from 'vue'
import mapboxgl from 'mapbox-gl'
import getRoute from "../utils/getMapBoxDirections";

const props = defineProps({
  mapCoords: String,
});
const { mapCoords } = toRefs(props);

onMounted(async () => {
  if (!mapCoords?.value) return;
  mapboxgl.accessToken = 'pk.eyJ1IjoiYmhoaDIiLCJhIjoiY2wxODFieDlpMDkzNTNjcXY4MGZja3VqOCJ9.L660Ro6Iyqfk-k-EDfCscA';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: mapCoords?.value, // starting position [lng, lat]
    zoom: 12.3, // starting zoom
  })
  // map.on('load', async () => {
  //   await getRoute(map, mapCoords?.value, mapboxgl.accessToken);
  // });
  map.on('idle', () => {
    map.setLayoutProperty('land', 'visibility', 'none');
    map.setLayoutProperty('hillshade', 'visibility', 'none');
  });
});
</script>

<style lang="scss">
  .map-container, .map-container__no-map {
    width: 100%;
    height: 500px;
    h3 {
      color: #000 !important;
    }
    canvas {
      filter: invert(1);
    }
  }

  .map-container__no-map {
    display: grid;
    place-items: center;
  }

  .mapboxgl-control-container {
    display: none;
  }

  .hash-marker {
    background-image: url('../assets/pin.png');
    background-size: cover;
    width: 100px;
    height: 200px;
  }
</style>
