<template>
  <div class="hareline" :class="{ 'hareline--previous': showingPreviousRuns }">
    <div class="hareline-container">
      <div class="hareline-header" v-if="!showingPreviousRuns">Receding Hareline</div>
      <div v-else>
        <div class="hareline-header">Previous Runs</div>
        <div class="hareline-header--latest" @click="reload()">Show Latest Run ⏱</div>
      </div>
      <div class="hareline-item" v-for="line in hareLine" @click="onClickPreviousRun(line)">
        <div class="hareline-item__number">#{{line[0]}}</div>
        <div class="hareline-item__date">{{line[1]}}</div>
        <div class="hareline-item__hare">{{line[2]}}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  hareLine: any,
  showingPreviousRuns: boolean,
  onClickPreviousRun: () => null
}>()

const reload = () => {
  window.location.reload()
}
</script>

<style lang="scss">
.hareline {
  font-family: 'Special Elite', cursive;
  font-weight: 600;
  color: #0ca501;
  &--previous {
    color: #0aa500;
    position: relative;
    background: white;
    width: 21cm;
    height: 29.7cm;
    display: block;
    margin: 30px auto 0.5cm;
    box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
    .hareline-container {
      width: 60% !important;
      margin: 50px auto 0 !important;
      .hareline-header--latest {
        text-align: center;
        margin-bottom: 16px;
      }
      .hareline-item {
        margin-bottom: 8px;
      }
      .hareline-item, .hareline-header--latest {
        grid-template-columns: 71px 100px 280px !important;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
          color: -webkit-link;
        }
      }
    }
    @media screen and (max-width: 800px) {
      width: 100%;
      height: 100%;
      padding-bottom: 20px;
      font-size: unset;
      .hareline-container {
        width: 90% !important;
      }
    }
  }
  font-size: 16px;
  text-align: left;
  height: 225px;
  overflow: hidden;
  .hareline-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding-right: 24px; /* Increase/decrease this value for cross-browser compatibility */
    box-sizing: content-box; /* So the width will be 100% + 17px */
  }

  .hareline-header {
    text-align: center;
    margin-bottom: 8px;
    font-weight: 800;
    font-size: 20px;
  }

  .hareline-item {
    display: grid;
    grid-template-columns: 50px 100px 215px;
    grid-template-rows: 1fr;
    gap: 8px;
    grid-template-areas: ". . .";
  }
}


@media print {
  //.hareline {
  //  display: none;
  //}
}
</style>
