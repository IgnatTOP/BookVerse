/**
 * Composable for handling smooth scrolling
 */
export function useScroll() {
  /**
   * Smoothly scrolls to a specific element on the page
   * @param elementId - The ID of the element to scroll to
   * @param offset - Additional offset from the top of the element (default: 0)
   * @param behavior - Scroll behavior (default: 'smooth')
   */
  const scrollToElement = (
    elementId: string, 
    offset = 0, 
    behavior: ScrollBehavior = 'smooth'
  ) => {
    const element = document.getElementById(elementId);
    
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior
      });
    }
  };

  /**
   * Smoothly scrolls to the top of the page
   * @param behavior - Scroll behavior (default: 'smooth')
   */
  const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
    window.scrollTo({
      top: 0,
      behavior
    });
  };

  return {
    scrollToElement,
    scrollToTop
  };
} 