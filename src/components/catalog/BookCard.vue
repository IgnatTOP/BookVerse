<template>
  <UiCard class="book-card" hoverable elevated>
    <template #media>
      <div class="book-card__image-container">
        <UiImage 
          :src="book.coverImage" 
          :alt="book.title" 
          class="book-card__image" 
          width="200" 
          height="300"
        />
        <UiBadge v-if="book.discountPercentage" variant="accent" class="book-card__discount">
          -{{ book.discountPercentage }}%
        </UiBadge>
        <div class="book-card__overlay">
          <UiButton 
            variant="primary" 
            size="sm" 
            rounded
            class="book-card__quick-view"
            @click="$router.push(`/book/${book.id}`)"
          >
            <template #icon>
              <UiIcon name="eye" size="sm" />
            </template>
            Просмотр
          </UiButton>
        </div>
      </div>
    </template>
    
    <div class="book-card__content">
      <router-link :to="`/book/${book.id}`" class="book-card__title-link">
        <h3 class="book-card__title">{{ book.title }}</h3>
      </router-link>
      
      <p class="book-card__author">{{ book.author }}</p>
      
      <div class="book-card__rating">
        <div class="book-card__stars">
          <UiIcon 
            v-for="i in 5" 
            :key="i"
            name="star"
            :type="i <= Math.round(book.rating) ? 'solid' : 'outline'"
            size="sm"
            class="book-card__star"
            :class="{ 'book-card__star--filled': i <= Math.round(book.rating) }"
          />
        </div>
        <span class="book-card__reviews">
          <UiIcon name="chat-bubble-left-right" size="xs" class="book-card__reviews-icon" />
          {{ book.reviewCount }}
        </span>
      </div>
      
      <p class="book-card__description">{{ truncatedDescription }}</p>
      
      <div class="book-card__features">
        <span v-if="book.hasPreview" class="book-card__feature">
          <UiIcon name="document-text" size="sm" class="book-card__feature-icon" />
          Предпросмотр
        </span>
        <span v-if="book.hasAudioSample" class="book-card__feature">
          <UiIcon name="speaker-wave" size="sm" class="book-card__feature-icon" />
          Аудиофрагмент
        </span>
      </div>
      
      <div class="book-card__price-row">
        <div class="book-card__price-container">
          <span 
            v-if="book.discountPercentage" 
            class="book-card__old-price"
          >
            {{ book.price }} ₽
          </span>
          <span class="book-card__price">
            {{ discountedPrice }} ₽
          </span>
        </div>
        
        <UiButton 
          :variant="isInCart ? 'success' : 'primary'" 
          size="sm" 
          @click="addToCart"
          :disabled="isInCart"
          rounded
        >
          <template #icon>
            <UiIcon :name="isInCart ? 'check' : 'shopping-cart'" size="sm" />
          </template>
          {{ isInCart ? 'В корзине' : 'В корзину' }}
        </UiButton>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IBook } from '../../interfaces/book.interface';
import { useCartStore } from '../../stores/cart';

defineOptions({
  name: 'BookCard'
});

interface Props {
  book: IBook;
}

const props = defineProps<Props>();
const cartStore = useCartStore();

const discountedPrice = computed(() => {
  if (!props.book.discountPercentage) return props.book.price;
  
  const discount = (props.book.price * props.book.discountPercentage) / 100;
  return Math.round(props.book.price - discount);
});

const truncatedDescription = computed(() => {
  const maxLength = 100;
  if (!props.book.description || props.book.description.length <= maxLength) {
    return props.book.description;
  }
  return props.book.description.substring(0, maxLength) + '...';
});

const isInCart = computed(() => {
  return cartStore.cart.items.some(item => item.bookId === props.book.id);
});

function addToCart() {
  if (!isInCart.value) {
    cartStore.addToCart(props.book, 1);
  }
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.book-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  
  &__image-container {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    background-color: var(--color-surface-hover);
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
  }
  
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .ui-card--hoverable:hover & {
      opacity: 1;
    }
  }
  
  &__quick-view {
    transform: translateY(20px);
    transition: transform 0.3s ease;
    
    .ui-card--hoverable:hover & {
      transform: translateY(0);
    }
  }
  
  &__discount {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    font-weight: $font-weight-bold;
    z-index: 2;
  }
  
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    

  }
  
  &__title-link {
    display: block;
    text-decoration: none;
    color: var(--color-text);
    transition: color $transition-fast;
    
    &:hover {
      color: var(--color-primary);
    }
  }
  
  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    @include line-clamp(2);
    margin-bottom: $spacing-xs;
    letter-spacing: -0.01em;
  }
  
  &__author {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    @include text-truncate;
    font-style: italic;
  }
  
  &__rating {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin: $spacing-xs 0;
  }
  
  &__stars {
    display: flex;
    color: var(--color-warning);
  }
  
  &__star {
    color: var(--color-warning);
    
    &--filled {
      color: var(--color-warning);
    }
  }
  
  &__reviews {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    
    &-icon {
      color: var(--color-text-light);
    }
  }
  
  &__description {
    font-size: $font-size-sm;
    line-height: $line-height-normal;
    color: var(--color-text-light);
    @include line-clamp(3);
    margin: $spacing-xs 0;
  }
  
  &__features {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
    margin-bottom: $spacing-md;
  }
  
  &__feature {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    
    &-icon {
      color: var(--color-primary);
    }
  }
  
  &__price-row {
    @include flex(row, space-between, center);
    margin-top: auto;
    padding-top: $spacing-sm;
    gap: $spacing-sm;
    flex-wrap: wrap;
    
    @include respond-to(sm) {
      flex-wrap: nowrap;
    }
  }
  
  &__price-container {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    margin-bottom: $spacing-sm;
    
    @include respond-to(sm) {
      margin-bottom: 0;
    }
  }
  
  &__old-price {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    text-decoration: line-through;
  }
  
  &__price {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
  }
}
</style> 