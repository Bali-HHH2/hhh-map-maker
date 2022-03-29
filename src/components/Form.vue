<template>
  <div class="form-container">
    <flow-form v-bind:questions="questions" v-on:complete="onComplete" />
  </div>
</template>

<script setup lang="ts">
  import {ref, onMounted, toRefs} from 'vue'
  import { FlowForm, QuestionModel, QuestionType } from '@ditdot-dev/vue-flow-form'

  const props = defineProps({
    onFormSubmit: {
      type: Function,
      default: () => {},
    },
  });

  const onComplete = () => {
    const answersRaw = questions.map(q => q.answer)
    const answers = {
      googleMapsLink: 'https://goo.gl/maps/jw2yvbncoyQTh3vbA', //answersRaw[0],
      coordinates: '-8.405286, 115.293728', //answersRaw[1],
      runSiteName: answersRaw[2],
      hares: answersRaw[3],
      occasion: answersRaw?.[4] ?? null,
      startTime: answersRaw?.[5] ?? '4:30 PM',
    }
    props.onFormSubmit(answers)
  }

  const questions = [
    new QuestionModel({
      title: "Enter the run site's coordinates",
      type: QuestionType.Text,
      placeholder: 'E.g: -8.5060135,115.2322403',
      required: false,
    }),
    new QuestionModel({
      title: "Enter the name of the Run Site",
      type: QuestionType.Text,
      placeholder: 'E.g: Pura Dalem Bongkasa',
      required: true,
    }),
    new QuestionModel({
      title: "Enter the Hare name(s)",
      type: QuestionType.Text,
      placeholder: 'E.g: The Cunt of Monte Cristo',
      required: true,
    }),
    new QuestionModel({
      title: "Enter run start time",
      type: QuestionType.Text,
      placeholder: '(Optional input, defaults to 4:30pm)',
      required: false,
    }),
  ]


  onMounted(async () => {

  });
</script>

<style lang="scss">
  @import '@ditdot-dev/vue-flow-form/dist/vue-flow-form.css';
  //@import '@ditdot-dev/vue-flow-form/dist/vue-flow-form.theme-minimal.css';

  .form-container {
    height: 100%;
  }
</style>
