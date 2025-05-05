<template>
  <component
    :is="tag"
    :class="[
      'ui-button',
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--full-width': fullWidth },
      { 'ui-button--loading': loading },
      { 'ui-button--icon-only': iconOnly },
      { 'ui-button--rounded': rounded }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="ui-button__loader" aria-hidden="true"></span>
    <span v-if="$slots.icon" class="ui-button__icon">
      <slot name="icon"></slot>
    </span>
    <span v-if="!iconOnly" class="ui-button__text">
      <slot></slot>
    </span>
  </component>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
  name: 'UiButton'
})

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'accent' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg'
  tag?: 'button' | 'a'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconOnly: false,
  rounded: false
})
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;
@use "sass:color";

.ui-button {
  @include button-base;
  position: relative;
  font-weight: $font-weight-semibold;
  letter-spacing: $letter-spacing-normal;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  transition: all $transition-normal $easing-standard;
  border: none;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    z-index: -1;
    transition: opacity $transition-normal;
  }
  
  &__text {
    position: relative;
    z-index: 1;
    transition: all $transition-normal;
  }
  
  &__icon {
    margin-right: $spacing-sm;
    display: inline-flex;
    align-items: center;
    position: relative;
    z-index: 1;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: currentColor;
    animation: spin 0.8s linear infinite;
    z-index: 1;
  }
  
  &--loading {
    .ui-button__text,
    .ui-button__icon {
      opacity: 0;
    }
  }
  
  &--primary {
    background: var(--gradient-primary);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      
      &::before {
        opacity: 1;
      }
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
      transition: transform 0.1s, box-shadow 0.1s;
      
      &::before {
        opacity: 0.2;
      }
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
  }
  
  &--secondary {
    background: var(--gradient-secondary);
    color: $color-dark;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      
      &::before {
        opacity: 1;
      }
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
      transition: transform 0.1s, box-shadow 0.1s;
      
      &::before {
        opacity: 0.2;
      }
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
  }
  
  &--outline {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid currentColor;
    
    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    &:active:not(:disabled) {
      background: var(--color-surface-active);
      transform: translateY(0);
      box-shadow: none;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
  }
  
  &--text {
    background: transparent;
    color: var(--color-primary);
    padding: $spacing-xs $spacing-sm;
    
    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      background: var(--color-surface-active);
      transform: translateY(0);
      transition: transform 0.1s;
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
  }
  
  &--accent {
    background: var(--gradient-accent);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      
      &::before {
        opacity: 1;
      }
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
      transition: transform 0.1s, box-shadow 0.1s;
      
      &::before {
        opacity: 0.2;
      }
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 61, 113, 0.35);
    }
  }
  
  &--success {
    background: var(--color-success);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--color-success-light);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    &:active:not(:disabled) {
      background: var(--color-success-dark);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(4, 197, 130, 0.35);
    }
  }
  
  &--error {
    background: var(--color-error);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--color-error-light);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    &:active:not(:disabled) {
      background: var(--color-error-dark);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 61, 113, 0.35);
    }
  }
  
  &--sm {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-sm;
    
    .ui-button__icon svg {
      width: 16px;
      height: 16px;
    }
  }
  
  &--md {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-base;
  }
  
  &--lg {
    padding: $spacing-md $spacing-xl;
    font-size: $font-size-lg;
    
    .ui-button__icon svg {
      width: 20px;
      height: 20px;
    }
  }
  
  &--full-width {
    width: 100%;
  }
  
  &--icon-only {
    padding: $spacing-sm;
    
    .ui-button__icon {
      margin-right: 0;
    }
    
    &.ui-button--sm {
      padding: $spacing-xs;
    }
    
    &.ui-button--lg {
      padding: $spacing-md;
    }
  }
  
  &--rounded {
    border-radius: $border-radius-full;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
</style> 