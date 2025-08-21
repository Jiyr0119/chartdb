<template>
  <BaseEdge
    :id="id"
    :style="edgeStyle"
    :path="edgePath"
    :marker-end="markerEnd"
  />
  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
        fontSize: '10px',
        fontWeight: 500,
        background: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        pointerEvents: 'all',
      }"
      class="edge-label"
    >
      {{ data.relationship.relationship_type }}
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'
import type { RelationshipEdgeData } from '@/types/diagram'

interface Props extends EdgeProps {
  data: RelationshipEdgeData
}

const props = defineProps<Props>()

const edgeStyle = computed(() => ({
  stroke: '#6b7280',
  strokeWidth: 2,
}))

const [edgePath, labelX, labelY] = getBezierPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  sourcePosition: props.sourcePosition,
  targetX: props.targetX,
  targetY: props.targetY,
  targetPosition: props.targetPosition,
})

const markerEnd = computed(() => {
  const type = props.data.relationship.relationship_type
  if (type.includes('1:N') || type.includes('1:M')) {
    return 'url(#arrow-one-to-many)'
  } else if (type.includes('N:M') || type.includes('M:N')) {
    return 'url(#arrow-many-to-many)'
  } else {
    return 'url(#arrow-one-to-one)'
  }
})
</script>

<style scoped>
.edge-label {
  font-family: inherit;
}
</style>
