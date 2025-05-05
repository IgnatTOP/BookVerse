<template>
  <span
    :class="[
      'ui-badge',
      `ui-badge--${variant}`,
      `ui-badge--${size}`,
      { 'ui-badge--rounded': rounded }
    ]"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UiBadge'
});

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  rounded: false
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  font-weight: $font-weight-medium;
  line-height: 1;
  white-space: nowrap;
  transition: all $transition-fast;
  
  &--rounded {
    border-radius: $border-radius-full;
  }
  
  &--sm {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-xs;
  }
  
  &--md {
    padding: $spacing-xs $spacing-md;
    font-size: $font-size-sm;
  }
  
  &--lg {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
  }
  
  &--primary {
    background: var(--color-primary);
    color: white;
  }
  
  &--secondary {
    background: var(--color-secondary);
    color: white;
  }
  
  &--accent {
    background: var(--color-accent);
    color: white;
  }
  
  &--success {
    background: var(--color-success);
    color: white;
  }
  
  &--error {
    background: var(--color-error);
    color: white;
  }
  
  &--warning {
    background: var(--color-warning);
    color: $color-dark;
  }
  
  &--info {
    background: var(--color-info);
    color: white;
  }
}
</style> 