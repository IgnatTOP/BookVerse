<template>
  <component
    :is="resolveIcon()"
    :class="[
      'ui-icon',
      `ui-icon--${size}`,
      { 'ui-icon--spin': spin }
    ]"
    :style="{ color: color }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as solidIcons from '@heroicons/vue/24/solid';
import * as outlineIcons from '@heroicons/vue/24/outline';

defineOptions({
  name: 'UiIcon'
});

interface Props {
  name: string;
  type?: 'solid' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  spin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'outline',
  size: 'md',
  color: '',
  spin: false
});

// Map of kebab-case icon names to PascalCase icon names in Heroicons
const iconNameMap: Record<string, string> = {
  'home': 'HomeIcon',
  'book-open': 'BookOpenIcon',
  'shopping-cart': 'ShoppingCartIcon',
  'x-mark': 'XMarkIcon',
  'check': 'CheckIcon',
  'arrow-path': 'ArrowPathIcon',
  'arrow-left': 'ArrowLeftIcon',
  'arrow-right': 'ArrowRightIcon',
  'arrow-uturn-left': 'ArrowUturnLeftIcon',
  'question-mark-circle': 'QuestionMarkCircleIcon',
  'document-text': 'DocumentTextIcon',
  'speaker-wave': 'SpeakerWaveIcon',
  'chat-bubble-left-right': 'ChatBubbleLeftRightIcon',
  'shopping-bag': 'ShoppingBagIcon',
  'tag': 'TagIcon',
  'calendar': 'CalendarIcon',
  'building-library': 'BuildingLibraryIcon',
  'document': 'DocumentIcon',
  'language': 'GlobeAltIcon', // Using globe alt as replacement for language
  'identification': 'IdentificationIcon',
  'information-circle': 'InformationCircleIcon',
  'plus-circle': 'PlusCircleIcon',
  'minus-circle': 'MinusCircleIcon',
  'clock': 'ClockIcon',
  'magnifying-glass': 'MagnifyingGlassIcon',
  'chevron-left': 'ChevronLeftIcon',
  'chevron-right': 'ChevronRightIcon',
  'trash': 'TrashIcon',
  'receipt-percent': 'ReceiptPercentIcon',
  'credit-card': 'CreditCardIcon',
  'funnel': 'FunnelIcon',
  // Add other icon mappings as needed
};

const resolveIcon = () => {
  try {
    const iconSet = props.type === 'solid' ? solidIcons : outlineIcons;
    
    // First check if we have a direct mapping for this icon name
    const mappedName = iconNameMap[props.name];
    
    // If we have a mapping, use it, otherwise try to generate the name
    let iconName = mappedName;
    
    if (!iconName) {
      // Convert kebab-case to PascalCase and add "Icon" suffix
      iconName = props.name
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('') + 'Icon';
    }
    
    const icon = iconSet[iconName as keyof typeof iconSet];
    
    if (!icon) {
      console.warn(`Icon not found: ${props.name} (as ${iconName}). Using fallback.`);
      return outlineIcons.QuestionMarkCircleIcon;
    }
    
    return icon;
  } catch (error) {
    console.error(`Error resolving icon: ${props.name}`, error);
    return outlineIcons.ExclamationCircleIcon;
  }
};
</script>

<style lang="scss">
@use '../../styles/base/variables' as *;

.ui-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  
  &--xs {
    width: 16px;
    height: 16px;
  }
  
  &--sm {
    width: 20px;
    height: 20px;
  }
  
  &--md {
    width: 24px;
    height: 24px;
  }
  
  &--lg {
    width: 32px;
    height: 32px;
  }
  
  &--xl {
    width: 40px;
    height: 40px;
  }
  
  &--spin {
    animation: ui-icon-spin 1.5s linear infinite;
  }
}

@keyframes ui-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 