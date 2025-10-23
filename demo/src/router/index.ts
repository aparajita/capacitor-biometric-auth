import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

import BiometryView from '../components/biometry-view.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BiometryView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
