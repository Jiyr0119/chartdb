<template>
  <div class="diagram-canvas">
    <VueFlow
      v-model="elements"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-viewport="{ zoom: 0.8 }"
      :min-zoom="0.1"
      :max-zoom="2"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
    >
      <Background pattern="dots" :gap="20" :size="1" />
      <Controls />
      <MiniMap />

      <!-- 自定义箭头标记 -->
      <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
        <g>
          <path
            :d="`M${sourceX},${sourceY} L${targetX},${targetY}`"
            stroke="#b1b1b7"
            stroke-width="1"
            fill="none"
          />
        </g>
      </template>

      <svg>
        <defs>
          <marker
            id="arrow-one-to-one"
            markerWidth="12.5"
            markerHeight="12.5"
            viewBox="-10 -10 20 20"
            orient="auto"
            refX="0"
            refY="0"
          >
            <polyline
              stroke="#6b7280"
              stroke-width="1.5"
              fill="none"
              points="-5,-4 0,0 -5,4"
            />
          </marker>
          <marker
            id="arrow-one-to-many"
            markerWidth="12.5"
            markerHeight="12.5"
            viewBox="-10 -10 20 20"
            orient="auto"
            refX="0"
            refY="0"
          >
            <polyline
              stroke="#6b7280"
              stroke-width="1.5"
              fill="none"
              points="-5,-4 0,0 -5,4"
            />
            <circle cx="-7" cy="0" r="2" fill="#6b7280" />
          </marker>
          <marker
            id="arrow-many-to-many"
            markerWidth="12.5"
            markerHeight="12.5"
            viewBox="-10 -10 20 20"
            orient="auto"
            refX="0"
            refY="0"
          >
            <circle cx="0" cy="0" r="3" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { nanoid } from 'nanoid'
import type { Node, Edge } from '@vue-flow/core'
import type { DiagramData, TableNodeData, RelationshipEdgeData } from '@/types/diagram'
import TableNode from './TableNode.vue'
import RelationshipEdge from './RelationshipEdge.vue'

interface Props {
  data?: DiagramData
}

const props = defineProps<Props>()

const nodeTypes = {
  table: TableNode,
}

const edgeTypes = {
  relationship: RelationshipEdge,
}

const elements = ref<(Node | Edge)[]>([])

const generateNodesAndEdges = (data: DiagramData) => {
  const nodes: Node<TableNodeData>[] = []
  const edges: Edge<RelationshipEdgeData>[] = []

  // 生成表节点
  let x = 100
  let y = 100
  const tableNames = Object.keys(data.tables)

  tableNames.forEach((tableName, index) => {
    const table = data.tables[tableName]

    nodes.push({
      id: tableName,
      type: 'table',
      position: { x: x + (index % 3) * 320, y: y + Math.floor(index / 3) * 250 },
      data: {
        table,
        tableName,
      },
    })
  })

  // 生成关系边
  data.relationships.forEach((relationship) => {
    edges.push({
      id: nanoid(),
      type: 'relationship',
      source: relationship.source_table,
      target: relationship.target_table,
      data: {
        relationship,
      },
    })
  })

  return [...nodes, ...edges]
}

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      elements.value = generateNodesAndEdges(newData)
    }
  },
  { immediate: true }
)

const onNodesChange = (changes: any) => {
  // 处理节点变化
}

const onEdgesChange = (changes: any) => {
  // 处理边变化
}
</script>

<style scoped>
.diagram-canvas {
  width: 100%;
  height: 100vh;
}
</style>
