<template>
  <div class="map" :class="{ 'map--full-page': fullPage }" ref="mapContainer" v-if="showMap" @click="handleMapClick">
    <img class="compass" src="../assets/compass.png" alt="Prost Compass" />
    <div ref="googleMap" class="map-container"></div>
  </div>
  <div v-else class="map-container__no-map">
    <h3 v-if="!mapCoords">No map coordinates published yet...</h3>
    <img src="../assets/map-placeholder.jpg" alt="No Map available yet" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import type { PropType } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import mapMarker2 from "../assets/pin2.png";
import footMarker from "../assets/foot.png";

interface LatLng {
  lat: number;
  lng: number;
}

// Vars

let map: google.maps.Map;
let marker: google.maps.Marker;

const props = defineProps({
  mapCoords: Array,
  pins: {
    type: Array as PropType<LatLng[]>,
    default: () => []
  },
  fullPage: {
    type: Boolean,
    default: false
  }
});

const lat = computed(() => parseFloat(props.mapCoords?.[1] as string));
const lng = computed(() => parseFloat(props.mapCoords?.[0] as string));
const showMap = computed(() => props.mapCoords || props.pins.length > 0);

// Data

const mapContainer = ref();
const googleMap = ref();

// Methods

const openMapInNewTab = () => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat.value},${lng.value}`);
};

const handleMapClick = () => {
  if (!props.pins.length) {
    openMapInNewTab();
  }
};

const setupMap = () => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLEMAPS_API_KEY as string,
    version: "weekly"
  });

  const hasPins = props.pins.length > 0;
  if (!hasPins && (!lat.value || !lng.value)) return;

  loader.load().then(() => {
    const center = hasPins
      ? { lat: props.pins[0].lat, lng: props.pins[0].lng }
      : { lat: lat.value, lng: lng.value };

    map = new google.maps.Map(googleMap.value, {
      center,
      zoom: 15,
      styles: [
        { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] }
      ]
    });

    if (hasPins) {
      const bounds = new google.maps.LatLngBounds();
      props.pins.forEach(pin => {
        new google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map,
          icon: footMarker,
          scale: 0.1
        });
        bounds.extend({ lat: pin.lat, lng: pin.lng });
      });
      map.fitBounds(bounds);
    } else {
      marker = new google.maps.Marker({
        position: { lat: lat.value, lng: lng.value },
        map,
        icon: footMarker,
        scale: 0.1
      });
    }

    window.map = map;

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
  if (props.pins.length) return;
  console.log(lat.value, lng.value);
  map.panTo({ lat: lat.value, lng: lng.value });
  map.setZoom(15);
  marker.setPosition({ lat: lat.value, lng: lng.value });
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

  &--full-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 500;

    .map-container {
      height: 100% !important;
    }
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
