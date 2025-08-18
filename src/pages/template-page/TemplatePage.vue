<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        模板详情页面
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        这里将显示特定模板的详细信息
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('TemplatePage mounted')
  console.log('Template slug:', route.params.templateSlug)
  console.log('Loader data:', route.meta.loaderData)
})
</script>
