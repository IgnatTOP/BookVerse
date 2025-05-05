<template>
  <MainLayout>
    <div class="page checkout-page">
      <div class="container">
        <h1 class="page__title fade-in">Оформление заказа</h1>
        
        <div v-if="!cart.items.length" class="checkout-page__empty fade-in">
          <UiIcon name="shopping-cart" size="xl" class="checkout-page__empty-icon" />
          <h2 class="checkout-page__empty-title">Ваша корзина пуста</h2>
          <p class="checkout-page__empty-text">Добавьте книги из каталога, чтобы оформить заказ</p>
          <router-link to="/catalog" class="checkout-page__empty-link">
            <UiButton variant="primary">
              <template #icon>
                <UiIcon name="book-open" />
              </template>
              Перейти в каталог
            </UiButton>
          </router-link>
        </div>
        
        <div v-else class="checkout-page__content">
          <div class="checkout-page__form-container fade-in">
            <h2 class="checkout-page__subtitle">
              <UiIcon name="user" class="checkout-page__subtitle-icon" />
              Информация о получателе
            </h2>
            
            <form @submit.prevent="submitOrder" class="checkout-page__form">
              <div class="checkout-page__form-group">
                <label for="name" class="checkout-page__form-label">ФИО</label>
                <UiInput
                  id="name"
                  v-model="form.name"
                  placeholder="Иванов Иван Иванович"
                  :error="errors.name"
                  required
                />
              </div>
              
              <div class="checkout-page__form-group">
                <label for="email" class="checkout-page__form-label">Email</label>
                <UiInput
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="example@mail.ru"
                  :error="errors.email"
                  required
                />
              </div>
              
              <div class="checkout-page__form-group">
                <label for="phone" class="checkout-page__form-label">Телефон</label>
                <UiInput
                  id="phone"
                  v-model="form.phone"
                  placeholder="+7 (___) ___-__-__"
                  :error="errors.phone"
                  required
                />
              </div>
              
              <h2 class="checkout-page__subtitle">
                <UiIcon name="map-pin" class="checkout-page__subtitle-icon" />
                Адрес доставки
              </h2>
              
              <div class="checkout-page__form-group">
                <label for="address" class="checkout-page__form-label">Адрес</label>
                <UiInput
                  id="address"
                  v-model="form.address"
                  placeholder="Улица, дом, квартира"
                  :error="errors.address"
                  required
                />
              </div>
              
              <div class="checkout-page__form-row">
                <div class="checkout-page__form-group">
                  <label for="city" class="checkout-page__form-label">Город</label>
                  <UiInput
                    id="city"
                    v-model="form.city"
                    placeholder="Москва"
                    :error="errors.city"
                    required
                  />
                </div>
                
                <div class="checkout-page__form-group">
                  <label for="zip" class="checkout-page__form-label">Индекс</label>
                  <UiInput
                    id="zip"
                    v-model="form.zip"
                    placeholder="123456"
                    :error="errors.zip"
                    required
                  />
                </div>
              </div>
              
              <h2 class="checkout-page__subtitle">
                <UiIcon name="credit-card" class="checkout-page__subtitle-icon" />
                Способ оплаты
              </h2>
              
              <div class="checkout-page__payment-methods">
                <div 
                  v-for="method in paymentMethods" 
                  :key="method.id"
                  class="checkout-page__payment-method"
                  :class="{ 'checkout-page__payment-method--active': form.paymentMethod === method.id }"
                  @click="form.paymentMethod = method.id"
                >
                  <div class="checkout-page__payment-method-radio">
                    <div class="checkout-page__payment-method-radio-inner" v-if="form.paymentMethod === method.id"></div>
                  </div>
                  <UiIcon :name="method.icon" class="checkout-page__payment-method-icon" />
                  <span class="checkout-page__payment-method-name">{{ method.name }}</span>
                </div>
              </div>
              
              <div class="checkout-page__form-actions">
                <router-link to="/cart" class="checkout-page__back-link">
                  <UiButton variant="text" size="md">
                    <template #icon>
                      <UiIcon name="arrow-left" />
                    </template>
                    Вернуться в корзину
                  </UiButton>
                </router-link>
                
                <UiButton 
                  type="submit" 
                  variant="primary" 
                  size="md"
                  :loading="isSubmitting"
                >
                  <template #icon>
                    <UiIcon name="check" />
                  </template>
                  Подтвердить заказ
                </UiButton>
              </div>
            </form>
          </div>
          
          <div class="checkout-page__summary fade-in">
            <h2 class="checkout-page__subtitle">
              <UiIcon name="receipt-percent" class="checkout-page__subtitle-icon" />
              Ваш заказ
            </h2>
            
            <div class="checkout-page__order-items">
              <div 
                v-for="item in cart.items" 
                :key="item.bookId" 
                class="checkout-page__order-item"
              >
                <UiImage 
                  :src="item.coverImage" 
                  :alt="item.title"
                  class="checkout-page__order-item-image" 
                />
                <div class="checkout-page__order-item-details">
                  <h3 class="checkout-page__order-item-title">{{ item.title }}</h3>
                  <p class="checkout-page__order-item-author">{{ item.author }}</p>
                  <div class="checkout-page__order-item-price">
                    <span class="checkout-page__order-item-quantity">{{ item.quantity }} × </span>
                    <span v-if="item.discountPercentage" class="checkout-page__order-item-discount">
                      {{ formatPrice(calculateDiscountPrice(item.price, item.discountPercentage)) }} ₽
                    </span>
                    <span 
                      :class="{ 'checkout-page__order-item-original-price': item.discountPercentage }"
                    >
                      {{ formatPrice(item.price) }} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="checkout-page__order-summary">
              <div class="checkout-page__summary-row">
                <span class="checkout-page__summary-label">Товары ({{ cart.totalQuantity }}):</span>
                <span class="checkout-page__summary-value">{{ formatPrice(cart.subtotal) }} ₽</span>
              </div>
              
              <div v-if="cart.discount > 0" class="checkout-page__summary-row">
                <span class="checkout-page__summary-label">Скидка:</span>
                <span class="checkout-page__summary-value checkout-page__summary-value--discount">−{{ formatPrice(cart.discount) }} ₽</span>
              </div>
              
              <div class="checkout-page__summary-row">
                <span class="checkout-page__summary-label">Доставка:</span>
                <span class="checkout-page__summary-value">{{ shippingCost === 0 ? 'Бесплатно' : `${formatPrice(shippingCost)} ₽` }}</span>
              </div>
              
              <div class="checkout-page__summary-row checkout-page__summary-row--total">
                <span class="checkout-page__summary-label">Итого:</span>
                <span class="checkout-page__summary-value checkout-page__summary-value--total">{{ formatPrice(totalWithShipping) }} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';

const router = useRouter();
const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);

const isSubmitting = ref(false);

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
}

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  paymentMethod: 'card'
});

const errors = reactive<FormErrors>({});

const paymentMethods = [
  { id: 'card', name: 'Банковская карта', icon: 'credit-card' },
  { id: 'cash', name: 'Наличные при получении', icon: 'cash' }
];

const shippingCost = computed(() => {
  return cart.value.total >= 2000 ? 0 : 300;
});

const totalWithShipping = computed(() => {
  return cart.value.total + shippingCost.value;
});

function formatPrice(price: number): string {
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function calculateDiscountPrice(price: number, discountPercentage: number): number {
  return price * (100 - discountPercentage) / 100;
}

function validateForm(): boolean {
  const newErrors: FormErrors = {};
  let isValid = true;
  
  if (!form.name.trim()) {
    newErrors.name = 'Введите ФИО';
    isValid = false;
  }
  
  if (!form.email.trim()) {
    newErrors.email = 'Введите email';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    newErrors.email = 'Введите корректный email';
    isValid = false;
  }
  
  if (!form.phone.trim()) {
    newErrors.phone = 'Введите телефон';
    isValid = false;
  }
  
  if (!form.address.trim()) {
    newErrors.address = 'Введите адрес';
    isValid = false;
  }
  
  if (!form.city.trim()) {
    newErrors.city = 'Введите город';
    isValid = false;
  }
  
  if (!form.zip.trim()) {
    newErrors.zip = 'Введите индекс';
    isValid = false;
  }
  
  Object.assign(errors, newErrors);
  return isValid;
}

async function submitOrder() {
  if (!validateForm()) return;
  
  try {
    isSubmitting.value = true;
    
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random order ID
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Redirect to success page
    router.push(`/order-success/${orderId}`);
  } catch (error) {
    console.error('Error submitting order:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.checkout-page {
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
    margin-top: $spacing-xl;
    @include flex(row, flex-start, center);
    gap: $spacing-xs;
    
    &:first-of-type {
      margin-top: 0;
    }
    
    &-icon {
      color: var(--color-primary);
    }
  }
  
  &__form-container {
    background-color: var(--color-card);
    padding: $spacing-lg;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }
  
  &__form {
    @include flex(column, flex-start, stretch);
    gap: $spacing-md;
  }
  
  &__form-group {
    width: 100%;
  }
  
  &__form-label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-md;
    
    @include respond-to(sm) {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  &__form-actions {
    @include flex(row, space-between, center);
    margin-top: $spacing-xl;
  }
  
  &__payment-methods {
    @include flex(column, flex-start, stretch);
    gap: $spacing-sm;
  }
  
  &__payment-method {
    @include flex(row, flex-start, center);
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--color-primary-light);
    }
    
    &--active {
      border-color: var(--color-primary);
      background-color: var(--color-primary-lightest);
    }
    
    &-radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid var(--color-primary);
      @include flex(row, center, center);
    }
    
    &-radio-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-primary);
    }
    
    &-icon {
      color: var(--color-primary);
    }
    
    &-name {
      font-size: $font-size-base;
    }
  }
  
  &__summary {
    background-color: var(--color-card);
    padding: $spacing-lg;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: calc(76px + #{$spacing-lg});
  }
  
  &__order-items {
    @include flex(column, flex-start, stretch);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    max-height: 300px;
    overflow-y: auto;
    padding-right: $spacing-sm;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--color-background);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-primary-light);
      border-radius: 3px;
    }
  }
  
  &__order-item {
    @include flex(row, flex-start, flex-start);
    gap: $spacing-sm;
  }
  
  &__order-item-image {
    width: 50px;
    height: 70px;
    border-radius: var(--border-radius-sm);
    object-fit: cover;
  }
  
  &__order-item-details {
    flex: 1;
  }
  
  &__order-item-title {
    font-family: $font-family-heading;
    font-size: $font-size-sm;
    margin-bottom: 2px;
    line-height: 1.3;
  }
  
  &__order-item-author {
    font-size: $font-size-xs;
    color: var(--color-text-light);
    margin-bottom: 4px;
  }
  
  &__order-item-price {
    font-size: $font-size-xs;
    @include flex(row, flex-start, center);
    flex-wrap: wrap;
    gap: 4px;
  }
  
  &__order-item-quantity {
    color: var(--color-text-light);
  }
  
  &__order-item-original-price {
    text-decoration: line-through;
    color: var(--color-text-light);
  }
  
  &__order-item-discount {
    color: var(--color-accent);
    font-weight: 600;
  }
  
  &__order-summary {
    @include flex(column, flex-start, stretch);
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    border-top: 1px solid var(--color-border);
    padding-top: $spacing-md;
  }
  
  &__summary-row {
    @include flex(row, space-between, center);
    
    &--total {
      margin-top: $spacing-sm;
      padding-top: $spacing-sm;
      border-top: 1px solid var(--color-border);
    }
  }
  
  &__summary-label {
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
  
  &__summary-value {
    font-size: $font-size-sm;
    font-weight: 500;
    
    &--discount {
      color: var(--color-accent);
    }
    
    &--total {
      font-size: $font-size-md;
      font-weight: 700;
      color: var(--color-primary);
    }
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