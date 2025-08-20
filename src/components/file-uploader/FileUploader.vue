<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Upload, FileIcon, AlertCircle, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/button'
import { cn } from '@/lib/utils'

interface FileWithPreview extends File {
  preview?: string
}

interface Props {
  multiple?: boolean
  supportedExtensions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  supportedExtensions: undefined
})

const emit = defineEmits<{
  (e: 'filesChange', files: File[]): void
}>()

// 响应式状态
const files = ref<FileWithPreview[]>([])
const isDragging = ref(false)
const error = ref<string | null>(null)

// 检查文件是否支持
const isFileSupported = (file: File): boolean => {
  if (!props.supportedExtensions) return true
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  return fileExtension
    ? props.supportedExtensions.includes(`.${fileExtension}`)
    : false
}

// 处理文件
const handleFiles = (selectedFiles: FileList) => {
  const newFiles = Array.from(selectedFiles)
    .filter((file) => {
      if (!isFileSupported(file)) {
        error.value = `File type not supported. Supported types: ${props.supportedExtensions?.join(', ')}`
        return false
      }
      return true
    })
    .map((file) => {
      const fileWithPreview = file as FileWithPreview
      fileWithPreview.preview = URL.createObjectURL(file)
      return fileWithPreview
    })

  if (newFiles.length === 0) return

  error.value = null
  if (props.multiple) {
    files.value = [...files.value, ...newFiles]
  } else {
    files.value = newFiles.slice(0, 1)
  }
}

// 拖拽事件处理
const onDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files)
  }
}

// 文件变化时触发事件
watch(files, (newFiles) => {
  emit('filesChange', newFiles.length > 0 ? newFiles : [])
})

// 移除文件
const removeFile = (fileToRemove: File) => {
  files.value = files.value.filter((file) => file !== fileToRemove)
  // 清理预览URL
  if ((fileToRemove as FileWithPreview).preview) {
    URL.revokeObjectURL((fileToRemove as FileWithPreview).preview!)
  }
}

// 组件卸载时清理预览URL
onUnmounted(() => {
  files.value.forEach((file) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
})

// 文件输入引用
const fileInput = ref<HTMLInputElement | null>(null)

// 触发文件选择
const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      :class="cn(
        'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/10 dark:bg-primary/20'
          : 'border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary'
      )"
    >
      <input
        ref="fileInput"
        type="file"
        :multiple="multiple"
        @change="(e) => {
          const target = e.target as HTMLInputElement
          if (target.files && target.files.length > 0) {
            handleFiles(target.files)
          }
        }"
        class="hidden"
        id="fileInput"
        :accept="supportedExtensions?.join(',')"
      />
      <label for="fileInput" class="cursor-pointer">
        <Upload class="mx-auto size-12 text-gray-400 dark:text-gray-500" />
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ multiple
            ? 'Drag and drop files here or click to select'
            : 'Drag and drop a file here or click to select' }}
        </p>
        <p v-if="supportedExtensions" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Supported types: {{ supportedExtensions.join(', ') }}
        </p>
      </label>
    </div>

    <div v-if="error" class="mt-4 flex items-center rounded-lg bg-red-100 p-3 text-red-700 dark:bg-red-900 dark:text-red-200">
      <AlertCircle class="mr-2 size-5" />
      <span class="text-sm">{{ error }}</span>
    </div>

    <ul v-if="files.length > 0" class="mt-4 space-y-4">
      <li
        v-for="file in files"
        :key="file.name"
        class="flex items-center justify-between rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
      >
        <div class="flex min-w-0 flex-1 items-center space-x-2">
          <FileIcon class="size-5 text-primary" />
          <span class="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ file.name }}
          </span>
        </div>
        <Button
          variant="ghost"
          class="size-5 p-0 hover:bg-primary-foreground"
          @click="removeFile(file)"
        >
          <Trash2 class="size-3.5 text-red-700" />
        </Button>
      </li>
    </ul>
  </div>
</template>