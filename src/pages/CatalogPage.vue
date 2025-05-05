<template>
  <MainLayout>
    <div class="page catalog-page">
      <div class="container">
        <h1 class="page__title fade-in">Каталог книг</h1>
        
        <div class="catalog-page__content">
          <aside class="catalog-page__sidebar fade-in">
            <CatalogFilters />
          </aside>
          
          <div class="catalog-page__main">
            <div class="catalog-page__controls fade-in">
              <div class="catalog-page__results">
                <span v-if="!isLoading && !error">
                  <UiIcon name="book-open" size="sm" class="catalog-page__results-icon" />
                  {{ totalBooksMessage }}
                </span>
              </div>
              
              <div class="catalog-page__mobile-filter">
                <UiButton 
                  @click="isFilterVisible = !isFilterVisible" 
                  variant="outline"
                  size="sm"
                >
                  <template #icon>
                    <UiIcon :name="isFilterVisible ? 'x-mark' : 'funnel'" size="sm" />
                  </template>
                  {{ isFilterVisible ? 'Скрыть фильтры' : 'Показать фильтры' }}
                </UiButton>
              </div>
            </div>
            
            <div
              v-if="isFilterVisible"
              class="catalog-page__mobile-filters"
            >
              <CatalogFilters />
            </div>
            
            <CatalogGrid />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCatalogStore } from '../stores/catalog';
// Components are registered globally

const catalogStore = useCatalogStore();
const isFilterVisible = ref(false);

const isLoading = computed(() => catalogStore.isLoading);
const error = computed(() => catalogStore.error);
const totalBooks = computed(() => catalogStore.totalBooks);

const totalBooksMessage = computed(() => {
  return `Найдено ${totalBooks.value} ${getNounPluralForm(totalBooks.value, 'книга', 'книги', 'книг')}`;
});

onMounted(() => {
  catalogStore.fetchBooks();
});

function getNounPluralForm(number: number, one: string, two: string, five: string): string {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.catalog-page {
  &__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    margin-bottom: $spacing-xxl;
    
    @include respond-to(md) {
      grid-template-columns: minmax(250px, 280px) 1fr;
      gap: $spacing-xl;
    }
  }
  
  &__sidebar {
    display: none;
    border-radius: var(--border-radius-lg);
    background-color: var(--color-card);
    padding: $spacing-md;
    box-shadow: var(--shadow-sm);
    
    @include respond-to(md) {
      display: block;
      position: sticky;
      top: calc(76px + #{$spacing-lg});
    }
  }
  
  &__main {
    min-height: 600px;
  }
  
  &__mobile-filter {
    display: block;
    
    @include respond-to(md) {
      display: none;
    }
  }
  
  &__mobile-filters {
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    
    @include respond-to(md) {
      display: none;
    }
  }
  
  &__controls {
    @include flex(row, space-between, center);
    margin-bottom: $spacing-lg;
    padding: $spacing-sm $spacing-md;
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  &__results {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    @include flex(row, flex-start, center);
    gap: $spacing-xs;
    
    &-icon {
      color: var(--color-primary);
    }
  }
}
</style> 