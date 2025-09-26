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
import { onMounted, toRefs, ref, watch, computed } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import mapMarker2 from "../assets/pin2.png";

// Vars

let map: google.maps.Map;
let marker: google.maps.Map;

const props = defineProps({
  mapCoords: Array
});

const lat = computed(() => parseFloat(props.mapCoords?.[1] as string));
const lng = computed(() => parseFloat(props.mapCoords?.[0] as string));

// Data

const mapContainer = ref();
const googleMap = ref();

// Methods

const openMapInNewTab = () => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat.value},${lng.value}`);
};

const setupMap = () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLEMAPS_API_KEY as string,
    version: "weekly"
  });
  if (!lat.value || !lng.value) return;

  loader.load().then(() => {
    map = new google.maps.Map(googleMap.value, {
      center: { lat: lat.value, lng: lng.value },
      zoom: 15
    });
    marker = new google.maps.Marker({
      position: { lat: lat.value, lng: lng.value },
      map,
      icon: mapMarker2
    });
    window.map = map;

    console.log(map);

    // Check if the print param is passed to the page.
    google.maps.event.addListenerOnce(map, "tilesloaded", () => {
      if (window.location.href.includes("print")) {
        const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
        if (!isFirefox) {
          window.print();
        }
      } else if (window.location.href.includes("screenshot")) {
        window.map.setOptions({ disableDefaultUI: true });
      }
    });
  });
};

// Hooks

onMounted(async () => {
  setupMap();
});

watch(() => props.mapCoords, () => {
  console.log(lat.value, lng.value);
  map.panTo({ lat: lat.value, lng: lng.value });
  map.setZoom(15)
  marker.setPosition({ lat: lat.value, lng: lng.value })
});
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
