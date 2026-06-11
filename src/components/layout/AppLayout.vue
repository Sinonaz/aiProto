<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'

defineProps<{
  hideSidebar?: boolean
}>()
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-bg-page">
    <AppSidebar v-if="!hideSidebar" />
    <main class="flex-1 flex flex-col min-w-0 p-6">
      <div class="flex-1 flex flex-col bg-white rounded-[20px] overflow-hidden">
        <slot />
      </div>
    </main>
  </div>
</template>
