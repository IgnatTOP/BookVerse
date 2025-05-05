<template>
  <div class="ui-image-container">
    <img 
      :src="src" 
      :alt="alt" 
      class="ui-image" 
      :width="width" 
      :height="height"
      loading="lazy"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { defineOptions } from 'vue';

defineOptions({
  name: 'UiImage',
  inheritAttrs: false
});

interface Props {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 'auto',
  height: 'auto',
  class: ''
});
</script>

<style lang="scss">
.ui-image-container {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 100%;
}

.ui-image {
  display: block;
  max-width: 100%;
  object-fit: cover;
  background-color: #f5f5f5;
}
</style>