import { ref, provide, inject, type InjectionKey } from 'vue'
import { DatabaseType } from '@/lib/domain/database-type'

// 对话框参数类型定义 - TODO: 当对话框组件迁移完成后，需要从实际组件中导入
export interface CreateDiagramDialogParams {
  // TODO: 从 CreateDiagramDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface OpenDiagramDialogParams {
  // TODO: 从 OpenDiagramDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface ExportSQLDialogParams {
  targetDatabaseType: DatabaseType
  // TODO: 从 ExportSQLDialog 组件导入其他 props 类型
  [key: string]: any
}

export interface CreateRelationshipDialogParams {
  // TODO: 从 CreateRelationshipDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface ImportDatabaseDialogParams {
  databaseType: DatabaseType
  // TODO: 从 ImportDatabaseDialog 组件导入其他 props 类型
  [key: string]: any
}

export interface TableSchemaDialogParams {
  schemas: any[] // TODO: 从具体类型定义导入
  onConfirm: () => void
  // TODO: 从 TableSchemaDialog 组件导入其他 props 类型
  [key: string]: any
}

export interface ExportImageDialogParams {
  format: 'png' | 'svg' | 'jpg'
  // TODO: 从 ExportImageDialog 组件导入其他 props 类型
  [key: string]: any
}

export interface ExportDiagramDialogParams {
  // TODO: 从 ExportDiagramDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface ImportDiagramDialogParams {
  // TODO: 从 ImportDiagramDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface ImportDBMLDialogParams {
  // TODO: 从 ImportDBMLDialog 组件导入具体的 props 类型
  [key: string]: any
}

export interface DialogContext {
  // Create diagram dialog
  openCreateDiagramDialog: (params?: CreateDiagramDialogParams) => void
  closeCreateDiagramDialog: () => void

  // Open diagram dialog
  openOpenDiagramDialog: (params?: OpenDiagramDialogParams) => void
  closeOpenDiagramDialog: () => void

  // Export SQL dialog
  openExportSQLDialog: (params: ExportSQLDialogParams) => void
  closeExportSQLDialog: () => void

  // Create relationship dialog
  openCreateRelationshipDialog: (params?: CreateRelationshipDialogParams) => void
  closeCreateRelationshipDialog: () => void

  // Import database dialog
  openImportDatabaseDialog: (params: ImportDatabaseDialogParams) => void
  closeImportDatabaseDialog: () => void

  // Change table schema dialog
  openTableSchemaDialog: (params: TableSchemaDialogParams) => void
  closeTableSchemaDialog: () => void

  // Star us dialog
  openStarUsDialog: () => void
  closeStarUsDialog: () => void

  // Export image dialog
  openExportImageDialog: (params: ExportImageDialogParams) => void
  closeExportImageDialog: () => void

  // Export diagram dialog
  openExportDiagramDialog: (params?: ExportDiagramDialogParams) => void
  closeExportDiagramDialog: () => void

  // Import diagram dialog
  openImportDiagramDialog: (params?: ImportDiagramDialogParams) => void
  closeImportDiagramDialog: () => void

  // Import DBML dialog
  openImportDBMLDialog: (params?: ImportDBMLDialogParams) => void
  closeImportDBMLDialog: () => void
}

export const DIALOG_CONTEXT_KEY: InjectionKey<DialogContext> = Symbol('dialog-context')

export function useDialogProvider() {
  // Create Diagram Dialog State
  const openNewDiagramDialog = ref(false)
  const newDiagramDialogParams = ref<CreateDiagramDialogParams>()

  const openCreateDiagramDialog = (params?: CreateDiagramDialogParams) => {
    newDiagramDialogParams.value = params
    openNewDiagramDialog.value = true
  }

  const closeCreateDiagramDialog = () => {
    openNewDiagramDialog.value = false
  }

  // Open Diagram Dialog State
  const openOpenDiagramDialogState = ref(false)
  const openDiagramDialogParams = ref<OpenDiagramDialogParams>()

  const openOpenDiagramDialog = (params?: OpenDiagramDialogParams) => {
    openDiagramDialogParams.value = params
    openOpenDiagramDialogState.value = true
  }

  const closeOpenDiagramDialog = () => {
    openOpenDiagramDialogState.value = false
  }

  // Export SQL Dialog State
  const openExportSQLDialogState = ref(false)
  const exportSQLDialogParams = ref<ExportSQLDialogParams>({
    targetDatabaseType: DatabaseType.GENERIC
  })

  const openExportSQLDialog = (params: ExportSQLDialogParams) => {
    exportSQLDialogParams.value = params
    openExportSQLDialogState.value = true
  }

  const closeExportSQLDialog = () => {
    openExportSQLDialogState.value = false
  }

  // Create Relationship Dialog State
  const openCreateRelationshipDialogState = ref(false)
  const createRelationshipDialogParams = ref<CreateRelationshipDialogParams>()

  const openCreateRelationshipDialog = (params?: CreateRelationshipDialogParams) => {
    createRelationshipDialogParams.value = params
    openCreateRelationshipDialogState.value = true
  }

  const closeCreateRelationshipDialog = () => {
    openCreateRelationshipDialogState.value = false
  }

  // Import Database Dialog State
  const openImportDatabaseDialogState = ref(false)
  const importDatabaseDialogParams = ref<ImportDatabaseDialogParams>({
    databaseType: DatabaseType.GENERIC
  })

  const openImportDatabaseDialog = (params: ImportDatabaseDialogParams) => {
    importDatabaseDialogParams.value = params
    openImportDatabaseDialogState.value = true
  }

  const closeImportDatabaseDialog = () => {
    openImportDatabaseDialogState.value = false
  }

  // Table Schema Dialog State
  const openTableSchemaDialogState = ref(false)
  const tableSchemaDialogParams = ref<TableSchemaDialogParams>({
    schemas: [],
    onConfirm: () => {}
  })

  const openTableSchemaDialog = (params: TableSchemaDialogParams) => {
    tableSchemaDialogParams.value = params
    openTableSchemaDialogState.value = true
  }

  const closeTableSchemaDialog = () => {
    openTableSchemaDialogState.value = false
  }

  // Star Us Dialog State
  const openStarUsDialogState = ref(false)

  const openStarUsDialog = () => {
    openStarUsDialogState.value = true
  }

  const closeStarUsDialog = () => {
    openStarUsDialogState.value = false
  }

  // Export Image Dialog State
  const openExportImageDialogState = ref(false)
  const exportImageDialogParams = ref<ExportImageDialogParams>({
    format: 'png'
  })

  const openExportImageDialog = (params: ExportImageDialogParams) => {
    exportImageDialogParams.value = params
    openExportImageDialogState.value = true
  }

  const closeExportImageDialog = () => {
    openExportImageDialogState.value = false
  }

  // Export Diagram Dialog State
  const openExportDiagramDialogState = ref(false)
  const exportDiagramDialogParams = ref<ExportDiagramDialogParams>()

  const openExportDiagramDialog = (params?: ExportDiagramDialogParams) => {
    exportDiagramDialogParams.value = params
    openExportDiagramDialogState.value = true
  }

  const closeExportDiagramDialog = () => {
    openExportDiagramDialogState.value = false
  }

  // Import Diagram Dialog State
  const openImportDiagramDialogState = ref(false)
  const importDiagramDialogParams = ref<ImportDiagramDialogParams>()

  const openImportDiagramDialog = (params?: ImportDiagramDialogParams) => {
    importDiagramDialogParams.value = params
    openImportDiagramDialogState.value = true
  }

  const closeImportDiagramDialog = () => {
    openImportDiagramDialogState.value = false
  }

  // Import DBML Dialog State
  const openImportDBMLDialogState = ref(false)
  const importDBMLDialogParams = ref<ImportDBMLDialogParams>()

  const openImportDBMLDialog = (params?: ImportDBMLDialogParams) => {
    importDBMLDialogParams.value = params
    openImportDBMLDialogState.value = true
  }

  const closeImportDBMLDialog = () => {
    openImportDBMLDialogState.value = false
  }

  const dialogContext: DialogContext = {
    // Create diagram dialog
    openCreateDiagramDialog,
    closeCreateDiagramDialog,

    // Open diagram dialog
    openOpenDiagramDialog,
    closeOpenDiagramDialog,

    // Export SQL dialog
    openExportSQLDialog,
    closeExportSQLDialog,

    // Create relationship dialog
    openCreateRelationshipDialog,
    closeCreateRelationshipDialog,

    // Import database dialog
    openImportDatabaseDialog,
    closeImportDatabaseDialog,

    // Table schema dialog
    openTableSchemaDialog,
    closeTableSchemaDialog,

    // Star us dialog
    openStarUsDialog,
    closeStarUsDialog,

    // Export image dialog
    openExportImageDialog,
    closeExportImageDialog,

    // Export diagram dialog
    openExportDiagramDialog,
    closeExportDiagramDialog,

    // Import diagram dialog
    openImportDiagramDialog,
    closeImportDiagramDialog,

    // Import DBML dialog
    openImportDBMLDialog,
    closeImportDBMLDialog,
  }

  provide(DIALOG_CONTEXT_KEY, dialogContext)

  return {
    ...dialogContext,
    // 暴露所有状态供渲染对话框组件使用
    // TODO: 当对话框组件迁移完成后，需要在这里添加对话框组件的渲染逻辑
    dialogStates: {
      // Create diagram dialog
      openNewDiagramDialog,
      newDiagramDialogParams,

      // Open diagram dialog
      openOpenDiagramDialog: openOpenDiagramDialogState,
      openDiagramDialogParams,

      // Export SQL dialog
      openExportSQLDialog: openExportSQLDialogState,
      exportSQLDialogParams,

      // Create relationship dialog
      openCreateRelationshipDialog: openCreateRelationshipDialogState,
      createRelationshipDialogParams,

      // Import database dialog
      openImportDatabaseDialog: openImportDatabaseDialogState,
      importDatabaseDialogParams,

      // Table schema dialog
      openTableSchemaDialog: openTableSchemaDialogState,
      tableSchemaDialogParams,

      // Star us dialog
      openStarUsDialog: openStarUsDialogState,

      // Export image dialog
      openExportImageDialog: openExportImageDialogState,
      exportImageDialogParams,

      // Export diagram dialog
      openExportDiagramDialog: openExportDiagramDialogState,
      exportDiagramDialogParams,

      // Import diagram dialog
      openImportDiagramDialog: openImportDiagramDialogState,
      importDiagramDialogParams,

      // Import DBML dialog
      openImportDBMLDialog: openImportDBMLDialogState,
      importDBMLDialogParams,
    }
  }
}

export function useDialogContext() {
  const context = inject(DIALOG_CONTEXT_KEY)
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider')
  }
  return context
}
