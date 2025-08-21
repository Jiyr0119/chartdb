<template>
  <BaseEdge :id="id" :path="edgePath" :marker-end="markerEnd" />
  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        fontSize: 12,
        pointerEvents: 'all',
      }"
      class="nodrag nopan bg-white px-2 py-1 rounded border text-xs"
    >
      {{ data.relationship.relationship_type }}
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import type { RelationshipEdgeData } from '../../types/diagram'

interface Props {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: string
  targetPosition: string
  data: RelationshipEdgeData
}

const props = defineProps<Props>()

const edgePath = computed(() => {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition as any,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition as any,
  })
  return path
})

const labelX = computed(() => (props.sourceX + props.targetX) / 2)
const labelY = computed(() => (props.sourceY + props.targetY) / 2)

const markerEnd = computed(() => {
  const type = props.data.relationship.relationship_type
  if (type === '1:N') return 'url(#arrow-one-to-many)'
  if (type === 'N:M') return 'url(#arrow-many-to-many)'
  return 'url(#arrow-one-to-many)'
})
</script>
