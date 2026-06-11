<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chat'
import AppLayout from '@/components/layout/AppLayout.vue'
import ChatInput from '@/components/chat/ChatInput.vue'
import ChatMessage from '@/components/chat/ChatMessage.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const chatStore = useChatStore()

// --- Prompt catalog modal ---
const isCatalogOpen = ref(false)

interface PromptTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  assistantId: string
}

const promptTemplates: PromptTemplate[] = [
  { id: '1', title: 'Анализ рынка', description: 'Структурированный анализ рыночных трендов и конкурентов', prompt: 'Проведи анализ рынка для...', category: 'Бизнес', assistantId: 'gpt-4o' },
  { id: '2', title: 'Code Review', description: 'Ревью кода с рекомендациями по улучшению', prompt: 'Проверь этот код на ошибки и предложи улучшения:\n\n```\n```', category: 'Разработка', assistantId: 'claude-fable-5' },
  { id: '3', title: 'План презентации', description: 'Структура презентации с ключевыми слайдами', prompt: 'Составь план презентации на тему...', category: 'Бизнес', assistantId: 'gpt-4o' },
  { id: '4', title: 'Объясни концепцию', description: 'Простое объяснение сложной концепции', prompt: 'Объясни простыми словами концепцию...', category: 'Обучение', assistantId: 'claude-haiku-4-5' },
  { id: '5', title: 'Написание текста', description: 'Создание статьи, поста или документа', prompt: 'Напиши текст на тему...', category: 'Контент', assistantId: 'gpt-4o' },
  { id: '6', title: 'Перевод и локализация', description: 'Профессиональный перевод с адаптацией', prompt: 'Переведи следующий текст на...', category: 'Контент', assistantId: 'gpt-4o-mini' },
]

function selectTemplate(template: PromptTemplate) {
  chatStore.selectedModelId = template.assistantId as any
  isCatalogOpen.value = false
  // Navigate to a new chat with the template
  const chatId = chatStore.createChat(template.title)
  chatStore.addMessage(chatId, 'system', template.prompt)
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Center area -->
      <div class="flex-1 flex flex-col items-center justify-center px-6">
        <!-- Empty state -->
        <div
          v-if="!chatStore.currentChatId || chatStore.currentMessages.length === 0"
          class="w-full max-w-[700px] flex flex-col items-center text-center"
        >
          <h1 class="text-[30px] font-semibold text-text-primary mb-8">
            Выберите ассистента, <br />чтобы начать работу в чатe
          </h1>

          <div class="w-full">
            <ChatInput @open-catalog="isCatalogOpen = true" />
          </div>
        </div>

        <!-- Messages -->
        <template v-else>
          <div class="w-full max-w-[700px] flex-1 overflow-y-auto">
            <ChatMessage
              v-for="msg in chatStore.currentMessages"
              :key="msg.id"
              :message="msg"
            />
          </div>
          <div class="w-full max-w-[700px]">
            <ChatInput @open-catalog="isCatalogOpen = true" />
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-4 text-center">
        <p class="text-xs text-text-tertiary leading-relaxed">
          Запрещено использовать КТ и ПД. Помните, ИИ может ошибаться. Перепроверяйте важные данные.
          <a href="#" class="text-brand hover:underline">Подробнее</a>
        </p>
      </div>
    </div>

    <!-- Prompt catalog modal -->
    <BaseModal v-model:open="isCatalogOpen" title="Каталог промптов" size="lg">
      <template #default>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="tmpl in promptTemplates"
            :key="tmpl.id"
            type="button"
            class="text-left p-4 rounded-xl border border-border hover:border-brand/30 hover:bg-brand/[0.02] transition-all cursor-pointer"
            @click="selectTemplate(tmpl)"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-tertiary">
                {{ tmpl.category }}
              </span>
            </div>
            <div class="text-sm font-medium text-text-primary">{{ tmpl.title }}</div>
            <div class="text-xs text-text-tertiary mt-1">{{ tmpl.description }}</div>
          </button>
        </div>
      </template>
    </BaseModal>
  </AppLayout>
</template>
