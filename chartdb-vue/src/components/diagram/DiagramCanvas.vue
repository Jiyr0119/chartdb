<template>
  <div class="diagram-canvas">
    <VueFlow ref="vueFlowRef" v-model="elements" :node-types="nodeTypes" :edge-types="edgeTypes"
      :default-viewport="{ zoom: 0.5 }" :min-zoom="0.1" :max-zoom="2" @nodes-change="onNodesChange"
      @edges-change="onEdgesChange" @connect="onConnect">
      <Background pattern="dots" :gap="20" :size="1" />

      <!-- 移动到左上角的Controls -->
      <Controls class="custom-controls" position="top-left" />

      <!-- 自定义重排布局按钮 -->
      <div class="layout-controls">
        <button @click="rearrangeLayout" class="layout-button" title="重新排列表格布局">
          <LayoutIcon class="layout-icon" />
          重排布局
        </button>
      </div>

      <MiniMap />

      <!-- 自定义箭头标记 -->
      <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
        <g>
          <path :d="`M${sourceX},${sourceY} L${targetX},${targetY}`" stroke="#b1b1b7" stroke-width="1" fill="none" />
        </g>
      </template>

      <svg>
        <defs>
          <marker id="arrow-one-to-one" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto"
            refX="0" refY="0">
            <polyline stroke="#6b7280" stroke-width="1.5" fill="none" points="-5,-4 0,0 -5,4" />
          </marker>
          <marker id="arrow-one-to-many" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto"
            refX="0" refY="0">
            <polyline stroke="#6b7280" stroke-width="1.5" fill="none" points="-5,-4 0,0 -5,4" />
            <circle cx="-7" cy="0" r="2" fill="#6b7280" />
          </marker>
          <marker id="arrow-many-to-many" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto"
            refX="0" refY="0">
            <circle cx="0" cy="0" r="3" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { nanoid } from 'nanoid';
import { LayoutGrid as LayoutIcon } from 'lucide-vue-next';
import type { Node, Edge, Connection } from '@vue-flow/core';
import type { DiagramData, TableNodeData, RelationshipEdgeData } from '@/types/diagram';
import { adjustTablePositions, adjustTablePositionsOptimized } from '@/utils/layout';
import { useCanvasStore } from '@/stores/canvas';
import TableNode from './TableNode.vue';
import RelationshipEdge from './RelationshipEdge.vue';

interface Props {
  data?: DiagramData;
}

const props = defineProps<Props>();
const canvasStore = useCanvasStore();

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const elements = ref<(Node | Edge)[]>([]);

const generateNodesAndEdges = (data: DiagramData) => {
  const nodes: Node<TableNodeData>[] = [];
  const edges: Edge<RelationshipEdgeData>[] = [];

  // 生成表节点
  const tableNames = Object.keys(data.tables);
  const TABLE_COLORS = [
    '#b067e9', // Purple
    '#ff6b8a', // Pink
    '#8eb7ff', // Blue
    '#ffe374', // Yellow
    '#9ef07a', // Green
    '#ff6363', // Red
    '#7175fa', // Indigo
    '#63c9ec', // Cyan
  ];

  // 准备布局算法需要的数据
  const tables = tableNames.map((tableName, index) => ({
    id: tableName,
    name: tableName,
    x: 0,
    y: 0,
    fields: data.tables[tableName].fields || [],
    parentAreaId: undefined,
    schema: undefined
  }));

  const relationships = data.relationships.map(rel => ({
    id: rel.id || nanoid(),
    sourceTableId: rel.source_table,
    targetTableId: rel.target_table,
    sourceFieldId: rel.source_field || '',
    targetFieldId: rel.target_field || ''
  }));

  // 使用优化的布局算法计算位置
  const repositionedTables = adjustTablePositionsOptimized({
    tables,
    relationships,
    areas: [],
    mode: 'all'
  });

  // 生成节点
  tableNames.forEach((tableName, index) => {
    const table = data.tables[tableName];
    const tableColor = table.color || TABLE_COLORS[index % TABLE_COLORS.length];
    const repositionedTable = repositionedTables.find(t => t.id === tableName);

    nodes.push({
      id: tableName,
      type: 'table',
      position: {
        x: repositionedTable?.x || 100,
        y: repositionedTable?.y || 100
      },
      data: {
        table,
        tableName,
        color: tableColor,
      },
    });
  });

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
    });
  });

  return [...nodes, ...edges];
};

// 重排布局功能
const rearrangeLayout = () => {
  if (!props.data) return;

  // 将当前数据转换为布局算法需要的格式
  const tables = Object.entries(props.data.tables).map(([tableName, table], index) => ({
    id: tableName,
    name: tableName,
    x: 0,
    y: 0,
    fields: table.fields || [],
    parentAreaId: undefined,
    schema: undefined
  }));

  const relationships = props.data.relationships.map(rel => ({
    id: rel.id || nanoid(),
    sourceTableId: rel.source_table,
    targetTableId: rel.target_table,
    sourceFieldId: rel.source_field || '',
    targetFieldId: rel.target_field || ''
  }));

  // 使用布局算法重新计算位置
  const repositionedTables = adjustTablePositions({
    tables,
    relationships,
    areas: [],
    mode: 'all'
  });

  // 更新节点位置
  const updatedElements = elements.value.map(element => {
    if (element.type === 'table') {
      const repositionedTable = repositionedTables.find(t => t.id === element.id);
      if (repositionedTable) {
        return {
          ...element,
          position: { x: repositionedTable.x, y: repositionedTable.y }
        };
      }
    }
    return element;
  });

  elements.value = updatedElements;
};

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      elements.value = generateNodesAndEdges(newData);
    }
  },
  { immediate: true }
);

const onNodesChange = (changes: any) => {
  // 处理节点变化
};

const onEdgesChange = (changes: any) => {
  // 处理边变化
};

const onConnect = (params: Connection) => {
  console.log('Connection params:', params);

  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
    return;
  }

  // 解析源字段ID
  const sourceFieldId = params.sourceHandle.split('_').pop();
  // 解析目标字段ID
  const targetFieldId = params.targetHandle.split('_').pop();

  if (!sourceFieldId || !targetFieldId) {
    console.error('无法解析字段ID');
    return;
  }

  // 创建关系
  const relationship = {
    id: nanoid(),
    source_table_id: params.source,
    target_table_id: params.target,
    source_field_id: sourceFieldId,
    target_field_id: targetFieldId,
    relationship_type: '1:N', // 默认关系类型
    description: `${sourceFieldId} -> ${targetFieldId}`
  };

  // 添加到store
  canvasStore.createRelationship(relationship);

  // 重新生成边
  if (props.data) {
    elements.value = generateNodesAndEdges(props.data);
  }
};
</script>

<style scoped>
.diagram-canvas {
  width: 100%;
  height: 100vh;
  position: relative;
}

.custom-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.layout-controls {
  position: absolute;
  top: 10px;
  left: 120px;
  z-index: 1000;
}

.layout-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.layout-button:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #111827;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.layout-button:active {
  background: #f3f4f6;
  transform: translateY(1px);
}

.layout-icon {
  width: 14px;
  height: 14px;
}
</style>
