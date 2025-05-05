<template>
  <MainLayout>
    <div class="page book-details-page">
      <div class="container">

        
        <div v-if="error" class="book-details-page__error" role="alert">
          <UiAlert variant="error" :modelValue="true">
            <p class="book-details-page__error-text">{{ error }}</p>
          </UiAlert>
          <div class="book-details-page__error-actions">
            <UiButton @click="fetchBook" variant="primary">
              <template #icon>
                <UiIcon name="arrow-path" />
              </template>
              Попробовать снова
            </UiButton>
            <router-link to="/catalog">
              <UiButton variant="outline">
                <template #icon>
                  <UiIcon name="arrow-uturn-left" />
                </template>
                Вернуться в каталог
              </UiButton>
            </router-link>
          </div>
        </div>
        
        <div v-else-if="!book" class="book-details-page__not-found">
          <UiIcon name="question-mark-circle" size="xl" class="book-details-page__not-found-icon" />
          <h1 class="book-details-page__not-found-title">Книга не найдена</h1>
          <p class="book-details-page__not-found-text">Книга, которую вы ищете, не существует или была удалена.</p>
          <router-link to="/catalog">
            <UiButton variant="primary">
              <template #icon>
                <UiIcon name="book-open" />
              </template>
              Вернуться в каталог
            </UiButton>
          </router-link>
        </div>
        
        <div v-else class="book-details-page__content">
          <div class="book-details-page__back fade-in">
            <router-link to="/catalog" class="book-details-page__back-link">
              <UiIcon name="arrow-left" class="book-details-page__back-icon" />
              Вернуться в каталог
            </router-link>
          </div>
          
          <article class="book-details-page__main">
            <div class="book-details-page__image-container fade-in">
              <UiImage
                :src="book.coverImage" 
                :alt="book.title" 
                class="book-details-page__image" 
                width="300"
                height="450"
              />
              
              <div v-if="book.discountPercentage" class="book-details-page__discount" aria-label="Скидка">
                <UiBadge variant="accent">-{{ book.discountPercentage }}%</UiBadge>
              </div>
              
              <div class="book-details-page__features" aria-label="Дополнительные возможности">
                <UiBadge v-if="book.hasPreview" variant="info" class="book-details-page__feature">
                  <UiIcon name="document-text" size="sm" />
                  Предпросмотр
                </UiBadge>
                <UiBadge v-if="book.hasAudioSample" variant="info" class="book-details-page__feature">
                  <UiIcon name="speaker-wave" size="sm" />
                  Аудиофрагмент
                </UiBadge>
              </div>
            </div>
            
            <div class="book-details-page__info fade-in">
              <h1 class="book-details-page__title">{{ book.title }}</h1>
              <p class="book-details-page__author">{{ book.author }}</p>
              
              <div class="book-details-page__rating" aria-label="Рейтинг книги">
                <div class="book-details-page__stars" aria-hidden="true">
                  <UiIcon 
                    v-for="i in 5" 
                    :key="i"
                    name="star"
                    :type="i <= Math.round(book.rating) ? 'solid' : 'outline'"
                    size="sm"
                    class="book-details-page__star"
                    :class="{ 'book-details-page__star--filled': i <= Math.round(book.rating) }"
                  />
                </div>
                <span class="book-details-page__rating-value">{{ book.rating.toFixed(1) }}</span>
                <span class="book-details-page__reviews">
                  <UiIcon name="chat-bubble-left-right" size="sm" class="book-details-page__reviews-icon" />
                  {{ book.reviewCount }} {{ getNounPluralForm(book.reviewCount, 'отзыв', 'отзыва', 'отзывов') }}
                </span>
              </div>
              
              <div class="book-details-page__price-container">
                <span 
                  v-if="book.discountPercentage" 
                  class="book-details-page__old-price"
                  aria-label="Начальная цена"
                >
                  {{ formatPrice(book.price) }} ₽
                </span>
                <span class="book-details-page__price" aria-label="Цена">
                  {{ formatPrice(discountedPrice) }} ₽
                </span>
              </div>
              
              <div class="book-details-page__actions">
                <UiButton 
                  :variant="isInCart ? 'success' : 'primary'" 
                  size="lg" 
                  @click="addToCart"
                  :disabled="isInCart"
                  aria-label="Добавить книгу в корзину"
                >
                  <template #icon>
                    <UiIcon :name="isInCart ? 'check' : 'shopping-cart'" />
                  </template>
                  {{ isInCart ? 'В корзине' : 'Добавить в корзину' }}
                </UiButton>
                
                <router-link v-if="isInCart" to="/cart">
                  <UiButton variant="outline" size="lg">
                    <template #icon>
                      <UiIcon name="shopping-bag" />
                    </template>
                    Перейти в корзину
                  </UiButton>
                </router-link>
              </div>
              
              <div class="book-details-page__meta-card">
                <dl class="book-details-page__meta">
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="tag" size="sm" class="book-details-page__meta-icon" />
                      Жанр:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ book.genres.join(', ') }}</dd>
                  </div>
                  
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="building-library" size="sm" class="book-details-page__meta-icon" />
                      Издательство:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ book.publisher }}</dd>
                  </div>
                  
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="calendar" size="sm" class="book-details-page__meta-icon" />
                      Год издания:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ getPublicationYear }}</dd>
                  </div>
                  
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="document" size="sm" class="book-details-page__meta-icon" />
                      Страниц:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ book.pages }}</dd>
                  </div>
                  
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="language" size="sm" class="book-details-page__meta-icon" />
                      Язык:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ book.language }}</dd>
                  </div>
                  
                  <div class="book-details-page__meta-item">
                    <dt class="book-details-page__meta-label">
                      <UiIcon name="identification" size="sm" class="book-details-page__meta-icon" />
                      ISBN:
                    </dt>
                    <dd class="book-details-page__meta-value">{{ book.isbn }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
          
          <section class="book-details-page__description fade-in">
            <h2 class="book-details-page__section-title">
              <UiIcon name="information-circle" class="book-details-page__section-icon" />
              Описание
            </h2>
            <div class="book-details-page__description-card">
              <p class="book-details-page__description-text">{{ book.description }}</p>
            </div>
          </section>
          
          <!-- Book Preview Section -->
          <section v-if="book.hasPreview" class="book-details-page__preview fade-in">
            <h2 class="book-details-page__section-title">
              <UiIcon name="document-text" class="book-details-page__section-icon" />
              Предпросмотр
            </h2>
            <div class="book-details-page__preview-card">
              <div v-if="bookPreview" class="book-details-page__preview-content">
                <Suspense>
                  <BookViewer 
                    v-if="showFullPreview"
                    :title="bookPreview.title"
                    :author="bookPreview.author"
                    :previewText="bookPreview.previewText"
                    :coverImage="bookPreview.previewImageUrl"
                  />
                  <template #fallback>
                    <div class="book-details-page__preview-loading">Загрузка предпросмотра...</div>
                  </template>
                </Suspense>
                <p v-if="!showFullPreview" class="book-details-page__preview-text">{{ bookPreview.previewText.substring(0, 150) }}...</p>
                <UiButton 
                  variant="outline" 
                  @click="togglePreview"
                  aria-controls="book-preview"
                >
                  <template #icon>
                    <UiIcon :name="showFullPreview ? 'minus-circle' : 'plus-circle'" />
                  </template>
                  {{ showFullPreview ? 'Скрыть полный предпросмотр' : 'Показать полный предпросмотр' }}
                </UiButton>
              </div>
              <div v-else-if="isPreviewLoading" class="book-details-page__preview-loading" role="status">
                <UiIcon name="arrow-path" spin size="md" class="book-details-page__loading-icon" />
                Загрузка предпросмотра...
              </div>
              <div v-else class="book-details-page__preview-error">
                <UiAlert variant="warning" :modelValue="true">
                  Предпросмотр временно недоступен
                </UiAlert>
              </div>
            </div>
          </section>
          
          <!-- Audio Sample Section -->
          <section v-if="book.hasAudioSample" class="book-details-page__audio fade-in">
            <h2 class="book-details-page__section-title">
              <UiIcon name="speaker-wave" class="book-details-page__section-icon" />
              Аудиофрагмент
            </h2>
            <div class="book-details-page__audio-card">
              <div v-if="audioSample" class="book-details-page__audio-content">
                <div class="book-details-page__audio-info">
                  <p class="book-details-page__audio-title">{{ audioSample.title }}</p>
                  <p class="book-details-page__audio-duration">
                    <UiIcon name="clock" size="sm" class="book-details-page__audio-icon" />
                    Продолжительность: {{ formatDuration(audioSample.duration) }}
                  </p>
                </div>
                <div class="book-details-page__speech-player">
                  <div class="book-details-page__speech-controls">
                    <UiButton 
                      variant="primary" 
                      size="sm" 
                      @click="playSpeech" 
                      :disabled="isSpeaking"
                    >
                      <template #icon>
                        <UiIcon name="play" size="sm" />
                      </template>
                      Воспроизвести
                    </UiButton>
                    <UiButton 
                      variant="outline" 
                      size="sm" 
                      @click="pauseSpeech" 
                      :disabled="!isSpeaking"
                    >
                      <template #icon>
                        <UiIcon name="pause" size="sm" />
                      </template>
                      Пауза
                    </UiButton>
                    <UiButton 
                      variant="outline" 
                      size="sm" 
                      @click="stopSpeech" 
                      :disabled="!isSpeaking && !isPaused"
                    >
                      <template #icon>
                        <UiIcon name="stop" size="sm" />
                      </template>
                      Стоп
                    </UiButton>
                  </div>
                  <div v-if="isSpeaking || isPaused" class="book-details-page__speech-status">
                    {{ isSpeaking ? 'Воспроизведение...' : 'Пауза' }}
                  </div>
                </div>
                <p class="book-details-page__audio-sample">
                  Это бесплатный фрагмент аудиокниги. Полная версия доступна после покупки.
                </p>
              </div>
              <div v-else-if="isAudioLoading" class="book-details-page__audio-loading" role="status">
                <UiIcon name="arrow-path" spin size="md" class="book-details-page__loading-icon" />
                Загрузка аудиофрагмента...
              </div>
              <div v-else class="book-details-page__audio-error">
                <UiAlert variant="warning" :modelValue="true">
                  Аудиофрагмент временно недоступен
                </UiAlert>
              </div>
            </div>
          </section>
          
          <!-- Reviews Section -->
          <BookReviews 
            v-if="book" 
            :bookId="book.id" 
            class="fade-in"
          />
          
          <!-- Recommendations Section -->
          <BookRecommendations 
            v-if="book" 
            :bookId="book.id"
            :author="book.author"
            :genres="book.genres"
            class="fade-in"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCatalogStore } from '../stores/catalog';
import { useCartStore } from '../stores/cart';
import { defineAsyncComponent } from 'vue';

// Import only non-global components as async components
const BookViewer = defineAsyncComponent(() => import('../components/book/BookViewer.vue'));
const BookReviews = defineAsyncComponent(() => import('../components/book/BookReviews.vue'));
const BookRecommendations = defineAsyncComponent(() => import('../components/book/BookRecommendations.vue'));

// Component scaffolds for UI components
const UiButton = {
  props: ['variant', 'size', 'disabled'],
  template: '<button class="ui-button" :class="{ [`ui-button--${variant}`]: true, [`ui-button--${size}`]: true }" :disabled="disabled"><slot></slot></button>'
};

const UiBadge = {
  props: ['variant'],
  template: '<span class="ui-badge" :class="[`ui-badge--${variant}`]"><slot></slot></span>'
};

const UiAlert = {
  props: ['variant', 'modelValue'],
  template: '<div class="ui-alert" :class="[`ui-alert--${variant}`]"><slot></slot></div>'
};

const UiIcon = {
  props: ['name', 'size'],
  template: '<span class="ui-icon" :class="[`ui-icon--${size}`]"><slot></slot></span>'
};

const UiImage = {
  props: ['src', 'alt', 'width', 'height'],
  template: '<div class="ui-image-wrapper" style="width:100%;position:relative;"><img :src="src" :alt="alt" :width="width" :height="height" class="ui-image" loading="lazy" /></div>'
};

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();

// Define type interfaces directly if import is problematic
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  discountPercentage?: number;
  coverImage: string;
  rating: number;
  reviewCount: number;
  genres: string[];
  publicationDate: string;
  pages: number;
  language: string;
  isbn: string;
  publisher: string;
  hasPreview: boolean;
  hasAudioSample: boolean;
}

interface BookPreview {
  id: string;
  title: string;
  author: string;
  previewText: string;
  previewImageUrl: string;
}

interface AudioSample {
  id: string;
  bookId: string;
  title: string;
  duration: number;
  url: string;
  useSpeechSynthesis?: boolean;
  textToRead?: string;
}

const bookId = computed(() => route.params.id as string);
const book = ref<Book | null>(null);
const error = ref<string | null>(null);
const isLoading = ref(false);
const bookPreview = ref<BookPreview | null>(null);
const isPreviewLoading = ref(false);
const showFullPreview = ref(false);
const audioSample = ref<AudioSample | null>(null);
const isAudioLoading = ref(false);
const isSpeaking = ref(false);
const isPaused = ref(false);
const speechSynthesis = window.speechSynthesis;
const speechUtterance = ref<SpeechSynthesisUtterance | null>(null);

const discountedPrice = computed(() => {
  if (!book.value || !book.value.discountPercentage) return book.value?.price || 0;
  
  return Math.round(book.value.price * (1 - book.value.discountPercentage / 100));
});

const isInCart = computed(() => {
  if (!book.value) return false;
  return cartStore.isInCart(book.value.id);
});

const getPublicationYear = computed(() => {
  if (!book.value) return '';
  return new Date(book.value.publicationDate).getFullYear();
});

async function fetchBook() {
  if (!bookId.value) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    book.value = await catalogStore.fetchBookById(bookId.value);
    
    if (book.value) {
      document.title = `${book.value.title} - Книжный магазин`;
      
      if (book.value.hasPreview) {
        fetchBookPreview();
      }
      
      if (book.value.hasAudioSample) {
        fetchAudioSample();
      }
    } else {
      error.value = 'Книга не найдена';
    }
  } catch (err) {
    console.error(err);
    error.value = 'Ошибка при загрузке книги. Пожалуйста, попробуйте позже.';
  } finally {
    isLoading.value = false;
  }
}

async function fetchBookPreview() {
  if (!bookId.value) return;
  
  isPreviewLoading.value = true;
  
  try {
    bookPreview.value = await catalogStore.fetchBookPreview(bookId.value);
  } catch (err) {
    console.error(err);
  } finally {
    isPreviewLoading.value = false;
  }
}

async function fetchAudioSample() {
  if (!bookId.value) return;
  
  isAudioLoading.value = true;
  
  try {
    audioSample.value = await catalogStore.fetchAudioSample(bookId.value);
    
    // Ensure we always have text to read for speech synthesis
    if (audioSample.value && book.value) {
      audioSample.value.useSpeechSynthesis = true;
      
      // Make sure we have text to read
      if (!audioSample.value.textToRead) {
        audioSample.value.textToRead = `${book.value.title} автора ${book.value.author}. ${book.value.description.substring(0, 200)}`;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    isAudioLoading.value = false;
  }
}

function addToCart() {
  if (!book.value) return;
  
  cartStore.addToCart(book.value);
}

function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function playSpeech() {
  if (!audioSample.value?.textToRead) {
    console.error('No text to read');
    return;
  }
  
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported in this browser');
    return;
  }
  
  if (isPaused.value && speechUtterance.value) {
    speechSynthesis.resume();
    isSpeaking.value = true;
    isPaused.value = false;
    return;
  }
  
  // Cancel any ongoing speech first
  stopSpeech();
  
  const utterance = new SpeechSynthesisUtterance(audioSample.value.textToRead);
  
  // Load voices and try to set a Russian voice if available
  let voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    // If voices aren't loaded yet, wait for them
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      setVoice(utterance, voices);
      
      // Now that we have voices, try speaking
      speechUtterance.value = utterance;
      speechSynthesis.speak(utterance);
      isSpeaking.value = true;
    };
  } else {
    setVoice(utterance, voices);
    speechUtterance.value = utterance;
    speechSynthesis.speak(utterance);
    isSpeaking.value = true;
  }
  
  utterance.onend = () => {
    isSpeaking.value = false;
    isPaused.value = false;
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    isSpeaking.value = false;
    isPaused.value = false;
  };
}

function setVoice(utterance: SpeechSynthesisUtterance, voices: SpeechSynthesisVoice[]) {
  // Try to find a Russian voice
  const russianVoice = voices.find(voice => voice.lang.includes('ru'));
  if (russianVoice) {
    utterance.voice = russianVoice;
    utterance.lang = 'ru-RU';
  } else {
    // Fallback to a default voice
    utterance.lang = 'ru-RU';
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1;
}

function pauseSpeech() {
  if (window.speechSynthesis && isSpeaking.value) {
    speechSynthesis.pause();
    isSpeaking.value = false;
    isPaused.value = true;
  }
}

function stopSpeech() {
  if (window.speechSynthesis) {
    speechSynthesis.cancel();
    isSpeaking.value = false;
    isPaused.value = false;
  }
}

function handleAudioError(event: Event) {
  console.error('Audio playback error:', event);
  
  // If normal audio fails and we have text to read, fallback to speech synthesis
  if (audioSample.value && audioSample.value.textToRead) {
    audioSample.value.useSpeechSynthesis = true;
  } else {
    audioSample.value = null;
  }
}

function togglePreview() {
  showFullPreview.value = !showFullPreview.value;
}

function getNounPluralForm(number: number, one: string, few: string, many: string): string {
  const lastTwoDigits = number % 100;
  const lastDigit = number % 10;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return many;
  }
  
  if (lastDigit === 1) {
    return one;
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }
  
  return many;
}

watchEffect(() => {
  if (route.params.id) {
    fetchBook();
  }
});

onMounted(() => {
  if (!route.params.id) {
    router.push('/catalog');
  }
});
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.book-details-page {
  padding: $spacing-xl 0;
  
  &__loader,
  &__error,
  &__not-found {
    text-align: center;
    padding: $spacing-xl 0;
    
    &-actions {
      margin-top: $spacing-lg;
      display: flex;
      justify-content: center;
      gap: $spacing-md;
      
      @include respond-to(xs) {
        flex-direction: column;
        align-items: center;
      }
    }
  }
  
  &__loader-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(var(--color-primary-rgb), 0.2);
    border-left-color: var(--color-primary);
    border-radius: 50%;
    margin: 0 auto $spacing-md;
    animation: spin 1s linear infinite;
  }
  
  &__error-text,
  &__not-found-text {
    margin-bottom: $spacing-lg;
    color: var(--color-text-light);
  }
  
  &__not-found-title {
    margin-bottom: $spacing-md;
    color: var(--color-text);
  }
  
  &__content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  &__back {
    margin-bottom: $spacing-lg;
    
    &-link {
      color: var(--color-primary);
      font-weight: 500;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
      
      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }
  }
  
  &__main {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;
    
    @include respond-to(md) {
      grid-template-columns: minmax(240px, 300px) 1fr;
    }
  }
  
  &__image-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    
    @include respond-to(md) {
      margin: 0;
      position: sticky;
      top: 100px;
    }
  }
  
  &__image {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    background-color: #f5f5f5;
  }
  
  &__discount {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
  }
  
  &__features {
    position: absolute;
    bottom: $spacing-sm;
    left: $spacing-sm;
    display: flex;
    gap: $spacing-xs;
  }
  
  &__title {
    font-size: $font-size-xl;
    margin-bottom: $spacing-xs;
    
    @include respond-to(lg) {
      font-size: $font-size-xxl;
    }
  }
  
  &__author {
    font-size: $font-size-lg;
    color: var(--color-text-light);
    margin-bottom: $spacing-md;
  }
  
  &__rating {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-md;
  }
  
  &__stars {
    margin-right: $spacing-xs;
  }
  
  &__star {
    color: var(--color-accent);
  }
  
  &__rating-value {
    font-weight: 600;
    margin-right: $spacing-xs;
  }
  
  &__reviews {
    color: var(--color-text-light);
  }
  
  &__price-container {
    margin-bottom: $spacing-lg;
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
  
  &__price {
    font-size: $font-size-xl;
    font-weight: 600;
    color: var(--color-primary);
  }
  
  &__old-price {
    font-size: $font-size-lg;
    color: var(--color-text-light);
    text-decoration: line-through;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    flex-direction: column;
    width: 100%;
    
    @include respond-to(sm) {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
  
  &__meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-md;
    
    @include respond-to(sm) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    &-item {
      display: flex;
      flex-direction: column;
      margin: 0;
      
      @include respond-to(sm) {
        flex-direction: row;
        align-items: center;
        gap: $spacing-xs;
      }
    }
    
    &-label {
      font-weight: 500;
      color: var(--color-text-light);
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin-bottom: $spacing-xs;
      
      @include respond-to(sm) {
        margin-bottom: 0;
      }
    }
  }
  
  &__section-title {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-xs;
    border-bottom: 1px solid var(--color-border);
  }
  
  &__description,
  &__preview,
  &__audio {
    margin-bottom: $spacing-xl;
  }
  
  &__description-card,
  &__preview-card,
  &__audio-card {
    background-color: var(--color-card);
    border-radius: $border-radius-lg;
    padding: $spacing-md;
    box-shadow: var(--shadow-sm);
    
    @include respond-to(md) {
      padding: $spacing-lg;
    }
  }
  
  &__description-text {
    line-height: 1.6;
  }
  
  &__preview-content,
  &__audio-content {
    background-color: var(--color-background-light);
    border-radius: 8px;
    padding: $spacing-lg;
  }
  
  &__preview-text {
    margin-bottom: $spacing-md;
    line-height: 1.6;
  }
  
  &__audio-player {
    width: 100%;
    margin: $spacing-md 0;
  }
  
  &__audio-info {
    margin-bottom: $spacing-md;
  }
  
  &__audio-title {
    font-weight: 500;
    margin-bottom: $spacing-xs;
  }
  
  &__audio-duration {
    color: var(--color-text-light);
  }
  
  &__audio-sample {
    color: var(--color-text-light);
    font-style: italic;
  }
  
  &__preview-loading,
  &__audio-loading {
    padding: $spacing-lg;
    text-align: center;
    color: var(--color-text-light);
  }
  
  &__preview-error,
  &__audio-error {
    padding: $spacing-lg;
    text-align: center;
    color: var(--color-error);
  }
  
  &__speech-player {
    margin: $spacing-md 0;
  }
  
  &__speech-controls {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }
  
  &__speech-status {
    font-style: italic;
    color: var(--color-text-light);
    margin-top: $spacing-xs;
  }
}

.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--primary {
    background: var(--color-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--color-primary-light);
    }
  }
  
  &--outline {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid currentColor;
    
    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
    }
  }
  
  &--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

.ui-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  
  &--accent {
    background: var(--color-accent);
    color: white;
  }
  
  &--info {
    background: var(--color-info);
    color: white;
  }
}

.ui-alert {
  padding: $spacing-md;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-card);
  box-shadow: var(--shadow-sm);
  
  &--error {
    background-color: var(--color-error-background);
    border: 1px solid var(--color-error);
  }
}

.ui-icon {
  width: 16px;
  height: 16px;
  
  &--sm {
    width: 12px;
    height: 12px;
  }
  
  &--md {
    width: 20px;
    height: 20px;
  }
  
  &--spin {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 