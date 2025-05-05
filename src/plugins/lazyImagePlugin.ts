// Global plugin to automatically apply lazy loading to all images
import type { App } from 'vue';

// Path to fallback image
const FALLBACK_IMAGE = '/src/assets/fallback-image.svg';

export default {
  install(app: App) {
    // Patch the global Image constructor to automatically apply lazy loading
    try {
      const originalImageSet = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
      
      if (originalImageSet) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
          set(url) {
            // Only intercept if it's a URL and not a data URL
            if (url && typeof url === 'string' && !url.startsWith('data:')) {
              // Add loading="lazy" attribute if not present
              if (!this.hasAttribute('loading')) {
                this.setAttribute('loading', 'lazy');
              }
              
              // If it's a new image and not yet mounted
              if (!this.isConnected && !this.dataset.lazySrc) {
                this.dataset.lazySrc = url;
                // Don't set src yet
                return;
              }
            }
            
            // Call the original setter
            originalImageSet.call(this, url);
          }
        });
      }
    } catch (error) {
      console.error('Failed to patch Image prototype:', error);
    }
    
    // Still use the component-based approach as a fallback
    app.mixin({
      mounted() {
        // Access the component instance's DOM element
        const el = this.$el;
        
        // Check if el is a valid DOM element that supports querySelectorAll
        if (!el || typeof el.querySelectorAll !== 'function') {
          return;
        }
        
        try {
          // Find all img elements that don't already have data-v-lazy
          const imgElements = el.querySelectorAll('img:not([data-v-lazy])');
          
          // Apply lazy loading to each image
          imgElements.forEach((img: HTMLImageElement) => {
            // Mark as processed
            img.setAttribute('data-v-lazy', 'true');
            
            // Add loading="lazy" attribute if not already present
            if (!img.hasAttribute('loading')) {
              img.setAttribute('loading', 'lazy');
            }
            
            // If we have a saved lazy src, now it's time to load it
            if (img.dataset.lazySrc) {
              img.src = img.dataset.lazySrc;
              delete img.dataset.lazySrc;
            }
            
            // Listen for errors and provide fallback
            img.addEventListener('error', (e) => {
              console.warn('Image failed to load:', img.src);
              // Set fallback image
              img.src = FALLBACK_IMAGE;
            }, { once: true });
          });
        } catch (error) {
          console.error('Error in lazyImagePlugin:', error);
        }
      }
    });
  }
}; 