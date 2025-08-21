<template>
  <div class="table-node" :style="{ width: nodeWidth + 'px' }">
    <NodeResizer
      v-if="selected"
      :min-width="200"
      :min-height="100"
      @resize="handleResize"
    />

    <div class="table-header">
      <div class="table-title">
        <h3>{{ data.tableName }}</h3>
        <p class="table-description">{{ data.table.chinese_name }}</p>
      </div>
    </div>

    <div class="table-fields">
      <div
        v-for="field in data.table.fields"
        :key="field.field_english_name"
        class="field-row"
        :class="{ 'primary-key': isPrimaryKey(field.field_english_name) }"
      >
        <div class="field-info">
          <span class="field-name">{{ field.field_english_name }}</span>
          <span class="field-chinese-name">{{ field.field_name }}</span>
        </div>
        <div class="field-description">{{ field.description }}</div>
      </div>
    </div>

    <Handle
      v-for="field in data.table.fields"
      :key="`source-${field.field_english_name}`"
      :id="`source-${field.field_english_name}`"
      type="source"
      :position="Position.Right"
      :style="{ top: getFieldHandlePosition(field.field_english_name, 'source') }"
    />

    <Handle
      v-for="field in data.table.fields"
      :key="`target-${field.field_english_name}`"
      :id="`target-${field.field_english_name}`"
      type="target"
      :position="Position.Left"
      :style="{ top: getFieldHandlePosition(field.field_english_name, 'target') }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'
import type { NodeProps } from '@vue-flow/core'
import type { TableNodeData } from '@/types/diagram'

interface Props extends NodeProps {
  data: TableNodeData
  selected?: boolean
}

const props = defineProps<Props>()
const nodeWidth = ref(280)

const isPrimaryKey = (fieldName: string) => {
  return props.data.table.primarykey.includes(fieldName)
}

const getFieldHandlePosition = (fieldName: string, type: 'source' | 'target') => {
  const fieldIndex = props.data.table.fields.findIndex(
    field => field.field_english_name === fieldName
  )
  const headerHeight = 60
  const fieldHeight = 40
  const position = headerHeight + (fieldIndex * fieldHeight) + (fieldHeight / 2)
  return `${position}px`
}

const handleResize = (event: any) => {
  nodeWidth.value = event.width
}
</script>

<style scoped>
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
