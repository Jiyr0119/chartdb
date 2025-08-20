<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select'
import { TablesSection } from './tables-section/TablesSection.vue'
import { RelationshipsSection } from './relationships-section/RelationshipsSection.vue'
import { useLayout } from '@/composables/useLayout'
import type { SidebarSection } from '@/context/layout-context/layout-context'
import { useTranslation } from 'vue-i18n'
import { useChartdb } from '@/composables/useChartdb'
import { DependenciesSection } from './dependencies-section/DependenciesSection.vue'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { AreasSection } from './areas-section/AreasSection.vue'
import { CustomTypesSection } from './custom-types-section/CustomTypesSection.vue'
import { DatabaseType } from '@/lib/domain/database-type'
import { ref } from 'vue'

interface SidePanelProps {}

const props = defineProps<SidePanelProps>()

const { t } = useTranslation()
const { databaseType } = useChartdb()
const { selectSidebarSection, selectedSidebarSection } = useLayout()
const { isMd: isDesktop } = useBreakpoint()

const handleSectionChange = (value: string) => {
  selectSidebarSection(value as SidebarSection)
}
</script>

<template>
  <aside class="flex h-full flex-col overflow-hidden">
    <div v-if="!isDesktop" class="flex justify-center border-b pt-0.5">
      <Select
        :model-value="selectedSidebarSection"
        @update:model-value="handleSectionChange"
      >
        <SelectTrigger class="rounded-none border-none font-semibold shadow-none hover:bg-secondary hover:underline focus:border-transparent focus:ring-0">
          <SelectValue />
          <div class="flex flex-1 justify-end px-2 text-xs font-normal text-muted-foreground">
            {{ t('side_panel.view_all_options') }}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="tables">
              {{ t('side_panel.tables_section.tables') }}
            </SelectItem>
            <SelectItem value="relationships">
              {{ t('side_panel.relationships_section.relationships') }}
            </SelectItem>
            <SelectItem value="dependencies">
              {{ t('side_panel.dependencies_section.dependencies') }}
            </SelectItem>
            <SelectItem value="areas">
              {{ t('side_panel.areas_section.areas') }}
            </SelectItem>
            <SelectItem 
              v-if="databaseType === DatabaseType.POSTGRESQL" 
              value="customTypes"
            >
              {{ t('side_panel.custom_types_section.custom_types') }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    
    <component 
      :is="selectedSidebarSection === 'tables' ? TablesSection :
           selectedSidebarSection === 'relationships' ? RelationshipsSection :
           selectedSidebarSection === 'dependencies' ? DependenciesSection :
           selectedSidebarSection === 'areas' ? AreasSection :
           CustomTypesSection"
    />
  </aside>
</template>