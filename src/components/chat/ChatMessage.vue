<script setup lang="ts">
import { ref } from 'vue'
import type { Message } from '@/types'
import { useRouter } from 'vue-router'

defineProps<{
  message: Message
}>()

const router = useRouter()

const feedback = ref<'none' | 'liked' | 'disliked'>('none')
const copied = ref(false)

function toggleLike() {
  feedback.value = feedback.value === 'liked' ? 'none' : 'liked'
}

function toggleDislike() {
  feedback.value = feedback.value === 'disliked' ? 'none' : 'disliked'
}

async function copyContent(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function openSources(chatId: string, messageId: string) {
  router.push(`/chat/${chatId}/sources/${messageId}`)
}

function sourcesLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} источник`
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} источника`
  return `${count} источников`
}
</script>

<template>
  <div
    :class="[
      'py-3 px-1',
      message.role === 'user' ? 'flex justify-end' : '',
    ]"
  >
    <!-- User message -->
    <div
      v-if="message.role === 'user'"
      class="max-w-[70%] rounded-2xl px-4 py-3 bg-[#F3F4F8] text-text-primary"
    >
      <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
    </div>

    <!-- Assistant message — plain text, no bubble -->
    <div v-else class="max-w-[85%]">
      <p class="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>

      <!-- Action row: like / dislike / copy + sources -->
      <div class="flex items-center gap-1 mt-3">
        <!-- Like -->
        <button
          type="button"
          :class="[
            'w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer',
            feedback === 'liked'
              ? 'text-green-600 bg-green-50'
              : 'text-text-tertiary hover:text-green-600 hover:bg-green-50',
          ]"
          @click="toggleLike"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
        </button>

        <!-- Dislike -->
        <button
          type="button"
          :class="[
            'w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer',
            feedback === 'disliked'
              ? 'text-red-600 bg-red-50'
              : 'text-text-tertiary hover:text-red-600 hover:bg-red-50',
          ]"
          @click="toggleDislike"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
        </button>

        <!-- Copy -->
        <button
          type="button"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer relative"
          @click="copyContent(message.content)"
        >
          <!-- Copy icon -->
          <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <!-- Check icon when copied -->
          <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <!-- Sources button with globe icon + count + label -->
        <button
          v-if="message.sources && message.sources.length > 0"
          type="button"
          class="flex items-center gap-1.5 px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors cursor-pointer ml-1"
          @click="openSources(message.chatId, message.id)"
        >
          <!-- Globe icon -->
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>{{ sourcesLabel(message.sources.length) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
