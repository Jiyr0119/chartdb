<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogInternalContent,
  DialogClose
} from '@/components/dialog'
import { Button } from '@/components/button'
import { CodeSnippet } from '@/components/code-snippet/CodeSnippet.vue'
import { Label } from '@/components/label'
import { Spinner } from '@/components/spinner'
import { useChartdb } from '@/composables/useChartdb'
import { useDialog } from '@/composables/useDialog'
import {
  exportBaseSQL,
  exportSQL,
} from '@/lib/data/export-metadata/export-sql-script'
import { databaseTypeToLabelMap } from '@/lib/databases'
import { DatabaseType } from '@/lib/domain/database-type'
import { Annoyed, Sparkles } from 'lucide-vue-next'
import { useTranslation } from 'vue-i18n'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import type { Diagram } from '@/lib/domain/diagram'
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter'
import {
  filterDependency,
  filterRelationship,
  filterTable,
} from '@/lib/domain/diagram-filter/filter'
import { defaultSchemas } from '@/lib/data/default-schemas'

interface ExportSQLDialogProps extends BaseDialogProps {
  targetDatabaseType: DatabaseType
}

const props = defineProps<ExportSQLDialogProps>()

const { closeExportSQLDialog } = useDialog()
const { currentDiagram } = useChartdb()
const { filter } = useDiagramFilter()
const { t } = useTranslation()

// 状态管理
const script = ref<string | undefined>(undefined)
const error = ref<boolean>(false)
const isScriptLoading = ref<boolean>(false)

// 计算属性
const databaseLabel = computed(() => 
  props.targetDatabaseType === DatabaseType.GENERIC
    ? 'SQL'
    : databaseTypeToLabelMap[props.targetDatabaseType]
)

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    // 重置状态
    script.value = undefined
    error.value = false
    isScriptLoading.value = true
    
    // 生成SQL脚本
    generateSQLScript()
  }
}, { immediate: true })

// 生成SQL脚本
const generateSQLScript = async () => {
  try {
    isScriptLoading.value = true
    error.value = false
    
    if (!currentDiagram.value) {
      error.value = true
      return
    }
    
    // 过滤图表数据
    const filteredDiagram: Diagram = {
      ...currentDiagram.value,
      tables: currentDiagram.value.tables.filter((table) =>
        filterTable({
          table: { id: table.id, schema: table.schema },
          filter: filter.value,
          options: {
            defaultSchema: defaultSchemas[currentDiagram.value!.databaseType],
          },
        })
      ),
      relationships: currentDiagram.value.relationships.filter((relationship) =>
        filterRelationship({
          relationship,
          filter: filter.value,
          options: {
            defaultSchema: defaultSchemas[currentDiagram.value!.databaseType],
          },
        })
      ),
      dependencies: currentDiagram.value.dependencies.filter((dependency) =>
        filterDependency({
          dependency,
          filter: filter.value,
          options: {
            defaultSchema: defaultSchemas[currentDiagram.value!.databaseType],
          },
        })
      ),
    }
    
    // 生成SQL脚本
    const sqlScript = await exportSQL({
      diagram: filteredDiagram,
      targetDatabaseType: props.targetDatabaseType,
    })
    
    script.value = sqlScript
  } catch (err) {
    console.error('Error generating SQL script:', err)
    error.value = true
  } finally {
    isScriptLoading.value = false
  }
}

// 渲染加载器
const renderLoader = () => (
  <div class="flex flex-col items-center justify-center gap-2">
    <Spinner size="large" />
    <p class="text-sm text-muted-foreground">
      {t('export_sql_dialog.generating_script')}
    </p>
  </div>
)

// 渲染错误
const renderError = () => (
  <div class="flex flex-col items-center justify-center gap-2">
    <Annoyed class="size-12 text-destructive" />
    <p class="text-sm text-destructive">
      {t('export_sql_dialog.script_generation_error')}
    </p>
    <Button variant="secondary" size="sm" @click="generateSQLScript">
      <Sparkles class="mr-2 size-4" />
      {t('export_sql_dialog.retry')}
    </Button>
  </div>
)

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeExportSQLDialog()
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="flex max-h-screen flex-col overflow-y-auto xl:min-w-[75vw]"
      show-close
    >
      <DialogHeader>
        <DialogTitle>{{ t('export_sql_dialog.title') }}</DialogTitle>
        <DialogDescription>
          {{
            t('export_sql_dialog.description', {
              databaseType: databaseLabel,
            })
          }}
        </DialogDescription>
      </DialogHeader>
      
      <DialogInternalContent>
        <div class="flex flex-1 items-center justify-center">
          <div v-if="error">
            {{ renderError() }}
          </div>
          <div v-else-if="script === undefined">
            {{ renderLoader() }}
          </div>
          <div v-else-if="script.length === 0">
            {{ renderError() }}
          </div>
          <CodeSnippet
            v-else
            class="h-96 w-full"
            :code="script"
            :auto-scroll="true"
            :is-complete="!isScriptLoading"
          />
        </div>
      </DialogInternalContent>
      
      <DialogFooter class="flex !justify-between gap-2">
        <div />
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            {{ t('export_sql_dialog.close') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>