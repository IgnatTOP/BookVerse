import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Composable for handling animations
 */
export function useAnimation() {
  const isIntersecting = ref<Record<string, boolean>>({});
  let observer: IntersectionObserver | null = null;

  /**
   * Initialize the intersection observer for animations
   * @param options - IntersectionObserver options
   */
  const initObserver = (options: IntersectionObserverInit = {}) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const defaultOptions = {
      rootMargin: '0px',
      threshold: 0.1,
      ...options
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id || entry.target.getAttribute('data-id') || '';
        if (id) {
          isIntersecting.value[id] = entry.isIntersecting;
        }
      });
    }, defaultOptions);
  };

  /**
   * Observe an element for animation
   * @param element - The element to observe
   */
  const observeElement = (element: Element) => {
    if (!observer) return;
    observer.observe(element);
  };

  /**
   * Observe all elements with a specific class for animation
   * @param className - The class name to look for
   */
  const observeElementsByClass = (className: string) => {
    if (!observer) return;
    
    document.querySelectorAll(`.${className}`).forEach((el) => {
      const id = el.id || `anim-${Math.random().toString(36).substring(2, 9)}`;
      if (!el.id) {
        el.setAttribute('data-id', id);
      }
      if (observer) {
        observer.observe(el);
      }
    });
  };

  /**
   * Cleanly disconnect the observer
   */
  const disconnect = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // Set up and clean up
  onMounted(() => {
    initObserver();
  });

  onBeforeUnmount(() => {
    disconnect();
  });

  return {
    isIntersecting,
    initObserver,
    observeElement,
    observeElementsByClass,
    disconnect
  };
} 