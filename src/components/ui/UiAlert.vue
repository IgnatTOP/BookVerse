<template>
  <Transition name="ui-alert-slide">
    <div 
      v-if="modelValue"
      :class="[
        'ui-alert',
        `ui-alert--${variant}`,
        { 'ui-alert--dismissible': dismissible }
      ]"
      role="alert"
    >
      <div class="ui-alert__icon" v-if="$slots.icon || icon">
        <slot name="icon">
          <UiIcon :name="resolveIcon()" />
        </slot>
      </div>
      
      <div class="ui-alert__content">
        <div v-if="title" class="ui-alert__title">{{ title }}</div>
        <div class="ui-alert__message">
          <slot></slot>
        </div>
      </div>
      
      <button 
        v-if="dismissible"
        class="ui-alert__close"
        type="button"
        @click="$emit('update:modelValue', false)"
        aria-label="Закрыть"
      >
        <UiIcon name="x-mark" size="sm" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UiAlert'
});

interface Props {
  modelValue?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: string;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  variant: 'primary',
  title: '',
  icon: '',
  dismissible: false
});

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const resolveIcon = () => {
  if (props.icon) {
    return props.icon;
  }
  
  switch (props.variant) {
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'error':
      return 'exclamation-circle';
    case 'info':
      return 'information-circle';
    default:
      return 'bell';
  }
};
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.ui-alert {
  display: flex;
  align-items: flex-start;
  border-radius: var(--border-radius-md);
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  position: relative;
  
  &__icon {
    margin-right: $spacing-md;
    display: flex;
    align-items: center;
    color: currentColor;
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
  }
  
  &__title {
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-xs;
  }
  
  &__message {
    font-size: $font-size-base;
  }
  
  &__close {
    background: transparent;
    border: none;
    cursor: pointer;
    margin-left: $spacing-md;
    padding: $spacing-xs;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    opacity: 0.7;
    border-radius: $border-radius-sm;
    transition: all $transition-fast;
    
    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  // Variants
  &--primary {
    background-color: rgba($color-primary, 0.08);
    color: var(--color-primary);
    border-left: 4px solid var(--color-primary);
  }
  
  &--secondary {
    background-color: rgba($color-secondary, 0.08);
    color: var(--color-secondary);
    border-left: 4px solid var(--color-secondary);
  }
  
  &--success {
    background-color: rgba($color-success, 0.08);
    color: var(--color-success);
    border-left: 4px solid var(--color-success);
  }
  
  &--warning {
    background-color: rgba($color-warning, 0.08);
    color: var(--color-warning);
    border-left: 4px solid var(--color-warning);
  }
  
  &--error {
    background-color: rgba($color-error, 0.08);
    color: var(--color-error);
    border-left: 4px solid var(--color-error);
  }
  
  &--info {
    background-color: rgba($color-info, 0.08);
    color: var(--color-info);
    border-left: 4px solid var(--color-info);
  }
}

// Transition animations
.ui-alert-slide-enter-active,
.ui-alert-slide-leave-active {
  transition: all 0.3s $easing-decelerate;
  max-height: 500px;
}

.ui-alert-slide-enter-from,
.ui-alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
</style> 