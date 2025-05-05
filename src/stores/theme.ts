import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useStorage, usePreferredDark } from '@vueuse/core';

type ThemeType = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', () => {
  const themePreference = useStorage<ThemeType>('bookstore-theme', 'system');
  const prefersDark = usePreferredDark();
  const currentTheme = ref<'light' | 'dark'>(
    themePreference.value === 'system' 
      ? prefersDark.value ? 'dark' : 'light'
      : themePreference.value
  );

  function setTheme(theme: ThemeType) {
    themePreference.value = theme;
    updateDocumentTheme();
  }

  function updateDocumentTheme() {
    const isDark = 
      themePreference.value === 'system'
        ? prefersDark.value
        : themePreference.value === 'dark';

    currentTheme.value = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  }

  watch(prefersDark, () => {
    if (themePreference.value === 'system') {
      updateDocumentTheme();
    }
  });

  // Initialize theme on store creation
  updateDocumentTheme();

  return {
    themePreference,
    currentTheme,
    setTheme
  };
}); 