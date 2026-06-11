<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import AssistantSelector from './AssistantSelector.vue'
import type { AssistantOption } from './AssistantSelector.vue'

const router = useRouter()
const chatStore = useChatStore()

// --- Model ---
const selectedModel = ref('5.5')
const modelOptions = ['5.5', '5.0', '4.5', '4.0']
const isModelOpen = ref(false)
const modelRoot = ref<HTMLElement | null>(null)

function selectModel(v: string) {
  selectedModel.value = v
  isModelOpen.value = false
}

function onDocClick(e: MouseEvent) {
  if (!isModelOpen.value) return
  const target = e.target as HTMLElement
  if (modelRoot.value && !modelRoot.value.contains(target)) {
    isModelOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onUnmounted(() => document.removeEventListener('click', onDocClick, true))

// --- Assistant ---
const assistantOptions: AssistantOption[] = [
  {
    id: 'it-support',
    name: 'IT-поддержка',
    description: 'Доступы . Сбои . Сервисы',
    color: '#9094FD',
    icon: 'it',
    iconSrc: new URL('@/assets/icons/asistent-1.png', import.meta.url).href,
  },
  {
    id: 'project-management',
    name: 'Управление проектами',
    description: 'Планирование . Задачи . Проекты',
    color: '#54CB98',
    icon: 'pm',
    iconSrc: new URL('@/assets/icons/asistent-2.png', import.meta.url).href,
  },
  {
    id: 'file-work',
    name: 'Работа с файлами',
    description: 'Документы . Анализ . Шаблоны',
    color: '#F65F52',
    icon: 'files',
    iconSrc: new URL('@/assets/icons/asistent-3.png', import.meta.url).href,
  },
  {
    id: 'learning',
    name: 'Обучение и развитие',
    description: 'Развитие . Обучение . Курсы',
    color: '#2F9EFF',
    icon: 'edu',
    iconSrc: new URL('@/assets/icons/asistent-4.png', import.meta.url).href,
  },
]

// Local selection for home page (no active chat)
const homeSelectedAssistant = ref<string | null>(null)

// Derive directly from store when in a chat — no watcher timing issues
const selectedAssistant = computed<string | null>({
  get: () => {
    if (chatStore.currentChatId) {
      return chatStore.currentChat?.assistantId ?? null
    }
    return homeSelectedAssistant.value
  },
  set: (val) => {
    if (chatStore.currentChatId && chatStore.currentChat) {
      const oldVal = chatStore.currentChat.assistantId
      // Switching assistant mid-conversation → create new chat
      if (val && oldVal && chatStore.currentMessages.length > 0) {
        const id = chatStore.createChat(undefined, val)
        router.push(`/chat/${id}`)
        return
      }
      chatStore.currentChat.assistantId = val
    } else {
      homeSelectedAssistant.value = val
    }
  },
})

const hasAssistant = computed(() => selectedAssistant.value !== null)

const selectedAssistantOption = computed(() =>
  assistantOptions.find((o) => o.id === selectedAssistant.value) ?? null,
)

const selectedAssistantColor = computed(() =>
  selectedAssistantOption.value?.color ?? null,
)

const isInChat = computed(() =>
  chatStore.currentChatId !== null && chatStore.currentMessages.length > 0,
)

const showChip = computed(() =>
  isInChat.value && !!chatStore.currentChat?.assistantId && !!selectedAssistantOption.value,
)

function removeAssistant() {
  if (chatStore.currentChatId && chatStore.currentChat) {
    chatStore.currentChat.assistantId = null
  } else {
    homeSelectedAssistant.value = null
  }
  chatStore.currentChatId = null
  router.push('/')
}

// --- Suggested prompts ---
const suggestedPrompts: Record<string, string[]> = {
  'it-support': [
    'Как настроить доступ для команды?',
    'Куда обратиться при сбое сервиса?',
    'Как получить доступ к новой системе?',
    'Как получить обучение',
    'Не работает сервис',
  ],
  'project-management': [
    'Как запустить проект?',
    'Кто согласует бюджеты и сроки?',
    'Куда эскалировать риски?',
    'Как составить дорожную карту?',
    'Как согласовать ставку сотруднику?',
  ],
  'file-work': [
    'Проанализируй и составь саммари',
    'Составь текст для презентации',
    'Проанализируй текст и составь вопросы для интервью',
    'Выпиши основные тезисы',
  ],
  'learning': [
    'Какие курсы доступны сотруднику?',
    'Где посмотреть цели и оценку?',
    'Какие есть карьерные возможности?',
    'Как согласовать курс с руководителем?',
  ],
}

const showPrompts = ref(false)
let promptsTimer: ReturnType<typeof setTimeout> | null = null

watch(selectedAssistant, (newVal) => {
  // Hide immediately on switch
  showPrompts.value = false
  if (promptsTimer) clearTimeout(promptsTimer)
  // Show after a brief pause for smooth transition
  if (newVal) {
    promptsTimer = setTimeout(() => {
      showPrompts.value = true
    }, 250)
  }
})

const currentPrompts = computed(() => {
  if (!selectedAssistant.value) return []
  return suggestedPrompts[selectedAssistant.value] ?? []
})

function fillPrompt(text: string) {
  promptText.value = text
}

// --- Prompt ---
const promptText = ref('')
const isSubmitting = ref(false)
const submitSuccess = ref(false)

const canSubmit = computed(() =>
  hasAssistant.value && promptText.value.trim().length > 0 && !isSubmitting.value,
)

const promptError = ref('')

function validatePrompt(): boolean {
  if (!hasAssistant.value) {
    promptError.value = 'Сначала выберите ассистента'
    return false
  }
  if (promptText.value.trim().length === 0) {
    promptError.value = 'Введите текст запроса'
    return false
  }
  promptError.value = ''
  return true
}

// --- Submit ---
async function handleSubmit() {
  if (!validatePrompt()) return

  isSubmitting.value = true
  promptError.value = ''

  let chatId = chatStore.currentChatId
  if (!chatId) {
    chatId = chatStore.createChat(promptText.value.slice(0, 40), selectedAssistant.value)
  }

  chatStore.addMessage(chatId, 'user', promptText.value)

  // Navigate to chat view if not already there
  if (router.currentRoute.value.name !== 'chat') {
    router.push(`/chat/${chatId}`)
  }

  // Wait for mock response
  await chatStore.sendMockResponse(chatId)

  submitSuccess.value = true
  promptText.value = ''
  isSubmitting.value = false

  setTimeout(() => {
    submitSuccess.value = false
  }, 3000)
}

// --- Prompt catalog ---
const emit = defineEmits<{
  openCatalog: []
}>()
</script>

<template>
  <div class="relative">
    <!-- Prompt input card -->
    <div
      :class="[
        'bg-white border-2 rounded-2xl transition-all duration-300',
        promptError
          ? 'border-red-400'
          : hasAssistant && selectedAssistantColor
            ? 'shadow-md'
            : 'border-border',
      ]"
      :style="hasAssistant && selectedAssistantColor ? { borderColor: selectedAssistantColor } : {}"
    >
      <!-- Assistant selector row — shown when chip is not visible -->
      <div v-if="!showChip" class="border-b rounded-t-2xl overflow-hidden" :style="{ borderColor: '#EBEDEF' }">
        <AssistantSelector
          v-model="selectedAssistant"
          :options="assistantOptions"
          :disabled="isSubmitting"
        />
      </div>

      <!-- Text input area -->
      <div class="px-4 py-3">
        <textarea
          v-model="promptText"
          :disabled="!hasAssistant || isSubmitting"
          :placeholder="hasAssistant ? 'Опишите задачу...' : ''"
          rows="3"
          :class="[
            'w-full resize-none text-[15px] text-text-primary bg-transparent placeholder:text-text-tertiary',
            'focus:outline-none',
            (!hasAssistant || isSubmitting) ? 'cursor-not-allowed opacity-30' : '',
          ]"
          @keydown.meta.enter="handleSubmit"
          @keydown.ctrl.enter="handleSubmit"
        />
      </div>

      <!-- Error / Success messages -->
      <div v-if="promptError || submitSuccess" class="px-4 pb-2">
        <p v-if="promptError" class="text-xs text-red-500">{{ promptError }}</p>
        <p v-if="submitSuccess" class="text-xs text-green-600">✓ Сообщение отправлено</p>
      </div>

      <!-- Bottom toolbar -->
      <div class="flex items-center justify-between px-4 py-3 rounded-b-2xl">
        <!-- Catalog button + Assistant chip -->
        <div class="flex items-center gap-2">
          <!-- Assistant chip -->
          <div
            v-if="showChip && !isSubmitting"
            class="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 text-xs rounded-lg border border-border text-text-secondary"
          >
            <img
              v-if="selectedAssistantOption?.iconSrc"
              :src="selectedAssistantOption?.iconSrc!"
              alt=""
              class="w-3.5 h-3.5 object-contain"
            />
            {{ selectedAssistantOption?.name }}
            <button
              class="w-4 h-4 flex items-center justify-center rounded text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer ml-0.5"
              @click="removeAssistant"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            :disabled="!hasAssistant || isSubmitting"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all',
              (!hasAssistant || isSubmitting)
                ? 'border-border text-text-tertiary opacity-30 cursor-not-allowed'
                : 'border-border text-text-secondary hover:border-brand/30 hover:text-brand cursor-pointer',
            ]"
            @click="emit('openCatalog')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Каталог промптов
          </button>
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-2">
          <!-- Model selector dropdown -->
          <div ref="modelRoot" class="relative">
            <button
              type="button"
              :disabled="!hasAssistant || isSubmitting"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all',
                (!hasAssistant || isSubmitting)
                  ? 'border-border text-text-tertiary opacity-30 cursor-not-allowed'
                  : 'border-border text-text-secondary hover:border-brand/40 cursor-pointer',
              ]"
              @click="isModelOpen = !isModelOpen"
            >
              Модель {{ selectedModel }}
              <svg class="w-3 h-3 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                v-if="isModelOpen"
                class="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg z-30 overflow-hidden min-w-[140px]"
              >
                <button
                  v-for="m in modelOptions"
                  :key="m"
                  type="button"
                  :class="[
                    'w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer',
                    selectedModel === m
                      ? 'bg-brand/5 text-brand font-medium'
                      : 'text-text-secondary hover:bg-bg-secondary',
                  ]"
                  @click="selectModel(m)"
                >
                  Модель {{ m }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Send button -->
          <button
            type="button"
            :disabled="!canSubmit"
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0',
              canSubmit
                ? 'bg-brand text-white hover:bg-brand/90 cursor-pointer'
                : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed',
            ]"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting" class="w-4 h-4 flex items-center justify-center">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Suggested prompts — absolute, floats below without pushing layout -->
    <TransitionGroup
      v-if="showPrompts && currentPrompts.length > 0"
      tag="div"
      name="prompt-chip"
      appear
      class="absolute top-full left-0 right-0 flex flex-wrap gap-2 mt-[30px]"
    >
      <button
        v-for="(prompt, idx) in currentPrompts"
        :key="prompt"
        type="button"
        :style="{ transitionDelay: `${idx * 60}ms` }"
        class="px-4 py-2 text-sm text-text-secondary bg-white border border-border rounded-full hover:border-brand/30 hover:text-brand transition-all cursor-pointer prompt-chip-item"
        @click="fillPrompt(prompt)"
      >
        {{ prompt }}
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.prompt-chip-enter-active {
  transition: all 0.35s ease-out;
}
/* Leave instantly — no animation, so switching assistants is smooth */
.prompt-chip-leave-active {
  transition: none;
}
.prompt-chip-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
.prompt-chip-leave-to {
  opacity: 0;
}
</style>
