import './assets/main.css'
import './assets/auth.css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/message/style/css'

import { APP_NAME } from '@/constants/app'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

document.title = APP_NAME

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {   // 注冊 Element Icon
  app.component(key, component)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
