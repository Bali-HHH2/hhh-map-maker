<template>
  <div class="map" ref="mapContainer" v-if="mapCoords" @click="openMapInNewTab">
    <img class="compass" src="../assets/compass.png" alt="Prost Compass" />
    <div id="map" ref="googleMap" class="map-container"></div>
  </div>
  <div v-else class="map-container__no-map">
    <h3 v-if="!mapCoords">No map coordinates published yet...</h3>
    <img src="../assets/map-placeholder.jpg" alt="No Map available yet" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRefs, ref } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import mapMarker2 from '../assets/pin2.png'

// Vars

let map: google.maps.Map
const props = defineProps({
  mapCoords: Array
})
const { mapCoords } = toRefs(props)
const lat = parseFloat(mapCoords?.value?.[1] as string)
const lng = parseFloat(mapCoords?.value?.[0] as string)

// Data

const mapContainer = ref()
const googleMap = ref()

// Methods

const openMapInNewTab = () => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`)
}

// Hooks

onMounted(async () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLEMAPS_API_KEY as string,
    version: 'weekly'
  })
  if (!lat || !lng) return
  loader.load().then(() => {
    map = new google.maps.Map(googleMap.value, {
      center: { lat, lng },
      zoom: 15
    })
    new google.maps.Marker({
      position: { lat, lng },
      map,
      icon: mapMarker2
    })
    window.map = map

    // Check if the print param is passed to the page.
    google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
      if (window.location.href.includes('print')) {
        window.print()
      } else if (window.location.href.includes('screenshot')) {
        window.map.setOptions({ disableDefaultUI: true })
      }
    })
  })
})
</script>

<style lang="scss">
@import '../style/Global.module.scss';

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

.map-container,
.map-container__no-map {
  width: 100%;
  height: 590px;
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

@include mobile {

}
</style>
