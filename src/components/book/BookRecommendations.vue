<template>
  <section class="book-recommendations">
    <h2 class="book-recommendations__title">
      <UiIcon name="sparkles" class="book-recommendations__icon" />
      Рекомендуемые книги
    </h2>
    <div v-if="isLoading" class="book-recommendations__loader">
      <UiIcon name="arrow-path" spin size="md" />
      <span>Загрузка рекомендаций...</span>
    </div>
    <p v-else-if="error" class="book-recommendations__error">
      {{ error }}
    </p>
    <div v-else-if="recommendedBooks.length === 0" class="book-recommendations__empty">
      <p>Рекомендации не найдены.</p>
    </div>
    <div v-else class="book-recommendations__list">
      <div 
        v-for="book in recommendedBooks" 
        :key="book.id"
        class="book-recommendations__item"
      >
        <BookCard :book="book" />
      </div>
    </div>
    
    <div class="book-recommendations__collections" v-if="collections.length > 0">
      <h3 class="book-recommendations__collections-title">Тематические подборки</h3>
      <div class="book-recommendations__collections-list">
        <div 
          v-for="collection in collections" 
          :key="collection.id"
          class="book-recommendations__collection"
          @click="navigateToCollection(collection.id)"
        >
          <div class="book-recommendations__collection-info">
            <h4 class="book-recommendations__collection-title">{{ collection.title }}</h4>
            <p class="book-recommendations__collection-description">{{ collection.description }}</p>
            <span class="book-recommendations__collection-count">
              {{ collection.booksCount }} {{ getNounPluralForm(collection.booksCount, 'книга', 'книги', 'книг') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '../../stores/catalog';
import type { IBook } from '../../interfaces/book.interface';
import { UiIcon } from '../ui';
import { BookCard } from '../catalog';

const props = defineProps({
  bookId: {
    type: String,
    required: true
  },
  genres: {
    type: Array as PropType<string[]>,
    required: true
  },
  author: {
    type: String,
    required: true
  }
});

interface IBookCollection {
  id: string;
  title: string;
  description: string;
  booksCount: number;
}

const catalogStore = useCatalogStore();
const router = useRouter();
const recommendedBooks = ref<IBook[]>([]);
const collections = ref<IBookCollection[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Define types of recommendations
const recommendationTypes = computed(() => [
  {
    id: 'author',
    title: `Больше от автора "${props.author}"`,
  },
  {
    id: 'genre',
    title: `Похожие по жанру "${props.genres[0]}"`,
  },
  {
    id: 'popular',
    title: 'Популярное сейчас',
  }
]);

// Generate example collection data
function generateCollections(): IBookCollection[] {
  return [
    {
      id: 'classics-must-read',
      title: 'Классика, которую стоит прочесть',
      description: 'Собрание лучших произведений русской классической литературы',
      booksCount: 25
    },
    {
      id: 'philosophical-novels',
      title: 'Философские романы',
      description: 'Глубокие размышления о смысле жизни и месте человека в мире',
      booksCount: 18
    },
    {
      id: 'best-2023',
      title: 'Лучшие книги 2023 года',
      description: 'Книги, получившие самые высокие оценки читателей',
      booksCount: 12
    }
  ];
}

async function loadRecommendations() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // In a real application, we would call an API endpoint
    // For now, we'll simulate it by using the catalogStore to get similar books
    recommendedBooks.value = await catalogStore.getRecommendedBooks(
      props.bookId,
      props.author,
      props.genres
    );
    
    // Generate sample collections
    collections.value = generateCollections();
  } catch (err) {
    console.error('Failed to load recommendations:', err);
    error.value = 'Не удалось загрузить рекомендации. Пожалуйста, попробуйте позже.';
  } finally {
    isLoading.value = false;
  }
}

function navigateToCollection(collectionId: string) {
  router.push({
    path: '/catalog',
    query: { collection: collectionId }
  });
}

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

onMounted(() => {
  loadRecommendations();
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.book-recommendations {
  margin-bottom: $spacing-xxl;
  
  &__title {
    @include flex(row, flex-start, center);
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    gap: $spacing-xs;
  }
  
  &__icon {
    color: var(--color-accent);
  }
  
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $spacing-lg;
    
    @include respond-to(md) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @include respond-to(lg) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  &__loader {
    @include flex(row, center, center);
    gap: $spacing-sm;
    padding: $spacing-xl;
    color: var(--color-text-light);
  }
  
  &__error, &__empty {
    padding: $spacing-lg;
    text-align: center;
    color: var(--color-text-light);
  }
  
  &__collections {
    margin-top: $spacing-xl;
    
    &-title {
      font-size: $font-size-lg;
      margin-bottom: $spacing-md;
    }
    
    &-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: $spacing-md;
      
      @include respond-to(md) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @include respond-to(lg) {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
  
  &__collection {
    padding: $spacing-md;
    border-radius: var(--border-radius-lg);
    background-color: var(--color-card);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    &-title {
      font-size: $font-size-md;
      margin-bottom: $spacing-xs;
    }
    
    &-description {
      font-size: $font-size-sm;
      color: var(--color-text-light);
      margin-bottom: $spacing-sm;
      @include line-clamp(2);
    }
    
    &-count {
      font-size: $font-size-xs;
      color: var(--color-primary);
      font-weight: $font-weight-bold;
    }
  }
}
</style> 