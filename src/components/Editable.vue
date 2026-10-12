<template>
  <div v-if="savedHtml" :data-edit-key="name" v-html="savedHtml"></div>
  <div v-else :data-edit-key="name"><slot></slot></div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

// Region of the page whose edited HTML gets saved under `name`.
const props = defineProps<{ name: string }>()

const globalData: any = inject('globalData')
const savedHtml = computed(() => globalData.edits.value.text?.[props.name])
</script>
