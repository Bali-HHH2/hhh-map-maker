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
  .loading {
    display: none;
  }
}
</style>
