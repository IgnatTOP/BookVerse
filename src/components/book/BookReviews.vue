<template>
  <section class="book-reviews">
    <h2 class="book-reviews__title">
      <UiIcon name="chat-bubble-left-right" class="book-reviews__title-icon" />
      Отзывы и рецензии ({{ reviews.length }})
    </h2>
    
    <div v-if="isLoading" class="book-reviews__loader">
      <UiIcon name="arrow-path" spin size="md" />
      <span>Загрузка отзывов...</span>
    </div>
    
    <div v-else>
      <div class="book-reviews__add">
        <button class="book-reviews__add-button" @click="showReviewForm = !showReviewForm">
          <UiIcon name="plus-circle" />
          {{ showReviewForm ? 'Отменить' : 'Написать отзыв' }}
        </button>
      </div>
      
      <form v-if="showReviewForm" class="book-reviews__form" @submit.prevent="submitReview">
        <div class="book-reviews__form-header">
          <h3 class="book-reviews__form-title">Ваш отзыв</h3>
        </div>
        
        <div class="book-reviews__rating-input">
          <label class="book-reviews__form-label">Ваша оценка:</label>
          <div class="book-reviews__rating-stars">
            <button 
              v-for="star in 5" 
              :key="star" 
              type="button"
              class="book-reviews__rating-star"
              :class="{ 'book-reviews__rating-star--active': star <= newReview.rating }"
              @click="newReview.rating = star"
            >
              <UiIcon :name="star <= newReview.rating ? 'star' : 'star-outline'" />
            </button>
          </div>
        </div>
        
        <div class="book-reviews__form-field">
          <label class="book-reviews__form-label" for="review-text">Текст отзыва:</label>
          <textarea 
            id="review-text"
            v-model="newReview.text"
            class="book-reviews__form-textarea"
            placeholder="Поделитесь своим мнением о книге..."
            rows="5"
            required
          ></textarea>
        </div>
        
        <div class="book-reviews__form-field book-reviews__form-checkbox">
          <input 
            type="checkbox" 
            id="contains-spoilers" 
            v-model="newReview.containsSpoilers"
          />
          <label for="contains-spoilers">
            Мой отзыв содержит спойлеры
          </label>
        </div>
        
        <div class="book-reviews__form-actions">
          <button type="submit" class="book-reviews__form-submit" :disabled="!canSubmit">
            Опубликовать отзыв
          </button>
          <button 
            type="button" 
            class="book-reviews__form-cancel"
            @click="showReviewForm = false"
          >
            Отмена
          </button>
        </div>
      </form>
      
      <div v-if="reviews.length === 0" class="book-reviews__empty">
        <p>У этой книги еще нет отзывов. Станьте первым, кто поделится своим мнением!</p>
      </div>
      
      <div v-else class="book-reviews__list">
        <div v-for="review in reviews" :key="review.id" class="book-reviews__item">
          <div class="book-reviews__header">
            <div class="book-reviews__user">
              <UiIcon name="user-circle" size="md" class="book-reviews__user-icon" />
              <div class="book-reviews__user-info">
                <span class="book-reviews__user-name">{{ review.userName }}</span>
                <span class="book-reviews__date">{{ formatDate(review.date) }}</span>
              </div>
            </div>
            <div class="book-reviews__rating">
              <UiIcon 
                v-for="star in 5" 
                :key="star"
                :name="star <= review.rating ? 'star' : 'star-outline'"
                size="sm"
                class="book-reviews__star"
                :class="{ 'book-reviews__star--filled': star <= review.rating }"
              />
            </div>
          </div>
          
          <div
            v-if="review.containsSpoilers" 
            class="book-reviews__content book-reviews__content--spoiler"
          >
            <div v-if="!review.spoilerRevealed" class="book-reviews__spoiler-alert">
              <UiIcon name="exclamation-triangle" class="book-reviews__spoiler-icon" />
              <p class="book-reviews__spoiler-text">
                Этот отзыв содержит спойлеры!
              </p>
              <button 
                class="book-reviews__spoiler-button"
                @click="revealSpoiler(review.id)"
              >
                Показать содержимое
              </button>
            </div>
            <p v-else class="book-reviews__text">{{ review.text }}</p>
          </div>
          <div v-else class="book-reviews__content">
            <p class="book-reviews__text">{{ review.text }}</p>
          </div>
          
          <div class="book-reviews__actions">
            <button 
              class="book-reviews__action book-reviews__action--like"
              :class="{ 'book-reviews__action--active': review.userLiked }"
              @click="likeReview(review.id)"
            >
              <UiIcon :name="review.userLiked ? 'hand-thumb-up-solid' : 'hand-thumb-up'" />
              <span>{{ review.likes }}</span>
            </button>
            <button 
              class="book-reviews__action book-reviews__action--dislike"
              :class="{ 'book-reviews__action--active': review.userDisliked }"
              @click="dislikeReview(review.id)"
            >
              <UiIcon :name="review.userDisliked ? 'hand-thumb-down-solid' : 'hand-thumb-down'" />
              <span>{{ review.dislikes }}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="hasMoreReviews" class="book-reviews__more">
        <button @click="loadMoreReviews" class="book-reviews__more-button">
          Загрузить еще отзывы
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { IBookReview } from '../../interfaces/book.interface';
import { UiIcon } from '../ui';

const props = defineProps<{
  bookId: string;
}>();

// Extended interface for UI interactions
interface IReviewWithUI extends IBookReview {
  spoilerRevealed?: boolean;
  userLiked?: boolean;
  userDisliked?: boolean;
}

const reviews = ref<IReviewWithUI[]>([]);
const isLoading = ref(false);
const showReviewForm = ref(false);
const hasMoreReviews = ref(false);
const page = ref(1);
const pageSize = 5;

const newReview = ref({
  rating: 0,
  text: '',
  containsSpoilers: false
});

const canSubmit = computed(() => {
  return newReview.value.rating > 0 && newReview.value.text.trim().length > 0;
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

async function loadReviews() {
  isLoading.value = true;
  
  try {
    // In a real app, we'd call an API endpoint
    // For now, we'll simulate a call with mock data
    const mockReviews = await getMockReviews();
    
    // Only show the specified number per page
    const startIndex = 0;
    const endIndex = pageSize;
    reviews.value = mockReviews.slice(startIndex, endIndex);
    
    // Check if there are more reviews to load
    hasMoreReviews.value = mockReviews.length > endIndex;
  } catch (error) {
    console.error('Error loading reviews:', error);
  } finally {
    isLoading.value = false;
  }
}

async function loadMoreReviews() {
  page.value++;
  isLoading.value = true;
  
  try {
    const mockReviews = await getMockReviews();
    const startIndex = (page.value - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const newPageReviews = mockReviews.slice(startIndex, endIndex);
    reviews.value = [...reviews.value, ...newPageReviews];
    
    // Check if there are more reviews to load
    hasMoreReviews.value = mockReviews.length > endIndex;
  } catch (error) {
    console.error('Error loading more reviews:', error);
  } finally {
    isLoading.value = false;
  }
}

function revealSpoiler(reviewId: string) {
  const reviewIndex = reviews.value.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    reviews.value[reviewIndex].spoilerRevealed = true;
  }
}

function likeReview(reviewId: string) {
  const reviewIndex = reviews.value.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    const review = reviews.value[reviewIndex];
    
    if (review.userLiked) {
      // Unlike
      reviews.value[reviewIndex].likes--;
      reviews.value[reviewIndex].userLiked = false;
    } else {
      // Like
      reviews.value[reviewIndex].likes++;
      reviews.value[reviewIndex].userLiked = true;
      
      // Remove dislike if present
      if (review.userDisliked) {
        reviews.value[reviewIndex].dislikes--;
        reviews.value[reviewIndex].userDisliked = false;
      }
    }
  }
}

function dislikeReview(reviewId: string) {
  const reviewIndex = reviews.value.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    const review = reviews.value[reviewIndex];
    
    if (review.userDisliked) {
      // Undislike
      reviews.value[reviewIndex].dislikes--;
      reviews.value[reviewIndex].userDisliked = false;
    } else {
      // Dislike
      reviews.value[reviewIndex].dislikes++;
      reviews.value[reviewIndex].userDisliked = true;
      
      // Remove like if present
      if (review.userLiked) {
        reviews.value[reviewIndex].likes--;
        reviews.value[reviewIndex].userLiked = false;
      }
    }
  }
}

async function submitReview() {
  if (!canSubmit.value) return;
  
  // In a real app, this would be an API call
  // For now, we'll just add it to the local state
  const newReviewData: IReviewWithUI = {
    id: `new-review-${Date.now()}`,
    bookId: props.bookId,
    userId: 'current-user',
    userName: 'Вы',
    rating: newReview.value.rating,
    text: newReview.value.text,
    date: new Date().toISOString(),
    containsSpoilers: newReview.value.containsSpoilers,
    likes: 0,
    dislikes: 0,
    spoilerRevealed: true // User can see their own spoilers
  };
  
  reviews.value = [newReviewData, ...reviews.value];
  
  // Reset form
  newReview.value = {
    rating: 0,
    text: '',
    containsSpoilers: false
  };
  
  showReviewForm.value = false;
}

// Mock data generation for testing
async function getMockReviews(): Promise<IReviewWithUI[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockReviews: IReviewWithUI[] = [
    {
      id: '1',
      bookId: props.bookId,
      userId: 'user1',
      userName: 'Алексей Петров',
      rating: 5,
      text: 'Отличная книга! Захватывающий сюжет и глубокие персонажи. Очень рекомендую всем любителям данного жанра.',
      date: '2023-03-15T10:30:00Z',
      containsSpoilers: false,
      likes: 12,
      dislikes: 2
    },
    {
      id: '2',
      bookId: props.bookId,
      userId: 'user2',
      userName: 'Марина Иванова',
      rating: 4,
      text: 'В целом книга понравилась, но некоторые моменты показались немного затянутыми. Тем не менее, рекомендую к прочтению.',
      date: '2023-02-20T15:45:00Z',
      containsSpoilers: false,
      likes: 8,
      dislikes: 1
    },
    {
      id: '3',
      bookId: props.bookId,
      userId: 'user3',
      userName: 'Сергей Сидоров',
      rating: 5,
      text: 'Внимание! В конце книги главный герой встречает своего отца, который оказывается злодеем всей истории! Невероятный поворот сюжета, особенно когда выясняется, что он всё это время манипулировал событиями.',
      date: '2023-01-10T09:15:00Z',
      containsSpoilers: true,
      likes: 5,
      dislikes: 3,
      spoilerRevealed: false
    },
    {
      id: '4',
      bookId: props.bookId,
      userId: 'user4',
      userName: 'Елена Козлова',
      rating: 3,
      text: 'Мне книга показалась средней. Есть интересные моменты, но в целом сюжет предсказуем. Особенно расстроила концовка.',
      date: '2022-12-05T18:30:00Z',
      containsSpoilers: false,
      likes: 2,
      dislikes: 4
    },
    {
      id: '5',
      bookId: props.bookId,
      userId: 'user5',
      userName: 'Николай Васильев',
      rating: 4,
      text: 'Книга превзошла мои ожидания! Единственное, что хотелось бы - больше раскрытия второстепенных персонажей.',
      date: '2022-11-22T14:10:00Z',
      containsSpoilers: false,
      likes: 9,
      dislikes: 0
    },
    {
      id: '6',
      bookId: props.bookId,
      userId: 'user6',
      userName: 'Анна Соколова',
      rating: 5,
      text: 'Мое любимое произведение автора! Читается на одном дыхании. Великолепный язык и проработанный мир.',
      date: '2022-10-18T11:25:00Z',
      containsSpoilers: false,
      likes: 15,
      dislikes: 1
    },
    {
      id: '7',
      bookId: props.bookId,
      userId: 'user7',
      userName: 'Дмитрий Орлов',
      rating: 2,
      text: 'Не понравилось. Слишком запутанный сюжет и неубедительные мотивы персонажей. Особенно возмутил момент, когда героиня внезапно меняет свое отношение к происходящему без каких-либо объяснений.',
      date: '2022-09-30T16:40:00Z',
      containsSpoilers: false,
      likes: 3,
      dislikes: 7
    }
  ];
  
  return mockReviews;
}

onMounted(() => {
  loadReviews();
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.book-reviews {
  margin-bottom: $spacing-xxl;
  
  &__title {
    @include flex(row, flex-start, center);
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    gap: $spacing-xs;
    
    &-icon {
      color: var(--color-primary);
    }
  }
  
  &__loader {
    @include flex(row, center, center);
    gap: $spacing-sm;
    padding: $spacing-xl;
    color: var(--color-text-light);
  }
  
  &__empty {
    text-align: center;
    padding: $spacing-xl;
    color: var(--color-text-light);
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
  }
  
  &__add {
    margin-bottom: $spacing-lg;
    text-align: right;
    
    &-button {
      @include flex(row, center, center);
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      background-color: var(--color-success);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--color-success-dark);
      }
    }
  }
  
  &__form {
    padding: $spacing-lg;
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    margin-bottom: $spacing-lg;
    
    &-header {
      margin-bottom: $spacing-md;
    }
    
    &-title {
      font-size: $font-size-md;
      font-weight: 600;
    }
    
    &-label {
      display: block;
      margin-bottom: $spacing-xs;
      font-weight: 500;
    }
    
    &-field {
      margin-bottom: $spacing-md;
    }
    
    &-textarea {
      width: 100%;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      padding: $spacing-sm;
      resize: vertical;
      background-color: var(--color-input);
      
      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }
    }
    
    &-checkbox {
      @include flex(row, flex-start, center);
      gap: $spacing-sm;
    }
    
    &-actions {
      @include flex(row, flex-end, center);
      gap: $spacing-md;
    }
    
    &-submit {
      padding: $spacing-sm $spacing-lg;
      background-color: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background-color: var(--color-primary-dark);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    &-cancel {
      padding: $spacing-sm $spacing-lg;
      background-color: transparent;
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      
      &:hover {
        background-color: var(--color-surface-hover);
      }
    }
  }
  
  &__rating {
    @include flex(row, center, center);
  }
  
  &__rating-input {
    margin-bottom: $spacing-md;
  }
  
  &__rating-stars {
    @include flex(row, flex-start, center);
    gap: $spacing-xs;
  }
  
  &__rating-star {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-warning);
    font-size: $font-size-lg;
    
    &--active {
      color: var(--color-warning);
    }
  }
  
  &__list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  &__item {
    padding: $spacing-lg;
    background-color: var(--color-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  &__header {
    @include flex(row, space-between, center);
    margin-bottom: $spacing-md;
    
    @include respond-to(xs) {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-sm;
    }
  }
  
  &__user {
    @include flex(row, flex-start, center);
    gap: $spacing-sm;
  }
  
  &__user-icon {
    color: var(--color-text-light);
  }
  
  &__user-info {
    display: flex;
    flex-direction: column;
  }
  
  &__user-name {
    font-weight: 600;
  }
  
  &__date {
    font-size: $font-size-xs;
    color: var(--color-text-light);
  }
  
  &__star {
    color: var(--color-warning);
    
    &--filled {
      color: var(--color-warning);
    }
  }
  
  &__content {
    margin-bottom: $spacing-md;
    
    &--spoiler {
      border-radius: var(--border-radius-md);
      overflow: hidden;
    }
  }
  
  &__text {
    line-height: 1.6;
    white-space: pre-line;
  }
  
  &__spoiler-alert {
    padding: $spacing-md;
    background-color: var(--color-warning-light);
    border-radius: var(--border-radius-md);
    text-align: center;
    
    @include flex(column, center, center);
    gap: $spacing-sm;
  }
  
  &__spoiler-icon {
    color: var(--color-warning);
    font-size: $font-size-lg;
  }
  
  &__spoiler-text {
    font-weight: 600;
  }
  
  &__spoiler-button {
    padding: $spacing-xs $spacing-sm;
    background-color: var(--color-warning);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    
    &:hover {
      background-color: var(--color-warning-dark);
    }
  }
  
  &__actions {
    @include flex(row, flex-start, center);
    gap: $spacing-md;
  }
  
  &__action {
    @include flex(row, center, center);
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background-color: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: $font-size-sm;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--color-surface-hover);
    }
    
    &--active {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    
    &--like {
      &.book-reviews__action--active {
        color: var(--color-success);
        border-color: var(--color-success);
      }
    }
    
    &--dislike {
      &.book-reviews__action--active {
        color: var(--color-error);
        border-color: var(--color-error);
      }
    }
  }
  
  &__more {
    text-align: center;
    margin-top: $spacing-lg;
    
    &-button {
      padding: $spacing-sm $spacing-lg;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      
      &:hover {
        background-color: var(--color-surface-hover);
      }
    }
  }
}
</style> 