<template>
  <!-- 表格节点容器 -->
  <div class="table-node">
    <!-- 表格头部，带动态背景色 -->
    <div class="table-header" :style="{ backgroundColor: data.color || '#f9fafb' }">
      <!-- 表格标题区域 -->
      <div class="table-title">
        <!-- 表名和图标 -->
        <h3 :style="{ color: isLightColor(data.color) ? '#1f2937' : '#ffffff' }">
          <TableIcon class="table-icon" />
          {{ data.tableName }}
        </h3>
        <!-- 表格中文名称 -->
        <p class="table-description" :style="{ color: isLightColor(data.color) ? '#6b7280' : '#e5e7eb' }">
          {{ data.table.chinese_name }}
        </p>
      </div>
      <!-- 字段数量显示 -->
      <div class="field-count" :style="{
        color: isLightColor(data.color) ? '#6b7280' : '#d1d5db',
        background: isLightColor(data.color) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
      }">
        {{ data.table.fields?.length || 0 }} 字段
      </div>
    </div>

    <!-- 表格字段列表 -->
    <div class="table-fields">
      <!-- 遍历所有字段 -->
      <div v-for="(field, index) in data.table.fields" :key="field.field_english_name" class="field-row" :class="{
        'primary-key': isPrimaryKey(field),   // 主键字段样式
        'foreign-key': isForeignKey(field)    // 外键字段样式
      }">
        <!-- 字段连接点 -->
        <!-- 右侧源连接点 -->
        <Handle :id="`${RIGHT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Right"
          class="field-handle field-handle-right" :style="{ top: getFieldHandlePosition(index) }" />
        <!-- 左侧源连接点 -->
        <Handle :id="`${LEFT_HANDLE_ID_PREFIX}${field.field_english_name}`" type="source" :position="Position.Left"
          class="field-handle field-handle-left" :style="{ top: getFieldHandlePosition(index) }" />
        <!-- 左侧目标连接点 -->
        <Handle :id="`${TARGET_ID_PREFIX}${field.field_english_name}`" type="target" :position="Position.Left"
          class="field-handle field-handle-target" :style="{ top: getFieldHandlePosition(index) }" />

        <!-- 字段内容区域 -->
        <div class="field-content">
          <!-- 字段主要信息 -->
          <div class="field-main">
            <!-- 字段名称区域 -->
            <div class="field-name-section">
              <!-- 主键图标 -->
              <KeyIcon v-if="isPrimaryKey(field)" class="field-icon primary-key-icon" />
              <!-- 外键图标 -->
              <LinkIcon v-else-if="isForeignKey(field)" class="field-icon foreign-key-icon" />
              <!-- 字段英文名 -->
              <span class="field-name">{{ field.field_english_name }}</span>
              <!-- 字段中文名 -->
              <span class="field-chinese">{{ field.field_name }}</span>
            </div>
            <!-- 字段类型 -->
            <div class="field-type">{{ getFieldType(field) }}</div>
          </div>
          <!-- 字段描述 -->
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- 表格底部统计信息 -->
    <div class="table-footer">
      <div class="table-stats">
        <!-- 主键数量 -->
        <span class="stat-item">
          <KeyIcon class="stat-icon" />
          {{ getPrimaryKeyCount() }}
        </span>
        <!-- 外键数量 -->
        <span class="stat-item">
          <LinkIcon class="stat-icon" />
          {{ getForeignKeyCount() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入Vue Flow的Handle组件和Position枚举
import { Handle, Position } from '@vue-flow/core';
// 导入Lucide图标组件
import { Table as TableIcon, Key as KeyIcon, Link as LinkIcon } from 'lucide-vue-next';
// 导入类型定义
import type { TableNodeData } from '../../types/diagram';

// Handle ID前缀定义，用于标识不同类型的连接点
const LEFT_HANDLE_ID_PREFIX = 'left_rel_';    // 左侧源连接点前缀
const RIGHT_HANDLE_ID_PREFIX = 'right_rel_';  // 右侧源连接点前缀
const TARGET_ID_PREFIX = 'target_rel_';       // 目标连接点前缀

// 组件属性接口定义
interface Props {
  data: TableNodeData;  // 表格节点数据
}

// 定义组件属性
const props = defineProps<Props>();

/**
 * 判断字段是否为主键
 * @param field 字段对象
 * @returns 如果是主键返回true，否则返回false
 */
const isPrimaryKey = (field: any) => {
  // 判断条件：
  // 1. 字段描述中包含"主键"
  // 2. 字段名为"id"
  // 3. 字段名以"_id"结尾且描述中包含"主"
  return field.description?.includes('主键') ||
    field.field_english_name === 'id' ||
    field.field_english_name.endsWith('_id') && field.description?.includes('主');
};

/**
 * 判断字段是否为外键
 * @param field 字段对象
 * @returns 如果是外键返回true，否则返回false
 */
const isForeignKey = (field: any) => {
  // 判断条件：
  // 1. 字段描述中包含"外键"
  // 2. 字段名以"_id"结尾且不是主键
  return field.description?.includes('外键') ||
    (field.field_english_name.endsWith('_id') && !isPrimaryKey(field));
};

/**
 * 获取字段类型
 * @param field 字段对象
 * @returns 字段类型字符串
 */
const getFieldType = (field: any) => {
  // 简化字段类型显示
  if (field.type) return field.type;                    // 如果有type属性，直接返回
  if (field.description?.includes('varchar')) return 'VARCHAR';  // varchar类型
  if (field.description?.includes('int')) return 'INT';          // int类型
  if (field.description?.includes('text')) return 'TEXT';        // text类型
  if (field.description?.includes('date')) return 'DATE';        // date类型
  return 'STRING';  // 默认返回STRING类型
};

/**
 * 获取主键字段数量
 * @returns 主键字段数量
 */
const getPrimaryKeyCount = () => {
  // 过滤出主键字段并返回数量
  return props.data.table.fields?.filter(field => isPrimaryKey(field)).length || 0;
};

/**
 * 获取外键字段数量
 * @returns 外键字段数量
 */
const getForeignKeyCount = () => {
  // 过滤出外键字段并返回数量
  return props.data.table.fields?.filter(field => isForeignKey(field)).length || 0;
};

/**
 * 计算字段Handle的垂直位置
 * @param index 字段索引
 * @returns Handle的top位置样式字符串
 */
const getFieldHandlePosition = (index: number) => {
  // 计算字段Handle的垂直位置
  const headerHeight = 85;      // 表头高度
  const fieldHeight = 44;       // 每个字段的高度
  const descriptionHeight = 16; // 描述行高度

  // 计算到当前字段的累计高度
  let totalHeight = headerHeight;
  for (let i = 0; i < index; i++) {
    totalHeight += fieldHeight;
    // 如果字段有描述，加上描述高度
    if (props.data.table.fields[i].description) {
      totalHeight += descriptionHeight;
    }
  }

  // 返回居中位置
  return `${totalHeight + (fieldHeight / 2)}px`;
};

/**
 * 判断颜色是否为浅色
 * 通过计算颜色亮度来判断是否为浅色
 * @param color 颜色值（十六进制）
 * @returns 如果是浅色返回true，否则返回false
 */
const isLightColor = (color?: string): boolean => {
  // 如果没有颜色值，返回true（默认浅色）
  if (!color) return true;

  // 移除 # 号
  const hex = color.replace('#', '');

  // 转换为 RGB 值
  const r = parseInt(hex.substr(0, 2), 16);  // 红色分量
  const g = parseInt(hex.substr(2, 2), 16);  // 绿色分量
  const b = parseInt(hex.substr(4, 2), 16);  // 蓝色分量

  // 计算亮度值（使用ITU-R BT.601标准）
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 如果亮度大于128，认为是浅色
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
  width: 450px;
  /* 固定宽度避免横向滚动 */
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
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  padding: 2px 6px;
  display: inline-block;
  text-align: center;
  min-width: 56px;
  letter-spacing: -0.1px;
}

.table-fields {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  /* 防止横向滚动 */
  word-wrap: break-word;
  /* 长文本换行 */
}

.field-row {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
  transition: background-color 0.15s ease;
  overflow: hidden;
  /* 防止内容溢出 */
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

.field-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 20px;
}

.field-name-section {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
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

/* 字段英文名 - 核心字段，加粗清晰 */
.field-name {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
  /* 深蓝灰，比 #111827 更现代 */
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  white-space: normal;
  word-break: break-word;
  flex: 1;
  min-width: 100px;
}

/* 字段中文名 - 说明性文字，语义清晰 */
.field-chinese {
  font-size: 12px;
  color: #475569;
  /* 中灰蓝，比原色更清晰 */
  font-weight: 400;
  white-space: normal;
  word-break: break-word;
  flex: 1;
  min-width: 100px;
}

/* 字段类型 - 技术属性，用语义色 */
.field-type {
  font-size: 11px;
  font-weight: 500;
  background: #f0fdfa;
  /* 轻绿色背景 */
  color: #059669;
  /* 深绿色文字 */
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  white-space: normal;
  word-break: break-word;
  max-width: 100px;
  text-align: center;
  border: 1px solid #d1fae5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 字段描述 - 辅助信息，柔和显示 */
.field-description {
  font-size: 11px;
  color: #64748b;
  /* 蓝灰色，比浅灰更清晰但不抢眼 */
  line-height: 1.5;
  padding-left: 18px;
  font-style: italic;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100%;
  opacity: 0.9;
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

/* 改进的滚动条样式 */
.table-fields::-webkit-scrollbar {
  width: 20px;
  /* 增加滚动条宽度 */
}

.table-fields::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.table-fields::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
  /* 添加边框增加可见性 */
}

.table-fields::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.table-fields::-webkit-scrollbar-thumb:active {
  background: #64748b;
}

/* 为Firefox添加滚动条样式 */
.table-fields {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}
</style>
