<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        示例页面
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        这里将显示ChartDB的各种示例
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('ExamplesPage mounted')
})
</script>
