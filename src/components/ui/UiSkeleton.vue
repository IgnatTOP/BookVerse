<template>
  <div 
    :class="[
      'ui-skeleton',
      `ui-skeleton--${variant}`,
      { 'ui-skeleton--animated': animated }
    ]"
    :style="{
      width: width,
      height: height,
      borderRadius
    }"
  ></div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UiSkeleton'
});

interface Props {
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
  borderRadius?: string;
  animated?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'rect',
  width: '100%',
  height: '1.2em',
  borderRadius: '',
  animated: true
});
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;

.ui-skeleton {
  display: inline-block;
  position: relative;
  overflow: hidden;
  background-color: var(--color-surface-hover);
  
  &--text {
    margin-top: 0.2em;
    margin-bottom: 0.2em;
    border-radius: $border-radius-sm;
    width: 100%;
    
    &:not(:last-child) {
      margin-bottom: 0.5em;
    }
  }
  
  &--circle {
    border-radius: 50%;
  }
  
  &--rect {
    border-radius: $border-radius-md;
  }
  
  &--animated {
    &::after {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 25%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      animation: skeleton-loading 1.5s infinite;
    }
  }
}

@keyframes skeleton-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style> 