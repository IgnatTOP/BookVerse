// Экспорт всех компонентов из одного места
export * from './ui'
export * from './book'
export * from './catalog'

// Другие компоненты
import MainLayout from './layout/MainLayout.vue'
import TheHeader from './layout/TheHeader.vue'
import TheFooter from './layout/TheFooter.vue'
import CartItem from './cart/CartItem.vue'
import CartSummary from './cart/CartSummary.vue'

export {
  MainLayout,
  TheHeader,
  TheFooter,
  CartItem,
  CartSummary
} 