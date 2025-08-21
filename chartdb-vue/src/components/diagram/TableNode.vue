<template>
  <div class="table-node">
    <!-- Table Header with dynamic color -->
    <div class="table-header" :style="{ backgroundColor: data.color || '#f9fafb' }">
      <div class="table-title">
        <h3 :style="{ color: isLightColor(data.color) ? '#1f2937' : '#ffffff' }">
          <TableIcon class="table-icon" />
          {{ data.tableName }}
        </h3>
        <p class="table-description" :style="{ color: isLightColor(data.color) ? '#6b7280' : '#e5e7eb' }">
          {{ data.table.chinese_name }}
        </p>
      </div>
      <div class="field-count" :style="{ color: isLightColor(data.color) ? '#9ca3af' : '#d1d5db' }">
        {{ data.table.fields?.length || 0 }} 字段
      </div>
    </div>

    <!-- Table Fields -->
    <div class="table-fields">
      <div v-for="(field, index) in data.table.fields" :key="field.field_english_name"
        class="field-row"
        :class="{
          'primary-key': isPrimaryKey(field),
          'foreign-key': isForeignKey(field)
        }">
        <!-- Field Handles -->
        <Handle :id="`${RIGHT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Right"
          class="field-handle field-handle-right" :style="{ top: getFieldHandlePosition(index) }" />
        <Handle :id="`${LEFT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Left"
          class="field-handle field-handle-left" :style="{ top: getFieldHandlePosition(index) }" />
        <Handle :id="`${TARGET_ID_PREFIX}${field.field_english_name}`" type="target" :position="Position.Left"
          class="field-handle field-handle-target" :style="{ top: getFieldHandlePosition(index) }" />

        <div class="field-content">
          <div class="field-main">
            <div class="field-name-section">
              <KeyIcon v-if="isPrimaryKey(field)" class="field-icon primary-key-icon" />
              <LinkIcon v-else-if="isForeignKey(field)" class="field-icon foreign-key-icon" />
              <span class="field-name">{{ field.field_english_name }}</span>
              <span class="field-chinese">{{ field.field_name }}</span>
            </div>
            <div class="field-type">{{ getFieldType(field) }}</div>
          </div>
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Table Footer -->
    <div class="table-footer">
      <div class="table-stats">
        <span class="stat-item">
          <KeyIcon class="stat-icon" />
          {{ getPrimaryKeyCount() }}
        </span>
        <span class="stat-item">
          <LinkIcon class="stat-icon" />
          {{ getForeignKeyCount() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { Table as TableIcon, Key as KeyIcon, Link as LinkIcon } from 'lucide-vue-next';
import type { TableNodeData } from '../../types/diagram';

// Handle ID前缀定义
const LEFT_HANDLE_ID_PREFIX = 'left_rel_';
const RIGHT_HANDLE_ID_PREFIX = 'right_rel_';
const TARGET_ID_PREFIX = 'target_rel_';

interface Props {
  data: TableNodeData;
}

const props = defineProps<Props>();

const isPrimaryKey = (field: any) => {
  return field.description?.includes('主键') ||
         field.field_english_name === 'id' ||
         field.field_english_name.endsWith('_id') && field.description?.includes('主');
};

const isForeignKey = (field: any) => {
  return field.description?.includes('外键') ||
         (field.field_english_name.endsWith('_id') && !isPrimaryKey(field));
};

const getFieldType = (field: any) => {
  // 简化字段类型显示
  if (field.type) return field.type;
  if (field.description?.includes('varchar')) return 'VARCHAR';
  if (field.description?.includes('int')) return 'INT';
  if (field.description?.includes('text')) return 'TEXT';
  if (field.description?.includes('date')) return 'DATE';
  return 'STRING';
};

const getPrimaryKeyCount = () => {
  return props.data.table.fields?.filter(field => isPrimaryKey(field)).length || 0;
};

const getForeignKeyCount = () => {
  return props.data.table.fields?.filter(field => isForeignKey(field)).length || 0;
};

const getFieldHandlePosition = (index: number) => {
  // 计算字段Handle的垂直位置
  const headerHeight = 85; // 表头高度
  const fieldHeight = 44; // 每个字段的高度
  const descriptionHeight = 16; // 描述行高度

  let totalHeight = headerHeight;
  for (let i = 0; i < index; i++) {
    totalHeight += fieldHeight;
    if (props.data.table.fields[i].description) {
      totalHeight += descriptionHeight;
    }
  }

  return `${totalHeight + (fieldHeight / 2)}px`;
};

// 判断颜色是否为浅色
const isLightColor = (color?: string): boolean => {
  if (!color) return true;

  // 移除 # 号
  const hex = color.replace('#', '');

  // 转换为 RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};
</script>

<style scoped>
.table-node {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  min-width: 240px;
  max-width: 320px;
  position: relative;
  transition: all 0.2s ease;
}

.table-node:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.table-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
  position: relative;
}

.table-title {
  margin-bottom: 8px;
}

.table-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.table-description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.field-count {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
}

.table-fields {
  max-height: 400px;
  overflow-y: auto;
}

.field-row {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
  transition: background-color 0.15s ease;
}

.field-row:hover {
  background-color: #f9fafb;
}

.field-row:last-child {
  border-bottom: none;
}

.field-row.primary-key {
  background: linear-gradient(90deg, #fef3c7 0%, #ffffff 100%);
  border-left: 3px solid #f59e0b;
}

.field-row.foreign-key {
  background: linear-gradient(90deg, #dbeafe 0%, #ffffff 100%);
  border-left: 3px solid #3b82f6;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-name-section {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.field-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.primary-key-icon {
  color: #f59e0b;
}

.foreign-key-icon {
  color: #3b82f6;
}

.field-name {
  font-weight: 600;
  font-size: 13px;
  color: #111827;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.field-chinese {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.field-type {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.field-description {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.4;
  padding-left: 18px;
  font-style: italic;
}

.table-footer {
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  padding: 8px 16px;
}

.table-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6b7280;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  width: 10px;
  height: 10px;
}

/* Handle样式 */
.field-handle {
  width: 10px;
  height: 10px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0;
}

.table-node:hover .field-handle {
  opacity: 1;
}

.field-handle-right {
  right: -5px;
  background: #ef4444;
}

.field-handle-left {
  left: -5px;
  background: #3b82f6;
}

.field-handle-target {
  left: -5px;
  background: #10b981;
}

.field-handle:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 滚动条样式 */
.table-fields::-webkit-scrollbar {
  width: 4px;
}

.table-fields::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-fields::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.table-fields::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
