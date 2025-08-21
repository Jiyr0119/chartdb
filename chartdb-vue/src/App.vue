<script setup lang="ts">
// 导入路由视图组件，用于渲染匹配的路由组件
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- 应用根容器 -->
  <div id="app">
    <!-- 路由视图出口，渲染当前路由匹配的组件 -->
    <RouterView />
  </div>
</template>

<style>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 设置全局html和body样式 */
html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 应用容器样式，占满整个视口 */
#app {
  height: 100vh;
  width: 100vw;
}
</style>
