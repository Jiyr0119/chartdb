<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent } from '@/components/card'
import { ZoomIn, ZoomOut, Funnel, Redo, Undo, Scan } from 'lucide-vue-next'
import { Separator } from '@/components/separator'
import ToolbarButton from './ToolbarButton.vue'
import { useHistory } from '@/composables/useHistory'
import { useVueFlow } from '@vue-flow/core'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/tooltip'
import { useTranslation } from 'vue-i18n'
import { Button } from '@/components/button'
import { keyboardShortcutsForOS } from '@/context/keyboard-shortcuts-context/keyboard-shortcuts'
import { KeyboardShortcutAction } from '@/context/keyboard-shortcuts-context/keyboard-shortcuts'
import { useCanvas } from '@/composables/useCanvas'
import { cn } from '@/lib/utils'
import { useDiagramFilter } from '@/context/diagram-filter-context/use-diagram-filter' // TODO: 实现Vue版本

interface Props {
  readonly?: boolean
}

const props = defineProps<Props>()

// TODO: 实现useTranslation
const t = (key: string) => key

const { redo, undo, hasRedo, hasUndo } = useHistory()
const { getZoom, zoomIn, zoomOut, fitView } = useVueFlow()
const zoom = ref<string>('100%')
const { setShowFilter } = useCanvas()
// TODO: 实现useDiagramFilter
const hasActiveFilter = ref(false)

const toggleFilter = () => {
  setShowFilter(!hasActiveFilter.value)
}

// 监听视口变化
// TODO: 实现useOnViewportChange的Vue版本

const updateZoom = () => {
  const currentZoom = getZoom()
  zoom.value = `${Math.round(currentZoom * 100)}%`
}

const zoomDuration = 200
const zoomInHandler = () => {
  zoomIn({ duration: zoomDuration })
  updateZoom()
}

const zoomOutHandler = () => {
  zoomOut({ duration: zoomDuration })
  updateZoom()
}

const resetZoom = () => {
  fitView({
    minZoom: 1,
    maxZoom: 1,
    duration: zoomDuration,
  })
  updateZoom()
}

const showAll = () => {
  fitView({
    duration: 500,
    padding: 0.1,
    maxZoom: 0.8,
  })
}

// 组件挂载时初始化zoom
onMounted(() => {
  updateZoom()
})
</script>

<template>
  <div class="px-1">
    <Card class="h-[44px] bg-secondary p-0 shadow-none">
      <CardContent class="flex h-full flex-row items-center p-1">
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton
                @click="toggleFilter"
                :class="cn(
                  'transition-all duration-200',
                  {
                    'bg-pink-500 text-white hover:bg-pink-600 hover:text-white':
                      hasActiveFilter,
                  }
                )"
              >
                <Funnel />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {{ t('toolbar.filter') }}
            <span class="ml-2 text-muted-foreground">
              {{
                keyboardShortcutsForOS[
                  KeyboardShortcutAction.TOGGLE_FILTER
                ].keyCombinationLabel
              }}
            </span>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" />
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton @click="showAll">
                <Scan />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {{ t('toolbar.show_all') }}
            <span class="ml-2 text-muted-foreground">
              {{
                keyboardShortcutsForOS[
                  KeyboardShortcutAction.SHOW_ALL
                ].keyCombinationLabel
              }}
            </span>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" />
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton @click="zoomOutHandler">
                <ZoomOut />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>{{ t('toolbar.zoom_out') }}</TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          @click="resetZoom"
          class="w-[60px] p-2 hover:bg-primary-foreground"
        >
          {{ zoom }}
        </Button>
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton @click="zoomInHandler">
                <ZoomIn />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>{{ t('toolbar.zoom_in') }}</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" />
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton
                @click="undo"
                :disabled="!hasUndo"
              >
                <Undo />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {{ t('toolbar.undo') }}
            <span class="ml-2 text-muted-foreground">
              {{
                keyboardShortcutsForOS[
                  KeyboardShortcutAction.UNDO
                ].keyCombinationLabel
              }}
            </span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <span>
              <ToolbarButton
                @click="redo"
                :disabled="!hasRedo"
              >
                <Redo />
              </ToolbarButton>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {{ t('toolbar.redo') }}
            <span class="ml-2 text-muted-foreground">
              {{
                keyboardShortcutsForOS[
                  KeyboardShortcutAction.REDO
                ].keyCombinationLabel
              }}
            </span>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  </div>
</template>