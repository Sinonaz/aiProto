<script setup lang="ts" generic="T extends string">
import { ref, computed } from 'vue'

const props = defineProps<{
  options: { value: T; label: string; description?: string }[]
  modelValue: T
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const isOpen = ref(false)

function select(value: T) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
}

function closeOnClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.base-select')) {
    isOpen.value = false
  }
}

const selectedLabel = computed(() => {
  return props.options.find((o) => o.value === props.modelValue)?.label ?? props.placeholder ?? ''
})
</script>

<template>
  <div class="base-select relative" @click.outside="closeOnClickOutside">
    <button
      type="button"
      :class="[
        'flex items-center gap-2 px-3 py-2 text-sm text-text-primary bg-bg-secondary rounded-lg border border-border',
        'hover:border-brand/40 transition-colors cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      ]"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <svg
        :class="['w-4 h-4 text-text-tertiary transition-transform', isOpen ? 'rotate-180' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 mt-1 w-64 bg-bg-primary border border-border rounded-xl shadow-lg z-30 overflow-hidden"
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :class="[
            'w-full text-left px-4 py-3 text-sm hover:bg-bg-tertiary transition-colors cursor-pointer',
            'border-b border-border last:border-b-0',
            option.value === modelValue ? 'bg-brand/5 text-brand' : 'text-text-primary',
          ]"
          @click="select(option.value)"
        >
          <div class="font-medium">{{ option.label }}</div>
          <div v-if="option.description" class="text-xs text-text-tertiary mt-0.5">{{ option.description }}</div>
        </button>
      </div>
    </Transition>
  </div>
</template>
