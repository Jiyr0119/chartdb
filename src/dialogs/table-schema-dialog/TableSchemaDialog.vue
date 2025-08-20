<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import type { DBTable } from '@/lib/domain/db-table'
import type { SelectBoxOption } from '@/components/select-box/SelectBox.vue'
import { SelectBox } from '@/components/select-box'
import type { DBSchema } from '@/lib/domain/db-schema'
import { schemaNameToSchemaId } from '@/lib/domain/db-schema'
import type { BaseDialogProps } from '../common/BaseDialogProps'
import { useTranslation } from 'vue-i18n'
import { Input } from '@/components/input'
import { Separator } from '@/components/separator'
import { Group, SquarePlus } from 'lucide-vue-next'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { useChartdb } from '@/composables/useChartdb'
import { defaultSchemas } from '@/lib/data/default-schemas'
import { Label } from '@/components/label'

interface TableSchemaDialogProps extends BaseDialogProps {
  table?: DBTable
  schemas: DBSchema[]
  onConfirm: ({ schema }: { schema: DBSchema }) => void
  allowSchemaCreation?: boolean
}

const props = defineProps<TableSchemaDialogProps>()

const { t } = useTranslation()
const { databaseType } = useChartdb()

// 状态管理
const selectedSchemaId = ref<string>(
  props.table?.schema
    ? schemaNameToSchemaId(props.table.schema)
    : props.schemas[0]?.id ?? ''
)
const isCreatingNew = ref(false)
const newSchemaName = ref('')
const newSchemaColor = ref('#8eb7ff')

// 计算属性
const schemaOptions = computed<SelectBoxOption[]>(() => 
  props.schemas.map((schema) => ({
    value: schema.id,
    label: schema.name,
  }))
)

const allowSchemaSelection = computed(() => 
  props.schemas.length > 0 && 
  databaseType.value !== 'GENERIC' &&
  databaseType.value !== 'MYSQL'
)

const showSchemaSelection = computed(() => 
  allowSchemaSelection.value && !isCreatingNew.value
)

// 监听对话框打开状态
watch(() => props.dialog?.open, (isOpen) => {
  if (isOpen) {
    // 重置状态
    selectedSchemaId.value = props.table?.schema
      ? schemaNameToSchemaId(props.table.schema)
      : props.schemas[0]?.id ?? ''
    isCreatingNew.value = false
    newSchemaName.value = ''
    newSchemaColor.value = '#8eb7ff'
  }
}, { immediate: true })

// 处理确认
const handleConfirm = () => {
  let schema: DBSchema
  
  if (isCreatingNew.value) {
    schema = {
      id: `schema_${Date.now()}`,
      name: newSchemaName.value.trim(),
      color: newSchemaColor.value,
    }
  } else {
    const selectedSchema = props.schemas.find(
      (schema) => schema.id === selectedSchemaId.value
    )
    if (!selectedSchema) return
    
    schema = selectedSchema
  }
  
  props.onConfirm({ schema })
}

// 切换创建新模式
const toggleCreateNew = () => {
  isCreatingNew.value = !isCreatingNew.value
  newSchemaName.value = ''
}

// 渲染切换创建或选择按钮
const renderSwitchCreateOrSelectButton = () => (
  <Button
    variant="secondary"
    size="sm"
    onClick={toggleCreateNew}
    class="w-full"
  >
    {isCreatingNew.value ? (
      <>
        <Group class="mr-2 size-4" />
        {t('table_schema_dialog.select_existing')}
      </>
    ) : (
      <>
        <SquarePlus class="mr-2 size-4" />
        {t('table_schema_dialog.create_new')}
      </>
    )}
  </Button>
)

// 处理对话框打开状态变化
const handleOpenChange = (open: boolean) => {
  // 不需要特殊处理，状态已在watch中处理
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
            props.table
              ? t('update_table_schema_dialog.title')
              : t('new_table_schema_dialog.title')
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            props.table
              ? t('update_table_schema_dialog.description')
              : t('new_table_schema_dialog.description')
          }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex flex-col gap-4 py-4">
        <div v-if="showSchemaSelection" class="flex flex-col gap-2">
          <Label for="schema-select">
            {{ t('table_schema_dialog.schema') }}
          </Label>
          <SelectBox
            id="schema-select"
            v-model="selectedSchemaId"
            :options="schemaOptions"
            :placeholder="t('table_schema_dialog.select_schema')"
            class="flex h-9 min-h-9 w-full min-w-0"
          />
        </div>
        
        <div v-else-if="isCreatingNew" class="flex flex-col gap-2">
          <Label for="new-schema-name">
            {{ t('table_schema_dialog.new_schema_name') }}
          </Label>
          <Input
            id="new-schema-name"
            v-model="newSchemaName"
            :placeholder="t('table_schema_dialog.schema_name_placeholder')"
            class="h-9"
          />
          
          <div class="mt-2 flex items-center gap-2">
            <Label>{{ t('table_schema_dialog.color') }}</Label>
            <input
              v-model="newSchemaColor"
              type="color"
              class="h-8 w-8 cursor-pointer rounded border border-gray-300 bg-white p-1"
            />
          </div>
        </div>
        
        <div v-if="props.allowSchemaCreation && allowSchemaSelection" class="flex flex-col">
          <div class="relative">
            <Separator class="my-2" />
            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              {{ t('table_schema_dialog.or') }}
            </span>
          </div>
          
          <Tooltip v-if="allowSchemaSelection">
            <TooltipTrigger as-child>
              <span>
                {{ renderSwitchCreateOrSelectButton() }}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ t('table_schema_dialog.no_existing_schemas') }}</p>
            </TooltipContent>
          </Tooltip>
          
          <div v-else>
            {{ renderSwitchCreateOrSelectButton() }}
          </div>
        </div>
      </div>
      
      <DialogFooter class="flex gap-1 md:justify-between">
        <DialogClose as-child>
          <Button variant="secondary">
            {{
              isCreatingNew
                ? t('create_table_schema_dialog.cancel')
                : props.table
                  ? t('update_table_schema_dialog.cancel')
                  : t('new_table_schema_dialog.cancel')
            }}
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button
            @click="handleConfirm"
            :disabled="isCreatingNew && !newSchemaName.trim()"
          >
            {{
              isCreatingNew
                ? t('create_table_schema_dialog.create')
                : props.table
                  ? t('update_table_schema_dialog.confirm')
                  : t('new_table_schema_dialog.confirm')
            }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>