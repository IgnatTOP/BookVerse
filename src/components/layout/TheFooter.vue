<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__content">
        <div class="footer__grid">
          <div class="footer__column">
            <h3 class="footer__title">КнигоМир</h3>
            <p class="footer__description">
              Ваш надежный источник качественной литературы. Мы предлагаем широкий выбор книг различных жанров и авторов.
            </p>
          </div>
          
          <div class="footer__column">
            <h4 class="footer__subtitle">Разделы</h4>
            <ul class="footer__list">
              <li class="footer__item">
                <router-link to="/" class="footer__link">Главная</router-link>
              </li>
              <li class="footer__item">
                <router-link to="/catalog" class="footer__link">Каталог</router-link>
              </li>
              <li class="footer__item">
                <router-link to="/cart" class="footer__link">Корзина</router-link>
              </li>
            </ul>
          </div>
          
          <div class="footer__column">
            <h4 class="footer__subtitle">Жанры</h4>
            <ul class="footer__list">
              <li class="footer__item">
                <a href="#" class="footer__link">Фантастика</a>
              </li>
              <li class="footer__item">
                <a href="#" class="footer__link">Детектив</a>
              </li>
              <li class="footer__item">
                <a href="#" class="footer__link">Роман</a>
              </li>
              <li class="footer__item">
                <a href="#" class="footer__link">Научно-популярная</a>
              </li>
            </ul>
          </div>
          
          <div class="footer__column">
            <h4 class="footer__subtitle">Контакты</h4>
            <ul class="footer__list">
              <li class="footer__item footer__item--contact">
                <span class="footer__icon">📱</span>
                <span class="footer__text">+7 (999) 123-45-67</span>
              </li>
              <li class="footer__item footer__item--contact">
                <span class="footer__icon">✉️</span>
                <span class="footer__text">info@knigomir.ru</span>
              </li>
              <li class="footer__item footer__item--contact">
                <span class="footer__icon">📍</span>
                <span class="footer__text">г. Москва, ул. Книжная, 123</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer__bottom">
          <p class="footer__copyright">&copy; {{ currentYear }} КнигоМир. Все права защищены.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());

defineOptions({
  name: 'TheFooter'
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.footer {
  background-color: var(--color-card);
  padding: $spacing-xl 0;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  
  &__content {
    @include flex(column, flex-start, stretch);
    gap: $spacing-xl;
  }
  
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    
    @include respond-to(sm) {
      grid-template-columns: 1fr 1fr;
    }
    
    @include respond-to(md) {
      grid-template-columns: 2fr 1fr 1fr 1fr;
    }
  }
  
  &__column {
    @include flex(column, flex-start, flex-start);
    gap: $spacing-md;
  }
  
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: $spacing-xs;
  }
  
  &__description {
    font-size: $font-size-sm;
    color: var(--color-text-light);
    line-height: 1.6;
  }
  
  &__subtitle {
    font-family: $font-family-heading;
    font-size: $font-size-base;
    font-weight: 600;
    margin-bottom: $spacing-xs;
  }
  
  &__list {
    @include flex(column, flex-start, flex-start);
    gap: $spacing-sm;
  }
  
  &__item {
    font-size: $font-size-sm;
    
    &--contact {
      @include flex(row, flex-start, center);
      gap: $spacing-sm;
    }
  }
  
  &__link {
    color: var(--color-text-light);
    transition: color $transition-fast;
    
    &:hover {
      color: var(--color-primary);
    }
  }
  
  &__icon {
    font-size: $font-size-lg;
    display: flex;
  }
  
  &__text {
    color: var(--color-text-light);
  }
  
  &__bottom {
    padding-top: $spacing-lg;
    border-top: 1px solid var(--color-border);
    text-align: center;
  }
  
  &__copyright {
    font-size: $font-size-sm;
    color: var(--color-text-light);
  }
}
</style> 