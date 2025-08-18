import { ref, computed, provide, inject, type InjectionKey, type Ref, watch, nextTick } from 'vue'
import { useChartdb } from './useChartdb'
import { adjustTablePositions } from '@/lib/domain/db-table'
import { findOverlappingTables } from '@/pages/editor-page/canvas/canvas-utils'
import type { Graph } from '@/lib/graph'
import { createGraph } from '@/lib/graph'
import { filterTable } from '@/lib/domain/diagram-filter/filter'
import { defaultSchemas } from '@/lib/data/default-schemas'

export interface CanvasContext {
  reorderTables: (options?: { updateHistory?: boolean }) => void
  fitView: (options?: {
    duration?: number
    padding?: number
    maxZoom?: number
  }) => void
  setOverlapGraph: (graph: Graph<string>) => void
  overlapGraph: Ref<Graph<string>>
  setShowFilter: (show: boolean) => void
  showFilter: Ref<boolean>
}

export const CANVAS_CONTEXT_KEY: InjectionKey<CanvasContext> = Symbol('canvas-context')

export function useCanvasProvider() {
  const {
    tables,
    relationships,
    updateTablesState,
    databaseType,
    areas,
    diagramId,
  } = useChartdb()

  // TODO: 需要实现 useDiagramFilter composable
  // const {
  //   filter,
  //   hasActiveFilter,
  //   loading: filterLoading,
  // } = useDiagramFilter()

  // 临时占位符，等待 useDiagramFilter 实现
  const filter = ref(null)
  const hasActiveFilter = ref(false)
  const filterLoading = ref(false)

  // TODO: 需要集成 ReactFlow 的 Vue 版本或替代方案
  // 临时占位符函数
  const fitViewInternal = (options?: {
    duration?: number
    padding?: number
    maxZoom?: number
  }) => {
    console.log('fitView called with options:', options)
    // 这里需要实现实际的 fitView 逻辑
  }

  const overlapGraph = ref<Graph<string>>(createGraph())
  const showFilter = ref(false)
  const diagramIdActiveFilter = ref<string>()

  // 监听过滤器变化
  watch([hasActiveFilter, filterLoading, () => diagramId], () => {
    if (filterLoading.value) {
      return
    }

    if (diagramIdActiveFilter.value === diagramId) {
      return
    }

    diagramIdActiveFilter.value = diagramId

    if (hasActiveFilter.value) {
      showFilter.value = true
    }
  })

  const reorderTables = (
    options: { updateHistory?: boolean } = {
      updateHistory: true,
    }
  ) => {
    const newTables = adjustTablePositions({
      relationships: [...relationships],
      tables: [...tables].filter((table) =>
        filterTable({
          table: {
            id: table.id,
            schema: table.schema,
          },
          filter: filter.value,
          options: {
            defaultSchema: defaultSchemas[databaseType],
          },
        })
      ),
      areas: [...areas],
      mode: 'all',
    })

    const updatedOverlapGraph = findOverlappingTables({
      tables: newTables,
    })

    updateTablesState(
      (currentTables) =>
        currentTables.map((table) => {
          const newTable = newTables.find((t) => t.id === table.id)
          return {
            id: table.id,
            x: newTable?.x ?? table.x,
            y: newTable?.y ?? table.y,
          }
        }),
      {
        updateHistory: options.updateHistory ?? true,
        forceOverride: false,
      }
    )

    overlapGraph.value = updatedOverlapGraph

    setTimeout(() => {
      fitViewInternal({
        duration: 500,
        padding: 0.2,
        maxZoom: 0.8,
      })
    }, 500)
  }

  const fitView = (options?: {
    duration?: number
    padding?: number
    maxZoom?: number
  }) => {
    fitViewInternal(options)
  }

  const setOverlapGraph = (graph: Graph<string>) => {
    overlapGraph.value = graph
  }

  const setShowFilter = (show: boolean) => {
    showFilter.value = show
  }

  const canvasContext: CanvasContext = {
    reorderTables,
    fitView,
    setOverlapGraph,
    overlapGraph,
    setShowFilter,
    showFilter,
  }

  provide(CANVAS_CONTEXT_KEY, canvasContext)

  return canvasContext
}

export function useCanvasContext() {
  const context = inject(CANVAS_CONTEXT_KEY)
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider')
  }
  return context
}
