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
import type { ImageType } from '@/context/export-image-context/export-image-context'
import { useExportImage } from '@/composables/useExportImage'
import { Checkbox } from '@/components/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion'

interface ExportImageDialogProps extends BaseDialogProps {
  format: ImageType
}

const props = defineProps<ExportImageDialogProps>()

const { t } = useTranslation()
const { exportImage } = useExportImage()

// 常量定义
const DEFAULT_INCLUDE_PATTERN_BG = true
const DEFAULT_TRANSPARENT = false
const DEFAULT_SCALE = '2'

// 状态管理
const scale = ref<string>(DEFAULT_SCALE)
const includePatternBG = ref<boolean>(DEFAULT_INCLUDE_PATTERN_BG)
const transparent = ref<boolean>(DEFAULT_TRANSPARENT)

// 计算属性
const scaleOptions = computed<SelectBoxOption[]>(() => [
  { value: '1', label: '1x' },
  { value: '2', label: '2x' },
  { value: '3', label: '3x' },
  { value: '4', label: '4x' },
])

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    // 重置状态
    scale.value = DEFAULT_SCALE
    includePatternBG.value = DEFAULT_INCLUDE_PATTERN_BG
    transparent.value = DEFAULT_TRANSPARENT
  }
}, { immediate: true })

// 处理导出
const handleExport = () => {
  exportImage({
    type: props.format,
    scale: parseInt(scale.value),
    includePatternBackground: includePatternBG.value,
    transparent: transparent.value,
  })
}

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    // 不需要特殊处理，状态已在watch中处理
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent class="flex w-full flex-col sm:max-w-[425px]" show-close>
      <DialogHeader>
        <DialogTitle>
          {{
            props.format === 'png'
              ? t('export_image_dialog.export_png_title')
              : props.format === 'svg'
                ? t('export_image_dialog.export_svg_title')
                : t('export_image_dialog.export_jpg_title')
          }}
        </DialogTitle>
        <DialogDescription>
          {{ t('export_image_dialog.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex flex-col gap-4 py-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="export-options">
            <AccordionTrigger>
              {{ t('export_image_dialog.export_options') }}
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex flex-col gap-4 pt-2">
                <div class="flex items-start gap-3">
                  <div class="flex flex-col gap-2">
                    <label class="font-medium">
                      {{ t('export_image_dialog.scale') }}
                    </label>
                    <SelectBox
                      v-model="scale"
                      :options="scaleOptions"
                      class="flex h-9 min-h-9 w-full min-w-0"
                    />
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <Checkbox
                    id="pattern-bg-checkbox"
                    class="mt-1 data-[state=checked]:border-pink-600 data-[state=checked]:bg-pink-600 data-[state=checked]:text-white"
                    :checked="includePatternBG"
                    @update:checked="includePatternBG = $event"
                  />
                  <div class="flex flex-col">
                    <label
                      for="pattern-bg-checkbox"
                      class="cursor-pointer font-medium"
                    >
                      {{ t('export_image_dialog.include_pattern_background') }}
                    </label>
                    <span class="text-sm text-muted-foreground">
                      {{ t('export_image_dialog.include_pattern_background_description') }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-start gap-3">
                  <Checkbox
                    id="transparent-checkbox"
                    class="mt-1 data-[state=checked]:border-pink-600 data-[state=checked]:bg-pink-600 data-[state=checked]:text-white"
                    :checked="transparent"
                    @update:checked="transparent = $event"
                  />
                  <div class="flex flex-col">
                    <label
                      for="transparent-checkbox"
                      class="cursor-pointer font-medium"
                    >
                      {{ t('export_image_dialog.transparent') }}
                    </label>
                    <span class="text-sm text-muted-foreground">
                      {{ t('export_image_dialog.transparent_description') }}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <DialogFooter class="flex gap-1 md:justify-between">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t('export_image_dialog.cancel') }}
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button @click="handleExport">
            {{ t('export_image_dialog.export') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>