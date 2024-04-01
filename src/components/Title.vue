<template>
  <div class="title">
    <img src="../assets/logo.png" alt="" />
    <div class="title__text">
      <p>Bali Hash House Harriers 2</p>
      <p><slot></slot></p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import '../style/Global.module.scss';

.title {
  display: flex;
  height: 100px;
  overflow: hidden;
  font-family: 'Special Elite', cursive;
  font-weight: 600;
  color: #0ca501;

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

@include mobile {
  .title {

    img {
      position: unset;
      margin-left: 18px;
      margin-right: 18px;
      margin-top: 16px;
    }

    &__text {
      margin-top: 38px;
      left: 120px;

      p {
        margin: 0;
        font-size: 4.5vw;
        text-align: left;
        line-height: 1em;
      }
    }
  }
}
</style>
