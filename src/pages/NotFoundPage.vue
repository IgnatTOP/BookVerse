<template>
  <MainLayout>
    <div class="page not-found-page">
      <div class="container">
        <div class="not-found-page__content">
          <div class="not-found-page__code">404</div>
          <h1 class="not-found-page__title">Страница не найдена</h1>
          <p class="not-found-page__text">Страница, которую вы ищете, не существует или была перемещена.</p>
          <div class="not-found-page__actions">
            <router-link to="/">
              <UiButton variant="primary">Вернуться на главную</UiButton>
            </router-link>
            <router-link to="/catalog">
              <UiButton variant="outline">Перейти в каталог</UiButton>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '../components/layout/MainLayout.vue';
import UiButton from '../components/ui/UiButton.vue';
</script>

<style lang="scss">
@use '../styles/base/variables' as *;
@use '../styles/base/mixins' as *;

.not-found-page {
  padding: $spacing-xxl 0;
  
  &__content {
    @include flex(column, center, center);
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
  
  &__code {
    font-size: 120px;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1;
    margin-bottom: $spacing-lg;
    font-family: $font-family-heading;
  }
  
  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-xl;
    margin-bottom: $spacing-md;
  }
  
  &__text {
    font-size: $font-size-lg;
    color: var(--color-text-light);
    margin-bottom: $spacing-xl;
  }
  
  &__actions {
    @include flex(row, center, center);
    flex-wrap: wrap;
    gap: $spacing-md;
  }
}
</style> 