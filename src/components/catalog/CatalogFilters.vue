<template>
  <div class="catalog-filters">
    <h2 class="catalog-filters__title">Фильтры</h2>
    
    <div class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Поиск</h3>
      <UiInput
        v-model="searchQuery"
        placeholder="Найти книгу"
        @input="onSearchChange"
        @focus="showAutocomplete = true"
      >
        <template #rightIcon>
          <span class="catalog-filters__search-icon">🔍</span>
        </template>
      </UiInput>
      
      <!-- Добавляем автодополнение -->
      <div v-if="showAutocomplete && searchResults.length > 0" class="catalog-filters__autocomplete">
        <ul class="catalog-filters__autocomplete-list">
          <li 
            v-for="result in searchResults" 
            :key="result.id"
            class="catalog-filters__autocomplete-item"
            @click="selectSearchResult(result)"
          >
            <span class="catalog-filters__autocomplete-title">{{ result.title }}</span>
            <span class="catalog-filters__autocomplete-author">{{ result.author }}</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Сортировка</h3>
      <div class="catalog-filters__select-wrapper">
        <select 
          v-model="sortBy" 
          class="catalog-filters__select"
          @change="onSortChange"
        >
          <option value="popularity">По популярности</option>
          <option value="price-low">По возрастанию цены</option>
          <option value="price-high">По убыванию цены</option>
          <option value="newest">По новизне</option>
          <option value="rating">По рейтингу</option>
        </select>
        <span class="catalog-filters__select-icon">▼</span>
      </div>
    </div>
    
    <div class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Цена</h3>
      <div class="catalog-filters__price-range">
        <UiInput
          v-model="priceMin"
          type="number"
          placeholder="от"
          @blur="onPriceRangeChange"
        />
        <span class="catalog-filters__price-range-divider">—</span>
        <UiInput
          v-model="priceMax"
          type="number"
          placeholder="до"
          @blur="onPriceRangeChange"
        />
      </div>
    </div>
    
    <div class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Рейтинг</h3>
      <div class="catalog-filters__ratings">
        <label 
          v-for="rating in ratings" 
          :key="rating.value" 
          class="catalog-filters__rating-item"
        >
          <input
            type="checkbox"
            :value="rating.value"
            v-model="rating.checked"
            @change="onRatingChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__rating-stars">
            <span v-for="i in 5" :key="i" class="catalog-filters__rating-star">
              {{ i <= rating.value ? '★' : '☆' }}
            </span>
          </span>
          <span v-if="rating.value === 5" class="catalog-filters__rating-text">и выше</span>
        </label>
      </div>
    </div>
    
    <!-- Publisher Filter -->
    <div v-if="isPublishersLoading" class="catalog-filters__loader">
      Загрузка издательств...
    </div>
    <div v-else-if="publishers.length" class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Издательства</h3>
      <div class="catalog-filters__publishers">
        <label 
          v-for="publisher in publishers" 
          :key="publisher.value" 
          class="catalog-filters__publisher-item"
        >
          <input
            type="checkbox"
            :value="publisher.value"
            v-model="publisher.checked"
            @change="onPublishersChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__publisher-name">
            {{ publisher.label }}
          </span>
          <span class="catalog-filters__publisher-count">({{ publisher.count }})</span>
        </label>
      </div>
    </div>
    
    <!-- Features Filter -->
    <div class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Особенности</h3>
      <div class="catalog-filters__features">
        <label class="catalog-filters__feature-item">
          <input
            type="checkbox"
            v-model="hasPreview"
            @change="onFeaturesChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__feature-label">
            Предпросмотр текста
          </span>
        </label>
        <label class="catalog-filters__feature-item">
          <input
            type="checkbox"
            v-model="hasAudio"
            @change="onFeaturesChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__feature-label">
            Аудиофрагмент
          </span>
        </label>
      </div>
    </div>
    
    <div v-if="isGenresLoading" class="catalog-filters__loader">
      Загрузка жанров...
    </div>
    <div v-else-if="genres.length" class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Жанры</h3>
      <div class="catalog-filters__genres">
        <label 
          v-for="genre in genres" 
          :key="genre.value" 
          class="catalog-filters__genre-item"
        >
          <input
            type="checkbox"
            :value="genre.value"
            v-model="genre.checked"
            @change="onGenresChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__genre-name">
            {{ genre.label }}
          </span>
          <span class="catalog-filters__genre-count">({{ genre.count }})</span>
        </label>
      </div>
    </div>
    
    <div v-if="isAuthorsLoading" class="catalog-filters__loader">
      Загрузка авторов...
    </div>
    <div v-else-if="authors.length" class="catalog-filters__section">
      <h3 class="catalog-filters__subtitle">Авторы</h3>
      <div class="catalog-filters__authors">
        <label 
          v-for="author in authors" 
          :key="author.value" 
          class="catalog-filters__author-item"
        >
          <input
            type="checkbox"
            :value="author.value"
            v-model="author.checked"
            @change="onAuthorsChange"
            class="catalog-filters__checkbox"
          />
          <span class="catalog-filters__author-name">
            {{ author.label }}
          </span>
          <span class="catalog-filters__author-count">({{ author.count }})</span>
        </label>
      </div>
    </div>
    
    <div class="catalog-filters__section">
      <label class="catalog-filters__discount-item">
        <input
          type="checkbox"
          v-model="onlyDiscounted"
          @change="onDiscountChange"
          class="catalog-filters__checkbox"
        />
        <span class="catalog-filters__discount-label">
          Только со скидкой
        </span>
      </label>
    </div>
    
    <div class="catalog-filters__actions">
      <UiButton 
        variant="outline" 
        @click="resetFilters"
        full-width
      >
        Сбросить фильтры
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCatalogStore } from '../../stores/catalog';
import UiInput from '../ui/UiInput.vue';
import UiButton from '../ui/UiButton.vue';
import type { ICatalogFilters, IFilterOption, IRatingFilter } from '../../interfaces/filters.interface';

// Добавим интерфейс для результатов поиска
interface ISearchResult {
  id: string;
  title: string;
  author: string;
}

const catalogStore = useCatalogStore();

const isGenresLoading = ref(true);
const isAuthorsLoading = ref(true);
const isPublishersLoading = ref(true);

const searchQuery = ref('');
const sortBy = ref<ICatalogFilters['sortBy']>('popularity');
const priceMin = ref<number | ''>(0);
const priceMax = ref<number | ''>(5000);
const ratings = ref<IRatingFilter[]>([
  { value: 5, checked: false },
  { value: 4, checked: false },
  { value: 3, checked: false },
  { value: 2, checked: false },
  { value: 1, checked: false }
]);
const genres = ref<IFilterOption[]>([]);
const authors = ref<IFilterOption[]>([]);
const publishers = ref<IFilterOption[]>([]);
const onlyDiscounted = ref(false);
const hasPreview = ref(false);
const hasAudio = ref(false);
const showAutocomplete = ref(false);
const searchResults = ref<ISearchResult[]>([]);

// Initial data loading
onMounted(async () => {
  initializeFilters();
  await loadFilterOptions();
  document.addEventListener('click', (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.catalog-filters__section')) {
      showAutocomplete.value = false;
    }
  });
});

// Initialize filters from store
function initializeFilters() {
  const storeFilters = catalogStore.filters;
  
  searchQuery.value = storeFilters.search;
  sortBy.value = storeFilters.sortBy;
  priceMin.value = storeFilters.priceRange.min;
  priceMax.value = storeFilters.priceRange.max;
  ratings.value = [...storeFilters.ratings];
  onlyDiscounted.value = storeFilters.onlyDiscounted;
  hasPreview.value = storeFilters.hasPreview;
  hasAudio.value = storeFilters.hasAudio;
}

// Load genres, authors, and publishers
async function loadFilterOptions() {
  isGenresLoading.value = true;
  isAuthorsLoading.value = true;
  isPublishersLoading.value = true;
  
  try {
    // Get genres, authors, and publishers from store
    const fetchedGenres = await catalogStore.fetchGenres();
    const fetchedAuthors = await catalogStore.fetchAuthors();
    const fetchedPublishers = await catalogStore.fetchPublishers();
    
    // Map store filters to UI elements
    const storeGenres = catalogStore.filters.genres || [];
    const storeAuthors = catalogStore.filters.authors || [];
    const storePublishers = catalogStore.filters.publishers || [];
    
    // Initialize genres with checked state from store
    genres.value = fetchedGenres.map(genre => ({
      ...genre,
      checked: storeGenres.some(g => g.value === genre.value)
    }));
    
    // Initialize authors with checked state from store
    authors.value = fetchedAuthors.map(author => ({
      ...author,
      checked: storeAuthors.some(a => a.value === author.value)
    }));
    
    // Initialize publishers with checked state from store
    publishers.value = fetchedPublishers.map(publisher => ({
      ...publisher,
      checked: storePublishers.some(p => p.value === publisher.value)
    }));
  } catch (err) {
    console.error('Error loading filter options:', err);
  } finally {
    isGenresLoading.value = false;
    isAuthorsLoading.value = false;
    isPublishersLoading.value = false;
  }
}

// Event handlers
function onSearchChange() {
  updateFilters({ search: searchQuery.value });
  
  // Добавим запрос на автодополнение
  if (searchQuery.value.length > 2) {
    // Здесь должен быть запрос к API, сейчас используем моковые данные
    searchResults.value = [
      { id: '1', title: 'Война и мир', author: 'Лев Толстой' },
      { id: '2', title: 'Преступление и наказание', author: 'Федор Достоевский' },
      { id: '3', title: 'Мастер и Маргарита', author: 'Михаил Булгаков' }
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    showAutocomplete.value = true;
  } else {
    searchResults.value = [];
    showAutocomplete.value = false;
  }
}

function onSortChange() {
  updateFilters({ sortBy: sortBy.value });
}

function onPriceRangeChange() {
  const min = priceMin.value === '' ? 0 : priceMin.value;
  const max = priceMax.value === '' ? 5000 : priceMax.value;
  
  updateFilters({ 
    priceRange: { 
      min: Number(min), 
      max: Number(max) 
    } 
  });
}

function onRatingChange() {
  updateFilters({ ratings: [...ratings.value] });
}

function onGenresChange() {
  const selectedGenres = genres.value
    .filter(genre => genre.checked)
    .map(genre => ({ id: genre.id, value: genre.value, label: genre.label }));
  
  updateFilters({ genres: selectedGenres });
}

function onAuthorsChange() {
  const selectedAuthors = authors.value
    .filter(author => author.checked)
    .map(author => ({ id: author.id, value: author.value, label: author.label }));
  
  updateFilters({ authors: selectedAuthors });
}

function onPublishersChange() {
  const selectedPublishers = publishers.value
    .filter(publisher => publisher.checked)
    .map(publisher => ({ id: publisher.id, value: publisher.value, label: publisher.label }));
  
  updateFilters({ publishers: selectedPublishers });
}

function onFeaturesChange() {
  updateFilters({ hasPreview: hasPreview.value, hasAudio: hasAudio.value });
}

function onDiscountChange() {
  updateFilters({ onlyDiscounted: onlyDiscounted.value });
}

function resetFilters() {
  catalogStore.resetFilters();
  initializeFilters();
  
  // Reset checkboxes for genres, authors, and publishers
  genres.value.forEach(genre => genre.checked = false);
  authors.value.forEach(author => author.checked = false);
  publishers.value.forEach(publisher => publisher.checked = false);
}

// Update filters in the store
function updateFilters(newFilters: Partial<ICatalogFilters>) {
  catalogStore.updateFilters(newFilters);
}

function selectSearchResult(result: ISearchResult) {
  searchQuery.value = result.title;
  showAutocomplete.value = false;
  updateFilters({ search: searchQuery.value });
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.catalog-filters {
  background-color: var(--color-card);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  padding: $spacing-lg;
  
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid var(--color-border);
  }
  
  &__section {
    margin-bottom: $spacing-lg;
  }
  
  &__subtitle {
    font-family: $font-family-heading;
    font-size: $font-size-base;
    margin-bottom: $spacing-sm;
    font-weight: 600;
  }
  
  &__search-icon {
    cursor: pointer;
  }
  
  &__select-wrapper {
    position: relative;
  }
  
  &__select {
    appearance: none;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-input-background);
    font-size: $font-size-base;
    color: var(--color-text);
    cursor: pointer;
  }
  
  &__select-icon {
    position: absolute;
    right: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: var(--color-text-light);
    pointer-events: none;
  }
  
  &__price-range {
    @include flex(row, space-between, center);
    gap: $spacing-sm;
  }
  
  &__price-range-divider {
    color: var(--color-text-light);
  }
  
  &__ratings,
  &__genres,
  &__authors,
  &__publishers,
  &__features {
    @include flex(column, flex-start, flex-start);
    gap: $spacing-xs;
  }
  
  &__rating-item,
  &__genre-item,
  &__author-item,
  &__publisher-item,
  &__feature-item,
  &__discount-item {
    @include flex(row, flex-start, center);
    gap: $spacing-sm;
    cursor: pointer;
    width: 100%;
  }
  
  &__checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  &__rating-stars {
    color: #f9a825;
    letter-spacing: -1px;
  }
  
  &__rating-text,
  &__genre-count,
  &__author-count,
  &__publisher-count,
  &__discount-label {
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__genre-name,
  &__author-name,
  &__publisher-name,
  &__discount-label {
    font-size: $font-size-sm;
    color: var(--color-text);
  }
  
  &__loader {
    margin-bottom: $spacing-lg;
    color: var(--color-text-light);
    font-size: $font-size-sm;
    font-style: italic;
  }
  
  &__actions {
    margin-top: $spacing-xl;
  }
  
  &__autocomplete {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: $spacing-sm;
    z-index: 1000;
    
    &__autocomplete-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    &__autocomplete-item {
      padding: $spacing-sm;
      cursor: pointer;
      
      &:hover {
        background-color: var(--color-background);
      }
    }
    
    &__autocomplete-title {
      font-weight: 600;
    }
    
    &__autocomplete-author {
      font-size: $font-size-sm;
      color: var(--color-text-light);
    }
  }
}
</style> 