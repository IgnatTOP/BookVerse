<template>
  <UiCard class="cart-summary">
    <template #header>
      <h2 class="cart-summary__title">Ваш заказ</h2>
    </template>
    
    <div class="cart-summary__content">
      <div class="cart-summary__row">
        <span class="cart-summary__label">Количество товаров:</span>
        <span class="cart-summary__value">{{ cart.totalQuantity }}</span>
      </div>
      
      <div class="cart-summary__row">
        <span class="cart-summary__label">Сумма:</span>
        <span class="cart-summary__value">{{ formatPrice(cart.subtotal) }} ₽</span>
      </div>
      
      <div v-if="cart.discount > 0" class="cart-summary__row">
        <span class="cart-summary__label">Скидка:</span>
        <span class="cart-summary__value cart-summary__value--discount">−{{ formatPrice(cart.discount) }} ₽</span>
      </div>
      
      <div class="cart-summary__row cart-summary__row--total">
        <span class="cart-summary__label">Итого:</span>
        <span class="cart-summary__value cart-summary__value--total">{{ formatPrice(cart.total) }} ₽</span>
      </div>
    </div>
    
    <template #footer>
      <div class="cart-summary__footer">
        <UiButton 
          variant="primary" 
          full-width 
          :disabled="cart.items.length === 0"
          @click="checkout"
        >
          Оформить заказ
        </UiButton>
        
        <UiButton 
          v-if="cart.items.length > 0" 
          variant="text" 
          full-width 
          @click="clearCart"
        >
          Очистить корзину
        </UiButton>
      </div>
    </template>
  </UiCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import UiCard from '../ui/UiCard.vue';
import UiButton from '../ui/UiButton.vue';

const cartStore = useCartStore();
const router = useRouter();

const cart = computed(() => cartStore.cart);

function formatPrice(price: number): string {
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function checkout() {
  if (cart.value.items.length > 0) {
    router.push('/checkout');
  }
}

function clearCart() {
  if (confirm('Вы уверены, что хотите очистить корзину?')) {
    cartStore.clearCart();
  }
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.cart-summary {
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    font-weight: 600;
  }
  
  &__content {
    @include flex(column, flex-start, stretch);
    gap: $spacing-md;
  }
  
  &__row {
    @include flex(row, space-between, center);
    
    &--total {
      margin-top: $spacing-sm;
      padding-top: $spacing-sm;
      border-top: 1px solid var(--color-border);
    }
  }
  
  &__label {
    font-size: $font-size-base;
    color: var(--color-text-light);
  }
  
  &__value {
    font-size: $font-size-base;
    font-weight: 500;
    
    &--discount {
      color: var(--color-accent);
    }
    
    &--total {
      font-size: $font-size-lg;
      font-weight: 700;
      color: var(--color-primary);
    }
  }
  
  &__footer {
    @include flex(column, center, stretch);
    gap: $spacing-sm;
  }
}
</style> 