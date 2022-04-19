<template>
  <div v-if="mapCoords" id="map" class="map-container">
  </div>
  <div v-else class="map-container__no-map">
    <h3 v-if="!mapCoords">No map coordinates published yet...</h3>
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRefs } from 'vue'
import { Loader } from "@googlemaps/js-api-loader"
import mapMarker from '../assets/pin.png'
import mapMarker2 from '../assets/pin2.png'

const props = defineProps({
  mapCoords: Array,
});
const { mapCoords } = toRefs(props);
const lat = parseFloat(mapCoords.value[1])
const lng = parseFloat(mapCoords.value[0])

onMounted(async () => {
  const loader = new Loader({
    apiKey: "AIzaSyBu5XBrgLw5AE4dFw5hoYHdfc72-5T5lAk",
    version: "weekly",
    // ...additionalOptions,
  });

  loader.load().then(() => {
    console.log(lat, lng);
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: { lat, lng },
      zoom: 15,
    });
    const hashMarker = new google.maps.Marker({
      position: { lat, lng },
      map,
      icon: mapMarker2,
    });
  });

  // if (!mapCoords?.value) return;
  // mapboxgl.accessToken = 'pk.eyJ1IjoiYmhoaDIiLCJhIjoiY2wxODFieDlpMDkzNTNjcXY4MGZja3VqOCJ9.L660Ro6Iyqfk-k-EDfCscA';
  // const map = new mapboxgl.Map({
  //   container: 'map', // container ID
  //   style: 'mapbox://styles/mapbox/streets-v11', // style URL
  //   center: mapCoords?.value, // starting position [lng, lat]
  //   zoom: 12.3, // starting zoom
  // })
  // map.on('load', async () => {
  //   await getRoute(map, mapCoords?.value, mapboxgl.accessToken);
  // });
  // map.on('idle', () => {
  //   map.setLayoutProperty('land', 'visibility', 'none');
  //   map.setLayoutProperty('hillshade', 'visibility', 'none');
  // });
});
</script>

<style lang="scss">
  .map-container, .map-container__no-map {
    width: 100%;
    height: 600px;
    h3 {
      color: #000 !important;
    }
  }

  .map-container__no-map {
    display: grid;
    place-items: center;
  }
</style>
