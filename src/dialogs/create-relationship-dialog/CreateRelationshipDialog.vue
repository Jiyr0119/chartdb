<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/dialog'
import { Button } from '@/components/button'
import { FileOutput, FileMinus2, FileType2 } from 'lucide-vue-next'
import { useTranslation } from 'vue-i18n'
import { useChartdb } from '@/composables/useChartdb'
import type { SelectBoxOption } from '@/components/select-box/SelectBox.vue'
import { SelectBox } from '@/components/select-box'
import { useLayout } from '@/composables/useLayout'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { areFieldTypesCompatible } from '@/lib/data/data-types/data-types'
import { useVueFlow } from '@vue-flow/core'

const ErrorMessageRelationshipFieldsNotSameType =
  'Relationships can only be created between fields of the same type'

interface CreateRelationshipDialogProps extends BaseDialogProps {
  sourceTableId?: string
}

const props = defineProps<CreateRelationshipDialogProps>()

const { closeCreateRelationshipDialog } = useDialog()
const { t } = useTranslation()
const { tables, getTable, createRelationship, getField, databaseType } = useChartdb()
const { openRelationshipFromSidebar } = useLayout()
const { fitView, setEdges } = useVueFlow()

// 状态管理
const primaryTableId = ref<string | undefined>(props.sourceTableId)
const primaryFieldId = ref<string | undefined>()
const referencedTableId = ref<string | undefined>()
const referencedFieldId = ref<string | undefined>()
const errorMessage = ref('')
const canCreateRelationship = ref(false)
const primaryFieldSelectOpen = ref(false)
const referencedFieldSelectOpen = ref(false)

// 计算属性
const primaryTableOptions = computed<SelectBoxOption[]>(() => 
  tables.value.map((table) => ({
    value: table.id,
    label: table.name,
  }))
)

const referencedTableOptions = computed<SelectBoxOption[]>(() => 
  tables.value
    .filter((table) => table.id !== primaryTableId.value)
    .map((table) => ({
      value: table.id,
      label: table.name,
    }))
)

const primaryFieldOptions = computed<SelectBoxOption[]>(() => {
  if (!primaryTableId.value) return []
  
  const table = getTable(primaryTableId.value)
  if (!table) return []
  
  return table.fields.map((field) => ({
    value: field.id,
    label: field.name,
  }))
})

const referencedFieldOptions = computed<SelectBoxOption[]>(() => {
  if (!referencedTableId.value) return []
  
  const table = getTable(referencedTableId.value)
  if (!table) return []
  
  const primaryField = primaryFieldId.value 
    ? getField(primaryTableId.value!, primaryFieldId.value) 
    : undefined
  
  return table.fields
    .filter((field) => {
      // 如果没有选择主字段，则显示所有字段
      if (!primaryField) return true
      
      // 如果选择了主字段，则只显示兼容类型的字段
      return areFieldTypesCompatible({
        sourceFieldType: primaryField.type.id,
        targetFieldType: field.type.id,
        databaseType: databaseType,
      })
    })
    .map((field) => ({
      value: field.id,
      label: field.name,
    }))
})

// 监听状态变化以验证关系创建条件
watch([primaryTableId, primaryFieldId, referencedTableId, referencedFieldId], () => {
  validateRelationshipCreation()
})

// 验证关系创建条件
const validateRelationshipCreation = () => {
  errorMessage.value = ''
  canCreateRelationship.value = false
  
  if (!primaryTableId.value || !primaryFieldId.value || 
      !referencedTableId.value || !referencedFieldId.value) {
    return
  }
  
  const primaryField = getField(primaryTableId.value, primaryFieldId.value)
  const referencedField = getField(referencedTableId.value, referencedFieldId.value)
  
  if (!primaryField || !referencedField) {
    return
  }
  
  // 检查字段类型是否兼容
  if (!areFieldTypesCompatible({
    sourceFieldType: primaryField.type.id,
    targetFieldType: referencedField.type.id,
    databaseType: databaseType,
  })) {
    errorMessage.value = ErrorMessageRelationshipFieldsNotSameType
    return
  }
  
  canCreateRelationship.value = true
}

// 处理主表变化
const handlePrimaryTableChange = (value: string | undefined) => {
  primaryTableId.value = value
  primaryFieldId.value = undefined
  primaryFieldSelectOpen.value = true
}

// 处理引用表变化
const handleReferencedTableChange = (value: string | undefined) => {
  referencedTableId.value = value
  referencedFieldId.value = undefined
  referencedFieldSelectOpen.value = true
}

// 处理创建关系
const handleCreateRelationship = () => {
  if (!canCreateRelationship.value) return
  
  createRelationship({
    sourceTableId: primaryTableId.value!,
    targetTableId: referencedTableId.value!,
    sourceFieldId: primaryFieldId.value!,
    targetFieldId: referencedFieldId.value!,
  }).then(() => {
    // 关闭对话框并打开关系侧边栏
    closeCreateRelationshipDialog()
    openRelationshipFromSidebar(referencedTableId.value!)
    
    // 适应视图
    setTimeout(() => {
      fitView({ 
        duration: 500,
        padding: 0.1,
        maxZoom: 0.8,
      })
    }, 100)
  })
}

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    // 重置状态
    primaryTableId.value = props.sourceTableId
    primaryFieldId.value = undefined
    referencedTableId.value = undefined
    referencedFieldId.value = undefined
    errorMessage.value = ''
    canCreateRelationship.value = false
    primaryFieldSelectOpen.value = false
    referencedFieldSelectOpen.value = false
  }
}, { immediate: true })

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeCreateRelationshipDialog()
  }
}
</script>

<template>
  <Dialog
    v-bind="props.dialog"
    @update:open="handleOpenChange"
  >
    <DialogContent 
      class="flex w-full flex-col sm:max-w-[425px]" 
      show-close
    >
      <DialogHeader>
        <DialogTitle>
          {{ t('create_relationship_dialog.title') }}
        </DialogTitle>
      </DialogHeader>
      
      <div class="flex flex-col gap-4 py-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <FileOutput class="size-4" />
            <label class="text-sm font-medium">
              {{ t('create_relationship_dialog.primary_table') }}
            </label>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <SelectBox
                v-model="primaryTableId"
                :options="primaryTableOptions"
                :placeholder="t('create_relationship_dialog.primary_table_placeholder')"
                class="flex h-8 min-h-8 w-full min-w-0"
                @update:model-value="handlePrimaryTableChange"
              />
            </div>
            <div class="flex-1">
              <SelectBox
                v-model="primaryFieldId"
                :disabled="primaryFieldOptions.length === 0"
                :options="primaryFieldOptions"
                :placeholder="t('create_relationship_dialog.primary_field_placeholder')"
                class="flex h-8 min-h-8 w-full min-w-0"
                :open="primaryFieldSelectOpen"
                @update:open="primaryFieldSelectOpen = $event"
              />
            </div>
          </div>
        </div>
        
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <FileMinus2 class="size-4" />
            <label class="text-sm font-medium">
              {{ t('create_relationship_dialog.referenced_table') }}
            </label>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <SelectBox
                v-model="referencedTableId"
                :disabled="referencedTableOptions.length === 0"
                :options="referencedTableOptions"
                :placeholder="t('create_relationship_dialog.referenced_table_placeholder')"
                class="flex h-8 min-h-8 w-full min-w-0"
                @update:model-value="handleReferencedTableChange"
              />
            </div>
            <div class="flex-1">
              <SelectBox
                v-model="referencedFieldId"
                :disabled="referencedFieldOptions.length === 0"
                :options="referencedFieldOptions"
                :placeholder="t('create_relationship_dialog.referenced_field_placeholder')"
                class="flex h-8 min-h-8 w-full min-w-0"
                :open="referencedFieldSelectOpen"
                @update:open="referencedFieldSelectOpen = $event"
              />
            </div>
          </div>
        </div>
        
        <p v-if="errorMessage" class="mt-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
      
      <DialogFooter class="flex !justify-between gap-2">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            {{ t('create_relationship_dialog.cancel') }}
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button
            :disabled="!canCreateRelationship"
            type="button"
            @click="handleCreateRelationship"
          >
            {{ t('create_relationship_dialog.create') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>