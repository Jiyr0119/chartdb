<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import type { DBTable } from '@/lib/domain/db-table'
import { useChartdb } from '@/composables/useChartdb'
import { useCanvas } from '@/composables/useCanvas'
import { useLayout } from '@/composables/useLayout'
import { useTheme } from '@/composables/useTheme'
import { useLocalConfig } from '@/composables/useLocalConfig'
import { MIN_TABLE_SIZE } from '@/lib/domain/db-table'
import { filterTable } from '@/lib/domain/diagram-filter/filter'
import { defaultSchemas } from '@/lib/data/default-schemas'
import { DatabaseType } from '@/lib/domain/database-type'
import type { DiagramFilter } from '@/lib/domain/diagram-filter/diagram-filter'
import type { Area } from '@/lib/domain/area'
import { getTablesInArea, updateTablesParentAreas } from './area-utils'
import type { Graph } from '@/lib/graph'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import Toolbar from './toolbar/Toolbar.vue'

// 类型定义
type EdgeType = any // TODO: 定义具体的边类型
type NodeType = any // TODO: 定义具体的节点类型

interface CanvasProps {
  initialTables: DBTable[]
}

const props = defineProps<CanvasProps>()

// 使用composables
const {
  tables,
  areas,
  relationships,
  dependencies,
  databaseType,
  readonly,
  highlightedCustomType,
  highlightCustomTypeId,
  createRelationship,
  createDependency,
  updateTablesState,
  removeRelationships,
  removeDependencies,
  getField,
  removeArea,
  updateArea
} = useChartdb()

const { 
  reorderTables, 
  fitView, 
  setOverlapGraph, 
  overlapGraph, 
  showFilter, 
  setShowFilter 
} = useCanvas()

const { showSidePanel } = useLayout()
const { effectiveTheme } = useTheme()
const { scrollAction, showDependenciesOnCanvas, showMiniMapOnCanvas } = useLocalConfig()

// 使用Vue Flow
const { onConnect, addEdges, addNodes, findNode, getNodes, getEdges } = useVueFlow()

// 状态管理
const isInitialLoadingNodes = ref(true)
const nodes = ref<NodeType[]>([])
const edges = ref<EdgeType[]>([])
const selectedTableIds = ref<string[]>([])
const selectedRelationshipIds = ref<string[]>([])
const snapToGridEnabled = ref(false)
const highlightOverlappingTables = ref(false)
const isLostInCanvas = ref(false)

// 过滤器相关（TODO: 实现useDiagramFilter composable）
const filter = ref<DiagramFilter | undefined>(undefined)
const filterLoading = ref(false)

// 节点转换函数
const tableToTableNode = (
  table: DBTable,
  {
    filter: filterValue,
    databaseType: dbType,
    filterLoading: loading
  }: {
    filter?: DiagramFilter
    databaseType: DatabaseType
    filterLoading: boolean
  }
) => {
  // 总是使用绝对位置
  const position = { x: table.x, y: table.y }

  return {
    id: table.id,
    type: 'table',
    position,
    data: {
      table,
      isOverlapping: false
    },
    width: table.width ?? MIN_TABLE_SIZE,
    hidden:
      !filterTable({
        table: { id: table.id, schema: table.schema },
        filter: filterValue,
        options: { defaultSchema: defaultSchemas[dbType] }
      }) || loading
  }
}

// 区域转换函数
const areaToAreaNode = (
  area: Area,
  {
    tables: tableList,
    filter: filterValue,
    databaseType: dbType,
    filterLoading: loading
  }: {
    tables: DBTable[]
    filter?: DiagramFilter
    databaseType: DatabaseType
    filterLoading: boolean
  }
) => {
  // 获取此区域中的所有表
  const tablesInArea = tableList.filter((t) => t.parentAreaId === area.id)

  // 检查区域内至少有一个表可见
  const hasVisibleTable =
    tablesInArea.length === 0 ||
    tablesInArea.some((table) =>
      filterTable({
        table: { id: table.id, schema: table.schema },
        filter: filterValue,
        options: {
          defaultSchema: defaultSchemas[dbType]
        }
      })
    )

  return {
    id: area.id,
    type: 'area',
    position: { x: area.x, y: area.y },
    data: { area },
    width: area.width,
    height: area.height,
    zIndex: -10,
    hidden: !hasVisibleTable || loading
  }
}

// 初始化节点
const initializeNodes = () => {
  const initialNodes = props.initialTables.map((table) =>
    tableToTableNode(table, { 
      filter: filter.value, 
      databaseType: databaseType, 
      filterLoading: filterLoading.value 
    })
  )
  nodes.value = initialNodes
  addNodes(initialNodes)
  isInitialLoadingNodes.value = false
}

// 更新边
const updateEdges = () => {
  // TODO: 实现边的更新逻辑
  console.log('Updating edges')
}

// 监听初始表变化
watch(
  () => props.initialTables,
  () => {
    isInitialLoadingNodes.value = true
    initializeNodes()
  }
)

// 监听节点初始化完成
watch(isInitialLoadingNodes, (loading) => {
  if (!loading) {
    setTimeout(() => {
      fitView({
        duration: 200,
        padding: 0.1,
        maxZoom: 0.8
      })
    }, 500)
  }
})

// 监听关系和依赖变化
watch([relationships, dependencies], () => {
  updateEdges()
})

// 组件挂载时初始化
onMounted(() => {
  initializeNodes()
})
</script>

<template>
  <div class="relative h-full w-full bg-background">
    <!-- Vue Flow画布区域 -->
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      class="h-full w-full"
      @connect="onConnect"
    >
      <!-- 背景 -->
      <template #background>
        <div class="bg-background" />
      </template>
      
      <!-- 小地图 -->
      <template #minimap="{ dimensions, nodes, zoom }">
        <div 
          v-if="showMiniMapOnCanvas" 
          class="absolute bottom-4 right-4 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90"
        >
          <!-- TODO: 实现小地图组件 -->
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Minimap
          </div>
        </div>
      </template>
      
      <!-- 控制器 -->
      <template #controls>
        <div class="absolute bottom-4 left-4 rounded-lg bg-white/90 p-2 shadow-lg dark:bg-gray-800/90">
          <!-- TODO: 实现控制器组件 -->
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Controls
          </div>
        </div>
      </template>
    </VueFlow>
    
    <!-- 工具栏 -->
    <div class="absolute left-4 top-4 z-10">
      <Toolbar />
    </div>
    
    <!-- 右键菜单 -->
    <div 
      v-if="false" 
      class="absolute z-20"
      style="top: 0; left: 0;"
    >
      <!-- TODO: 实现右键菜单 -->
      <div class="rounded-md border bg-background p-2 shadow-lg">
        <p class="text-sm">右键菜单占位符</p>
      </div>
    </div>
    
    <!-- 过滤器 -->
    <div 
      v-if="showFilter" 
      class="absolute right-4 top-4 z-10"
    >
      <!-- TODO: 实现过滤器组件 -->
      <div class="rounded-lg bg-background p-4 shadow-lg">
        <p class="text-sm">过滤器占位符</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* TODO: 添加必要的样式 */
</style>