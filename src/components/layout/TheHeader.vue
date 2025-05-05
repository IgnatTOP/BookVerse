<template>
  <header class="header" :class="{'header--glass': isGlassHeader}">
    <div class="container">
      <div class="header__content">
        <div class="header__logo">
          <router-link to="/" class="header__logo-link">
            <span class="header__logo-part">Книго</span>
            <span class="header__logo-part header__logo-part--accent">Мир</span>
          </router-link>
        </div>
        
        <nav class="header__nav">
          <ul class="header__nav-list">
            <li class="header__nav-item">
              <router-link to="/" class="header__nav-link">
                <UiIcon name="home" class="header__nav-icon" />
                <span>Главная</span>
              </router-link>
            </li>
            <li class="header__nav-item">
              <router-link to="/catalog" class="header__nav-link">
                <UiIcon name="book-open" class="header__nav-icon" />
                <span>Каталог</span>
              </router-link>
            </li>
          </ul>
        </nav>
        
        <div class="header__actions">
          <button 
            class="header__theme-toggle" 
            @click="toggleTheme" 
            :aria-label="themeButtonLabel"
          >
            <div class="header__theme-icon-container">
              <UiIcon 
                name="sun" 
                class="header__theme-icon header__theme-icon--sun"
                :class="{'header__theme-icon--active': currentTheme === 'light'}"
              />
              <UiIcon 
                name="moon" 
                class="header__theme-icon header__theme-icon--moon"
                :class="{'header__theme-icon--active': currentTheme === 'dark'}"
              />
            </div>
          </button>
          
          <router-link to="/cart" class="header__cart">
            <UiIcon name="shopping-cart" class="header__action-icon" />
            <span v-if="cart.totalQuantity > 0" class="header__cart-count">
              {{ cart.totalQuantity }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '../../stores/theme';
import { useCartStore } from '../../stores/cart';

defineOptions({
  name: 'TheHeader'
});

const themeStore = useThemeStore();
const cartStore = useCartStore();

const currentTheme = computed(() => themeStore.currentTheme);
const cart = computed(() => cartStore.cart);
const isGlassHeader = ref(false);

const themeButtonLabel = computed(() => 
  currentTheme.value === 'light' 
    ? 'Переключить на темную тему' 
    : 'Переключить на светлую тему'
);

function toggleTheme() {
  themeStore.setTheme(currentTheme.value === 'light' ? 'dark' : 'light');
}

function handleScroll() {
  isGlassHeader.value = window.scrollY > 50;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.header {
  background-color: var(--color-card);
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  transition: all 0.3s ease;
  width: 100%;
  
  &--glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: var(--shadow-md);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    [data-theme="dark"] & {
      background: rgba(26, 32, 44, 0.8);
    }
  }
  
  &__content {
    @include flex(row, space-between, center);
    height: 76px;
    padding: 0 $spacing-sm;
    
    @include respond-to(md) {
      padding: 0;
    }
  }
  
  &__logo {
    flex-shrink: 0;
    
    &-link {
      display: flex;
      align-items: center;
      font-family: 'Playfair Display', $font-family-heading;
      font-weight: $font-weight-bold;
      font-size: $font-size-xl;
      transition: transform $transition-fast;
      letter-spacing: -0.5px;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    &-part {
      display: inline-block;
      color: var(--color-text);
      
      &--accent {
        color: var(--color-primary);
        margin-left: 2px;
      }
    }
  }
  
  &__nav {
    display: none;
    
    @include respond-to(md) {
      display: block;
    }
    
    &-list {
      @include flex(row, center, center);
      gap: $spacing-xl;
    }
    
    &-link {
      @include flex(row, center, center);
      gap: $spacing-xs;
      font-weight: $font-weight-medium;
      font-size: $font-size-base;
      padding: $spacing-xs $spacing-sm;
      border-radius: var(--border-radius-md);
      transition: all $transition-fast;
      position: relative;
      
      &:hover {
        color: var(--color-primary);
        transform: translateY(-2px);
      }
      
      &.router-link-active {
        color: var(--color-primary);
        font-weight: $font-weight-semibold;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: var(--color-primary);
          border-radius: 50%;
        }
      }
    }
    
    &-icon {
      color: currentColor;
    }
  }
  
  &__actions {
    @include flex(row, center, center);
    gap: $spacing-md;
  }
  
  &__theme-toggle,
  &__cart {
    @include flex(row, center, center);
    width: 44px;
    height: 44px;
    border-radius: $border-radius-full;
    transition: all $transition-fast;
    position: relative;
    color: var(--color-text);
    background: var(--color-surface-hover);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  &__theme-icon-container {
    position: relative;
    width: 24px;
    height: 24px;
  }
  
  &__theme-icon {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transform: scale(0.7);
    transition: all 0.3s $easing-decelerate;
    
    &--active {
      opacity: 1;
      transform: scale(1);
    }
    
    &--sun {
      color: #ffaa00;
    }
    
    &--moon {
      color: #9c64ff;
    }
  }
  
  &__action-icon {
    color: var(--color-text);
  }
  
  &__cart-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--gradient-accent);
    color: white;
    width: 22px;
    height: 22px;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    @include flex(row, center, center);
    box-shadow: var(--shadow-sm);
  }
}
</style> 