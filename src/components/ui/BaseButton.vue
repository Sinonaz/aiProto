<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const variantClasses = {
  primary: 'bg-brand text-white hover:bg-brand/90 active:bg-brand/80',
  secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-border',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      sizeClasses[size ?? 'md'],
      variantClasses[variant ?? 'primary'],
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="i-svg-spinners-90-ring w-4 h-4" />
    <slot />
  </button>
</template>
