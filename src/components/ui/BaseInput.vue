<script setup lang="ts">
import { ref } from 'vue'

const model = defineModel<string>()
defineProps<{
  placeholder?: string
  disabled?: boolean
  error?: string
  rows?: number
}>()

const isFocused = ref(false)
</script>

<template>
  <div class="relative">
    <textarea
      v-model="model"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows ?? 1"
      :class="[
        'w-full px-4 py-3 rounded-xl text-sm text-text-primary bg-bg-primary border resize-none transition-all duration-200',
        'placeholder:text-text-tertiary',
        'focus:outline-none',
        isFocused && !error ? 'border-brand ring-1 ring-brand/20' : '',
        error ? 'border-red-400 ring-1 ring-red-400/20' : 'border-border',
        disabled ? 'opacity-50 cursor-not-allowed bg-bg-secondary' : '',
      ]"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @input="() => {}"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
