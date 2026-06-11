<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const message = computed(() => {
  return chatStore.messages.find((m) => m.id === route.params.messageId as string)
})

const chat = computed(() => {
  return chatStore.chats.find((c) => c.id === route.params.chatId as string)
})
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="px-6 py-3 border-b border-border flex items-center gap-3">
        <button
          class="text-text-secondary hover:text-text-primary cursor-pointer"
          @click="router.back()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-sm font-medium text-text-primary">Источники</h1>
          <p class="text-xs text-text-tertiary">{{ chat?.title }}</p>
        </div>
      </div>

      <!-- Sources list -->
      <div class="flex-1 overflow-y-auto px-6 py-4">
        <div class="max-w-[700px] mx-auto">
          <div v-if="!message || !message.sources?.length" class="text-center text-text-tertiary py-12">
            <p class="text-sm">Нет источников для этого сообщения</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="source in message.sources"
              :key="source.id"
              class="p-4 bg-bg-secondary rounded-xl border border-border"
            >
              <h3 class="text-sm font-medium text-text-primary mb-1">{{ source.title }}</h3>
              <a :href="source.url" class="text-xs text-brand hover:underline break-all">{{ source.url }}</a>
              <p class="text-sm text-text-secondary mt-2">{{ source.snippet }}</p>
            </div>
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
