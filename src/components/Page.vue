<template>
  <div class="A4-container">
    <div class="A4">
      <div class="title">
        <img src="../assets/logo.png" alt="">
        <div class="title__text">
          <p>Bali Hash House Harriers 2</p>
          <p>Next Run Map</p>
        </div>
      </div>
      <hr>
      <div class="main-info">
        <div class="main-info__left">
          <div>Run: #{{currentRunInfo.number}}</div>
          <div>
            Date: {{currentRunInfo.date}}
          </div>
          <div v-if="currentRunInfo.startTime.match('4:30')">Start Time: {{currentRunInfo.startTime}}</div>
          <div class="run-time--nonstandard" v-else>Start Time: {{currentRunInfo.startTime}}!!</div>
          <div>Location: {{currentRunInfo.runSiteName}}</div>
        </div>
        <div class="main-info__right">
          GPS:
          <a v-if="currentRunInfo.coordinates && currentRunInfo.googleMapsLink"
            :href="currentRunInfo.googleMapsLink"
            target="_blank"
          >
            {{currentRunInfo.coordinates[1]}}, {{currentRunInfo.coordinates[0]}}
          </a>
          <span v-else>Waiting on hares...</span>
          <h2 v-if="currentRunInfo.occasion">{{currentRunInfo.occasion}} Run</h2>
        </div>
      </div>
      <div class="hares">Hares: {{currentRunInfo.hares}}</div>
      <GoogleMap v-if="!willUseMapBox" :map-coords="currentRunInfo.coordinates"/>
      <MapBoxMap v-else :map-coords="currentRunInfo.coordinates"/>
      <div class="bottom-info">
        <div v-if="currentRunInfo.filteredHareLine" class="bottom-info__left">
          <div class="mismanagement">
            <p>
              {{ currentYear }} Mismanagement
            </p>
            <p>
              Grand Master: Nightjar | Hash Master: Serial Offender | On Sec: 69’er | RA: Wooden Eye | Hash Cash: Toilet
              Trasher & Harelip | Backup Hash Cash: Ringtail | Hash Bank: Pain & Pleasure | Hare Raiser: Barnacle Balls |
              Beer Master: Short Shaft Hash Maps: Balderdash | Hashberdashery: No Deposit
            </p>
            <p>© {{ currentYear }} | Bali Hash House Harriers 2</p>
            <a href="http://balihash2.com/next-run-map" target="_blank">http://balihash2.com/next-run-map</a>
            <div class="mismanagement__links">
              <a class="social-link" target="_blank" href="https://facebook.com/BaliHash2/">
                <img src="https://www.facebook.com/favicon.ico" alt="">
              </a>
              <a class="social-link" target="_blank" href="https://www.instagram.com/balihash.househarriers2/">
                <img src="https://www.instagram.com/favicon.ico" alt="">
              </a>
              <a class="social-link" target="_blank" href="https://twitter.com/BaliHash2">
                <img src="https://abs.twimg.com/favicons/twitter.2.ico" alt="">
              </a>
              <a class="social-link" target="_blank" href="http://balihash2.com/subscribe-bali-hash-2/">
                <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="">
              </a>
            </div>
          </div>
        </div>
        <div class="bottom-info__right">
          <div class="hairline-container">
            <div class="hairline-header">Receding Hareline</div>
            <div class="hairline-item" v-for="line in currentRunInfo.filteredHareLine">
              <div class="hairline-item__number">#{{line[0]}}</div>
              <div class="hairline-item__date">{{line[1]}}</div>
              <div class="hairline-item__hare">{{line[2]}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue'
import MapBoxMap from "./MapBoxMap.vue";
import GoogleMap from "./GoogleMap.vue";
import getHareLine from "../utils/getHareLine";

declare global {
  interface Window {
    initMap: () => void;
    useMapBox: () => void;
  }
}

interface pageParameters {
  number: string,
  date: string,
  hares: string,
  googleMapsLink: string,
  occasion: string,
  runSiteName: string,
  coordinates: string,
  filteredHareLine: string[],
  startTime: string,
}

defineProps<{ currentRunInfo: pageParameters }>()

const currentYear = new Date().getFullYear()

let willUseMapBox = ref(false);

window.useMapBox = () => {
  willUseMapBox.value = true
}
</script>

<style lang="scss">
.A4-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 30px;
}

.A4 {
  position: relative;
  background: white;
  width: 21cm;
  height: 29.7cm;
  display: block;
  margin: 0 auto 0.5cm;
  box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
  @media screen and (max-width: 800px) {
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
    .main-info, .hares {
      font-size: unset;
      margin: 0 18px;
    }
    .compass {
      height: 160px;
    }
    .title {
      img {
        position: unset;
        margin-left: 18px;
        margin-right: 18px;
        margin-top: 16px;
      }
      &__text {
        position: unset;
        margin-top: 16px;
        p {
          margin: 0;
          font-size: 28px;
          text-align: left;
          line-height: 1em;
        }
      }
    }
    .bottom-info {
      display: flex;
      flex-direction: column-reverse;
    }
    .hairline-container {
      margin: 0 auto;
      max-width: 400px;
      padding: 0 18px !important;
    }
    .mismanagement {
      width: unset !important;
    }
  }
}

.title, .main-info, .bottom-info, .hares {
  font-family: 'Special Elite', cursive;
  font-weight: 600;
  color: #0ca501;
}

.hares {
  font-size: 20px;
  text-align: left;
  margin: 0 40px;
}

.title {
  display: flex;
  height: 100px;
  overflow: hidden;
  img {
    height: 92px;
    position: absolute;
    left: 39px;
    top: 12px;
  }
  &__text {
    position: absolute;
    left: 148px;
    top: 0;
    p {
      font-size: 42px;
      text-align: left;
      line-height: 0;
    }
  }
}

hr {
  width: 90%;
  border-top: 2px solid #0ca501;
}

.main-info, .bottom-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 0 0;
  grid-template-areas:
    ". .";
  margin: 0 40px;
  font-size: 20px;
  &__left {
    text-align: left;
    .run-time--nonstandard {
      font-size: 24px;
      color: red;
    }
  }
  &__right {
    text-align: right;
    .hairline-item {
      display: flex;
      margin-bottom: 4px;
    }
  }
}

.bottom-info {
  margin-top: 16px;
  margin-right: 0;
  margin-left: 0;
  &__left {
    .mismanagement {
      text-align: center;
      font-size: 14px;
      margin: 0 16px 0 24px;
      width: 350px;
      &__links {
        display: flex;
        justify-content: center;
        margin-top: 16px;
        .social-link {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          img {
            margin-right: 8px;
            height: 24px;
          }
        }
        a {
          margin-right: 8px;
          img {
            height: 24px;
          }
        }
      }
    }
  }
  &__right {
    font-size: 16px;
    text-align: left;
    height: 225px;
    overflow: hidden;
    .hairline-container {
      width: 100%;
      height: 100%;
      overflow-y: scroll;
      padding-right: 24px; /* Increase/decrease this value for cross-browser compatibility */
      box-sizing: content-box; /* So the width will be 100% + 17px */
    }

    .hairline-header {
      text-align: center;
      margin-bottom: 8px;
      font-weight: 800;
      font-size: 20px;
    }

    .hairline-item {
      display: grid;
      grid-template-columns: 50px 100px 215px;
      grid-template-rows: 1fr;
      gap: 8px;
      grid-template-areas: ". . .";
    }
  }
}


@media print {
  body, .A4 {
    margin: 0;
    box-shadow: none;
  }
  .A4-container {
    padding: 0 !important;
  }
  .map, .map-container {
    height: 15.5cm!important;
  }
  .print-button {
    display: none;
  }
}
</style>
