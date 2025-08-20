<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover'
import { colorOptions } from '@/lib/colors'
import { cn } from '@/lib/utils'

interface Props {
  color: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:color', color: string): void
}>()

// 处理颜色变化
const handleColorChange = (color: string) => {
  emit('update:color', color)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <div
        :class="cn('h-6 w-8 cursor-pointer rounded-md border-2 border-muted transition-shadow hover:shadow-md')"
        :style="{ backgroundColor: props.color }"
      />
    </PopoverTrigger>
    <PopoverContent class="w-fit">
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="option in colorOptions"
          :key="option"
          :class="cn('size-8 cursor-pointer rounded-md border-2 border-muted transition-shadow hover:shadow-md')"
          :style="{ backgroundColor: option }"
          @click="handleColorChange(option)"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>