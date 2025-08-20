<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TableList } from './table-list/TableList.vue'
import { Button } from '@/components/button'
import { Table, List, X, Code } from 'lucide-vue-next'
import { Input } from '@/components/input'
import type { DBTable } from '@/lib/domain/db-table'
import { useChartdb } from '@/composables/useChartdb'
import { useLayout } from '@/composables/useLayout'
import { EmptyState } from '@/components/empty-state'
import { ScrollArea } from '@/components/scroll-area'
import { useTranslation } from 'vue-i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { useDialog } from '@/composables/useDialog'
import { TableDBML } from './table-dbml/TableDBML.vue'
import { useHotkeys } from '@vueuse/core'
import { getOperatingSystem } from '@/lib/utils'
import type { DBSchema } from '@/lib/domain'
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter'
import { filterTable } from '@/lib/domain/diagram-filter/filter'
import { defaultSchemas } from '@/lib/data/default-schemas'

interface TablesSectionProps {}

const props = defineProps<TablesSectionProps>()

const { createTable, tables, databaseType } = useChartdb()
const { filter, schemasDisplayed } = useDiagramFilter()
const { openTableSchemaDialog } = useDialog()
const { t } = useTranslation()
const { openTableFromSidebar } = useLayout()

const filterText = ref('')
const showDBML = ref(false)
const filterInputRef = ref<HTMLInputElement | null>(null)

// 过滤后的表
const filteredTables = computed(() => {
  const filterTableName = (table: DBTable): boolean =>
    !filterText.value?.trim?.() ||
    table.name.toLowerCase().includes(filterText.value.toLowerCase())

  const filterTables = (table: DBTable): boolean =>
    filterTable({
      table: {
        id: table.id,
        schema: table.schema,
      },
      filter: filter.value,
      options: {
        defaultSchema: defaultSchemas[databaseType],
        schemasDisplayed: schemasDisplayed.value,
      },
    })

  return tables.value
    .filter(filterTables)
    .filter(filterTableName)
    .sort((a, b) => a.name.localeCompare(b.name))
})

// 处理创建表
const handleCreateTable = () => {
  const newTable = createTable()
  if (newTable) {
    openTableFromSidebar(newTable.id)
  }
}

// 处理清除过滤器
const handleClearFilter = () => {
  filterText.value = ''
}

// 处理切换DBML视图
const handleToggleDBML = () => {
  showDBML.value = !showDBML.value
}

// 处理聚焦过滤器输入框
const handleFocusFilter = () => {
  filterInputRef.value?.focus()
}

// 注册快捷键
useHotkeys(['ctrl+f', 'cmd+f'], (e) => {
  e.preventDefault()
  handleFocusFilter()
})

// 组件挂载时添加键盘事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
})

// 组件卸载时移除键盘事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})

// 处理全局键盘事件
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault()
    handleFocusFilter()
  }
}
</script>

<template>
  <section class="flex h-full flex-col">
    <div class="flex h-10 items-center justify-between border-b px-2">
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 p-0"
          @click="handleToggleDBML"
        >
          <Code class="h-4" />
        </Button>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 p-0"
              @click="handleFocusFilter"
            >
              <List class="h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {{
              t('side_panel.tables_section.search_tooltip', {
                operatingSystemModifier: getOperatingSystem() === 'mac' ? '⌘' : 'Ctrl',
              })
            }}
          </TooltipContent>
        </Tooltip>
      </div>
      <div class="flex flex-1 items-center gap-2 px-1">
        <div class="relative w-full">
          <Input
            ref="filterInputRef"
            v-model="filterText"
            :placeholder="t('side_panel.tables_section.search_placeholder')"
            class="h-8 w-full pl-7 pr-4 text-xs"
          />
          <div
            v-if="filterText"
            class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2"
            @click="handleClearFilter"
          >
            <X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </div>
        </div>
        <Button
          variant="secondary"
          class="h-8 p-2 text-xs"
          @click="handleCreateTable"
        >
          <Table class="h-4" />
          {{ t('side_panel.tables_section.add_table') }}
        </Button>
      </div>
    </div>
    <div class="flex flex-1 flex-col overflow-hidden">
      <TableDBML 
        v-if="showDBML" 
        :filtered-tables="filteredTables" 
      />
      <ScrollArea v-else class="h-full">
        <div v-if="tables.length === 0" class="mt-20">
          <EmptyState
            :title="t('side_panel.tables_section.empty_state.title')"
            :description="t('side_panel.tables_section.empty_state.description')"
            class="mt-20"
          />
        </div>
        <div 
          v-else-if="filterText && filteredTables.length === 0" 
          class="mt-10 flex flex-col items-center gap-2"
        >
          <div class="text-sm text-muted-foreground">
            {{ t('side_panel.tables_section.no_results') }}
          </div>
          <Button
            variant="outline"
            size="sm"
            @click="handleClearFilter"
            class="gap-1"
          >
            <X class="size-3.5" />
            {{ t('side_panel.tables_section.clear') }}
          </Button>
        </div>
        <TableList 
          v-else 
          :tables="filteredTables" 
        />
      </ScrollArea>
    </div>
  </section>
</template>