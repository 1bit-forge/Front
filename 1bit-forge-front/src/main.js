import './assets/main.css'
import './assets/auth.css'

import { APP_NAME } from '@/constants/app'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

document.title = APP_NAME

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
