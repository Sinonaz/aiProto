<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()
const router = useRouter()

const collapsed = ref(false)
const isSearching = ref(false)
const searchQuery = ref('')

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chatStore.sortedChats
  const q = searchQuery.value.toLowerCase()
  return chatStore.sortedChats.filter((c) => c.title.toLowerCase().includes(q))
})

function startSearch() {
  isSearching.value = true
}

function closeSearch() {
  isSearching.value = false
  searchQuery.value = ''
}

function goToChat(id: string) {
  chatStore.selectChat(id)
  router.push(`/chat/${id}`)
}

function newChat() {
  const id = chatStore.createChat()
  router.push(`/chat/${id}`)
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function goHome() {
  chatStore.currentChatId = null
  router.push('/')
}

function goToProfile() {
  router.push('/profile')
}
</script>

<template>
  <aside
    :class="[
      'flex flex-col h-full bg-bg-page shrink-0 transition-all duration-300',
      collapsed ? 'w-[56px]' : 'w-[260px]',
    ]"
  >
    <!-- Header -->
    <div :class="['flex items-center', collapsed ? 'flex-col px-1 pt-4 gap-3' : 'px-5 pt-5 pb-3 justify-between']">
      <a
        v-if="!collapsed"
        class="text-base font-bold text-text-primary hover:text-brand transition-colors cursor-pointer"
        @click="goHome"
      >
        AI-АССИСТЕНТ
      </a>

      <!-- Collapse toggle -->
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-sidebar-hover transition-colors cursor-pointer shrink-0"
        @click="toggleCollapse"
      >
        <svg v-if="!collapsed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- New chat + Search chats -->
    <div :class="collapsed ? 'px-2 pt-2 flex flex-col gap-3' : 'px-4 pb-3 flex flex-col gap-1'">
      <button
        :class="[
          'flex items-center gap-3 text-sm text-text-primary hover:text-brand transition-colors cursor-pointer',
          collapsed ? 'flex-col gap-1 text-xs mx-auto' : 'w-full',
        ]"
        @click="newChat"
      >
        <div class="w-7 h-7 rounded-full bg-[#E8EAF2] flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span v-if="!collapsed">Новый чат</span>
      </button>

      <button
        :class="[
          'flex items-center gap-3 text-sm text-text-primary hover:text-brand transition-colors cursor-pointer',
          collapsed ? 'flex-col gap-1 text-xs mx-auto' : 'w-full',
        ]"
        @click="startSearch"
      >
        <div class="w-7 h-7 rounded-full bg-[#E8EAF2] flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span v-if="!collapsed">Искать чаты</span>
      </button>
    </div>

    <!-- Search input -->
    <div v-if="isSearching && !collapsed" class="px-4 pb-2">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск..."
          class="w-full pl-8 pr-8 py-1.5 text-sm bg-white rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-text-tertiary hover:text-text-primary cursor-pointer"
          @click="closeSearch"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Recent chats -->
    <div v-if="!collapsed && !isSearching" class="px-5 pb-2">
      <span class="text-xs text-text-tertiary">Недавние</span>
    </div>

    <!-- Chat list -->
    <nav v-if="!collapsed" class="flex-1 overflow-y-auto px-2">
      <div
        v-for="chat in filteredChats"
        :key="chat.id"
        :class="[
          'rounded-xl cursor-pointer transition-colors px-2.5 py-2',
          chat.id === chatStore.currentChatId
            ? 'bg-white shadow-sm'
            : 'hover:bg-sidebar-hover',
        ]"
        @click="goToChat(chat.id)"
      >
        <div class="text-[14px] text-sidebar-text truncate">
          {{ chat.title }}
        </div>
      </div>

      <div
        v-if="filteredChats.length === 0"
        class="text-center text-sm text-sidebar-text-muted py-8"
      >
        Нет чатов
      </div>
    </nav>

    <!-- Footer user -->
    <div v-if="!collapsed" class="px-4 pb-4">
      <div
        class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-hover transition-colors cursor-pointer"
        @click="goToProfile"
      >
        <div class="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-semibold">
          I
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-sidebar-text truncate">Isaac Shir</div>
          <div class="text-xs text-sidebar-text-muted">Pro план</div>
        </div>
      </div>
    </div>
  </aside>
</template>
