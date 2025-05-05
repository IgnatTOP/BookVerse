<template>
  <div 
    :class="[
      'ui-card',
      { 'ui-card--hoverable': hoverable },
      { 'ui-card--flat': flat },
      { 'ui-card--elevated': elevated },
      { 'ui-card--no-padding': noPadding },
      { 'ui-card--border': border },
      { 'ui-card--glass': glass },
      { 'ui-card--accent': accent }
    ]"
  >
    <div v-if="$slots.header" class="ui-card__header">
      <slot name="header"></slot>
    </div>
    
    <div v-if="$slots.media" class="ui-card__media">
      <slot name="media"></slot>
    </div>
    
    <div v-if="$slots.default" class="ui-card__content">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UiCard'
});

interface Props {
  hoverable?: boolean
  flat?: boolean
  elevated?: boolean
  noPadding?: boolean
  border?: boolean
  glass?: boolean
  accent?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  flat: false,
  elevated: false,
  noPadding: false,
  border: true,
  glass: false,
  accent: false
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.ui-card {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  position: relative;
  transition: all $transition-normal $easing-standard;
  
  &__header {
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid var(--color-divider);
  }
  
  &__content {
    padding: $spacing-lg;
    position: relative;
    z-index: 1;
    
    @include respond-to(md) {
      padding: $spacing-xl;
    }
  }
  
  &__footer {
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid var(--color-divider);
  }
  
  &__media {
    width: 100%;
    position: relative;
    overflow: hidden;
    
    img {
      width: 100%;
      height: auto;
      display: block;
      transition: transform 0.5s $easing-standard;
    }
  }
  
  &--hoverable {
    &:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      
      .ui-card__media img {
        transform: scale(1.05);
      }
    }
  }
  
  &--flat {
    box-shadow: none;
  }
  
  &--elevated {
    box-shadow: var(--shadow-md);
    border: none;
  }
  
  &--border {
    border: 1px solid var(--color-border);
  }
  
  &--glass {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    
    &.ui-card--border {
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
  }
  
  &--accent {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--gradient-primary);
      z-index: 1;
    }
    
    .ui-card__content {
      padding-left: calc($spacing-lg + 4px);
      
      @include respond-to(md) {
        padding-left: calc($spacing-xl + 4px);
      }
    }
  }
  
  &--no-padding {
    .ui-card__content {
      padding: 0;
    }
  }
}
</style> 