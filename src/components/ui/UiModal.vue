<template>
  <Teleport to="body">
    <Transition name="ui-modal-fade">
      <div
        v-if="modelValue"
        class="ui-modal-backdrop"
        @click="closeOnBackdrop && $emit('update:modelValue', false)"
      >
        <Transition name="ui-modal-scale">
          <div 
            v-if="modelValue"
            class="ui-modal"
            :class="[
              `ui-modal--${size}`,
              { 'ui-modal--scrollable': scrollable }
            ]"
            @click.stop
          >
            <div class="ui-modal__header" v-if="$slots.header || title">
              <slot name="header">
                <h3 class="ui-modal__title">{{ title }}</h3>
              </slot>
              <button 
                v-if="closable"
                class="ui-modal__close" 
                @click="$emit('update:modelValue', false)"
                type="button"
                aria-label="Закрыть"
              >
                <UiIcon name="x-mark" />
              </button>
            </div>
            
            <div class="ui-modal__body" :class="{ 'ui-modal__body--padded': !noPadding }">
              <slot></slot>
            </div>
            
            <div class="ui-modal__footer" v-if="$slots.footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';

defineOptions({
  name: 'UiModal'
});

interface Props {
  modelValue: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  scrollable?: boolean;
  noPadding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEsc: true,
  scrollable: false,
  noPadding: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

const handleEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEsc && props.modelValue) {
    emit('update:modelValue', false);
    emit('close');
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.classList.add('ui-modal-open');
  } else {
    document.body.classList.remove('ui-modal-open');
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleEsc);
  if (props.modelValue) {
    document.body.classList.add('ui-modal-open');
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEsc);
  document.body.classList.remove('ui-modal-open');
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

body.ui-modal-open {
  overflow: hidden;
}

.ui-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal-backdrop;
  overflow-y: auto;
  padding: $spacing-md;
}

.ui-modal {
  background-color: var(--color-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  z-index: $z-index-modal;
  overflow: hidden;
  position: relative;
  
  &--scrollable {
    max-height: 90vh;
    
    .ui-modal__body {
      overflow-y: auto;
    }
  }
  
  &--sm { width: 400px; }
  &--md { width: 600px; }
  &--lg { width: 800px; }
  &--xl { width: 1000px; }
  &--full { 
    width: calc(100vw - #{$spacing-xl * 2}); 
    height: calc(100vh - #{$spacing-xl * 2}); 
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid var(--color-divider);
  }
  
  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    margin: 0;
    color: var(--color-text);
  }
  
  &__close {
    background: transparent;
    border: none;
    color: var(--color-text-light);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-full;
    transition: all $transition-fast;
    
    &:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text);
    }
  }
  
  &__body {
    flex: 1 1 auto;
    
    &--padded {
      padding: $spacing-lg;
      
      @include respond-to(md) {
        padding: $spacing-xl;
      }
    }
  }
  
  &__footer {
    padding: $spacing-md $spacing-lg;
    border-top: 1px solid var(--color-divider);
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
}

// Transitions
.ui-modal-fade-enter-active,
.ui-modal-fade-leave-active {
  transition: opacity $transition-normal $easing-standard;
}

.ui-modal-fade-enter-from,
.ui-modal-fade-leave-to {
  opacity: 0;
}

.ui-modal-scale-enter-active,
.ui-modal-scale-leave-active {
  transition: all $transition-normal $easing-standard;
}

.ui-modal-scale-enter-from,
.ui-modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 