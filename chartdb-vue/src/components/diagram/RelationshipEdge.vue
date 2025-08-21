<template>
  <!-- 基础边线组件，渲染连接线 -->
  <BaseEdge :id="id" :path="edgePath" :marker-end="markerEnd" />
  
  <!-- 边标签渲染器，用于显示关系类型标签 -->
  <EdgeLabelRenderer>
    <!-- 关系类型标签 -->
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        fontSize: 12,
        pointerEvents: 'all',
      }"
      class="nodrag nopan bg-white px-2 py-1 rounded border text-xs"
    >
      <!-- 显示关系类型 -->
      {{ data.relationship.relationship_type }}
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
// 导入Vue的computed函数
import { computed } from 'vue'
// 导入Vue Flow的核心组件和函数
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
// 导入关系边数据类型定义
import type { RelationshipEdgeData } from '../../types/diagram'

// 组件属性接口定义
interface Props {
  id: string;               // 边的唯一标识
  sourceX: number;          // 源点X坐标
  sourceY: number;          // 源点Y坐标
  targetX: number;          // 目标点X坐标
  targetY: number;          // 目标点Y坐标
  sourcePosition: string;   // 源点位置
  targetPosition: string;   // 目标点位置
  data: RelationshipEdgeData; // 边的数据
}

// 定义组件属性
const props = defineProps<Props>()

/**
 * 计算边的路径
 * 使用贝塞尔曲线算法计算连接线路径
 */
const edgePath = computed(() => {
  // 调用getBezierPath函数计算贝塞尔路径
  const [path] = getBezierPath({
    sourceX: props.sourceX,        // 源点X坐标
    sourceY: props.sourceY,        // 源点Y坐标
    sourcePosition: props.sourcePosition as any,  // 源点位置
    targetX: props.targetX,        // 目标点X坐标
    targetY: props.targetY,        // 目标点Y坐标
    targetPosition: props.targetPosition as any,  // 目标点位置
  })
  return path  // 返回计算出的路径
})

/**
 * 计算标签的X坐标
 * 标签位置在源点和目标点的中点
 */
const labelX = computed(() => (props.sourceX + props.targetX) / 2)

/**
 * 计算标签的Y坐标
 * 标签位置在源点和目标点的中点
 */
const labelY = computed(() => (props.sourceY + props.targetY) / 2)

/**
 * 计算箭头标记的URL
 * 根据关系类型返回相应的箭头标记
 */
const markerEnd = computed(() => {
  // 获取关系类型
  const type = props.data.relationship.relationship_type
  
  // 根据关系类型返回对应的箭头标记
  if (type === '1:N') return 'url(#arrow-one-to-many)'   // 一对多关系
  if (type === 'N:M') return 'url(#arrow-many-to-many)'  // 多对多关系
  return 'url(#arrow-one-to-many)'  // 默认返回一对多箭头
})
</script>
