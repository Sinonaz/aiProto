<script setup lang="ts">
import AppLayout from '@/components/layout/AppLayout.vue'

interface ProfileData {
  name: string
  email: string
  plan: string
  avatar: string
  department: string
  position: string
  joinedDate: string
  stats: {
    chatsTotal: number
    promptsThisMonth: number
    avgResponseTime: string
    favoriteModel: string
  }
}

const profile: ProfileData = {
  name: 'Isaac Shir',
  email: 'aziksimpson@gmail.com',
  plan: 'Pro план',
  avatar: 'I',
  department: 'Разработка',
  position: 'Senior Frontend Developer',
  joinedDate: 'Январь 2024',
  stats: {
    chatsTotal: 247,
    promptsThisMonth: 89,
    avgResponseTime: '2.1 сек',
    favoriteModel: 'Fable 5',
  },
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col h-full overflow-y-auto">
      <div class="max-w-[600px] mx-auto w-full px-6 py-8">
        <!-- Header -->
        <div class="flex items-center gap-5 mb-8">
          <div class="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold shrink-0">
            {{ profile.avatar }}
          </div>
          <div>
            <h1 class="text-xl font-bold text-text-primary">{{ profile.name }}</h1>
            <p class="text-sm text-text-secondary">{{ profile.position }}</p>
            <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand font-medium">
              {{ profile.plan }}
            </span>
          </div>
        </div>

        <!-- Info -->
        <div class="bg-bg-secondary rounded-2xl p-5 mb-4">
          <h2 class="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">Информация</h2>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary">Email</span>
              <span class="text-sm text-text-primary">{{ profile.email }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary">Отдел</span>
              <span class="text-sm text-text-primary">{{ profile.department }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary">Должность</span>
              <span class="text-sm text-text-primary">{{ profile.position }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary">Дата регистрации</span>
              <span class="text-sm text-text-primary">{{ profile.joinedDate }}</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-bg-secondary rounded-2xl p-4">
            <div class="text-2xl font-bold text-text-primary">{{ profile.stats.chatsTotal }}</div>
            <div class="text-xs text-text-tertiary mt-1">Всего чатов</div>
          </div>
          <div class="bg-bg-secondary rounded-2xl p-4">
            <div class="text-2xl font-bold text-text-primary">{{ profile.stats.promptsThisMonth }}</div>
            <div class="text-xs text-text-tertiary mt-1">Промптов в этом месяце</div>
          </div>
          <div class="bg-bg-secondary rounded-2xl p-4">
            <div class="text-2xl font-bold text-text-primary">{{ profile.stats.avgResponseTime }}</div>
            <div class="text-xs text-text-tertiary mt-1">Среднее время ответа</div>
          </div>
          <div class="bg-bg-secondary rounded-2xl p-4">
            <div class="text-2xl font-bold text-text-primary">{{ profile.stats.favoriteModel }}</div>
            <div class="text-xs text-text-tertiary mt-1">Любимая модель</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
