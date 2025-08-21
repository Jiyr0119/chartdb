<template>
  <div class="table-node bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px]">
    <!-- <NodeResizer
      color="#ff0071"
      isVisible
      minWidth={200}
      minHeight={100}
      @resize="handleResize"
    /> -->

    <!-- Table Header -->
    <div class="table-header">
      <div class="table-title">
        <h3>{{ data.tableName }}</h3>
        <p class="table-description">{{ data.table.chinese_name }}</p>
      </div>
    </div>
    <!-- <div class="table-header bg-blue-500 text-white p-3 rounded-t-lg">
      <div class="table-title font-bold text-lg">{{ data.table.tableName }}</div>
      <div class="table-description text-sm opacity-90">{{ data.table.chinese_name }}</div>
    </div> -->

    <!-- Table Fields -->
    <div class="table-fields">
      <div v-for="(field, index) in data.table.fields" :key="field.field_english_name"
        class="field-row flex items-center justify-between p-2 border-t border-gray-200 hover:bg-gray-50"
        :class="{ 'font-semibold': isPrimaryKey(field) }">
        <!-- Field Handles -->
        <Handle :id="`${RIGHT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Right"
          class="field-handle-right" :style="{ top: getFieldHandlePosition(index) }" />
        <Handle :id="`${LEFT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Left"
          class="field-handle-left" :style="{ top: getFieldHandlePosition(index) }" />
        <Handle :id="`${TARGET_ID_PREFIX}${field.field_english_name}`" type="target" :position="Position.Left"
          class="field-handle-target" :style="{ top: getFieldHandlePosition(index) }" />

        <div class="field-info flex-1">
          <span class="field-name">{{ field.field_english_name }}</span>
          <span class="field-chinese text-gray-600 ml-2">{{ field.field_name }}</span>
        </div>
        <div class="field-type text-sm text-gray-500">{{ field.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position, NodeResizer } from '@vue-flow/core';
import type { TableNodeData } from '../../types/diagram';

// Handle ID前缀定义
const LEFT_HANDLE_ID_PREFIX = 'left_rel_';
const RIGHT_HANDLE_ID_PREFIX = 'right_rel_';
const TARGET_ID_PREFIX = 'target_rel_';

interface Props {
  data: TableNodeData;
}

defineProps<Props>();

const isPrimaryKey = (field: any) => {
  return field.description?.includes('主键') || field.field_english_name === 'id';
};

const getFieldHandlePosition = (index: number) => {
  // 计算字段Handle的垂直位置
  const headerHeight = 80; // 表头高度
  const fieldHeight = 40; // 每个字段的高度
  return `${headerHeight + (index * fieldHeight) + (fieldHeight / 2)}px`;
};

const handleResize = (event: any) => {
  // 处理节点大小调整
  console.log('Node resized:', event);
};
</script>

<style scoped>
.table-node {
  min-width: 200px;
}

.field-handle-right,
.field-handle-left,
.field-handle-target {
  width: 8px;
  height: 8px;
  background: #ff0071;
  border: 2px solid #fff;
  border-radius: 50%;
}

.field-handle-right {
  right: -4px;
}

.field-handle-left,
.field-handle-target {
  left: -4px;
}

.field-handle-target {
  background: #00ff71;
}

.table-node {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 200px;
  position: relative;
}

.table-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

.table-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.table-description {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.table-fields {
  max-height: 300px;
  overflow-y: auto;
}

.field-row {
  padding: 8px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 40px;
  justify-content: center;
}

.field-row:last-child {
  border-bottom: none;
}

.field-row.primary-key {
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
}

.field-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-name {
  font-weight: 500;
  font-size: 12px;
  color: #111827;
}

.field-chinese-name {
  font-size: 11px;
  color: #6b7280;
}

.field-description {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.3;
}

.primary-key .field-name {
  color: #92400e;
}
</style>
