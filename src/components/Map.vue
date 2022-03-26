<template>
  <div id="map" class="map-container">
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
const latLng = mapCoords.value.split(',');

onMounted(async () => {
  const coordinates = [latLng[1], latLng[0]]
  mapboxgl.accessToken = 'pk.eyJ1IjoiYmhoaDIiLCJhIjoiY2wxODFieDlpMDkzNTNjcXY4MGZja3VqOCJ9.L660Ro6Iyqfk-k-EDfCscA';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 12.3, // starting zoom
  })
  map.on('load', async () => {
    await getRoute(map, coordinates, mapboxgl.accessToken);

    map.addLayer({
      id: 'point',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: coordinates
              }
            }
          ]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#3887be'
      }
    });
  });
  map.on('idle', () => {
    map.setLayoutProperty('land', 'visibility', 'none');
    map.setLayoutProperty('hillshade', 'visibility', 'none');
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map);
  });
});
</script>

<style lang="scss">
  .map-container {
    width: 80%;
    height: 600px;
    canvas {
      //filter: invert(1);
    }
  }

  .mapboxgl-control-container {
    display: none;
  }

  .hash-marker {
    background-image: url('../assets/pin.png');
    background-size: cover;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
  }
</style>
