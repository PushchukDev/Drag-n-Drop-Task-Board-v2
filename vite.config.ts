import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  base: '/Drag-n-Drop-Task-Board-v2/',
  plugins: [svelte()],
})
