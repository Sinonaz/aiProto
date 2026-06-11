<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isVisible = ref(false)
const isAnimating = ref(false)

watch(
  () => props.open,
  (val) => {
    if (val) {
      isVisible.value = true
      requestAnimationFrame(() => {
        isAnimating.value = true
      })
    } else {
      isAnimating.value = false
      setTimeout(() => {
        isVisible.value = false
      }, 200)
    }
  },
  { immediate: true },
)

function close() {
  emit('update:open', false)
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      :class="[
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200',
        isAnimating ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent',
      ]"
      @click="onBackdropClick"
      @keydown="onKeydown"
    >
      <div
        :class="[
          'w-full bg-bg-primary rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-200',
          sizeClasses[size ?? 'md'],
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        ]"
      >
        <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-text-primary">{{ title }}</h2>
          <BaseButton variant="ghost" size="sm" @click="close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </BaseButton>
        </div>
        <div class="p-6">
          <slot :close="close" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
