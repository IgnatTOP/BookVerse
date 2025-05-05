<template>
  <div class="cart-item" role="article" aria-label="Товар в корзине">
    <div class="cart-item__image-container">
      <UiImage 
        :src="item.coverImage" 
        :alt="item.title" 
        class="cart-item__image" 
        width="120"
        height="180"
      />
    </div>
    
    <div class="cart-item__content">
      <h3 class="cart-item__title">{{ item.title }}</h3>
      <p class="cart-item__author">{{ item.author }}</p>
      
      <div class="cart-item__price-container">
        <span 
          v-if="item.discountPercentage" 
          class="cart-item__old-price"
          aria-label="Начальная цена"
        >
          {{ formatPrice(item.price) }} ₽
        </span>
        <span class="cart-item__price" aria-label="Цена">
          {{ formatPrice(discountedPrice) }} ₽
        </span>
      </div>
    </div>
    
    <div class="cart-item__actions">
      <div class="cart-item__quantity" role="group" aria-label="Количество">
        <button 
          class="cart-item__quantity-btn" 
          @click="decrementQuantity"
          :disabled="item.quantity <= 1"
          aria-label="Уменьшить количество"
        >
          −
        </button>
        <span class="cart-item__quantity-value" aria-live="polite">{{ item.quantity }}</span>
        <button 
          class="cart-item__quantity-btn" 
          @click="incrementQuantity"
          aria-label="Увеличить количество"
        >
          +
        </button>
      </div>
      
      <div class="cart-item__total">
        <span class="cart-item__total-label">Итого:</span>
        <span class="cart-item__total-value" aria-live="polite">{{ formatPrice(totalPrice) }} ₽</span>
      </div>
      
      <button 
        class="cart-item__remove-btn" 
        @click="removeFromCart"
        aria-label="Удалить из корзины"
      >
        ✖
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ICartItem } from '../../interfaces/cart.interface';
import { useCartStore } from '../../stores/cart';

interface Props {
  item: ICartItem;
}

const props = defineProps<Props>();
const cartStore = useCartStore();

const discountedPrice = computed(() => {
  if (!props.item.discountPercentage) return props.item.price;
  
  return Math.round(props.item.price * (1 - props.item.discountPercentage / 100));
});

const totalPrice = computed(() => {
  return discountedPrice.value * props.item.quantity;
});

function incrementQuantity() {
  cartStore.updateQuantity(props.item.bookId, props.item.quantity + 1);
}

function decrementQuantity() {
  if (props.item.quantity > 1) {
    cartStore.updateQuantity(props.item.bookId, props.item.quantity - 1);
  }
}

function removeFromCart() {
  cartStore.removeFromCart(props.item.bookId);
}

function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: 8px;
  background-color: var(--color-card);
  border: 1px solid var(--color-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  @include respond-to(sm) {
    grid-template-columns: 100px 1fr auto;
  }
  
  @include respond-to(md) {
    grid-template-columns: 120px 1fr 200px;
  }
  
  &__image-container {
    width: 100%;
    aspect-ratio: 2/3;
    overflow: hidden;
    border-radius: 4px;
  }
  
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: #f5f5f5;
  }
  
  &__content {
    @include flex(column, flex-start, flex-start);
    gap: $spacing-xs;
  }
  
  &__title {
    font-size: $font-size-base;
    font-weight: 500;
    @include line-clamp(2);
    margin: 0;
  }
  
  &__author {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    @include text-truncate;
    margin: 0;
  }
  
  &__price-container {
    @include flex(column, flex-start, flex-start);
    margin-top: $spacing-xs;
  }
  
  &__price {
    font-weight: 600;
    font-size: $font-size-base;
    color: var(--color-text);
  }
  
  &__old-price {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    text-decoration: line-through;
  }
  
  &__actions {
    @include flex(column, space-between, flex-end);
    gap: $spacing-md;
    
    @include respond-to(xs) {
      gap: $spacing-sm;
    }
    
    @include respond-to(md) {
      align-items: flex-end;
      gap: $spacing-md;
    }
  }
  
  &__quantity {
    @include flex(row, center, center);
    gap: $spacing-xs;
  }
  
  &__quantity-btn {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: var(--color-input-background);
    font-size: $font-size-lg;
    @include flex(row, center, center);
    transition: background-color 0.2s ease, color 0.2s ease;
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary);
      color: white;
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    @include respond-to(xs) {
      width: 26px;
      height: 26px;
    }
  }
  
  &__quantity-value {
    width: 30px;
    text-align: center;
    font-weight: 500;
  }
  
  &__total {
    @include flex(row, flex-end, center);
    gap: $spacing-xs;
    
    @include respond-to(xs) {
      @include flex(column, flex-end, flex-end);
      gap: 0;
    }
    
    @include respond-to(md) {
      @include flex(row, flex-end, center);
      gap: $spacing-xs;
    }
  }
  
  &__total-label {
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__total-value {
    font-weight: 600;
    font-size: $font-size-base;
    color: var(--color-primary);
    
    @include respond-to(xs) {
      font-size: $font-size-md;
    }
  }
  
  &__remove-btn {
    margin-top: $spacing-sm;
    color: var(--color-text-light);
    font-size: $font-size-base;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    background-color: transparent;
    @include flex(row, center, center);
    transition: background-color 0.2s ease, color 0.2s ease;
    
    &:hover {
      background-color: var(--color-error-light);
      color: var(--color-error);
    }
    
    &:focus-visible {
      outline: 2px solid var(--color-error);
      outline-offset: 2px;
    }
  }
}
</style> 