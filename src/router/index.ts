import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../pages/HomePage.vue'),
    meta: { title: 'Главная - Книжный магазин' }
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import('../pages/CatalogPage.vue'),
    meta: { title: 'Каталог книг - Книжный магазин' }
  },
  {
    path: '/book/:id',
    name: 'book-details',
    component: () => import('../pages/BookDetailsPage.vue'),
    props: true,
    meta: { title: 'Детали книги - Книжный магазин' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../pages/CartPage.vue'),
    meta: { title: 'Корзина - Книжный магазин' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../pages/CheckoutPage.vue'),
    meta: { title: 'Оформление заказа - Книжный магазин' }
  },
  {
    path: '/order-success/:orderId',
    name: 'order-success',
    component: () => import('../pages/OrderSuccessPage.vue'),
    props: true,
    meta: { title: 'Заказ оформлен - Книжный магазин' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFoundPage.vue'),
    meta: { title: 'Страница не найдена - Книжный магазин' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || 'Книжный магазин';
  next();
});

export default router; 