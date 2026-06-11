# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev       # Start Vite dev server
npm run build     # Type-check (vue-tsc) then build for production
npm run preview   # Preview production build locally
npm run deploy    # Build + publish to GitHub Pages (gh-pages branch)
```

## Architecture

**gpnAI** — clickable AI chatbot prototype with mock data. No backend; all state is in-memory.

### Stack
Vue 3 (Composition API, `<script setup>`), TypeScript strict mode, Vite 8, Tailwind CSS 4, Pinia, Vue Router 4.

### Routing
Hash-based history (`createWebHashHistory`) for GitHub Pages compatibility. Three routes:
- `/` — HomeView (assistant selection + prompt input)
- `/chat/:id` — ChatView (messages with answer/sources tabs)
- `/chat/:chatId/sources/:messageId` — SourcesView (source detail for a message)

### Central state — `src/stores/chat.ts`
Pinia store in composable style (`defineStore` + setup function). Holds:
- `chats` — array of Chat objects, each with `assistantId` linking to the selected assistant
- `messages` — flat array of all messages; `currentMessages` computed filters by `currentChatId`
- `isTyping` — boolean ref for typing indicator
- `sendMockResponse(chatId)` — returns a Promise that resolves with a mock assistant message (structured markdown + sources) after 1.5–3.5s delay

### Key patterns

**Dropdown overlays:** Components like `AssistantSelector` use `<Teleport to="body">` with `position: fixed` and `getBoundingClientRect()` for positioning. This avoids clipping by `overflow: hidden` parents. Click-outside handling uses manual `document.addEventListener('click', handler, true)` in `onMounted`/`onUnmounted`.

**Assistant selection flow:** On the home page, `selectedAssistant` is stored locally (`homeSelectedAssistant` ref). Once in a chat, it derives directly from `chatStore.currentChat.assistantId` via a writable computed — no watcher synchronization. Switching assistants mid-conversation creates a new chat.

**Design tokens** are defined in `src/style.css` as Tailwind CSS 4 `@theme` custom colors (`--color-brand`, `--color-bg-page`, `--color-text-primary`, `--color-sidebar-*`, etc.). Page background is `#F3F4F8`; chat area is a white card with 24px padding and 20px border-radius.

**Sidebar:** 260px expanded / 56px collapsed, animated with `transition-all duration-300`. Clicking the "AI-АССИСТЕНТ" title clears `currentChatId` and navigates home.

### Types — `src/types/index.ts`
`Chat`, `Message` (with optional `sources: Source[]`), `Source`, `Model`, `ModelId` union type.
