import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.scss'

// UI Components
import UiButton from './components/ui/UiButton.vue'
import UiInput from './components/ui/UiInput.vue'
import UiCard from './components/ui/UiCard.vue'
import UiBadge from './components/ui/UiBadge.vue'
import UiIcon from './components/ui/UiIcon.vue'
import UiModal from './components/ui/UiModal.vue'
import UiAlert from './components/ui/UiAlert.vue'
import UiSkeleton from './components/ui/UiSkeleton.vue'
import UiImage from './components/ui/UiImage.vue'

// Layout Components
import MainLayout from './components/layout/MainLayout.vue'
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'

// Catalog Components
import BookCard from './components/catalog/BookCard.vue'
import CatalogFilters from './components/catalog/CatalogFilters.vue'
import CatalogGrid from './components/catalog/CatalogGrid.vue'
import CartItem from './components/cart/CartItem.vue'
import CartSummary from './components/cart/CartSummary.vue'

// Directives
import LazyImage from './directives/lazyImage'

// Plugins
import LazyImagePlugin from './plugins/lazyImagePlugin'

const app = createApp(App)

// Register components globally
app.component('UiButton', UiButton)
app.component('UiInput', UiInput)
app.component('UiCard', UiCard)
app.component('UiBadge', UiBadge)
app.component('UiIcon', UiIcon)
app.component('UiModal', UiModal)
app.component('UiAlert', UiAlert)
app.component('UiSkeleton', UiSkeleton)
app.component('UiImage', UiImage)
app.component('MainLayout', MainLayout)
app.component('TheHeader', TheHeader)
app.component('TheFooter', TheFooter)
app.component('BookCard', BookCard)
app.component('CatalogFilters', CatalogFilters)
app.component('CatalogGrid', CatalogGrid)
app.component('CartItem', CartItem)
app.component('CartSummary', CartSummary)

// Register directives
app.directive('lazy-image', LazyImage)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(LazyImagePlugin)

app.mount('#app')
