<template>
  <aside class="edit-panel">
    <label class="edit-panel__field">
      <span>Password</span>
      <input v-model="password" type="password" autocomplete="current-password" />
    </label>

    <div v-if="imageEditor" class="edit-panel__field">
      <span>Images</span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        hidden
        @change="onFilesPicked"
      />
      <div class="edit-panel__row">
        <button @click="fileInput?.click()">Add</button>
        <button class="edit-panel__danger" @click="onClear">
          Clear
        </button>
      </div>
    </div>

    <button
      v-if="imageEditor"
      class="edit-panel__primary"
      :disabled="isSaving"
      @click="onSave"
    >
      {{ isSaving ? 'Saving...' : 'Save changes' }}
    </button>
    <p v-if="status" class="edit-panel__status">{{ status }}</p>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ICurrentRun } from '../utils/currentRun'
import { deleteEdits, saveEdits } from '../utils/edits'

const PASSWORD_KEY = 'editPassword'

const props = defineProps<{
  runInfo: ICurrentRun
  imageEditor?: any
}>()

const password = ref(localStorage.getItem(PASSWORD_KEY) ?? '')
const fileInput = ref<HTMLInputElement>()
const isSaving = ref(false)
const status = ref('')

watch(password, (value) => localStorage.setItem(PASSWORD_KEY, value))

const onFilesPicked = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) await props.imageEditor.addImages(input.files)
  input.value = ''
}

const onClear = async () => {
  const run = props.runInfo.number
  if (!confirm(`Delete all saved images for run #${run}?`)) return
  try {
    await deleteEdits(run, password.value)
    window.location.reload()
  } catch (error) {
    status.value = (error as Error).message
  }
}

const onSave = async () => {
  isSaving.value = true
  try {
    await saveEdits(
      props.runInfo.number,
      { images: props.imageEditor.getCanvasData() },
      password.value
    )
    window.location.href = window.location.pathname
  } catch (error) {
    status.value = (error as Error).message
    isSaving.value = false
  }
}
</script>

<style scoped lang="scss">
@import '../style/Global.module.scss';

$green: #0ca501;
$a4-half-width: 10.5cm;

.edit-panel {
  position: fixed;
  top: 2rem;
  right: calc(50% + #{$a4-half-width} + 1rem);
  z-index: 100;
  width: 14rem;
  box-sizing: border-box;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  color: #1f2937;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  font: 14px/1.4 system-ui, sans-serif;
  text-align: left;

  @include mobile {
    position: static;
    width: auto;
    margin: 1rem;
  }

  @media print {
    display: none;
  }

  &__field {
    display: grid;
    gap: 0.375rem;
    margin: 0;

    > span {
      font-size: 0.75rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
  }

  &__row {
    display: flex;
    gap: 0.5rem;

    button {
      flex: 1;
    }
  }

  input {
    box-sizing: border-box;
    width: 100%;
    padding: 0.5rem 0.625rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font: inherit;
    color: inherit;

    &:focus {
      outline: 2px solid $green;
      outline-offset: -1px;
      border-color: transparent;
    }
  }

  button {
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 8px;
    background: #f3f4f6;
    color: inherit;
    font: inherit;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background: #e5e7eb;
    }

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }

    &.edit-panel__primary {
      background: $green;
      color: #fff;

      &:hover {
        filter: brightness(0.95);
      }
    }

    &.edit-panel__danger {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  &__status {
    margin: 0;
    font-size: 0.8125rem;
    color: #6b7280;
  }
}
</style>
