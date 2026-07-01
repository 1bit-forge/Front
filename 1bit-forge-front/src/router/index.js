import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import CalendarView from '@/views/CalendarView.vue'
import SettingView from '@/views/SettingView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { isAuthenticated } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guest: true },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'calendar',
          component: CalendarView,
          meta: { header: false },
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

// router.beforeEach((to) => {
//   const authenticated = isAuthenticated()
//   const isGuestRoute = to.matched.some((record) => record.meta.guest)
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

//   if (isGuestRoute && authenticated) {
//     return { name: 'calendar' }
//   }

//   if (requiresAuth && !authenticated) {
//     return {
//       name: 'login',
//       query: { redirect: to.fullPath },
//     }
//   }
// })

export default router
