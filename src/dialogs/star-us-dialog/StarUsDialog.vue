<script setup lang="ts">
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
import StarUs from '@/assets/star-us.gif'
import { ZoomableImage } from '@/components/zoomable-image/zoomable-image'
import { useTranslation } from 'vue-i18n'
import { useLocalConfig } from '@/composables/useLocalConfig'
import { useDialog } from '@/composables/useDialog'
import { onMounted } from 'vue'

interface StarUsDialogProps {
  open: boolean
}

const props = defineProps<StarUsDialogProps>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useTranslation()
const { setGithubRepoOpened } = useLocalConfig()
const { closeStarUsDialog } = useDialog()

const handleOpenChange = (open: boolean) => {
  if (!open) {
    closeStarUsDialog()
  }
  emit('update:open', open)
}

const handleConfirm = () => {
  setGithubRepoOpened(true)
  window.open('https://github.com/chartdb/chartdb', '_blank')
}

onMounted(() => {
  // 可以在这里添加任何需要在组件挂载时执行的逻辑
})
</script>

<template>
  <Dialog 
    :open="props.open"
    @update:open="handleOpenChange"
  >
    <DialogContent class="flex flex-col" show-close>
      <DialogHeader>
        <DialogTitle>{{ t('star_us_dialog.title') }}</DialogTitle>
        <DialogDescription>
          {{ t('star_us_dialog.description') }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex">
        <ZoomableImage :src="StarUs" />
      </div>
      
      <DialogFooter class="flex gap-1 md:justify-between">
        <DialogClose as-child>
          <Button variant="secondary">
            {{ t('star_us_dialog.close') }}
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button @click="handleConfirm">
            {{ t('star_us_dialog.confirm') }}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>