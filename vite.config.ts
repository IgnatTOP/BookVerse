import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'vue',
            'vue-router',
            'pinia',
            '@vueuse/core',
            '@heroicons/vue'
          ],
          axios: ['axios'],
          ui: [
            './src/components/ui/UiButton.vue',
            './src/components/ui/UiInput.vue',
            './src/components/ui/UiCard.vue',
            './src/components/ui/UiBadge.vue',
            './src/components/ui/UiIcon.vue',
            './src/components/ui/UiModal.vue',
            './src/components/ui/UiAlert.vue',
            './src/components/ui/UiSkeleton.vue',
            './src/components/ui/UiImage.vue'
          ]
        }
      }
    }
  }
})
