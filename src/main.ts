import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import intersectDirective from '@/utils/directive'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus, {
    locale: zhCn,
})

app.directive('intersect', intersectDirective)

app.mount('#app')
