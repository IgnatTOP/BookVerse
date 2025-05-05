<template>
  <div class="catalog-grid">
    <div v-if="isLoading" class="catalog-grid__loader">
      <div class="catalog-grid__loader-spinner"></div>
      <p class="catalog-grid__loader-text">Загрузка книг...</p>
    </div>
    
    <div v-else-if="error" class="catalog-grid__error">
      <UiAlert variant="error" :modelValue="true">
        <p class="catalog-grid__error-text">{{ error }}</p>
      </UiAlert>
      <div class="catalog-grid__error-action">
        <UiButton @click="retry" variant="primary">
          <template #icon>
            <UiIcon name="arrow-path" spin />
          </template>
          Попробовать снова
        </UiButton>
      </div>
    </div>
    
    <div v-else-if="!books.length" class="catalog-grid__empty">
      <UiIcon name="magnifying-glass" size="xl" class="catalog-grid__empty-icon" />
      <p class="catalog-grid__empty-text">Книги не найдены</p>
      <p class="catalog-grid__empty-help">Попробуйте изменить параметры фильтрации</p>
      <UiButton @click="resetFilters" variant="outline">
        <template #icon>
          <UiIcon name="arrow-uturn-left" />
        </template>
        Сбросить фильтры
      </UiButton>
    </div>
    
    <div v-else class="catalog-grid__grid">
      <div 
        v-for="(book, index) in books" 
        :key="book.id" 
        class="catalog-grid__item fade-in"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <BookCard :book="book" />
      </div>
    </div>
    
    <div v-if="books.length && totalPages > 1" class="catalog-grid__pagination fade-in">
      <button 
        class="catalog-grid__pagination-btn catalog-grid__pagination-btn--prev" 
        :disabled="currentPage === 1"
        @click="prevPage"
        aria-label="Предыдущая страница"
      >
        <UiIcon name="chevron-left" size="sm" />
      </button>
      
      <div class="catalog-grid__pagination-pages">
        <button 
          v-for="page in visiblePages" 
          :key="page" 
          class="catalog-grid__pagination-page"
          :class="{ 'catalog-grid__pagination-page--active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="catalog-grid__pagination-btn catalog-grid__pagination-btn--next"
        :disabled="currentPage === totalPages"
        @click="nextPage"
        aria-label="Следующая страница"
      >
        <UiIcon name="chevron-right" size="sm" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCatalogStore } from '../../stores/catalog';

defineOptions({
  name: 'CatalogGrid'
});

const catalogStore = useCatalogStore();

const books = computed(() => catalogStore.books);
const isLoading = computed(() => catalogStore.isLoading);
const error = computed(() => catalogStore.error);
const totalPages = computed(() => catalogStore.totalPages);
const currentPage = computed(() => catalogStore.filters.page);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5; // максимальное количество видимых кнопок
  
  if (totalPages.value <= maxVisible) {
    // Если страниц меньше или равно maxVisible, показываем все
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    // Иначе показываем страницы вокруг текущей
    let start = Math.max(currentPage.value - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;
    
    if (end > totalPages.value) {
      end = totalPages.value;
      start = Math.max(end - maxVisible + 1, 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
});

function retry() {
  catalogStore.fetchBooks();
}

function resetFilters() {
  catalogStore.resetFilters();
}

function goToPage(page: number) {
  catalogStore.setPage(page);
}

function prevPage() {
  if (currentPage.value > 1) {
    catalogStore.setPage(currentPage.value - 1);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    catalogStore.setPage(currentPage.value + 1);
  }
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.catalog-grid {
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-md;
    
    @include respond-to(sm) {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: $spacing-lg;
    }
    
    @include respond-to(lg) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
  
  &__loader,
  &__error,
  &__empty {
    @include flex(column, center, center);
    padding: $spacing-xxl;
    text-align: center;
  }
  
  &__error-action {
    margin-top: $spacing-md;
  }
  
  &__empty-icon {
    color: var(--color-text-light);
    margin-bottom: $spacing-md;
    opacity: 0.7;
  }
  
  &__loader-spinner {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid rgba(63, 81, 181, 0.1);
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
    margin-bottom: $spacing-md;
  }
  
  &__loader-text,
  &__error-text,
  &__empty-text {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    color: var(--color-text);
    font-weight: $font-weight-medium;
  }
  
  &__empty-help {
    font-size: $font-size-base;
    color: var(--color-text-light);
    margin-bottom: $spacing-lg;
    max-width: 400px;
  }
  
  &__pagination {
    @include flex(row, center, center);
    margin-top: $spacing-xl;
    gap: $spacing-sm;
    padding: $spacing-md;
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }
  
  &__pagination-btn {
    min-width: 40px;
    height: 40px;
    border-radius: var(--border-radius-md);
    background-color: var(--color-surface);
    color: var(--color-text);
    @include flex(row, center, center);
    transition: all $transition-fast;
    border: 1px solid var(--color-border);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      color: var(--color-text-light);
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  
  &__pagination-pages {
    @include flex(row, center, center);
    gap: $spacing-xs;
  }
  
  &__pagination-page {
    min-width: 40px;
    height: 40px;
    border-radius: var(--border-radius-md);
    background-color: var(--color-surface);
    color: var(--color-text);
    @include flex(row, center, center);
    transition: all $transition-fast;
    border: 1px solid var(--color-border);
    font-weight: $font-weight-medium;
    
    &:hover:not(.catalog-grid__pagination-page--active) {
      background-color: var(--color-surface-hover);
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active:not(.catalog-grid__pagination-page--active) {
      transform: translateY(0);
    }
    
    &--active {
      background-color: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 