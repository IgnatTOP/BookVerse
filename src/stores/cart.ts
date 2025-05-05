import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { useCatalogStore } from './catalog';
import type { ICart, ICartItem } from '../interfaces/cart.interface';
import type { IBook } from '../interfaces/book.interface';

export const useCartStore = defineStore('cart', () => {
  const initialCart: ICart = {
    items: [],
    totalQuantity: 0,
    subtotal: 0,
    discount: 0,
    total: 0
  };

  const cart = useStorage<ICart>('bookstore-cart', initialCart);
  const catalogStore = useCatalogStore();

  async function addToCart(book: IBook | string, quantity: number = 1) {
    if (quantity <= 0) return;
    
    let bookData: IBook | null = null;
    
    if (typeof book === 'string') {
      bookData = await catalogStore.fetchBookById(book);
      if (!bookData) return;
    } else {
      bookData = book;
    }

    const existingItemIndex = cart.value.items.findIndex(item => item.bookId === bookData!.id);

    if (existingItemIndex !== -1) {
      // Create a new array to trigger reactivity
      const items = [...cart.value.items];
      items[existingItemIndex].quantity += quantity;
      cart.value.items = items;
    } else {
      const newItem: ICartItem = {
        bookId: bookData.id,
        title: bookData.title,
        author: bookData.author,
        coverImage: bookData.coverImage,
        price: bookData.price,
        discountPercentage: bookData.discountPercentage,
        quantity
      };
      cart.value.items = [...cart.value.items, newItem];
    }

    recalculateCart();
  }

  function updateQuantity(bookId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    const existingItemIndex = cart.value.items.findIndex(item => item.bookId === bookId);
    
    if (existingItemIndex !== -1) {
      // Create a new array to trigger reactivity
      const items = [...cart.value.items];
      items[existingItemIndex].quantity = quantity;
      cart.value.items = items;
      recalculateCart();
    }
  }

  function removeFromCart(bookId: string) {
    cart.value.items = cart.value.items.filter(item => item.bookId !== bookId);
    recalculateCart();
  }

  function clearCart() {
    cart.value = { ...initialCart };
  }

  function recalculateCart() {
    const items = cart.value.items;
    
    let totalQuantity = 0;
    let subtotal = 0;
    let discount = 0;

    for (const item of items) {
      totalQuantity += item.quantity;
      
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      
      if (item.discountPercentage) {
        discount += (itemSubtotal * item.discountPercentage) / 100;
      }
    }

    cart.value.totalQuantity = totalQuantity;
    cart.value.subtotal = Math.round(subtotal);
    cart.value.discount = Math.round(discount);
    cart.value.total = Math.round(subtotal - discount);
  }
  
  function isInCart(bookId: string): boolean {
    return cart.value.items.some(item => item.bookId === bookId);
  }
  
  function getCartItemQuantity(bookId: string): number {
    const item = cart.value.items.find(item => item.bookId === bookId);
    return item ? item.quantity : 0;
  }
  
  function isEmpty(): boolean {
    return cart.value.items.length === 0;
  }

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getCartItemQuantity,
    isEmpty
  };
}); 