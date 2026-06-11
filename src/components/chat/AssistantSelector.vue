<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import chooseIcon from '@/assets/icons/chose-asistent.png'

export interface AssistantOption {
  id: string
  name: string
  description: string
  icon?: string
  iconSrc?: string
  color?: string
}

const props = defineProps<{
  options: AssistantOption[]
  modelValue: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const dropdownStyle = ref<Record<string, string>>({})

const filteredOptions = computed(() => props.options)

const selectedOption = computed(() =>
  props.options.find((o) => o.id === props.modelValue),
)

function optionColor(option: AssistantOption): string {
  return option.color ?? '#6c5ce7'
}

function optionBgColor(option: AssistantOption): string {
  const hex = option.color ?? '#6c5ce7'
  return hex + '1A' // 10% alpha
}

function select(option: AssistantOption) {
  emit('update:modelValue', option.id)
  close()
}

function close() {
  isOpen.value = false
}

function toggle() {
  if (props.disabled) return
  if (!isOpen.value) {
    open()
  } else {
    close()
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  nextTick(() => updatePosition())
}

function updatePosition() {
  if (!rootEl.value) return
  const rect = rootEl.value.getBoundingClientRect()
  const dropdownWidth = Math.max(rect.width, 560)
  const dropdownHeight = 360

  let top = rect.bottom + 8
  let left = rect.left

  // If not enough space below, open above
  if (top + dropdownHeight > window.innerHeight - 16) {
    top = rect.top - 8 - dropdownHeight
  }

  if (left + dropdownWidth > window.innerWidth - 16) {
    left = window.innerWidth - dropdownWidth - 16
  }
  if (left < 16) left = 16

  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${dropdownWidth}px`,
    zIndex: '9999',
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

function onDocumentClick(e: MouseEvent) {
  if (!isOpen.value) return
  const target = e.target as HTMLElement
  const dropdownEl = document.querySelector('.assistant-dropdown-portal')
  if (
    (rootEl.value && rootEl.value.contains(target)) ||
    (dropdownEl && dropdownEl.contains(target))
  ) {
    return
  }
  close()
}

watch(isOpen, (val) => {
  if (val) nextTick(() => updatePosition())
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})
</script>

<template>
  <div
    ref="rootEl"
    class="assistant-selector"
    @keydown="onKeydown"
  >
    <!-- Trigger: empty state -->
    <button
      v-if="!selectedOption"
      type="button"
      :disabled="disabled"
      :class="[
        'flex items-center gap-2 w-full px-4 py-3.5 text-left transition-all duration-200',
        disabled
          ? 'text-text-tertiary cursor-not-allowed'
          : 'text-text-secondary hover:text-text-primary cursor-pointer bg-white',
      ]"
      @click.stop="toggle"
    >
      <img :src="chooseIcon" alt="" class="w-4 h-4 shrink-0" />
      <span class="text-sm">Выберите ассистента</span>
      <svg class="w-4 h-4 shrink-0 ml-auto text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Trigger: selected assistant chip -->
    <div v-else class="flex items-center gap-3 bg-white">
      <div
        class="flex items-center gap-2.5 flex-1 px-4 py-3 cursor-pointer transition-all"
        @click.stop="toggle"
      >
        <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
          <img
            v-if="selectedOption.iconSrc"
            :src="selectedOption.iconSrc"
            alt=""
            class="w-5 h-5 object-contain"
          />
          <span v-else class="text-white text-xs font-bold">{{ selectedOption.name.charAt(0) }}</span>
        </div>
        <span class="text-sm font-medium text-text-primary">{{ selectedOption.name }}</span>
        <svg class="w-4 h-4 shrink-0 ml-auto text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Teleported dropdown -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="assistant-dropdown-portal fixed bg-white border border-border rounded-2xl shadow-2xl overflow-hidden"
          :style="dropdownStyle"
        >
          <!-- Options grid -->
          <div class="max-h-[320px] overflow-y-auto p-5">
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="option in filteredOptions"
                :key="option.id"
                type="button"
                :class="[
                  'flex items-start gap-3 p-5 rounded-[10px] text-left transition-all cursor-pointer border-solid',
                  option.id === modelValue
                    ? ''
                    : 'hover:bg-bg-secondary',
                ]"
                :style="{
                  borderColor: option.id === modelValue ? optionColor(option) : '#EBEDEF',
                  borderWidth: option.id === modelValue ? '2px' : '1px',
                }"
                @click="select(option)"
              >
                <!-- Icon circle 47x47 -->
                <div
                  class="w-[47px] h-[47px] rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                  :style="{ backgroundColor: optionBgColor(option) }"
                >
                  <img
                    v-if="option.iconSrc"
                    :src="option.iconSrc"
                    alt=""
                    class="w-7 h-7 object-contain"
                  />
                  <span v-else class="text-lg font-bold" :style="{ color: optionColor(option) }">{{ option.name.charAt(0) }}</span>
                </div>

                <!-- Text -->
                <div class="min-w-0 flex-1 pt-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm font-semibold text-text-primary">{{ option.name }}</span>
                    <div
                      v-if="option.id === modelValue"
                      class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      :style="{ backgroundColor: optionColor(option) }"
                    >
                      <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="text-xs text-text-tertiary mt-1">{{ option.description }}</div>
                </div>
              </button>
            </div>
          </div>

          <div
            v-if="filteredOptions.length === 0"
            class="text-center text-sm text-text-tertiary py-8"
          >
            Ничего не найдено
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
