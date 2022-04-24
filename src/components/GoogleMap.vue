<template>
  <div class="map" v-if="mapCoords">
    <img class="compass" src="../assets/compass.png" alt="Prost Compass">
    <div id="map" class="map-container"></div>
  </div>
  <div v-else class="map-container__no-map">
    <h3 v-if="!mapCoords">No map coordinates published yet...</h3>
    <img src="../assets/map-placeholder.jpg" alt="No Map available yet">
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
const lat = parseFloat(mapCoords.value?.[1])
const lng = parseFloat(mapCoords.value?.[0])

onMounted(async () => {
  const loader = new Loader({
    apiKey: "AIzaSyBu5XBrgLw5AE4dFw5hoYHdfc72-5T5lAk",
    version: "weekly",
  });
  if (!lat || !lng) return;
  loader.load().then(() => {
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: { lat, lng },
      zoom: 15,
    });
    new google.maps.Marker({
      position: { lat, lng },
      map,
      icon: mapMarker2,
    });
  });
});
</script>

<style lang="scss">
.map {
  position: relative;
  .compass {
    position: absolute;
    height: 160px;
    bottom: 10px;
    width: auto;
    left: 10px;
    z-index: 1;
    filter: drop-shadow(0px 0px 2px #fff);
  }
}
  .map-container, .map-container__no-map {
    width: 100%;
    height: 600px;
    h3 {
      position: absolute;
      color: #000 !important;
      z-index: 1;
    }
    img {
      width: 100%;
    }
  }

  .map-container__no-map {
    display: grid;
    place-items: center;
    img {
      filter: blur(9px);
    }
  }
</style>
