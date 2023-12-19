<template>
  <div class="A4-container">
    <div v-show="isPrintMode" class="A4--canvas" ref="pageCanvas">
      <!--
      This div will contain a canvas that contains an image of the original interactive page below, it is only
      shown when the print button or shortcut are pressed, we do this because the PDF creator tries to vectorize
      the typewriter font we use and causes huge PDF file sizes. If we raster the whole div into an image first
      with html2canvas and print that to PDF, it will skip vectorization of the font and result in ~700kb vs ~10mb.
      These links aren't visible but are overlay links on top of the canvas so we can keep clickable links on the
      raster image
     -->
      <a
        class="A4__gps-link"
        v-if="currentRunInfo.coordinates && currentRunInfo.googleMapsLink"
        :href="currentRunInfo.googleMapsLink"
        target="_blank"
      >
        {{ currentRunInfo.coordinates[1] }}, {{ currentRunInfo.coordinates[0] }}
      </a>
      <a
        class="A4__website-link"
        href="http://balihash2.com/next-run-map"
        target="_blank"
      >
        http://balihash2.com/next-run-map
      </a>
    </div>
    <div v-if="!isPrintMode" class="A4" ref="realPage">
      <Title> Next Run Map </Title>
      <hr />
      <div class="main-info">
        <div class="main-info__left">
          <div>Run: #{{ currentRunInfo.number }}</div>
          <div>Date: {{ currentRunInfo.date }}</div>
          <div v-if="currentRunInfo.startTime.match('4:30')">
            Start Time: {{ currentRunInfo.startTime }}
          </div>
          <div class="run-time--nonstandard" v-else>
            Start Time: {{ currentRunInfo.startTime }}!!
          </div>
          <div>Location: {{ currentRunInfo.runSiteName }}</div>
        </div>
        <div class="main-info__right">
          GPS:
          <a
            v-if="currentRunInfo.coordinates && currentRunInfo.googleMapsLink"
            class="gps-link"
            :href="currentRunInfo.googleMapsLink"
            target="_blank"
          >
            {{ currentRunInfo.coordinates[1] }},
            {{ currentRunInfo.coordinates[0] }}
          </a>
          <span v-else>Waiting on hares...</span>
          <h2 class="run-occasion" v-if="currentRunInfo.occasion">
            {{ currentRunInfo.occasion }} Run
          </h2>
          <p class="run-remark">{{ currentRunInfo.remark }}</p>
        </div>
      </div>
      <div class="hares">Hares: {{ currentRunInfo.hares }}</div>
      <GoogleMap :map-coords="currentRunInfo.coordinates" />
      <div class="bottom-info">
        <div v-if="currentRunInfo.filteredHareLine" class="bottom-info__left">
          <div class="mismanagement">
            <p>{{ currentYear }} Mismanagement</p>
            <p v-if="!mismanagement">
              Grand Master: Nightjar | Hash Master: Serial Offender | On Sec:
              69’er | RA: Wooden Eye | Hash Cash: Toilet Trasher & Harelip |
              Backup Hash Cash: Ringtail | Hash Bank: Pain & Pleasure | Hare
              Raiser: Barnacle Balls | Beer Master: Short Shaft Hash Maps:
              Balderdash | Hashberdashery: No Deposit
            </p>
            <p v-else>{{ mismanagement }}</p>
            <p>© {{ currentYear }} | Bali Hash House Harriers 2</p>
            <a href="http://balihash2.com/next-run-map" target="_blank"
              >http://balihash2.com/next-run-map</a
            >
            <div class="mismanagement__links">
              <a
                class="social-link"
                target="_blank"
                href="https://facebook.com/BaliHash2/"
              >
                <img src="../assets/fb.ico" alt="" />
              </a>
              <a
                class="social-link"
                target="_blank"
                href="https://www.instagram.com/balihash.househarriers2/"
              >
                <img src="../assets/insta.ico" alt="" />
              </a>
              <a
                class="social-link"
                target="_blank"
                href="https://twitter.com/BaliHash2"
              >
                <img src="../assets/twitter.ico" alt="" />
              </a>
              <a
                class="social-link"
                target="_blank"
                href="http://balihash2.com/subscribe-bali-hash-2/"
              >
                <img src="../assets/gmail.ico" alt="" />
              </a>
            </div>
          </div>
        </div>
        <HareLine :hare-line="currentRunInfo.filteredHareLine" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GoogleMap from './GoogleMap.vue'
import HareLine from './HareLine.vue'
import delay from '../utils/delay'
import html2canvas from 'html2canvas'
import { ref } from 'vue'
import Title from './Title.vue'

interface pageParameters {
  number: string
  date: string
  hares: string
  googleMapsLink: string
  occasion: string
  runSiteName: string
  coordinates: string
  filteredHareLine: string[]
  startTime: string
  remark: string
  mismanagement: string
}

defineProps<{
  currentRunInfo: pageParameters
  mismanagement: string | undefined
}>()

const currentYear = new Date().getFullYear()
const pageCanvas = ref()
const realPage = ref()
const isPrintMode = ref(false)

// Takes the interactive map, turns it into an image and displays it on ref="pageCanvas"
const onBeforePrint = async () => {
  window.map.setOptions({ disableDefaultUI: true }) // Hides the nav button on google map
  await delay(500)
  const canvas = await html2canvas(realPage.value, {
    backgroundColor: null,
    useCORS: true
  })
  pageCanvas.value.appendChild(canvas)
  isPrintMode.value = true // This hides the original interactive page and shows the imaged version
}

const onAfterPrint = async () => {
  window.map.setOptions({ disableDefaultUI: false })
  isPrintMode.value = false
}

// Overwrite print function then call it after copying map div to image.
const _print = window.print
window.print = async function () {
  await onBeforePrint()
  _print()
}

// Remove the canvas and show the map again after printing.
window.onafterprint = function () {
  onAfterPrint()
}
</script>

<style lang="scss">
.A4-container {
  width: 100%;
  padding-bottom: 30px;
  padding-top: 30px;
  @media screen and (max-width: 800px) {
    padding: 0;
  }
}

.A4--canvas {
  @extend .A4;
}

.A4 {
  position: relative;
  background: white;
  width: 21cm;
  height: 29.7cm;
  display: block;
  margin: 0 auto 0.5cm;
  box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
  .A4__website-link,
  .A4__gps-link {
    position: absolute;
    font-size: 22px;
    color: #ff000000;
  }
  .A4__gps-link {
    right: 29px;
    top: 111px;
    width: 300px;
    height: 36px;
  }
  .A4__website-link {
    left: 43px;
    bottom: 32px;
    width: 300px;
    height: 65px;
  }
  @media screen and (max-width: 800px) {
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
    .main-info,
    .hares {
      font-size: unset;
      margin: 0 18px;
    }
    .compass {
      height: 160px;
    }
    .run-time--nonstandard {
      font-size: 18px !important;
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

.main-info,
.bottom-info,
.hares {
  font-family: 'Special Elite', cursive;
  font-weight: 600;
  color: #0ca501;
}

.hares {
  font-size: 20px;
  text-align: left;
  margin: 0 40px;
}

hr {
  width: 90%;
  border-top: 2px solid #0ca501;
}

.main-info,
.bottom-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  gap: 0 0;
  grid-template-areas: '. .';
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
    z-index: 10;
    h2.run-occasion {
      margin: 8px 0 5px;
    }
    p.run-remark {
      margin: 0 0 8px;
      text-decoration: underline;
      color: #226f1c;
    }
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
      grid-template-areas: '. . .';
    }
  }
}

@media print {
  body,
  .A4 {
    margin: 0;
    box-shadow: none;
  }
  .A4-container {
    padding: 0 !important;
  }
  .map,
  .map-container {
    height: 15.5cm !important;
  }
}
</style>
