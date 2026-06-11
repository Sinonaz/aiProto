import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/chat/:id',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
    },
    {
      path: '/chat/:chatId/sources/:messageId',
      name: 'sources',
      component: () => import('@/views/SourcesView.vue'),
    },
  ],
})

export default router
