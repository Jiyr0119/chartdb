<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Dialog, 
  DialogContent 
} from '@/components/dialog'
import { useDialog } from '@/composables/useDialog'
import { DatabaseType } from '@/lib/domain/database-type'
import { ImportDatabase } from '../common/import-database/ImportDatabase.vue'
import type { DatabaseEdition } from '@/lib/domain/database-edition'
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata'
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata'
import type { Diagram } from '@/lib/domain/diagram'
import { loadFromDatabaseMetadata } from '@/lib/domain/diagram'
import { useChartdb } from '@/composables/useChartdb'
import { useRedoUndoStack } from '@/composables/useRedoUndoStack'
import { useTranslation } from 'vue-i18n'
import { useVueFlow } from '@vue-flow/core'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { useAlert } from '@/composables/useAlert'
import { sqlImportToDiagram } from '@/lib/data/sql-import'

interface ImportDatabaseDialogProps extends BaseDialogProps {
  databaseType: DatabaseType
}

const props = defineProps<ImportDatabaseDialogProps>()

const { t } = useTranslation()
const { closeImportDatabaseDialog } = useDialog()
const { showAlert } = useAlert()
const {
  tables,
  relationships,
  removeTables,
  removeRelationships,
  addTables,
  addRelationships,
  diagramName,
  databaseType: currentDatabaseType,
  updateDatabaseType,
} = useChartdb()
const { resetRedoStack, resetUndoStack } = useRedoUndoStack()
const { setNodes } = useVueFlow()

// 状态管理
const importMethod = ref<'query' | 'ddl'>('query')
const scriptResult = ref('')
const databaseEdition = ref<DatabaseEdition | undefined>()

// 监听数据库类型变化
watch(() => props.databaseType, () => {
  databaseEdition.value = undefined
})

// 导入数据库
const importDatabase = async ({
  scriptResult: result,
  databaseEdition: edition,
}: {
  scriptResult: string
  databaseEdition?: DatabaseEdition
}) => {
  try {
    scriptResult.value = result
    databaseEdition.value = edition

    // 如果当前数据库类型不同，更新数据库类型
    if (currentDatabaseType !== props.databaseType) {
      updateDatabaseType(props.databaseType)
    }

    const metadata = await loadDatabaseMetadata({
      databaseType: props.databaseType,
      databaseEdition: edition,
      scriptResult: result,
    })

    // 清除现有图表元素
    if (tables.value.length > 0) {
      removeTables(tables.value.map((table) => table.id))
    }
    if (relationships.value.length > 0) {
      removeRelationships(relationships.value.map((rel) => rel.id))
    }

    resetUndoStack()
    resetRedoStack()

    const diagram = await sqlImportToDiagram({
      dbma: metadata,
      databaseType: props.databaseType,
      databaseEdition: edition,
    })

    // 添加新的表和关系
    if (diagram.tables.length > 0) {
      addTables(diagram.tables)
    }
    if (diagram.relationships.length > 0) {
      addRelationships(diagram.relationships)
    }

    // 更新节点
    setNodes([])

    closeImportDatabaseDialog()
  } catch (error) {
    console.error('Error importing database:', error)
    showAlert({
      title: t('import_database_dialog.import_error'),
      description: t('import_database_dialog.import_error_description'),
      actionLabel: t('common.ok'),
    })
  }
}

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeImportDatabaseDialog()
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="flex max-h-screen w-full flex-col md:max-w-[900px]"
      show-close
    >
      <ImportDatabase
        :database-type="props.databaseType"
        :database-edition="databaseEdition"
        @update:database-edition="databaseEdition = $event"
        :on-import="importDatabase"
        :script-result="scriptResult"
        @update:script-result="scriptResult = $event"
        :keep-dialog-after-import="true"
        :title="t('import_database_dialog.title', { diagramName })"
        :import-method="importMethod"
        @update:import-method="importMethod = $event"
      />
    </DialogContent>
  </Dialog>
</template>