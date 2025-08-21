// 导入全局样式
import './assets/main.css'

// 导入Vue和Pinia
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 导入根组件和路由
import App from './App.vue'
import router from './router'

// 创建Vue应用实例
const app = createApp(App)

// 注册Pinia状态管理
app.use(createPinia())
// 注册路由
app.use(router)

// 挂载应用到DOM
app.mount('#app')
