<template>
  <MainLayout>
    <div class="page order-success-page">
      <div class="container">
        <div class="order-success-page__content fade-in">
          <UiIcon name="check-circle" size="xl" class="order-success-page__icon" />
          <h1 class="order-success-page__title">Заказ успешно оформлен!</h1>
          <p class="order-success-page__text">Спасибо за ваш заказ. Номер вашего заказа: <span class="order-success-page__order-id">#{{ orderId }}</span></p>
          <p class="order-success-page__info">Подтверждение заказа отправлено на ваш email. Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
          
          <div class="order-success-page__actions">
            <router-link to="/" class="order-success-page__action-link">
              <UiButton variant="primary">
                <template #icon>
                  <UiIcon name="home" />
                </template>
                На главную
              </UiButton>
            </router-link>
            
            <router-link to="/catalog" class="order-success-page__action-link">
              <UiButton variant="secondary">
                <template #icon>
                  <UiIcon name="book-open" />
                </template>
                Продолжить покупки
              </UiButton>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import MainLayout from '../components/layout/MainLayout.vue';
import UiButton from '../components/ui/UiButton.vue';
import UiIcon from '../components/ui/UiIcon.vue';

const route = useRoute();
const cartStore = useCartStore();
const orderId = route.params.orderId as string;

onMounted(() => {
  // Clear the cart once the success page is loaded
  cartStore.clearCart();
});
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.order-success-page {
  &__content {
    max-width: 600px;
    margin: 0 auto;
    padding: $spacing-xxl 0;
    text-align: center;
    @include flex(column, center, center);
  }
  
  &__icon {
    font-size: 80px;
    color: var(--color-success);
    margin-bottom: $spacing-lg;
  }
  
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-xxl;
    margin-bottom: $spacing-md;
    color: var(--color-text);
  }
  
  &__text {
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
    color: var(--color-text);
  }
  
  &__order-id {
    font-weight: 700;
    color: var(--color-primary);
  }
  
  &__info {
    font-size: $font-size-base;
    color: var(--color-text-light);
    margin-bottom: $spacing-xl;
    max-width: 500px;
  }
  
  &__actions {
    @include flex(row, center, center);
    gap: $spacing-md;
    flex-wrap: wrap;
  }
}
</style> 