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
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { useTranslation } from 'vue-i18n'
import { FileUploader } from '@/components/file-uploader/FileUploader.vue'
import { useStorage } from '@/composables/useStorage'
import { useRouter } from 'vue-router'
import { diagramFromJSONInput } from '@/lib/export-import-utils'
import { importCustomJson } from '@/lib/import-custom-json'
import { Alert, AlertDescription, AlertTitle } from '@/components/alert'
import { AlertCircle } from 'lucide-vue-next'
import { useDialog } from '@/composables/useDialog'

interface ImportDiagramDialogProps extends BaseDialogProps {}

const props = defineProps<ImportDiagramDialogProps>()

const { t } = useTranslation()
const file = ref<File | null>(null)
const { addDiagram } = useStorage()
const router = useRouter()
const error = ref(false)

const { closeImportDiagramDialog, closeCreateDiagramDialog } = useDialog()

// 处理文件变化
const onFileChange = (files: File[]) => {
  if (files.length === 0) {
    file.value = null
    return
  }
  
  file.value = files[0]
}

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    error.value = false
    file.value = null
  }
}, { immediate: true })

// 处理导入
const handleImport = async () => {
  if (!file.value) return
  
  try {
    error.value = false
    
    const fileContent = await file.value.text()
    const diagram = diagramFromJSONInput(fileContent)
    
    if (!diagram) {
      error.value = true
      return
    }
    
    // 导入自定义JSON
    const importedDiagram = await importCustomJson(diagram)
    
    // 添加图表
    await addDiagram({ diagram: importedDiagram })
    
    // 关闭对话框
    closeImportDiagramDialog()
    closeCreateDiagramDialog()
    
    // 导航到新图表
    router.push(`/diagrams/${importedDiagram.id}`)
  } catch (e) {
    console.error('Error importing diagram:', e)
    error.value = true
  }
}

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeImportDiagramDialog()
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent class="flex max-h-screen flex-col" show-close>
      <DialogHeader>
        <DialogTitle>
          {{ t('import_diagram_dialog.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('import_diagram_dialog.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <DialogInternalContent>
        <div class="flex flex-col p-1">
          <FileUploader
            :supported-extensions="['.json']"
            @files-change="onFileChange"
          />
          
          <Alert v-if="error" variant="destructive" class="mt-2">
            <AlertCircle class="size-4" />
            <AlertTitle>
              {{ t('import_diagram_dialog.error.title') }}
            </AlertTitle>
            <AlertDescription>
              {{ t('import_diagram_dialog.error.description') }}
            </AlertDescription>
          </Alert>
        </div>
      </DialogInternalContent>
      
      <DialogFooter class="flex gap-1 md:justify-between">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t('import_diagram_dialog.cancel') }}
          </Button>
        </DialogClose>
        <Button @click="handleImport" :disabled="file === null">
          {{ t('import_diagram_dialog.import') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>