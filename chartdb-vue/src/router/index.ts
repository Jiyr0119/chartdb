// 导入Vue Router相关函数和组件
import { createRouter, createWebHistory } from 'vue-router'
// 导入首页视图组件
import HomeView from '../views/HomeView.vue'

// 创建路由器实例
const router = createRouter({
  // 配置路由历史模式，使用HTML5 History模式
  history: createWebHistory(import.meta.env.BASE_URL),
  // 定义路由表
  routes: [
    // 首页路由
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
  ],
})

// 导出路由器实例
export default router
