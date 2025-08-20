<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from '@/components/dialog'
import { DatabaseType } from '@/lib/domain/database-type'
import { useStorage } from '@/composables/useStorage'
import type { Diagram } from '@/lib/domain/diagram'
import { loadFromDatabaseMetadata } from '@/lib/domain/diagram'
import { useConfig } from '@/composables/useConfig'
import type { DatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata'
import { loadDatabaseMetadata } from '@/lib/data/import-metadata/metadata-types/database-metadata'
import { generateDiagramId } from '@/lib/utils'
import { useChartdb } from '@/composables/useChartdb'
import { useDialog } from '@/composables/useDialog'
import type { DatabaseEdition } from '@/lib/domain/database-edition'
import { SelectDatabase } from './select-database/SelectDatabase.vue'
import { CreateDiagramDialogStep } from './CreateDiagramDialogStep'
import { ImportDatabase } from '../common/import-database/ImportDatabase.vue'
import { SelectTables } from '../common/select-tables/SelectTables.vue'
import { useTranslation } from 'vue-i18n'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { sqlImportToDiagram } from '@/lib/data/sql-import'
import type { SelectedTable } from '@/lib/data/import-metadata/filter-metadata'
import { filterMetadataByTables } from '@/lib/data/import-metadata/filter-metadata'
import { MAX_TABLES_WITHOUT_SHOWING_FILTER } from '../common/select-tables/constants'
import { useRouter } from 'vue-router'

interface CreateDiagramDialogProps extends BaseDialogProps {
  dialog: any
}

const props = defineProps<CreateDiagramDialogProps>()

const { diagramId } = useChartdb()
const { t } = useTranslation()
const router = useRouter()

// 状态管理
const importMethod = ref<'query' | 'ddl'>('query')
const databaseType = ref<DatabaseType>(DatabaseType.GENERIC)
const { closeCreateDiagramDialog, openImportDBMLDialog } = useDialog()
const { updateConfig } = useConfig()
const scriptResult = ref('')
const databaseEdition = ref<DatabaseEdition | undefined>()
const step = ref<CreateDiagramDialogStep>(CreateDiagramDialogStep.SELECT_DATABASE)
const { listDiagrams, addDiagram } = useStorage()
const diagramNumber = ref<number>(1)
const parsedMetadata = ref<DatabaseMetadata>()
const isParsingMetadata = ref(false)

// 计算属性
const hasExistingDiagram = computed(() => (diagramId.value ?? '').trim().length !== 0)

// 监听数据库类型变化
watch(databaseType, () => {
  databaseEdition.value = undefined
  importMethod.value = 'query'
})

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    step.value = CreateDiagramDialogStep.SELECT_DATABASE
    databaseType.value = DatabaseType.GENERIC
    databaseEdition.value = undefined
    scriptResult.value = ''
    importMethod.value = 'query'
    parsedMetadata.value = undefined
    
    // 获取图表数量
    const fetchDiagrams = async () => {
      const diagrams = await listDiagrams()
      diagramNumber.value = diagrams.length + 1
    }
    fetchDiagrams()
  }
}, { immediate: true })

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeCreateDiagramDialog()
  }
}

// 创建空图表
const createEmptyDiagram = async () => {
  const id = generateDiagramId()
  const now = new Date()
  
  const diagram: Diagram = {
    id,
    name: `Diagram #${diagramNumber.value}`,
    createdAt: now,
    updatedAt: now,
    databaseType: databaseType.value,
    databaseEdition: databaseEdition.value,
    tables: [],
    relationships: [],
    dependencies: [],
    areas: [],
    customTypes: [],
    schemas: databaseType.value === DatabaseType.POSTGRESQL ? [
      { id: 'public', name: 'public' }
    ] : undefined
  }
  
  await addDiagram({ diagram })
  router.push(`/diagrams/${id}`)
  closeCreateDiagramDialog()
}

// 导入新图表
const importNewDiagram = async ({
  selectedTables,
  databaseMetadata,
}: {
  selectedTables?: SelectedTable[]
  databaseMetadata: DatabaseMetadata
}) => {
  try {
    isParsingMetadata.value = true
    
    const filteredMetadata = selectedTables
      ? filterMetadataByTables(databaseMetadata, selectedTables)
      : databaseMetadata
    
    const diagram = await sqlImportToDiagram({
      dbma: filteredMetadata,
      databaseType: databaseType.value,
      databaseEdition: databaseEdition.value,
      diagramNumber: diagramNumber.value,
    })
    
    await addDiagram({ diagram })
    router.push(`/diagrams/${diagram.id}`)
    closeCreateDiagramDialog()
  } catch (error) {
    console.error('Error importing diagram:', error)
  } finally {
    isParsingMetadata.value = false
  }
}

// 导入新图表或过滤表
const importNewDiagramOrFilterTables = async ({
  scriptResult: result,
  databaseEdition: edition,
}: {
  scriptResult: string
  databaseEdition?: DatabaseEdition
}) => {
  try {
    isParsingMetadata.value = true
    scriptResult.value = result
    databaseEdition.value = edition
    
    const metadata = await loadDatabaseMetadata({
      databaseType: databaseType.value,
      databaseEdition: edition,
      scriptResult: result,
    })
    
    parsedMetadata.value = metadata
    
    // 检查是否需要显示表选择界面
    if (
      metadata.tables.length > MAX_TABLES_WITHOUT_SHOWING_FILTER &&
      databaseType.value !== DatabaseType.SQLITE
    ) {
      step.value = CreateDiagramDialogStep.SELECT_TABLES
    } else {
      await importNewDiagram({ databaseMetadata: metadata })
    }
  } catch (error) {
    console.error('Error parsing metadata:', error)
    isParsingMetadata.value = false
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="flex max-h-dvh w-full flex-col md:max-w-[900px]"
      :show-close="hasExistingDiagram"
      @interact-outside.prevent
      @escape-key-down.prevent
    >
      <SelectDatabase
        v-if="step === CreateDiagramDialogStep.SELECT_DATABASE"
        :create-new-diagram="createEmptyDiagram"
        :database-type="databaseType"
        :has-existing-diagram="hasExistingDiagram"
        @update:database-type="databaseType = $event"
        @continue="step = CreateDiagramDialogStep.IMPORT_DATABASE"
      />
      
      <ImportDatabase
        v-else-if="step === CreateDiagramDialogStep.IMPORT_DATABASE"
        :on-import="importNewDiagramOrFilterTables"
        :on-create-empty-diagram="createEmptyDiagram"
        :database-edition="databaseEdition"
        :database-type="databaseType"
        :script-result="scriptResult"
        @update:database-edition="databaseEdition = $event"
        @go-back="step = CreateDiagramDialogStep.SELECT_DATABASE"
        @update:script-result="scriptResult = $event"
        :title="t('new_diagram_dialog.import_database.title')"
        :import-method="importMethod"
        @update:import-method="importMethod = $event"
        :keep-dialog-after-import="true"
      />
      
      <SelectTables
        v-else-if="step === CreateDiagramDialogStep.SELECT_TABLES"
        :is-loading="isParsingMetadata || !parsedMetadata"
        :database-metadata="parsedMetadata"
        :on-import="importNewDiagram"
        @on-back="step = CreateDiagramDialogStep.IMPORT_DATABASE"
      />
    </DialogContent>
  </Dialog>
</template>