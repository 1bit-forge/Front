import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import CalendarView from '@/views/CalendarView.vue'
import SettingView from '@/views/SettingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'calendar',
          component: CalendarView,
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingView,
        },
      ],
    },
  ],
})

export default router
