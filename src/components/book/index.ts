// Компоненты связанные с книгами
import { defineAsyncComponent } from 'vue'

const BookViewer = defineAsyncComponent(() => import('./BookViewer.vue'))
const BookRecommendations = defineAsyncComponent(() => import('./BookRecommendations.vue'))
const BookReviews = defineAsyncComponent(() => import('./BookReviews.vue'))
const AudioSamplePlayer = defineAsyncComponent(() => import('./AudioSamplePlayer.vue'))

export {
  BookViewer,
  BookRecommendations,
  BookReviews,
  AudioSamplePlayer
} 