<template>
  <div class="diagram-canvas">
    <VueFlow
      ref="vueFlowRef"
      v-model="elements"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :default-viewport="{ zoom: 0.3, x: 0, y: 0 }"
      :min-zoom="0.1"
      :max-zoom="2"
      :fit-view-on-init="true"
      :nodes-draggable="true"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :zoom-on-double-click="false"
      @nodes-change="onNodesChange"
      @edges-change="onEdgesChange"
      @connect="onConnect">
      <Background pattern="dots" :gap="20" :size="1" />

      <!-- 移动到左上角的Controls -->
      <Controls class="custom-controls" position="top-left" />

      <!-- 布局控制面板 -->
      <div class="layout-controls">
        <!-- 布局方向选择器 -->
        <div class="layout-direction-selector">
          <button
            @click="layoutDirection = 'horizontal'"
            :class="['direction-button', { active: layoutDirection === 'horizontal' }]"
            title="横向布局">
            <ArrowRightIcon class="direction-icon" />
            横向
          </button>
          <button
            @click="layoutDirection = 'vertical'"
            :class="['direction-button', { active: layoutDirection === 'vertical' }]"
            title="纵向布局">
            <ArrowDownIcon class="direction-icon" />
            纵向
          </button>
        </div>

        <!-- 重排布局按钮 -->
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
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { nanoid } from 'nanoid';
import { LayoutGrid as LayoutIcon, ArrowRight as ArrowRightIcon, ArrowDown as ArrowDownIcon } from 'lucide-vue-next';
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

// 布局方向状态
const layoutDirection = ref<'horizontal' | 'vertical'>('horizontal');

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const elements = ref<(Node | Edge)[]>([]);

// 添加VueFlow实例引用
const vueFlowRef = ref<InstanceType<typeof VueFlow>>();

// 缩放和居中配置常量 - 方便调试修改
const ZOOM_CONFIG = {
  defaultZoom: 0.3,        // 默认缩放比例 - 可调整此值
  minZoom: 0.1,           // 最小缩放比例
  maxZoom: 2,             // 最大缩放比例
  fitViewPadding: 50,     // 适应视图时的边距 - 可调整此值
  animationDuration: 300   // 动画持续时间
};

// 自动适应视图函数
const fitViewToContent = async () => {
  if (!vueFlowRef.value) return;

  await nextTick();

  // 使用VueFlow的fitView方法
  vueFlowRef.value.fitView({
    padding: ZOOM_CONFIG.fitViewPadding,
    minZoom: ZOOM_CONFIG.minZoom,
    maxZoom: ZOOM_CONFIG.defaultZoom, // 限制最大缩放为默认值
    duration: ZOOM_CONFIG.animationDuration
  });
};

// 修改generateNodesAndEdges函数
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

  // 使用优化的布局算法计算位置，传入布局方向
  const repositionedTables = adjustTablePositionsOptimized({
    tables,
    relationships,
    areas: [],
    mode: 'all',
    direction: layoutDirection.value // 传入当前选择的布局方向
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
const rearrangeLayout = async () => {
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

  // 使用布局算法重新计算位置，传入布局方向
  const repositionedTables = adjustTablePositionsOptimized({
    tables,
    relationships,
    areas: [],
    mode: 'all',
    direction: layoutDirection.value // 传入当前选择的布局方向
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

  // 重排布局后自动适应视图
  await nextTick();
  fitViewToContent();
};

// 监听布局方向变化，自动重新布局和适应视图
watch(layoutDirection, async () => {
  if (props.data) {
    await nextTick();
    rearrangeLayout();
  }
});

// 组件挂载后初始化
onMounted(() => {
  if (props.data) {
    nextTick(() => {
      fitViewToContent();
    });
  }
});

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

// 监听布局方向变化，自动重新布局
watch(layoutDirection, () => {
  if (props.data) {
    nextTick(() => {
      rearrangeLayout();
    });
  }
});
</script>

<style scoped>
.diagram-canvas {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden; /* 防止横向滚动条 */
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
  display: flex;
  gap: 8px;
  align-items: center;
}

.layout-direction-selector {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.direction-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: white;
  border: none;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid #e5e7eb;
}

.direction-button:last-child {
  border-right: none;
}

.direction-button:hover {
  background: #f9fafb;
  color: #374151;
}

.direction-button.active {
  background: #3b82f6;
  color: white;
}

.direction-button.active:hover {
  background: #2563eb;
}

.direction-icon {
  width: 12px;
  height: 12px;
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
