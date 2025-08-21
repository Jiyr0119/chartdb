<template>
  <div class="home">
    <div v-if="!diagramData" class="import-section">
      <h1>数据库关系图渲染器</h1>
      <p>导入JSON文件来生成数据库关系图</p>
      <JsonImporter @data-loaded="handleDataLoaded" />
    </div>

    <div v-else class="diagram-section">
      <div class="toolbar">
        <button @click="resetData" class="reset-button">
          重新导入
        </button>
        <span class="table-count">
          共 {{ Object.keys(diagramData.tables).length }} 张表
        </span>
      </div>
      <div class="canvas-container">
        <DiagramCanvas :data="diagramData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JsonImporter from '@/components/json-import/JsonImporter.vue'
import DiagramCanvas from '@/components/diagram/DiagramCanvas.vue'
import type { DiagramData } from '@/types/diagram'

const diagramData = ref<DiagramData | null>(null)

const handleDataLoaded = (data: DiagramData) => {
  diagramData.value = data
}

const resetData = () => {
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
