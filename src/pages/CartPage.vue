<template>
  <MainLayout>
    <div class="page cart-page">
      <div class="container">
        <h1 class="page__title fade-in">Корзина</h1>
        
        <div v-if="!cart.items.length" class="cart-page__empty fade-in">
          <UiIcon name="shopping-cart" size="xl" class="cart-page__empty-icon" />
          <h2 class="cart-page__empty-title">Ваша корзина пуста</h2>
          <p class="cart-page__empty-text">Добавьте книги из каталога, чтобы оформить заказ</p>
          <router-link to="/catalog" class="cart-page__empty-link">
            <UiButton variant="primary">
              <template #icon>
                <UiIcon name="book-open" />
              </template>
              Перейти в каталог
            </UiButton>
          </router-link>
        </div>
        
        <div v-else class="cart-page__content">
          <div class="cart-page__items fade-in">
            <h2 class="cart-page__subtitle">
              <UiIcon name="shopping-bag" class="cart-page__subtitle-icon" />
              Товары в корзине
            </h2>
            
            <div class="cart-page__item-list">
              <CartItem 
                v-for="item in cart.items" 
                :key="item.bookId"
                :item="item"
                class="fade-in"
              />
            </div>
            
            <div class="cart-page__actions">
              <UiButton @click="clearCart" variant="error" size="sm">
                <template #icon>
                  <UiIcon name="trash" />
                </template>
                Очистить корзину
              </UiButton>
            </div>
          </div>
          
          <div class="cart-page__summary fade-in">
            <h2 class="cart-page__subtitle">
              <UiIcon name="receipt-percent" class="cart-page__subtitle-icon" />
              Итого
            </h2>
            <CartSummary />
            <router-link to="/checkout" class="cart-page__checkout-link">
              <UiButton variant="primary" size="lg" fullWidth>
                <template #icon>
                  <UiIcon name="credit-card" />
                </template>
                Оформить заказ
              </UiButton>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCartStore } from '../stores/cart';
import MainLayout from '../components/layout/MainLayout.vue';
import CartItem from '../components/cart/CartItem.vue';
import CartSummary from '../components/cart/CartSummary.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiIcon from '../components/ui/UiIcon.vue';

const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);

function clearCart() {
  if (confirm('Вы уверены, что хотите очистить корзину?')) {
    cartStore.clearCart();
  }
}
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.cart-page {
  &__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-xl;
    margin-bottom: $spacing-xxl;
    
    @include respond-to(md) {
      grid-template-columns: 1fr 320px;
      align-items: flex-start;
    }
  }
  
  &__subtitle {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    @include flex(row, flex-start, center);
    gap: $spacing-xs;
    
    &-icon {
      color: var(--color-primary);
    }
  }
  
  &__item-list {
    @include flex(column, flex-start, stretch);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }
  
  &__items {
    background-color: var(--color-card);
    padding: $spacing-lg;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  &__summary {
    background-color: var(--color-card);
    padding: $spacing-lg;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: calc(76px + #{$spacing-lg});
  }
  
  &__checkout-link {
    margin-top: $spacing-lg;
    display: block;
  }
  
  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: $spacing-md;
  }
  
  &__empty {
    @include flex(column, center, center);
    text-align: center;
    padding: $spacing-xxl 0;
    max-width: 500px;
    margin: 0 auto;
  }
  
  &__empty-icon {
    font-size: 64px;
    margin-bottom: $spacing-lg;
    color: var(--color-text-light);
    opacity: 0.7;
  }
  
  &__empty-title {
    font-family: $font-family-heading;
    font-size: $font-size-xl;
    margin-bottom: $spacing-md;
  }
  
  &__empty-text {
    font-size: $font-size-base;
    color: var(--color-text-light);
    margin-bottom: $spacing-xl;
  }
}
</style> 