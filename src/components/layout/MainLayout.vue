<template>
  <div class="layout">
    <TheHeader />
    <main class="layout__main">
      <slot></slot>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// No need to import components that are registered globally
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;
@use '../../styles/base/mixins' as *;

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: $spacing-md 0;
    
    @include respond-to(md) {
      padding: $spacing-lg 0;
    }
  }
}
</style> 