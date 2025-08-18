<template>
  <div class="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">
        404
      </h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
        页面未找到
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        您访问的页面不存在
      </p>
      <RouterLink 
        to="/" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        返回首页
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

onMounted(() => {
  console.log('NotFoundPage mounted')
})
</script>
