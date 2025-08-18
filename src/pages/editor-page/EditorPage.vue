<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        ChartDB Vue Edition
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-8">
        这是Vue版本的ChartDB编辑器页面
      </p>
      
      <!-- 临时编辑器区域 -->
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          图表编辑器
        </h2>
        <div class="h-96 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">
            图表编辑器将在这里渲染
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('EditorPage mounted')
  console.log('Route params:', route.params)
})
</script>
