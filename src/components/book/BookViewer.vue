<template>
  <div class="book-viewer" aria-label="Просмотр книги">
    <div class="book-viewer__container">
      <div class="book-viewer__book">
        <div class="book-viewer__page book-viewer__page--left">
          <div class="book-viewer__content">
            <h3 class="book-viewer__title">{{ title }}</h3>
            <h4 class="book-viewer__author">{{ author }}</h4>
            <div class="book-viewer__divider" aria-hidden="true"></div>
            <p class="book-viewer__text">{{ getLeftPageText }}</p>
          </div>
          <div class="book-viewer__page-number" aria-label="Страница номер">{{ currentPage }}</div>
        </div>
        <div class="book-viewer__spine" aria-hidden="true"></div>
        <div class="book-viewer__page book-viewer__page--right">
          <div class="book-viewer__content">
            <p class="book-viewer__text">{{ getRightPageText }}</p>
          </div>
          <div class="book-viewer__page-number" aria-label="Страница номер">{{ currentPage + 1 }}</div>
        </div>
      </div>
      
      <div class="book-viewer__controls" role="navigation" aria-label="Навигация по книге">
        <button 
          class="ui-button ui-button--outline ui-button--sm" 
          :disabled="currentPage <= 1" 
          @click="prevPage"
          aria-label="Перейти к предыдущим страницам"
        >
          ← Предыдущая
        </button>
        <div class="book-viewer__page-info" aria-live="polite">
          {{ currentPage }}-{{ currentPage + 1 }} из {{ totalPages }}
        </div>
        <button 
          class="ui-button ui-button--outline ui-button--sm" 
          :disabled="currentPage >= totalPages - 1" 
          @click="nextPage"
          aria-label="Перейти к следующим страницам"
        >
          Следующая →
        </button>
      </div>
      
      <p class="book-viewer__notice">
        Это бесплатный предпросмотр книги. Полный текст доступен после покупки.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useCartStore } from '../../stores/cart';
import type { IBook } from '../../interfaces/book.interface';
import { UiIcon, UiButton } from '../ui';
import { defineAsyncComponent } from 'vue';

const AudioSamplePlayer = defineAsyncComponent(() => 
  import('./AudioSamplePlayer.vue')
);

defineOptions({
  name: 'BookViewer'
});

const props = defineProps<{
  title: string;
  author: string;
  previewText: string;
  coverImage: string;
  book?: IBook;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const cartStore = useCartStore();

// Split text into chunks of approximately 300 characters, ending at periods
const textChunks = computed(() => {
  const chunks = [];
  let text = props.previewText;
  
  // Create a loop to split text into chunks, trying to end at periods
  while (text.length > 0) {
    let chunkEnd = Math.min(300, text.length);
    
    // Try to find a period near the 300 character mark to make a natural break
    if (chunkEnd < text.length) {
      const periodIndex = text.indexOf('.', chunkEnd - 50);
      if (periodIndex !== -1 && periodIndex < chunkEnd + 50) {
        chunkEnd = periodIndex + 1;
      }
    }
    
    chunks.push(text.substring(0, chunkEnd));
    text = text.substring(chunkEnd);
  }
  
  return chunks;
});

const totalPages = computed(() => {
  return textChunks.value.length + 1; // +1 for the title page
});

const currentPage = ref(1);

const getLeftPageText = computed(() => {
  if (currentPage.value === 1) {
    return ''; // Title page is blank on the text side
  }
  return textChunks.value[currentPage.value - 2] || '';
});

const getRightPageText = computed(() => {
  return textChunks.value[currentPage.value - 1] || '';
});

function nextPage() {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value += 2;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 2;
  }
}

watchEffect(() => {
  document.title = `Просмотр книги: ${props.title}`;
});

onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextPage();
    } else if (e.key === 'ArrowLeft') {
      prevPage();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
});

const isInCart = computed(() => {
  if (!props.book) return false;
  return cartStore.isInCart(props.book.id);
});

// Доступные вкладки
type TabId = 'preview' | 'audio';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

// Определим доступные вкладки в зависимости от данных книги
const availableTabs = computed<Tab[]>(() => {
  const tabs: Tab[] = [];
  
  if (!props.book) {
    tabs.push({
      id: 'preview',
      label: 'Текст',
      icon: 'document-text'
    });
    return tabs;
  }
  
  if (props.book.previewText) {
    tabs.push({
      id: 'preview',
      label: 'Текст',
      icon: 'document-text'
    });
  }
  
  // Добавим вкладку аудио если есть аудиофрагмент или если есть превью текст
  // (в этом случае мы используем Web Speech API)
  if (props.book.hasAudioSample || props.book.previewText) {
    tabs.push({
      id: 'audio',
      label: 'Аудио',
      icon: 'speaker-wave'
    });
  }
  
  return tabs;
});

// Активная вкладка
const activeTab = ref<TabId>(
  availableTabs.value.length > 0 ? availableTabs.value[0].id : 'preview'
);

function closeViewer() {
  emit('close');
}

function addToCart() {
  if (!props.book || isInCart.value) return;
  cartStore.addToCart(props.book);
}

function formatPreviewText(text?: string): string {
  if (!text) return '<p class="book-viewer__no-preview">Предпросмотр недоступен</p>';
  
  return text.split('\n').map(paragraph => {
    if (paragraph.trim() === '') return '';
    return `<p>${paragraph}</p>`;
  }).join('');
}

function handleAudioError(error: Error) {
  console.error('Ошибка воспроизведения аудио:', error);
  // При необходимости можно показать уведомление пользователю
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.book-viewer {
  margin: $spacing-lg 0;
  
  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-lg;
  }
  
  &__book {
    display: flex;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    overflow: hidden;
    
    @include respond-to(xs) {
      flex-direction: column;
    }
    
    @include respond-to(sm) {
      flex-direction: row;
    }
  }
  
  &__page {
    flex: 1;
    background-color: var(--color-light);
    padding: $spacing-lg;
    height: 500px;
    display: flex;
    flex-direction: column;
    position: relative;
    
    @include respond-to(xs) {
      height: 300px;
    }
    
    @include respond-to(sm) {
      height: 400px;
    }
    
    @include respond-to(md) {
      height: 500px;
    }
    
    &--left {
      border-right: none;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      background-color: #f9f7f1;
    }
    
    &--right {
      border-left: none;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      background-color: #fff;
    }
  }
  
  &__spine {
    width: 24px;
    background: linear-gradient(to right, 
      var(--color-primary-light) 0%, 
      var(--color-primary) 50%, 
      var(--color-primary-dark) 100%);
    position: relative;
    
    @include respond-to(xs) {
      width: 100%;
      height: 10px;
    }
    
    @include respond-to(sm) {
      width: 24px;
      height: auto;
    }
    
    &::before, &::after {
      content: "";
      position: absolute;
      background-color: rgba(0, 0, 0, 0.1);
      
      @include respond-to(xs) {
        height: 100%;
        width: 2px;
        top: 0;
      }
      
      @include respond-to(sm) {
        width: 100%;
        height: 2px;
        left: 0;
      }
    }
    
    &::before {
      @include respond-to(xs) {
        left: 15%;
      }
      
      @include respond-to(sm) {
        top: 15%;
      }
    }
    
    &::after {
      @include respond-to(xs) {
        right: 15%;
      }
      
      @include respond-to(sm) {
        bottom: 15%;
      }
    }
  }
  
  &__content {
    flex: 1;
    padding: $spacing-md;
    overflow-y: auto;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-primary-light);
      border-radius: 3px;
    }
  }
  
  &__title {
    font-size: $font-size-xl;
    margin-bottom: $spacing-sm;
    color: var(--color-text);
    
    @include respond-to(xs) {
      font-size: $font-size-lg;
    }
    
    @include respond-to(md) {
      font-size: $font-size-xl;
    }
  }
  
  &__author {
    font-size: $font-size-base;
    color: var(--color-text-light);
    margin-bottom: $spacing-md;
  }
  
  &__divider {
    width: 40%;
    height: 2px;
    background-color: var(--color-primary-light);
    margin-bottom: $spacing-md;
  }
  
  &__text {
    font-size: $font-size-sm;
    line-height: 1.6;
    
    @include respond-to(md) {
      font-size: $font-size-base;
    }
  }
  
  &__page-number {
    position: absolute;
    bottom: $spacing-sm;
    font-size: $font-size-sm;
    color: var(--color-text-light);
    
    .book-viewer__page--left & {
      right: $spacing-sm;
    }
    
    .book-viewer__page--right & {
      left: $spacing-sm;
    }
  }
  
  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-top: $spacing-sm;
  }
  
  &__page-info {
    min-width: 100px;
    text-align: center;
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__notice {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    font-style: italic;
    margin-top: $spacing-sm;
    text-align: center;
  }
}

.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s, transform 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--outline {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid currentColor;
    
    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }
  
  &--sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
</style> 