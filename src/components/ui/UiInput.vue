<template>
  <div 
    :class="[
      'ui-input',
      { 'ui-input--error': error },
      { 'ui-input--success': success },
      { 'ui-input--disabled': disabled },
      { 'ui-input--with-left-icon': $slots.leftIcon },
      { 'ui-input--with-right-icon': $slots.rightIcon }
    ]"
  >
    <label v-if="label" :for="id" class="ui-input__label">
      {{ label }}
      <span v-if="required" class="ui-input__required">*</span>
    </label>
    
    <div class="ui-input__wrapper">
      <span v-if="$slots.leftIcon" class="ui-input__icon ui-input__icon--left">
        <slot name="leftIcon"></slot>
      </span>
      
      <input
        :id="id"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="ui-input__field"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <span 
        v-if="$slots.rightIcon" 
        class="ui-input__icon ui-input__icon--right"
        @click="$emit('rightIconClick', $event)"
      >
        <slot name="rightIcon"></slot>
      </span>
    </div>
    
    <div v-if="error || success || hint" class="ui-input__message">
      <span v-if="error" class="ui-input__error">{{ error }}</span>
      <span v-else-if="success" class="ui-input__success">{{ success }}</span>
      <span v-else-if="hint" class="ui-input__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UiInput',
  inheritAttrs: false
})

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: string
  id?: string
  error?: string
  success?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  type: 'text',
  id: '',
  error: '',
  success: '',
  hint: '',
  disabled: false,
  required: false,
  autocomplete: 'off'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'rightIconClick', event: MouseEvent): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value);
}
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;
@use "sass:color";

.ui-input {
  margin-bottom: $spacing-md;
  
  &__label {
    display: inline-block;
    margin-bottom: $spacing-xs;
    font-weight: $font-weight-medium;
    font-size: $font-size-sm;
    color: var(--color-text);
  }
  
  &__required {
    color: var(--color-error);
    margin-left: 2px;
  }
  
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  &__field {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    border: 1px solid var(--color-input-border);
    border-radius: var(--border-radius-md);
    font-size: $font-size-base;
    background-color: var(--color-input-background);
    color: var(--color-text);
    transition: all $transition-fast $easing-decelerate;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px var(--color-focus-ring);
    }
    
    &::placeholder {
      color: var(--color-text-muted);
      opacity: 0.7;
    }
  }
  
  &__icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-light);
    z-index: 2;
    
    svg {
      width: 18px;
      height: 18px;
    }
    
    &--left {
      left: $spacing-sm;
    }
    
    &--right {
      right: $spacing-sm;
      cursor: pointer;
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
  
  &__message {
    margin-top: $spacing-xs;
    font-size: $font-size-sm;
  }
  
  &__error {
    color: var(--color-error);
  }
  
  &__success {
    color: var(--color-success);
  }
  
  &__hint {
    color: var(--color-text-light);
    font-style: italic;
  }
  
  &--with-left-icon {
    .ui-input__field {
      padding-left: $spacing-xl + $spacing-sm;
    }
  }
  
  &--with-right-icon {
    .ui-input__field {
      padding-right: $spacing-xl + $spacing-sm;
    }
  }
  
  &--error {
    .ui-input__field {
      border-color: var(--color-error);
      
      &:focus {
        box-shadow: 0 0 0 2px rgba($color-error, 0.2);
      }
    }
  }
  
  &--success {
    .ui-input__field {
      border-color: var(--color-success);
      
      &:focus {
        box-shadow: 0 0 0 2px rgba($color-success, 0.2);
      }
    }
  }
  
  &--disabled {
    opacity: 0.7;
    
    .ui-input__field {
      cursor: not-allowed;
      background-color: var(--color-input-disabled);
    }
  }
}
</style> 