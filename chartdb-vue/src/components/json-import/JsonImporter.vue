<template>
  <div class="json-importer">
    <div class="upload-area" :class="{ 'drag-over': isDragOver }" @drop="handleDrop" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave">
      <input ref="fileInput" type="file" accept=".json" @change="handleFileSelect" class="hidden" />
      <div class="upload-content">
        <div class="upload-icon">
          📁
        </div>
        <p class="upload-text">拖拽JSON文件到此处或点击选择文件</p>
        <button @click="triggerFileSelect" class="upload-button">
          选择文件
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="isLoading" class="loading">
      正在解析文件...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DiagramData } from '@/types/diagram'

const emit = defineEmits<{
  dataLoaded: [data: DiagramData]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const error = ref('')
const isLoading = ref(false)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = async (file: File) => {
  error.value = ''
  isLoading.value = true
  
  try {
    if (!file.name.endsWith('.json')) {
      throw new Error('请选择JSON文件')
    }
    
    const text = await file.text()
    const data = JSON.parse(text) as DiagramData
    
    // 验证数据结构
    if (!data.tables || typeof data.tables !== 'object') {
      throw new Error('JSON格式不正确：缺少tables字段')
    }
    
    emit('dataLoaded', data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '文件解析失败'
  } finally {
    isLoading.value = false
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