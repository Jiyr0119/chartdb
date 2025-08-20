<script setup lang="ts">
import { randomColor } from '@/lib/colors'
import {
  databaseSecondaryLogoMap,
  databaseTypeToLabelMap,
} from '@/lib/databases'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { useTheme } from '@/composables/useTheme'
import type { Template } from '@/templates-data/templates-data'
import { Badge } from '@/components/badge'

interface Props {
  template: Template
}

const props = defineProps<Props>()

const { effectiveTheme } = useTheme()
</script>

<template>
  <router-link :to="`/templates/${template.slug}`">
    <div class="flex h-80 w-full cursor-pointer flex-col rounded-lg border-2 border-slate-500 bg-slate-50 shadow-sm transition duration-300 ease-in-out hover:scale-[102%] hover:border-pink-600 dark:border-slate-700 dark:bg-slate-950">
      <div
        class="h-2 rounded-t-[6px]"
        :style="{ backgroundColor: randomColor() }"
      ></div>
      <div class="overflow-hidden p-1">
        <img
          :src="effectiveTheme === 'dark' ? template.imageDark : template.image"
          :alt="template.name"
          class="size-full rounded object-fill"
        />
      </div>
      <div class="mt-2 flex items-center justify-between px-2">
        <div class="flex items-center gap-1">
          <h3 class="cursor-pointer text-base font-semibold">
            {{ template.name }}
          </h3>
        </div>
        <div class="flex h-full flex-col justify-start pt-1">
          <Tooltip>
            <TooltipTrigger class="mr-1">
              <img
                :src="databaseSecondaryLogoMap[template.diagram.databaseType]"
                class="h-5 max-w-fit"
                alt="database"
              />
            </TooltipTrigger>
            <TooltipContent>
              {{ databaseTypeToLabelMap[template.diagram.databaseType] }}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div class="flex p-2 text-sm">
        {{ template.shortDescription }}
      </div>
      <div class="flex flex-wrap gap-1 p-2">
        <Badge
          v-for="tag in template.tags"
          :key="`${template.slug}_${tag}`"
          variant="outline"
        >
          {{ tag }}
        </Badge>
      </div>
    </div>
  </router-link>
</template>