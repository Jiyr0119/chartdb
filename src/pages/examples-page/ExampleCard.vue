<script setup lang="ts">
import type { Example } from '@/pages/examples-page/examples-data/examples-data'
import { randomColor } from '@/lib/colors'
import { Import } from 'lucide-vue-next'
import { Label } from '@/components/label'
import { Button } from '@/components/button'
import {
  databaseSecondaryLogoMap,
  databaseTypeToLabelMap,
} from '@/lib/databases'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip'
import { useTheme } from '@/composables/useTheme'
import { Spinner } from '@/components/spinner'
import { ref } from 'vue'

interface Props {
  example: Example
  loading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'utilize'): void
}>()

const { effectiveTheme } = useTheme()
const color = ref(randomColor())
</script>

<template>
  <div
    @click="emit('utilize')"
    class="flex h-96 w-full cursor-pointer flex-col rounded-xl border-2 border-slate-500 bg-slate-50 shadow-sm transition duration-300 ease-in-out hover:scale-[102%] hover:border-pink-600 dark:border-slate-700 dark:bg-slate-950"
  >
    <div
      class="h-4 rounded-t-[10px]"
      :style="{ backgroundColor: color }"
    ></div>
    <div class="flex h-12 items-center justify-between bg-slate-200 px-2 dark:bg-slate-900">
      <div class="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger class="mr-1">
            <img
              :src="databaseSecondaryLogoMap[example.diagram.databaseType]"
              class="h-5 max-w-fit"
              alt="database"
            />
          </TooltipTrigger>
          <TooltipContent>
            {{ databaseTypeToLabelMap[example.diagram.databaseType] }}
          </TooltipContent>
        </Tooltip>
        <Label class="cursor-pointer text-base font-bold">
          {{ example.name }}
        </Label>
      </div>
      <div class="flex flex-row">
        <Spinner v-if="loading" class="size-5" />
        <Button
          v-else
          variant="ghost"
          class="size-9 p-0 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Import class="size-5" />
        </Button>
      </div>
    </div>
    <div class="grow overflow-hidden">
      <img
        :src="effectiveTheme === 'dark' ? example.imageDark : example.image"
        :alt="example.name"
        class="w-fit object-cover"
      />
    </div>
    <div class="flex p-2 text-base">{{ example.description }}</div>
  </div>
</template>