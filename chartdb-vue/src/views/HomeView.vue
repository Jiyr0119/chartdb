<template>
  <!-- 主页容器 -->
  <div class="home">
    <!-- 数据导入区域 - 当没有图表数据时显示 -->
    <div v-if="!diagramData" class="import-section">
      <h1>数据库关系图渲染器</h1>
      <p>导入JSON文件来生成数据库关系图</p>
      <!-- JSON导入组件 -->
      <JsonImporter @data-loaded="handleDataLoaded" />
    </div>

    <!-- 图表显示区域 - 当有图表数据时显示 -->
    <div v-else class="diagram-section">
      <!-- 工具栏 -->
      <div class="toolbar">
        <!-- 重新导入按钮 -->
        <button @click="resetData" class="reset-button">
          重新导入
        </button>
        <!-- 表数量统计 -->
        <span class="table-count">
          共 {{ Object.keys(diagramData.tables).length }} 张表
        </span>
      </div>
      <!-- 画布容器 -->
      <div class="canvas-container">
        <!-- 图表画布组件 -->
        <DiagramCanvas :data="diagramData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入Vue的响应式引用
import { ref } from 'vue'
// 导入JSON导入组件
import JsonImporter from '@/components/json-import/JsonImporter.vue'
// 导入图表画布组件
import DiagramCanvas from '@/components/diagram/DiagramCanvas.vue'
// 导入图表数据类型定义
import type { DiagramData } from '@/types/diagram'

// 响应式图表数据引用，初始值为null
const diagramData = ref<DiagramData | null>(null)

/**
 * 处理数据加载完成事件
 * @param data 加载的图表数据
 */
const handleDataLoaded = (data: DiagramData) => {
  // 设置图表数据
  diagramData.value = data
}

/**
 * 重置数据
 * 清空图表数据，回到导入界面
 */
const resetData = () => {
  // 清空图表数据
  diagramData.value = null
}
</script>

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.import-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  text-align: center;
}

.diagram-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.canvas-container {
  flex: 1;
  height: calc(100vh - 60px); /* 减去toolbar高度 */
  overflow: hidden;
}

.import-section h1 {
  margin-bottom: 16px;
  color: #111827;
}

.import-section p {
  margin-bottom: 32px;
  color: #6b7280;
}

.diagram-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.reset-button {
  background-color: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #4b5563;
}

.table-count {
  color: #6b7280;
  font-size: 14px;
}
</style>
