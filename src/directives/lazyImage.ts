// A Vue directive for lazy loading images
// This will work with all images, including those loaded from API calls

export default {
  beforeMount(el: HTMLImageElement) {
    try {
      // Store the original src
      const src = el.getAttribute('src');
      if (src) {
        el.dataset.src = src;
        // Don't use placeholder, just empty src
        el.setAttribute('src', '');
      }
      
      // Add loading="lazy" attribute if not already present
      if (!el.hasAttribute('loading')) {
        el.setAttribute('loading', 'lazy');
      }
      
      // Add event listeners for error handling
      el.addEventListener('error', handleError);
    } catch (error) {
      console.error('Error in lazy-image directive (beforeMount):', error);
    }
  },
  
  mounted(el: HTMLImageElement) {
    try {
      // Don't proceed if element doesn't have dataset or src property
      if (!el.dataset || !el.dataset.src) return;
      
      // Immediately load image without using IntersectionObserver
      const originalSrc = el.dataset.src;
      if (originalSrc) {
        // Set real image source to trigger loading
        el.setAttribute('src', originalSrc);
        
        // Add onload handler to mark as loaded when done
        el.onload = () => {
          el.classList.add('loaded');
        };
      }
    } catch (error) {
      console.error('Error in lazy-image directive (mounted):', error);
      // Fallback: if error occurs, load the image immediately
      if (el.dataset && el.dataset.src) {
        el.setAttribute('src', el.dataset.src);
      }
    }
  },
  
  updated(el: HTMLImageElement) {
    try {
      // Handle src changes after component updates
      const currentSrc = el.getAttribute('src');
      const dataSrc = el.dataset.src;
      
      // If src has changed and isn't empty
      if (currentSrc && currentSrc !== dataSrc && currentSrc !== '' && currentSrc !== 'data:,') {
        el.dataset.src = currentSrc;
        
        // Add onload handler to mark as loaded when done
        el.onload = () => {
          el.classList.add('loaded');
        };
      }
    } catch (error) {
      console.error('Error in lazy-image directive (updated):', error);
    }
  },
  
  unmounted(el: HTMLImageElement) {
    try {
      // Remove event listeners to prevent memory leaks
      el.removeEventListener('error', handleError);
    } catch (error) {
      console.error('Error in lazy-image directive (unmounted):', error);
    }
  }
};

// Handle image loading errors
function handleError(event: Event) {
  try {
    const img = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${img.dataset?.src || img.src}`);
    
    // Don't set fallback image, better to show nothing than 404 error
    img.style.display = 'none';
    
    img.classList.add('error');
  } catch (error) {
    console.error('Error in image error handler:', error);
  }
} 