<template>
  <!-- 图表画布容器 -->
  <div class="diagram-canvas">
    <!-- Vue Flow 图表组件 -->
    <VueFlow
      ref="vueFlowRef"
      :nodes="nodes"
      :edges="computedEdges"
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
      @connect="onConnect"
      @edge-click="handleEdgeClick"
      @edge-double-click="handleEdgeDoubleClick"
      @pane-click="handlePaneClick">

      <!-- Vue Flow 背景网格 - 显示点状背景 -->
      <Background pattern="dots" :gap="20" :size="1" />
      
      <!-- Vue Flow 控制面板 - 提供缩放、适应视图等功能 -->
      <Controls class="custom-controls" position="top-left" />

      <!-- 自定义布局控制面板 - 提供布局方向切换和重排功能 -->
      <div class="layout-controls">
        <!-- 布局方向选择器 - 支持横向/纵向布局切换 -->
        <div class="layout-direction-selector">
          <!-- 横向布局按钮 -->
          <button
            @click="layoutDirection = 'horizontal'"
            :class="['direction-button', { active: layoutDirection === 'horizontal' }]"
            title="横向布局">
            <ArrowRightIcon class="direction-icon" />
            横向
          </button>
          <!-- 纵向布局按钮 -->
          <button
            @click="layoutDirection = 'vertical'"
            :class="['direction-button', { active: layoutDirection === 'vertical' }]"
            title="纵向布局">
            <ArrowDownIcon class="direction-icon" />
            纵向
          </button>
        </div>

        <!-- 重排布局按钮 - 重新计算表格位置 -->
        <button @click="rearrangeLayout" class="layout-button" title="重新排列表格布局">
          <LayoutIcon class="layout-icon" />
          重排布局
        </button>

        <!-- 边类型选择器 - 支持多种连接线样式 -->
        <div class="edge-type-selector">
          <label>连接线类型:</label>
          <!-- 边类型下拉选择器 -->
          <select v-model="currentEdgeType" @change="updateEdgeTypes">
            <option value="default">默认 (Bezier曲线)</option>
            <option value="straight">直线</option>
            <option value="step">转角</option>
            <option value="smoothstep">圆角转角</option>
          </select>
        </div>
      </div>

      <!-- Vue Flow 小地图 - 显示整体布局缩略图 -->
      <MiniMap />

      <!-- 自定义连接线模板 - 拖拽连接时的临时线条样式 -->
      <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
        <g>
          <!-- 连接线路径 -->
          <path :d="`M${sourceX},${sourceY} L${targetX},${targetY}`" stroke="#b1b1b7" stroke-width="1" fill="none" />
        </g>
      </template>

      <!-- SVG 箭头标记定义 - 用于连接线末端的箭头样式 -->
      <svg>
        <defs>
          <!-- 一对一关系箭头 -->
          <marker id="arrow-one-to-one" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto"
            refX="0" refY="0">
            <polyline stroke="#6b7280" stroke-width="1.5" fill="none" points="-5,-4 0,0 -5,4" />
          </marker>
          <!-- 一对多关系箭头 -->
          <marker id="arrow-one-to-many" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto"
            refX="0" refY="0">
            <polyline stroke="#6b7280" stroke-width="1.5" fill="none" points="-5,-4 0,0 -5,4" />
            <circle cx="-7" cy="0" r="2" fill="#6b7280" />
          </marker>
        </defs>
      </svg>
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { nanoid } from 'nanoid'
import { LayoutGrid as LayoutIcon, ArrowRight as ArrowRightIcon, ArrowDown as ArrowDownIcon } from 'lucide-vue-next'
import type { Node, Edge, Connection } from '@vue-flow/core'
import type { DiagramData, TableNodeData, RelationshipEdgeData } from '@/types/diagram'
import { adjustTablePositions, adjustTablePositionsOptimized } from '@/utils/layout'
import { useCanvasStore } from '@/stores/canvas'
import TableNode from './TableNode.vue'
import RelationshipEdge from './RelationshipEdge.vue'

// 组件属性接口定义
interface Props {
  data?: DiagramData  // 图表数据，包含表格和关系信息
}

const props = defineProps<Props>()
const canvasStore = useCanvasStore()

// ==================== 响应式状态管理 ====================

// 布局方向状态 - 控制表格的排列方向
const layoutDirection = ref<'horizontal' | 'vertical'>('horizontal')

// 节点和边的响应式数据
const nodes = ref<Node<TableNodeData>[]>([])  // 表格节点数组
const edges = ref<Edge<RelationshipEdgeData>[]>([])  // 关系边数组

// 边的交互状态管理
const clickedEdgeId = ref<string | null>(null)    // 当前被点击的边ID
const selectedEdgeId = ref<string | null>(null)   // 当前被选中的边ID

// ==================== Vue Flow 配置 ====================

/**
 * Vue Flow 支持的边类型配置
 *
 * 可用的边类型选项：
 * - 'default': 默认贝塞尔曲线，平滑的S形曲线连接，适合大多数场景
 * - 'straight': 直线连接，最短路径，简洁明了
 * - 'step': 转角连接，直角转弯，类似流程图
 * - 'smoothstep': 圆角转角连接，带圆角的转弯，兼具清晰和美观
 *
 * 每种类型的特点和适用场景：
 * - default: 视觉效果好，适合复杂关系图
 * - straight: 适合简单关系，节省空间
 * - step: 适合层次结构，逻辑清晰
 * - smoothstep: 平衡美观和清晰度
 */
const currentEdgeType = ref<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep')

// Vue Flow 组件类型注册
const nodeTypes = {
  table: TableNode,        // 表格节点组件
}

const edgeTypes = {
  relationship: RelationshipEdge,  // 关系边组件
}

// Vue Flow 实例引用
const vueFlowRef = ref<InstanceType<typeof VueFlow>>()

// ==================== 缩放和视图配置 ====================

/**
 * 缩放和居中配置常量
 * 定义画布的缩放行为和视图适应参数
 */
const ZOOM_CONFIG = {
  defaultZoom: 0.3,      // 默认缩放比例
  minZoom: 0.1,          // 最小缩放比例
  maxZoom: 2,            // 最大缩放比例
  fitViewPadding: 50,    // 适应视图时的边距
}

// ==================== 层级控制配置 ====================

/**
 * 层级控制常量定义
 * 控制不同元素在画布上的显示层级
 * 
 * 层级规则说明：
 * 1. 默认状态：表格(节点)显示在连接线(边)上层
 * 2. 点击连接线：被点击的连接线提升到最高层级
 * 3. 选中连接线：被选中的连接线保持高层级
 * 4. 数值越大，显示层级越高
 */
const Z_INDEX_CONFIG = {
  // 默认层级 - 表格在连接线上方
  defaultEdge: 1,           // 默认连接线层级
  defaultNode: 100,         // 默认表格节点层级
  
  // 交互状态层级 - 点击时连接线提升到表格上方
  clickedEdge: 200,         // 被点击的连接线层级
  selectedEdge: 300,        // 被选中的连接线层级
}

// ==================== 计算属性 ====================

/**
 * 计算边的属性 - 根据交互状态动态设置边的样式和行为
 *
 * 边的可配置属性详细说明：
 * 
 * 1. type: 边的类型
 *    - 'default': 贝塞尔曲线
 *    - 'straight': 直线
 *    - 'step': 直角转弯
 *    - 'smoothstep': 圆角转弯
 * 
 * 2. animated: 动画效果控制
 *    - true: 显示流动动画效果
 *    - false: 静态显示
 * 
 * 3. selected: 选中状态
 *    - true: 边处于选中状态
 *    - false: 边处于普通状态
 * 
 * 4. zIndex: 层级控制
 *    - 数值越大，显示层级越高
 *    - 用于控制边与节点的显示优先级
 * 
 * 5. style: CSS样式对象
 *    - stroke: 线条颜色
 *    - strokeWidth: 线条宽度
 *    - strokeDasharray: 虚线样式
 *    - opacity: 透明度
 *    - transition: 过渡动画
 * 
 * 6. className: CSS类名
 *    - 用于自定义样式和动画效果
 *
 * 层级控制逻辑：
 * - 默认：表格在连接线上层 (节点zIndex=100, 边zIndex=1)
 * - 点击连接线：被点击的连接线提升到表格上层 (zIndex=200)
 * - 选中连接线：被选中的连接线保持最高层级 (zIndex=300)
 */
const computedEdges = computed(() => {
  return edges.value.map(edge => {
    // 判断当前边的交互状态
    const isClicked = clickedEdgeId.value === edge.id
    const isSelected = selectedEdgeId.value === edge.id

    return {
      ...edge,
      
      // 设置边的类型 - 根据用户选择的类型
      type: currentEdgeType.value,

      // 动画效果配置
      // 点击或选中时启用动画，提供视觉反馈
      animated: isClicked || isSelected,

      // 选中状态配置
      // 用于 Vue Flow 内部状态管理
      selected: isSelected,

      // 层级控制配置 - 关键优化点
      // 默认：连接线在表格下方 (zIndex=1)
      // 点击：连接线提升到表格上方 (zIndex=200)
      // 选中：连接线保持最高层级 (zIndex=300)
      zIndex: isSelected 
        ? Z_INDEX_CONFIG.selectedEdge 
        : (isClicked ? Z_INDEX_CONFIG.clickedEdge : Z_INDEX_CONFIG.defaultEdge),

      // 样式配置
      style: {
        // 基础颜色配置
        // 选中：蓝色，点击：绿色，默认：灰色
        stroke: isSelected ? '#3b82f6' : (isClicked ? '#10b981' : '#6b7280'),
        
        // 线条宽度配置
        // 选中：3px，点击：2.5px，默认：2px
        strokeWidth: isSelected ? 3 : (isClicked ? 2.5 : 2),

        // 虚线效果 - 点击时显示虚线动画
        // '5,5' 表示5px实线，5px空白的重复模式
        strokeDasharray: isClicked ? '5,5' : undefined,

        // 过渡动画 - 平滑的状态切换
        // 0.3秒的缓动过渡，提升用户体验
        transition: 'all 0.3s ease-in-out',

        // 透明度控制
        // 选中：完全不透明，点击：轻微透明，默认：较透明
        opacity: isSelected ? 1 : (isClicked ? 0.9 : 0.8),
      },

      // CSS类名配置
      // 用于额外的样式控制和动画效果
      className: [
        isSelected && 'edge-selected',
        isClicked && 'edge-clicked',
      ].filter(Boolean).join(' '),
    }
  })
})

// ==================== 事件处理函数 ====================

/**
 * 边点击事件处理
 * 实现点击连接线的动画效果优化
 *
 * 功能说明：
 * 1. 单击边时触发动画效果和层级提升
 * 2. 设置点击状态，连接线会显示在表格上层
 * 3. 2秒后自动清除点击状态，恢复默认层级
 * 4. 提供视觉反馈，增强用户交互体验
 * 
 * 层级变化：
 * - 点击前：连接线 zIndex=1，表格 zIndex=100
 * - 点击后：连接线 zIndex=200，表格 zIndex=100
 * - 2秒后：连接线 zIndex=1，表格 zIndex=100
 */
const handleEdgeClick = (event: any) => {
  console.log('边被点击:', event.edge.id)

  // 设置点击状态 - 连接线将提升到表格上层
  clickedEdgeId.value = event.edge.id

  // 2秒后清除点击状态，连接线恢复到表格下层
  setTimeout(() => {
    if (clickedEdgeId.value === event.edge.id) {
      clickedEdgeId.value = null
    }
  }, 2000)
}

/**
 * 边双击事件处理
 * 实现边的选中状态切换
 *
 * 功能说明：
 * 1. 双击边时切换选中状态
 * 2. 选中的边会保持高亮显示和最高层级
 * 3. 可用于后续的编辑或删除操作
 * 4. 支持取消选中（再次双击同一边）
 * 
 * 层级变化：
 * - 选中：连接线 zIndex=300，表格 zIndex=100
 * - 取消选中：连接线 zIndex=1，表格 zIndex=100
 */
const handleEdgeDoubleClick = (event: any) => {
  console.log('边被双击:', event.edge.id)

  // 切换选中状态
  if (selectedEdgeId.value === event.edge.id) {
    // 取消选中 - 连接线恢复到表格下层
    selectedEdgeId.value = null
  } else {
    // 选中边 - 连接线提升到最高层级
    selectedEdgeId.value = event.edge.id
  }
}

/**
 * 画布点击事件处理
 * 清除所有边的选中和点击状态
 * 
 * 功能说明：
 * 1. 点击空白画布区域时触发
 * 2. 清除所有连接线的交互状态
 * 3. 所有连接线恢复到默认层级（表格下方）
 */
const handlePaneClick = () => {
  selectedEdgeId.value = null
  clickedEdgeId.value = null
}

/**
 * 更新边类型
 * 当用户选择不同的边类型时，更新所有边的显示效果
 * 
 * 功能说明：
 * 1. 响应用户在下拉菜单中的选择
 * 2. 实时更新所有连接线的样式
 * 3. computedEdges 会自动响应 currentEdgeType 的变化
 */
const updateEdgeTypes = () => {
  console.log('边类型已更新为:', currentEdgeType.value)
  // computedEdges 会自动响应 currentEdgeType 的变化
}

// ==================== 视图控制函数 ====================

/**
 * 自动适应视图函数
 * 调整画布视图以适应所有内容
 * 
 * 功能说明：
 * 1. 自动计算合适的缩放比例和位置
 * 2. 确保所有表格都在可视区域内
 * 3. 应用配置的边距和缩放限制
 */
const fitViewToContent = async () => {
  if (!vueFlowRef.value) return

  await nextTick()

  vueFlowRef.value.fitView({
    padding: ZOOM_CONFIG.fitViewPadding,
    minZoom: ZOOM_CONFIG.minZoom,
    maxZoom: ZOOM_CONFIG.defaultZoom,
  })
}

// ==================== 数据生成函数 ====================

/**
 * 生成节点和边的函数
 * 根据图表数据创建 Vue Flow 所需的节点和边
 * 
 * 参数说明：
 * @param data - 图表数据，包含表格和关系信息
 * 
 * 处理流程：
 * 1. 解析表格数据，创建表格节点
 * 2. 应用颜色主题和布局算法
 * 3. 解析关系数据，创建连接边
 * 4. 设置默认的层级和样式
 */
const generateNodesAndEdges = (data: DiagramData) => {
  const newNodes: Node<TableNodeData>[] = []
  const newEdges: Edge<RelationshipEdgeData>[] = []

  // 表格颜色主题配置
  const TABLE_COLORS = [
    '#b067e9', '#ff6b8a', '#8eb7ff', '#ffe374',
    '#9ef07a', '#ff6363', '#7175fa', '#63c9ec',
  ]

  // 生成表节点数据
  const tableNames = Object.keys(data.tables)
  const tables = tableNames.map((tableName, index) => ({
    id: tableName,
    name: tableName,
    x: 0,
    y: 0,
    fields: data.tables[tableName].fields || [],
    parentAreaId: undefined,
    schema: undefined
  }))

  // 生成关系数据
  const relationships = data.relationships.map(rel => ({
    id: rel.id || nanoid(),
    sourceTableId: rel.source_table,
    targetTableId: rel.target_table,
    sourceFieldId: rel.source_field || '',
    targetFieldId: rel.target_field || ''
  }))

  // 应用布局算法 - 自动计算表格位置
  const repositionedTables = adjustTablePositionsOptimized({
    tables,
    relationships,
    areas: [],
    mode: 'all',
    direction: layoutDirection.value
  })

  // 创建表格节点
  tableNames.forEach((tableName, index) => {
    const table = data.tables[tableName]
    const tableColor = table.color || TABLE_COLORS[index % TABLE_COLORS.length]
    const repositionedTable = repositionedTables.find(t => t.id === tableName)

    newNodes.push({
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
      // 设置表格节点的默认层级 - 在连接线上方
      zIndex: Z_INDEX_CONFIG.defaultNode,
    })
  })

  // 创建关系边
  data.relationships.forEach((relationship) => {
    newEdges.push({
      id: relationship.id || nanoid(),
      type: 'relationship',
      source: relationship.source_table,
      target: relationship.target_table,
      data: {
        relationship,
      },
      // 设置边的默认配置 - 在表格下方
      animated: false,
      zIndex: Z_INDEX_CONFIG.defaultEdge,
    })
  })

  // 更新响应式数据
  nodes.value = newNodes
  edges.value = newEdges
}

// ==================== 布局控制函数 ====================

/**
 * 重排布局功能
 * 重新计算并应用表格的位置布局
 * 
 * 功能说明：
 * 1. 保持现有的表格和关系数据
 * 2. 重新运行布局算法
 * 3. 更新表格位置
 * 4. 自动适应视图
 */
const rearrangeLayout = async () => {
  if (!props.data) return

  // 准备表格数据
  const tables = Object.entries(props.data.tables).map(([tableName, table]) => ({
    id: tableName,
    name: tableName,
    x: 0,
    y: 0,
    fields: table.fields || [],
    parentAreaId: undefined,
    schema: undefined
  }))

  // 准备关系数据
  const relationships = props.data.relationships.map(rel => ({
    id: rel.id || nanoid(),
    sourceTableId: rel.source_table,
    targetTableId: rel.target_table,
    sourceFieldId: rel.source_field || '',
    targetFieldId: rel.target_field || ''
  }))

  // 重新计算布局
  const repositionedTables = adjustTablePositionsOptimized({
    tables,
    relationships,
    areas: [],
    mode: 'all',
    direction: layoutDirection.value
  })

  // 更新节点位置
  nodes.value = nodes.value.map(node => {
    const repositionedTable = repositionedTables.find(t => t.id === node.id)
    if (repositionedTable) {
      return {
        ...node,
        position: { x: repositionedTable.x, y: repositionedTable.y }
      }
    }
    return node
  })

  // 适应视图
  await nextTick()
  fitViewToContent()
}

// ==================== Vue Flow 事件处理 ====================

/**
 * 节点变化事件处理
 * 响应节点的拖拽、删除等操作
 */
const onNodesChange = (changes: any) => {
  // 处理节点变化
  console.log('节点变化:', changes)
}

/**
 * 边变化事件处理
 * 响应边的删除等操作
 */
const onEdgesChange = (changes: any) => {
  // 处理边变化
  console.log('边变化:', changes)
}

/**
 * 连接事件处理
 * 处理用户手动创建的新连接
 * 
 * 功能说明：
 * 1. 解析连接的源和目标信息
 * 2. 提取字段ID信息
 * 3. 创建新的关系记录
 * 4. 更新画布数据
 */
const onConnect = (params: Connection) => {
  console.log('Connection params:', params)

  // 验证连接参数
  if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) {
    return
  }

  // 解析字段ID
  const sourceFieldId = params.sourceHandle.split('_').pop()
  const targetFieldId = params.targetHandle.split('_').pop()

  if (!sourceFieldId || !targetFieldId) {
    console.error('无法解析字段ID')
    return
  }

  // 创建关系对象
  const relationship = {
    id: nanoid(),
    source_table_id: params.source,
    target_table_id: params.target,
    source_field_id: sourceFieldId,
    target_field_id: targetFieldId,
    relationship_type: '1:N',
    description: `${sourceFieldId} -> ${targetFieldId}`
  }

  // 保存关系到store
  canvasStore.createRelationship(relationship)

  // 重新生成边
  if (props.data) {
    generateNodesAndEdges(props.data)
  }
}

// ==================== 生命周期和监听器 ====================

/**
 * 监听布局方向变化
 * 当用户切换布局方向时，自动重新排列
 */
watch(layoutDirection, async () => {
  if (props.data) {
    await nextTick()
    rearrangeLayout()
  }
})

/**
 * 监听数据变化
 * 当图表数据更新时，重新生成节点和边
 */
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      generateNodesAndEdges(newData)
    }
  },
  { immediate: true }
)

/**
 * 组件挂载后初始化
 * 设置初始视图状态
 */
onMounted(() => {
  if (props.data) {
    nextTick(() => {
      fitViewToContent()
    })
  }
})
</script>

<style scoped>
/* ==================== 主容器样式 ==================== */

.diagram-canvas {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* ==================== 控制面板样式 ==================== */

/* Vue Flow 默认控制面板 */
.custom-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

/* 自定义布局控制面板 */
.layout-controls {
  position: absolute;
  top: 10px;
  left: 120px;
  z-index: 1000;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ==================== 布局方向选择器样式 ==================== */

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

/* ==================== 重排布局按钮样式 ==================== */

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

/* ==================== 边类型选择器样式 ==================== */

.edge-type-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.edge-type-selector label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.edge-type-selector select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  background: white;
  color: #374151;
  cursor: pointer;
}

.edge-type-selector select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>
