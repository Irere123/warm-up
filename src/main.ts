import './styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import OpenLayersMap, { type Vue3OpenlayersGlobalOptions } from 'vue3-openlayers'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin)

const options: Vue3OpenlayersGlobalOptions = {
  debug: process.env.NODE_ENV !== 'production',
}

app.use(OpenLayersMap, options)

app.mount('#app')
