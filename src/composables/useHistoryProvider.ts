import { ref, provide, inject, type InjectionKey } from 'vue'
import type { DBTable } from '@/lib/domain/db-table'
import type { DBField } from '@/lib/domain/db-field'
import type { DBIndex } from '@/lib/domain/db-index'
import type { DBRelationship } from '@/lib/domain/db-relationship'
import type { DBDependency } from '@/lib/domain/db-dependency'
import type { Area } from '@/lib/domain/area'
import type { DBCustomType } from '@/lib/domain/db-custom-type'
import { useChartdb } from './useChartdb'

// 定义动作类型
type Action = 
    | 'updateDiagramName'
    | 'addTables'
    | 'removeTables'
    | 'updateTable'
    | 'updateTablesState'
    | 'addField'
    | 'removeField'
    | 'updateField'
    | 'addIndex'
    | 'removeIndex'
    | 'updateIndex'
    | 'addRelationships'
    | 'updateRelationship'
    | 'removeRelationships'
    | 'addDependencies'
    | 'removeDependencies'
    | 'updateDependency'
    | 'addAreas'
    | 'removeAreas'
    | 'updateArea'
    | 'addCustomTypes'
    | 'removeCustomTypes'
    | 'updateCustomType'

// 定义撤销/重做动作接口
interface RedoUndoAction {
    action: Action
    redoData: any
    undoData: any
}

export interface HistoryContext {
    undo: () => Promise<void>
    redo: () => Promise<void>
    hasUndo: boolean
    hasRedo: boolean
}

export const HISTORY_CONTEXT_KEY: InjectionKey<HistoryContext> = Symbol('history-context')

export function useHistoryProvider() {
    const {
        updateDiagramName,
        addTables,
        removeTables,
        updateTable,
        updateTablesState,
        addField,
        removeField,
        updateField,
        addIndex,
        removeIndex,
        updateIndex,
        addRelationships,
        updateRelationship,
        removeRelationships,
        addDependencies,
        removeDependencies,
        updateDependency,
        addAreas,
        removeAreas,
        updateArea,
        addCustomTypes,
        removeCustomTypes,
        updateCustomType
    } = useChartdb()

    // 撤销和重做栈
    const undoStack = ref<RedoUndoAction[]>([])
    const redoStack = ref<RedoUndoAction[]>([])

    // 撤销动作处理器
    const undoActionHandlers: Record<Action, (args: any) => Promise<void>> = {
        updateDiagramName: async ({ undoData }: { undoData: { name: string } }) => {
            await updateDiagramName(undoData.name, { updateHistory: false })
        },
        updateTable: async ({ undoData }: { undoData: { tableId: string; table: Partial<DBTable> } }) => {
            await updateTable(undoData.tableId, undoData.table, { updateHistory: false })
        },
        addTables: async ({ undoData }: { undoData: { tableIds: string[] } }) => {
            await removeTables(undoData.tableIds, { updateHistory: false })
        },
        removeTables: async ({ undoData }: { 
            undoData: { 
                tables: DBTable[], 
                relationships: DBRelationship[], 
                dependencies: DBDependency[] 
            } 
        }) => {
            await Promise.all([
                addTables(undoData.tables, { updateHistory: false }),
                addRelationships(undoData.relationships, { updateHistory: false }),
                addDependencies(undoData.dependencies, { updateHistory: false })
            ])
        },
        updateTablesState: async ({ undoData }: { 
            undoData: { 
                tables: DBTable[], 
                relationships: DBRelationship[], 
                dependencies: DBDependency[] 
            } 
        }) => {
            await Promise.all([
                updateTablesState(() => undoData.tables, { updateHistory: false, forceOverride: true }),
                addRelationships(undoData.relationships, { updateHistory: false }),
                addDependencies(undoData.dependencies, { updateHistory: false })
            ])
        },
        addField: async ({ undoData }: { undoData: { tableId: string; fieldId: string } }) => {
            await removeField(undoData.tableId, undoData.fieldId, { updateHistory: false })
        },
        removeField: async ({ undoData }: { undoData: { tableId: string; field: DBField } }) => {
            await addField(undoData.tableId, undoData.field, { updateHistory: false })
        },
        updateField: async ({ undoData }: { undoData: { tableId: string; fieldId: string; field: Partial<DBField> } }) => {
            await updateField(undoData.tableId, undoData.fieldId, undoData.field, { updateHistory: false })
        },
        addIndex: async ({ undoData }: { undoData: { tableId: string; indexId: string } }) => {
            await removeIndex(undoData.tableId, undoData.indexId, { updateHistory: false })
        },
        removeIndex: async ({ undoData }: { undoData: { tableId: string; index: DBIndex } }) => {
            await addIndex(undoData.tableId, undoData.index, { updateHistory: false })
        },
        updateIndex: async ({ undoData }: { undoData: { tableId: string; indexId: string; index: Partial<DBIndex> } }) => {
            await updateIndex(undoData.tableId, undoData.indexId, undoData.index, { updateHistory: false })
        },
        addRelationships: async ({ undoData }: { undoData: { relationshipIds: string[] } }) => {
            await removeRelationships(undoData.relationshipIds, { updateHistory: false })
        },
        removeRelationships: async ({ undoData }: { undoData: { relationships: DBRelationship[] } }) => {
            await addRelationships(undoData.relationships, { updateHistory: false })
        },
        updateRelationship: async ({ undoData }: { undoData: { relationshipId: string; relationship: Partial<DBRelationship> } }) => {
            await updateRelationship(undoData.relationshipId, undoData.relationship, { updateHistory: false })
        },
        addDependencies: async ({ undoData }: { undoData: { dependenciesIds: string[] } }) => {
            await removeDependencies(undoData.dependenciesIds, { updateHistory: false })
        },
        removeDependencies: async ({ undoData }: { undoData: { dependencies: DBDependency[] } }) => {
            await addDependencies(undoData.dependencies, { updateHistory: false })
        },
        updateDependency: async ({ undoData }: { undoData: { dependencyId: string; dependency: Partial<DBDependency> } }) => {
            await updateDependency(undoData.dependencyId, undoData.dependency, { updateHistory: false })
        },
        addAreas: async ({ undoData }: { undoData: { areaIds: string[] } }) => {
            await removeAreas(undoData.areaIds, { updateHistory: false })
        },
        removeAreas: async ({ undoData }: { undoData: { areas: Area[] } }) => {
            await addAreas(undoData.areas, { updateHistory: false })
        },
        updateArea: async ({ undoData }: { undoData: { areaId: string; area: Partial<Area> } }) => {
            await updateArea(undoData.areaId, undoData.area, { updateHistory: false })
        },
        addCustomTypes: async ({ undoData }: { undoData: { customTypeIds: string[] } }) => {
            await removeCustomTypes(undoData.customTypeIds, { updateHistory: false })
        },
        removeCustomTypes: async ({ undoData }: { undoData: { customTypes: DBCustomType[] } }) => {
            await addCustomTypes(undoData.customTypes, { updateHistory: false })
        },
        updateCustomType: async ({ undoData }: { undoData: { customTypeId: string; customType: Partial<DBCustomType> } }) => {
            await updateCustomType(undoData.customTypeId, undoData.customType, { updateHistory: false })
        }
    }

    // 重做动作处理器
    const redoActionHandlers: Record<Action, (args: any) => Promise<void>> = {
        updateDiagramName: async ({ redoData }: { redoData: { name: string } }) => {
            await updateDiagramName(redoData.name, { updateHistory: false })
        },
        updateTable: async ({ redoData }: { redoData: { tableId: string; table: Partial<DBTable> } }) => {
            await updateTable(redoData.tableId, redoData.table, { updateHistory: false })
        },
        addTables: async ({ redoData }: { redoData: { tables: DBTable[] } }) => {
            await addTables(redoData.tables, { updateHistory: false })
        },
        removeTables: async ({ redoData }: { redoData: { tableIds: string[] } }) => {
            await removeTables(redoData.tableIds, { updateHistory: false })
        },
        updateTablesState: async ({ redoData }: { 
            redoData: { 
                tables: DBTable[], 
                relationships: DBRelationship[], 
                dependencies: DBDependency[] 
            } 
        }) => {
            await Promise.all([
                updateTablesState(() => redoData.tables, { updateHistory: false, forceOverride: true }),
                addRelationships(redoData.relationships, { updateHistory: false }),
                addDependencies(redoData.dependencies, { updateHistory: false })
            ])
        },
        addField: async ({ redoData }: { redoData: { tableId: string; field: DBField } }) => {
            await addField(redoData.tableId, redoData.field, { updateHistory: false })
        },
        removeField: async ({ redoData }: { redoData: { tableId: string; fieldId: string } }) => {
            await removeField(redoData.tableId, redoData.fieldId, { updateHistory: false })
        },
        updateField: async ({ redoData }: { redoData: { tableId: string; fieldId: string; field: Partial<DBField> } }) => {
            await updateField(redoData.tableId, redoData.fieldId, redoData.field, { updateHistory: false })
        },
        addIndex: async ({ redoData }: { redoData: { tableId: string; index: DBIndex } }) => {
            await addIndex(redoData.tableId, redoData.index, { updateHistory: false })
        },
        removeIndex: async ({ redoData }: { redoData: { tableId: string; indexId: string } }) => {
            await removeIndex(redoData.tableId, redoData.indexId, { updateHistory: false })
        },
        updateIndex: async ({ redoData }: { redoData: { tableId: string; indexId: string; index: Partial<DBIndex> } }) => {
            await updateIndex(redoData.tableId, redoData.indexId, redoData.index, { updateHistory: false })
        },
        addRelationships: async ({ redoData }: { redoData: { relationships: DBRelationship[] } }) => {
            await addRelationships(redoData.relationships, { updateHistory: false })
        },
        removeRelationships: async ({ redoData }: { redoData: { relationshipsIds: string[] } }) => {
            await removeRelationships(redoData.relationshipsIds, { updateHistory: false })
        },
        updateRelationship: async ({ redoData }: { redoData: { relationshipId: string; relationship: Partial<DBRelationship> } }) => {
            await updateRelationship(redoData.relationshipId, redoData.relationship, { updateHistory: false })
        },
        addDependencies: async ({ redoData }: { redoData: { dependencies: DBDependency[] } }) => {
            await addDependencies(redoData.dependencies, { updateHistory: false })
        },
        removeDependencies: async ({ redoData }: { redoData: { dependenciesIds: string[] } }) => {
            await removeDependencies(redoData.dependenciesIds, { updateHistory: false })
        },
        updateDependency: async ({ redoData }: { redoData: { dependencyId: string; dependency: Partial<DBDependency> } }) => {
            await updateDependency(redoData.dependencyId, redoData.dependency, { updateHistory: false })
        },
        addAreas: async ({ redoData }: { redoData: { areas: Area[] } }) => {
            await addAreas(redoData.areas, { updateHistory: false })
        },
        removeAreas: async ({ redoData }: { redoData: { areaIds: string[] } }) => {
            await removeAreas(redoData.areaIds, { updateHistory: false })
        },
        updateArea: async ({ redoData }: { redoData: { areaId: string; area: Partial<Area> } }) => {
            await updateArea(redoData.areaId, redoData.area, { updateHistory: false })
        },
        addCustomTypes: async ({ redoData }: { redoData: { customTypes: DBCustomType[] } }) => {
            await addCustomTypes(redoData.customTypes, { updateHistory: false })
        },
        removeCustomTypes: async ({ redoData }: { redoData: { customTypeIds: string[] } }) => {
            await removeCustomTypes(redoData.customTypeIds, { updateHistory: false })
        },
        updateCustomType: async ({ redoData }: { redoData: { customTypeId: string; customType: Partial<DBCustomType> } }) => {
            await updateCustomType(redoData.customTypeId, redoData.customType, { updateHistory: false })
        }
    }

    const undo = async () => {
        const action = undoStack.value.pop()
        if (!action) return

        const handler = undoActionHandlers[action.action]
        redoStack.value.push(action)

        await handler?.({ undoData: action.undoData })
    }

    const redo = async () => {
        const action = redoStack.value.pop()
        if (!action) return

        const handler = redoActionHandlers[action.action]
        undoStack.value.push(action)

        await handler?.({ redoData: action.redoData })
    }

    const hasUndo = ref(false)
    const hasRedo = ref(false)

    // 监听栈变化更新状态
    const updateHistoryState = () => {
        hasUndo.value = undoStack.value.length > 0
        hasRedo.value = redoStack.value.length > 0
    }

    const historyContext: HistoryContext = {
        undo,
        redo,
        get hasUndo() { return hasUndo.value },
        get hasRedo() { return hasRedo.value }
    }

    provide(HISTORY_CONTEXT_KEY, historyContext)

    return historyContext
}

export function useHistory() {
    const context = inject(HISTORY_CONTEXT_KEY)
    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider')
    }
    return context
}
