import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chat, Message, Model, ModelId } from '@/types'

export const useChatStore = defineStore('chat', () => {
  // --- Models ---
  const models = ref<Model[]>([
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable model' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and efficient' },
    { id: 'claude-fable-5', name: 'Fable 5', provider: 'Anthropic', description: 'Powerful reasoning' },
    { id: 'claude-haiku-4-5', name: 'Haiku 4.5', provider: 'Anthropic', description: 'Quick responses' },
  ])

  const selectedModelId = ref<ModelId>('gpt-4o')
  const selectedModel = computed(() =>
    models.value.find((m) => m.id === selectedModelId.value) ?? models.value[0],
  )

  // --- Chats ---
  const chats = ref<Chat[]>([
    { id: '1', title: 'Анализ рыночных трендов', lastMessage: 'Основные выводы по рынку...', timestamp: Date.now() - 3600000, model: 'gpt-4o', assistantId: 'file-work' },
    { id: '2', title: 'Рефакторинг компонента DashboardView', lastMessage: 'Вот исправленный код...', timestamp: Date.now() - 7200000, model: 'claude-fable-5', assistantId: 'it-support' },
    { id: '3', title: 'План презентации для заказчика', lastMessage: 'Структура готова...', timestamp: Date.now() - 86400000, model: 'gpt-4o-mini', assistantId: 'file-work' },
    { id: '4', title: 'Расчёт бюджета на Q2', lastMessage: 'Итоговая таблица прилагается...', timestamp: Date.now() - 90000000, model: 'gpt-4o', assistantId: 'project-management' },
    { id: '5', title: 'Как оформить доступ к VPN', lastMessage: 'Инструкция отправлена...', timestamp: Date.now() - 100000000, model: 'claude-haiku-4-5', assistantId: 'it-support' },
    { id: '6', title: 'Анализ конкурентов по рынку', lastMessage: 'Основные выводы по рынку...', timestamp: Date.now() - 120000000, model: 'gpt-4o', assistantId: 'file-work' },
    { id: '7', title: 'Саммари встречи 5 июня', lastMessage: 'Договорились о сроках...', timestamp: Date.now() - 140000000, model: 'claude-fable-5', assistantId: 'project-management' },
    { id: '8', title: 'Перевод ТЗ на английский', lastMessage: 'Документ готов...', timestamp: Date.now() - 170000000, model: 'gpt-4o-mini', assistantId: 'learning' },
    { id: '9', title: 'Исправление бага с авторизацией', lastMessage: 'Патч отправлен...', timestamp: Date.now() - 200000000, model: 'claude-haiku-4-5', assistantId: 'it-support' },
    { id: '10', title: 'Подготовка к Sprint Review', lastMessage: 'Слайды готовы...', timestamp: Date.now() - 220000000, model: 'gpt-4o', assistantId: 'project-management' },
    { id: '11', title: 'Онбординг нового сотрудника', lastMessage: 'План адаптации составлен...', timestamp: Date.now() - 250000000, model: 'claude-fable-5', assistantId: 'learning' },
    { id: '12', title: 'Выбор CRM-системы', lastMessage: 'Сравнительная таблица...', timestamp: Date.now() - 280000000, model: 'gpt-4o', assistantId: 'file-work' },
  ])

  const currentChatId = ref<string | null>(null)

  const currentChat = computed(() =>
    chats.value.find((c) => c.id === currentChatId.value) ?? null,
  )

  const sortedChats = computed(() =>
    [...chats.value].sort((a, b) => b.timestamp - a.timestamp),
  )

  function selectChat(id: string) {
    currentChatId.value = id
  }

  function createChat(title?: string, assistantId?: string | null): string {
    const id = String(Date.now())
    chats.value.push({
      id,
      title: title ?? 'Новый чат',
      lastMessage: '',
      timestamp: Date.now(),
      model: selectedModelId.value,
      assistantId: assistantId ?? null,
    })
    currentChatId.value = id
    return id
  }

  function updateChatTitle(id: string, title: string) {
    const chat = chats.value.find((c) => c.id === id)
    if (chat) chat.title = title
  }

  // --- Messages ---
  const messages = ref<Message[]>([])

  const currentMessages = computed(() =>
    messages.value.filter((m) => m.chatId === currentChatId.value),
  )

  function addMessage(chatId: string, role: Message['role'], content: string, sources?: Message['sources']) {
    const msg: Message = {
      id: String(Date.now()) + Math.random(),
      chatId,
      role,
      content,
      timestamp: Date.now(),
      sources,
    }
    messages.value.push(msg)

    // Update last message in chat
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      chat.lastMessage = content.slice(0, 80)
      chat.timestamp = Date.now()
    }
    // Return reactive proxy from the array, not the plain object
    return messages.value[messages.value.length - 1]
  }

  // --- Typing indicator ---
  const isTyping = ref(false)

  // --- Helper ---
  function tick(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // --- Mock response with streaming ---
  async function sendMockResponse(chatId: string): Promise<Message> {
    const responses = [
      'Хорошо, давайте разберём этот вопрос подробнее.\n\nНа основе анализа можно выделить несколько ключевых моментов:\n\n1. **Текущая ситуация** — показатели находятся в пределах нормы, но есть потенциал для оптимизации.\n\n2. **Рекомендации** — предлагаю внедрить поэтапный подход с контрольными точками каждые две недели.\n\n3. **Риски** — основной риск связан с временными затратами на начальном этапе.',
      'Отличный вопрос! Вот что мне удалось выяснить:\n\nПроанализировав доступные данные, могу отметить положительную динамику по всем ключевым метрикам. Особенно выделяется рост эффективности на 15% после внедрения предложенных изменений.\n\nЕсли потребуется более детальный разбор — уточните, какой аспект интересует в первую очередь.',
      'Спасибо за запрос. Подготовил краткую сводку:\n\n- **Проблема:** описана достаточно чётко, вижу несколько путей решения\n- **Решение:** оптимальным вариантом будет комбинированный подход\n- **Сроки:** ориентировочно 2-3 недели на реализацию\n\nГотов предоставить пошаговый план, если нужно.',
      'Давайте посмотрим на ситуацию системно.\n\nС одной стороны, текущие процессы отлажены и работают стабильно. С другой — есть возможности для улучшения, которые могут дать существенный прирост эффективности.\n\nМой совет: начать с малого, протестировать гипотезы на ограниченном участке, и только потом масштабировать.',
    ]
    const content = responses[Math.floor(Math.random() * responses.length)]

    // Initial delay — show typing dots
    isTyping.value = true
    await tick(600 + Math.random() * 900)

    // Create empty message and hide typing dots
    const msg = addMessage(chatId, 'assistant', '', [
      { id: 's1', title: 'Внутренняя документация', url: '#', snippet: 'Актуальные регламенты и процедуры...' },
      { id: 's2', title: 'Аналитическая справка', url: '#', snippet: 'Сводные данные за последний период...' },
    ])
    isTyping.value = false

    // Stream content character by character
    let i = 0
    while (i < content.length) {
      const chunkSize = Math.floor(Math.random() * 5) + 1 // 1–5 chars
      const chunk = content.slice(i, i + chunkSize)
      i += chunkSize
      msg.content += chunk

      // Variable delay based on punctuation
      const last = chunk[chunk.length - 1]
      let pause = 15 + Math.random() * 30
      if (last === '.' || last === '!' || last === '?') pause += 70
      else if (last === ',') pause += 35
      else if (last === '\n') pause += 50

      await tick(pause)
    }

    // Update lastMessage in chat sidebar after streaming completes
    const chat = chats.value.find((c) => c.id === chatId)
    if (chat) {
      chat.lastMessage = content.slice(0, 80)
    }

    return msg
  }

  return {
    models,
    selectedModelId,
    selectedModel,
    chats,
    sortedChats,
    currentChatId,
    currentChat,
    messages,
    currentMessages,
    isTyping,
    selectChat,
    createChat,
    updateChatTitle,
    addMessage,
    sendMockResponse,
  }
})
