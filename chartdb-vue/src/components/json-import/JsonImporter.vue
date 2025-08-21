<template>
  <!-- JSON导入器容器 -->
  <div class="json-importer">
    <!-- 文件上传区域 -->
    <div class="upload-area" :class="{ 'drag-over': isDragOver }" @drop="handleDrop" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave">
      <!-- 隐藏的文件输入框 -->
      <input ref="fileInput" type="file" accept=".json" @change="handleFileSelect" class="hidden" />
      <!-- 上传内容区域 -->
      <div class="upload-content">
        <!-- 上传图标 -->
        <div class="upload-icon">
          📁
        </div>
        <!-- 上传提示文本 -->
        <p class="upload-text">拖拽JSON文件到此处或点击选择文件</p>
        <!-- 选择文件按钮 -->
        <button @click="triggerFileSelect" class="upload-button">
          选择文件
        </button>
      </div>
    </div>
    
    <!-- 错误消息显示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 加载状态显示 -->
    <div v-if="isLoading" class="loading">
      正在解析文件...
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入Vue的响应式引用
import { ref } from 'vue'
// 导入图表数据类型定义
import type { DiagramData } from '@/types/diagram'

// 定义组件事件发射器
const emit = defineEmits<{
  dataLoaded: [data: DiagramData]  // 数据加载完成事件
}>()

// 响应式引用定义
const fileInput = ref<HTMLInputElement>()  // 文件输入框引用
const isDragOver = ref(false)             // 拖拽状态
const error = ref('')                     // 错误消息
const isLoading = ref(false)              // 加载状态

/**
 * 触发文件选择
 * 点击按钮时触发隐藏的文件输入框
 */
const triggerFileSelect = () => {
  fileInput.value?.click()
}

/**
 * 处理拖拽悬停事件
 * @param e 拖拽事件对象
 */
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()           // 阻止默认行为
  isDragOver.value = true     // 设置拖拽状态为true
}

/**
 * 处理拖拽离开事件
 */
const handleDragLeave = () => {
  isDragOver.value = false    // 设置拖拽状态为false
}

/**
 * 处理文件拖拽放置事件
 * @param e 拖拽事件对象
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()          // 阻止默认行为
  isDragOver.value = false    // 设置拖拽状态为false
  
  // 获取拖拽的文件
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])     // 处理第一个文件
  }
}

/**
 * 处理文件选择事件
 * @param e 文件选择事件对象
 */
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement  // 类型断言为输入框元素
  const files = target.files                   // 获取选择的文件
  if (files && files.length > 0) {
    processFile(files[0])                      // 处理第一个文件
  }
}

/**
 * 处理文件解析
 * @param file 要处理的文件对象
 */
const processFile = async (file: File) => {
  error.value = ''        // 清空错误消息
  isLoading.value = true  // 设置加载状态为true
  
  try {
    // 验证文件类型
    if (!file.name.endsWith('.json')) {
      throw new Error('请选择JSON文件')
    }
    
    // 读取文件内容
    const text = await file.text()
    // 解析JSON数据
    const data = JSON.parse(text) as DiagramData
    
    // 验证数据结构
    if (!data.tables || typeof data.tables !== 'object') {
      throw new Error('JSON格式不正确：缺少tables字段')
    }
    
    // 发射数据加载完成事件
    emit('dataLoaded', data)
  } catch (err) {
    // 处理错误消息
    error.value = err instanceof Error ? err.message : '文件解析失败'
  } finally {
    isLoading.value = false  // 设置加载状态为false
  }
}
</script>

<style scoped>
.json-importer {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text {
  color: #6b7280;
  margin: 0;
}

.upload-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background-color: #2563eb;
}

.hidden {
  display: none;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 12px;
  margin-top: 16px;
}

.loading {
  color: #3b82f6;
  text-align: center;
  margin-top: 16px;
  font-weight: 500;
}
</style>