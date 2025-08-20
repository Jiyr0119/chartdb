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
import { Button } from '@/components/button'
import type { SelectBoxOption } from '@/components/select-box/SelectBox.vue'
import { SelectBox } from '@/components/select-box'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { useTranslation } from 'vue-i18n'
import { useChartdb } from '@/composables/useChartdb'
import { Spinner } from '@/components/spinner'
import { AlertCircle } from 'lucide-vue-next'
import { Alert, AlertDescription, AlertTitle } from '@/components/alert'
import { useExportDiagram } from '@/composables/useExportDiagram'
import { useDialog } from '@/composables/useDialog'

interface ExportDiagramDialogProps extends BaseDialogProps {}

const props = defineProps<ExportDiagramDialogProps>()

const { t } = useTranslation()
const { currentDiagram } = useChartdb()
const { closeExportDiagramDialog } = useDialog()
const error = ref(false)

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    error.value = false
  }
}, { immediate: true })

const { exportDiagram, isExporting: isLoading } = useExportDiagram()

// 处理导出
const handleExport = async () => {
  try {
    await exportDiagram({ diagram: currentDiagram.value })
    closeExportDiagramDialog()
  } catch (e) {
    error.value = true
    throw e
  }
}

// 输出类型选项
const outputTypeOptions = computed<SelectBoxOption[]>(() => 
  ['json'].map((format) => ({
    value: format,
    label: t(`export_diagram_dialog.format_${format}`),
  }))
)

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeExportDiagramDialog()
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent class="flex flex-col" show-close>
      <DialogHeader>
        <DialogTitle>
          {{ t('export_diagram_dialog.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('export_diagram_dialog.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-1">
        <div class="grid w-full items-center gap-4">
          <SelectBox
            :options="outputTypeOptions"
            :multiple="false"
            value="json"
          />
        </div>
        
        <Alert v-if="error" variant="destructive">
          <AlertCircle class="size-4" />
          <AlertTitle>
            {{ t('export_diagram_dialog.error.title') }}
          </AlertTitle>
          <AlertDescription>
            {{ t('export_diagram_dialog.error.description') }}
          </AlertDescription>
        </Alert>
      </div>
      
      <DialogFooter class="flex gap-1 md:justify-between">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t('export_diagram_dialog.cancel') }}
          </Button>
        </DialogClose>
        <Button @click="handleExport" :disabled="isLoading">
          <Spinner 
            v-if="isLoading" 
            class="mr-1 size-5 text-primary-foreground" 
          />
          {{ t('export_diagram_dialog.export') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>