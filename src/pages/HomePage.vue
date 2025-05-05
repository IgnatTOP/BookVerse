<template>
  <MainLayout>
    <div class="home-page">
      <section class="home-page__hero">
        <div class="container">
          <div class="home-page__hero-content">
            <h1 class="home-page__title slide-up">Добро пожаловать в КнигоМир</h1>
            <p class="home-page__subtitle slide-up">Ваш проводник в мире литературы</p>
            <router-link to="/catalog" class="home-page__cta slide-up">
              <UiButton variant="accent" size="lg">
                <template #icon>
                  <UiIcon name="book-open" />
                </template>
                Перейти к каталогу
              </UiButton>
            </router-link>
          </div>
        </div>
      </section>
      
      <section class="home-page__featured">
        <div class="container">
          <h2 class="home-page__section-title fade-in">Популярные книги</h2>
          
          <div v-if="isLoading" class="home-page__loader">
            <div class="home-page__loader-spinner"></div>
            <p class="home-page__loader-text">Загрузка книг...</p>
          </div>
          
          <div v-else-if="error" class="home-page__error">
            <UiAlert variant="error" :modelValue="true">
              <p class="home-page__error-text">{{ error }}</p>
            </UiAlert>
            <div class="home-page__error-action">
              <UiButton @click="loadBooks" variant="primary">Попробовать снова</UiButton>
            </div>
          </div>
          
          <div v-else class="home-page__books">
            <div 
              v-for="(book, index) in featuredBooks" 
              :key="book.id" 
              class="home-page__book fade-in"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <BookCard :book="book" />
            </div>
          </div>
          
          <div class="home-page__view-all fade-in">
            <router-link to="/catalog">
              <UiButton variant="outline">
                <template #icon>
                  <UiIcon name="arrow-right" />
                </template>
                Смотреть все книги
              </UiButton>
            </router-link>
          </div>
        </div>
      </section>
      
      <section class="home-page__categories">
        <div class="container">
          <h2 class="home-page__section-title fade-in">Популярные жанры</h2>
          
          <div class="home-page__category-grid">
            <router-link 
              v-for="(category, index) in categories" 
              :key="index"
              :to="`/catalog?genre=${category.value}`"
              class="home-page__category fade-in"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="home-page__category-inner">
                <h3 class="home-page__category-title">{{ category.label }}</h3>
                <span class="home-page__category-count">{{ category.count }} книг</span>
              </div>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCatalogStore } from '../stores/catalog';
import type { IFilterOption } from '../interfaces/filters.interface';

// The components are registered globally in main.ts, 
// no need to import UI components individually

const catalogStore = useCatalogStore();

const isLoading = computed(() => catalogStore.isLoading);
const error = computed(() => catalogStore.error);
const books = computed(() => catalogStore.books);
const featuredBooks = computed(() => books.value.slice(0, 4));

const categories = ref<IFilterOption[]>([]);

onMounted(async () => {
  await loadBooks();
  await loadCategories();
});

async function loadBooks() {
  await catalogStore.fetchBooks();
}

async function loadCategories() {
  try {
    categories.value = await catalogStore.fetchGenres();
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.home-page {
  &__hero {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
    padding: $spacing-xxl 0;
    margin-bottom: $spacing-lg;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/images/pattern.svg') repeat;
      opacity: 0.1;
      z-index: 1;
    }
  }
  
  &__hero-content {
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
    @include flex(column, center, center);
    gap: $spacing-lg;
    position: relative;
    z-index: 2;
  }
  
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-xl;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    
    @include respond-to(md) {
      font-size: $font-size-xxxl;
    }
  }
  
  &__subtitle {
    font-size: $font-size-lg;
    opacity: 0.9;
    max-width: 80%;
    margin: 0 auto;
    
    @include respond-to(md) {
      font-size: $font-size-xl;
    }
  }
  
  &__cta {
    margin-top: $spacing-lg;
  }
  
  &__featured,
  &__categories {
    padding: $spacing-xxl 0;
  }
  
  &__section-title {
    font-family: $font-family-heading;
    font-size: $font-size-xl;
    margin-bottom: $spacing-xl;
    text-align: center;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -$spacing-sm;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background-color: var(--color-accent);
      border-radius: 2px;
    }
  }
  
  &__books {
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
  
  &__view-all {
    margin-top: $spacing-xl;
    text-align: center;
  }
  
  &__category-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-md;
    
    @include respond-to(sm) {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: $spacing-lg;
    }
    
    @include respond-to(lg) {
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
  }
  
  &__category {
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    text-decoration: none;
    transition: all $transition-normal;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-primary);
    }
  }
  
  &__category-inner {
    padding: $spacing-xl $spacing-md;
    @include flex(column, center, center);
    text-align: center;
    height: 100%;
  }
  
  &__category-title {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    margin-bottom: $spacing-xs;
    color: var(--color-text);
    font-weight: $font-weight-semibold;
  }
  
  &__category-count {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    padding: $spacing-xs $spacing-sm;
    background-color: var(--color-surface-hover);
    border-radius: var(--border-radius-full);
  }
  
  &__loader,
  &__error {
    @include flex(column, center, center);
    padding: $spacing-xxl;
    text-align: center;
  }
  
  &__error-action {
    margin-top: $spacing-md;
  }
  
  &__loader-spinner {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid rgba(var(--color-primary), 0.2);
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
    margin-bottom: $spacing-md;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style> 