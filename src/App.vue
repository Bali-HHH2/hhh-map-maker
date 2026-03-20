<template>
  <button class="print-button" @click="print">Print Map</button>
  <button class="past-map-button" @click="showPreviousRuns = !showPreviousRuns">
    View Past Maps
  </button>
  <button
    ref="copyDetailsButton"
    class="copy-details-button"
    @click="onCopyToClipboard"
  >
    Copy Run Info
  </button>
  <button
    class="member-login"
    @click="openMembersPage"
  >
    Members login
  </button>
  <button class="pins-map-button" @click="showPinsMap = true">Location Pins</button>
  <div v-if="showPinsMap" class="pins-map-overlay">
    <button class="pins-map-close" @click="showPinsMap = false">✕ Close</button>
    <GoogleMap :pins="locationPins" :full-page="true" />
  </div>
  <HareLine
    v-if="showPreviousRuns"
    :hare-line="fullHairLine"
    :showing-previous-runs="true"
    :on-click-previous-run="onClickPreviousRun"
    @close="showPreviousRuns = false"
  />
  <!--  <BlankPage />-->
  <Page
    v-if="hairLine && !showPreviousRuns"
    :currentRunInfo="currentRunInfo"
    :mismanagement="mismanagement"
  />
  <div v-if="isEditMode" class="edit-map">
    <p>Map Coordinates</p>
    <input v-model="editedMapCoords" id="coords-input" type="text">
    <button @click="onSaveMapCoords">Save</button>
  </div>
  <div class="loading" v-else>
<!--    <h1>Loading...</h1>-->
  </div>
</template>

<script setup lang="ts">
import Page from "./components/Page.vue";
import GoogleMap from "./components/GoogleMap.vue";
import { onBeforeMount, onMounted, provide, ref } from "vue";
import getHareLine from "./utils/getHareLine";
import { subDays } from "date-fns";
import { currentRun, formRunObject } from "./utils/currentRun";
import HareLine from "./components/HareLine.vue";
import copyRunDetailsToClipboard from "./utils/create-copy-text";
import delay from "./utils/delay";
import { convert } from "geo-coordinates-parser";

// Data

const fullHairLine = ref();
const hairLine = ref();
const showPreviousRuns = ref();
const currentRunInfo = ref();
const mismanagement = ref();
const copyDetailsButton = ref();
const editedMapCoords = ref('');
const isEditMode = ref(false);
const showPinsMap = ref(false);

const locationPins = [
  { lat: -8.524528, lng: 115.184083 },
  { lat: -8.4610401, lng: 115.3009115 },
  { lat: -8.546974, lng: 115.228390 },
  { lat: -8.480433, lng: 115.270864 },
  { lat: -8.513887, lng: 115.170332 },
  { lat: -8.483154, lng: 115.204976 },
  { lat: -8.567545, lng: 115.269713 },
  { lat: -8.4516000, lng: 115.2273000 },
  { lat: -8.551400, lng: 115.283343 },
  { lat: -8.4369377, lng: 115.2578178 },
  { lat: -8.51237, lng: 115.21819 },
  { lat: -8.4996870, lng: 115.3133472 },
  { lat: -8.599472, lng: 115.251389 },
  { lat: -8.432835, lng: 115.321566 },
  { lat: -8.4833095, lng: 115.2050075 },
  { lat: -8.5331264, lng: 115.3704686 },
  { lat: -8.5292719, lng: 115.2512638 },
  { lat: -8.4313146, lng: 115.1949968 },
  { lat: -8.5602570, lng: 115.2352765 },
  { lat: -8.1714696, lng: 115.0299440 },
  { lat: -8.529733266928755, lng: 115.23717685914393 },
  { lat: -8.523661, lng: 115.294937 },
  { lat: -8.484906, lng: 115.211703 },
  { lat: -8.551625, lng: 115.470969 },
  { lat: -8.47521, lng: 115.20452 },
  { lat: -8.51360, lng: 115.17048 },
  { lat: -8.534695, lng: 115.208179 },
  { lat: -8.477900, lng: 115.284480 },
  { lat: -8.555675, lng: 115.306071 },
  { lat: -8.552185, lng: 115.283401 },
  { lat: -8.484971, lng: 115.211844 },
  { lat: -8.570647, lng: 115.428746 },
  { lat: -8.4369310, lng: 115.2578869 },
  { lat: -8.4607840, lng: 115.3019330 },
  { lat: -8.5016079, lng: 115.6103271 },
  { lat: -8.4498830, lng: 115.2162134 },
  { lat: -8.674838, lng: 115.262525 },
  { lat: -8.501897, lng: 115.328335 },
  { lat: -8.607621, lng: 115.324613 },
  { lat: -8.451500, lng: 115.227667 },
  { lat: -8.436898, lng: 115.257799 },
  { lat: -8.480449, lng: 115.265580 },
  { lat: -8.781200, lng: 115.163766 },
  { lat: -8.511462, lng: 115.249110 },
  { lat: -8.44142, lng: 115.22264 },
  { lat: -8.524004, lng: 115.345397 },
  { lat: -8.4081831, lng: 115.2240176 },
  { lat: -8.512370, lng: 115.218190 },
  { lat: -8.4755024, lng: 115.1712193 },
  { lat: -8.5944712, lng: 115.3458818 },
  { lat: -8.595459, lng: 115.239271 },
  { lat: -8.5993324, lng: 115.2514070 },
  { lat: -8.5674418, lng: 115.2700294 },
  { lat: -8.5954647, lng: 115.2392492 },
  { lat: -8.5687659, lng: 115.2887474 },
  { lat: -8.5094297, lng: 115.2327797 },
  { lat: -8.392126, lng: 115.284726 },
  { lat: -8.502193, lng: 115.328328 },
  { lat: -8.5298800, lng: 115.2372000 },
  { lat: -8.4516165, lng: 115.2772008 },
  { lat: -8.5675980, lng: 115.2695310 },
  { lat: -8.424190, lng: 115.258520 },
  { lat: -8.6200792, lng: 115.2349811 },
  { lat: -8.5423889, lng: 115.274147 },
  { lat: -8.5229400, lng: 115.2881200 },
  { lat: -8.5987719, lng: 115.3370928 },
  { lat: -8.4099018, lng: 115.2742490 },
  { lat: -8.5599690, lng: 115.2342840 },
  { lat: -8.5499791, lng: 115.2265272 },
  { lat: -8.4946510, lng: 115.2055134 },
  { lat: -8.5139050, lng: 115.1703740 },
  { lat: -8.470911, lng: 115.291910 },
  { lat: -8.5298724, lng: 115.2371309 },
  { lat: -8.672554, lng: 115.260440 },
  { lat: -8.5303416, lng: 115.2518154 },
  { lat: -8.556360, lng: 115.213844 },
  { lat: -8.510264, lng: 115.206953 },
  { lat: -8.4849130, lng: 115.2118570 },
  { lat: -8.534340, lng: 115.208090 },
  { lat: -8.6572562, lng: 115.2630032 },
  { lat: -8.447398, lng: 115.290054 },
  { lat: -8.5069607, lng: 115.3136051 },
  { lat: -8.5753530, lng: 115.2638650 },
  { lat: -8.7815982, lng: 115.1641715 },
  { lat: -8.4500611, lng: 115.2162241 },
  { lat: -8.551396535420354, lng: 115.28334381431927 },
  { lat: -8.321510, lng: 115.177360 },
  { lat: -8.548170, lng: 115.433990 },
  { lat: -8.4279470, lng: 115.3043800 },
  { lat: -8.37731, lng: 115.15188 },
  { lat: -8.522802661049706, lng: 115.28768828749146 },
  { lat: -8.6098799, lng: 115.2895101 },
  { lat: -8.4417492, lng: 115.2231533 },
  { lat: -8.480580, lng: 115.265580 },
  { lat: -8.56846, lng: 115.27906 },
  { lat: -8.5246382, lng: 115.3451442 },
  { lat: -8.3667477, lng: 115.2130849 },
  { lat: -8.5301720, lng: 115.2517680 },
  { lat: -8.466160, lng: 115.163345 },
  { lat: -8.597955, lng: 115.271368 },
  { lat: -8.500111, lng: 115.235194 },
];

// Methods

const print = () => {
  const editing = window.location.href.includes("edit")
  isEditMode.value = false;
  window.print();
  isEditMode.value = editing;
};

const onClickPreviousRun = (run: string[]) => {
  if (!showPreviousRuns.value) return;
  currentRunInfo.value = formRunObject(run, fullHairLine);
  showPreviousRuns.value = false;
};

const onCopyToClipboard = async () => {
  await copyRunDetailsToClipboard(currentRunInfo.value);
  copyDetailsButton.value.style.backgroundColor = "green";
  await delay(1000);
  copyDetailsButton.value.style.backgroundColor = "unset";
};

const openMembersPage = () => {
  Object.assign(document.createElement("a"), {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://members.balihash2.com/applogin.asp"
  }).click();
};

const onSaveMapCoords = () => {
  const converted = convert(editedMapCoords.value)
  currentRunInfo.value.coordinates = [converted.verbatimLongitude, converted.verbatimLatitude];
};

// Hooks

onMounted(() => {
  if (window.location.href.includes("edit")) {
    document.body.contentEditable = String(true);
    isEditMode.value = true
  }
});

onBeforeMount(async () => {
  const unfilteredHareLine = await getHareLine();
  // Mismanagement is on 1F on the hareline sheet
  mismanagement.value = unfilteredHareLine?.[0]?.[5] || undefined;
  fullHairLine.value = unfilteredHareLine.filter(
    (e: string[]) =>
      // First items needs to be a run number, and the rest need to be present to be a valid run.
      parseInt(e[0]) && e[1] && e[2] && e[3] && e[5]
  );
  hairLine.value = unfilteredHareLine.filter(
    (value: string[]) =>
      parseInt(value[0]) > 1500 &&
      value[2] &&
      new Date(value?.[1]) >= subDays(new Date(), 1)
  );

  currentRunInfo.value = currentRun(hairLine);
});

// Inject

provide('globalData', {
  isEditMode
})

</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
@import './style/Global.module.scss';

html,
body {
  height: 100%;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
  height: 100%;

  .loading {
    text-align: center;
  }

  .print-button,
  .past-map-button,
  .copy-details-button,
  .member-login {
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;
    z-index: 100;
    margin: 10px;
  }

  .past-map-button {
    right: 0;
    left: unset;
    width: auto;
  }

  .copy-details-button {
    bottom: unset;
    top: 0;
    @include mobile {
      display: none;
    }
  }

  .member-login {
    top: 0;
    right: 0;
    left: unset;
    bottom: unset;
  }

  .pins-map-button {
    bottom: 40px;
    left: 0;
    position: fixed;
    background-color: #fff;
    color: #000;
    border: 1px solid #000;
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;
    z-index: 100;
    margin: 10px;
  }
}

.pins-map-overlay {
  position: fixed;
  inset: 0;
  z-index: 499;

  .pins-map-close {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 600;
    background: #fff;
    color: #000;
    border: 1px solid #000;
    border-radius: 5px;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 14px;
  }
}

.edit-map {
  background: #fff;
  padding: 1rem;
  text-align: left;
  color: #000;
  position: absolute;
  top: 50% ;
  left: 10%;
}

@media print {
  body {
    margin: 0;
    box-shadow: none;
  }

  .edit-map,
  .print-button,
  .past-map-button,
  .copy-details-button,
  .member-login,
  .pins-map-button,
  .pins-map-overlay,
  .loading {
    display: none;
  }
}
</style>
