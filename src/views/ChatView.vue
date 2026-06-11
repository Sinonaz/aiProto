<script setup lang="ts">
import { onMounted, watch, ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import AppLayout from '@/components/layout/AppLayout.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import type { Source } from '@/types'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const messagesContainer = ref<HTMLElement | null>(null)

type TabId = 'answer' | 'sources'
const currentTab = ref<TabId>('answer')

// Collect all sources from assistant messages in the current chat
const allSources = computed<Source[]>(() => {
  const seen = new Set<string>()
  const result: Source[] = []
  for (const msg of chatStore.currentMessages) {
    if (msg.role === 'assistant' && msg.sources) {
      for (const s of msg.sources) {
        if (!seen.has(s.id)) {
          seen.add(s.id)
          result.push(s)
        }
      }
    }
  }
  return result
})

onMounted(() => {
  const chatId = route.params.id as string
  if (!chatStore.chats.find((c) => c.id === chatId)) {
    router.push('/')
    return
  }
  chatStore.selectChat(chatId)
})

// Reset tab when chat changes
watch(() => chatStore.currentChatId, () => {
  currentTab.value = 'answer'
})

function openSourceDetail(sourceId: string) {
  const msg = chatStore.currentMessages.find(m => m.sources?.some(s => s.id === sourceId))
  if (msg && chatStore.currentChatId) {
    router.push(`/chat/${chatStore.currentChatId}/sources/${msg.id}`)
  }
}

// Auto-scroll to bottom when new messages or typing
watch(
  () => [chatStore.currentMessages.length, chatStore.isTyping],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: false },
)
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Tabs -->
      <div class="px-6 pt-4 pb-0 border-b" style="border-color: #00203314;">
        <div class="max-w-[700px] mx-auto flex items-center gap-6">
        <button
          type="button"
          :class="[
            'flex items-center gap-1.5 text-sm pb-2.5 transition-colors cursor-pointer',
            currentTab === 'answer'
              ? 'text-text-primary font-medium border-b-2 border-text-primary'
              : 'text-text-tertiary hover:text-text-secondary',
          ]"
          @click="currentTab = 'answer'"
        >
          <!-- Message icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Ответ
        </button>
        <button
          type="button"
          :class="[
            'flex items-center gap-1.5 text-sm pb-2.5 transition-colors cursor-pointer',
            currentTab === 'sources'
              ? 'text-text-primary font-medium border-b-2 border-text-primary'
              : 'text-text-tertiary hover:text-text-secondary',
          ]"
          @click="currentTab = 'sources'"
        >
          <!-- Globe icon -->
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          Ссылки
        </button>
        </div>
      </div>

      <!-- Answer tab -->
      <template v-if="currentTab === 'answer'">
        <!-- Messages - centered -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-6 py-4"
        >
          <div class="max-w-[700px] mx-auto">
            <div
              v-if="chatStore.currentMessages.length === 0 && !chatStore.isTyping"
              class="flex flex-col items-center justify-center h-full text-text-tertiary text-sm"
            >
              <p>Начните диалог — введите запрос ниже</p>
            </div>

            <ChatMessage
              v-for="msg in chatStore.currentMessages"
              :key="msg.id"
              :message="msg"
            />

            <!-- Typing indicator -->
            <div v-if="chatStore.isTyping" class="py-3 px-1">
              <div class="flex gap-1">
                <span class="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" />
                <span class="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" :style="{ animationDelay: '150ms' }" />
                <span class="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" :style="{ animationDelay: '300ms' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Input - centered -->
        <div class="px-6 pb-6">
          <div class="max-w-[700px] mx-auto">
            <ChatInput />
          </div>
        </div>
      </template>

      <!-- Sources tab -->
      <div v-else class="flex-1 overflow-y-auto px-6 py-4">
        <div class="max-w-[700px] mx-auto">
          <div v-if="allSources.length === 0" class="text-text-tertiary text-sm text-center py-12">
            Нет источников
          </div>
          <div v-else class="flex flex-col gap-3">
            <a
              v-for="source in allSources"
              :key="source.id"
              class="block p-4 rounded-xl border border-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all cursor-pointer"
              @click.prevent="openSourceDetail(source.id)"
            >
              <div class="flex items-center gap-2 mb-1">
                <!-- Globe icon -->
                <svg class="w-4 h-4 text-text-tertiary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span class="text-sm font-medium text-text-primary">{{ source.title }}</span>
              </div>
              <p class="text-xs text-text-tertiary line-clamp-2 ml-6">{{ source.snippet }}</p>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-4 text-center">
        <p class="text-xs text-text-tertiary leading-relaxed">
          Запрещено использовать КТ и ПД. Помните, ИИ может ошибаться. Перепроверяйте важные данные.
          <a href="#" class="text-brand hover:underline">Подробнее</a>
        </p>
      </div>
    </div>
  </AppLayout>
</template>
