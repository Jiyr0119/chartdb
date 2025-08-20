<script setup lang="ts">
import ChartDBLogo from '@/assets/logo-light.png'
import ChartDBDarkLogo from '@/assets/logo-dark.png'
import type { Example } from './examples-data/examples-data'
import { examples } from './examples-data/examples-data'
import ExampleCard from './ExampleCard.vue'
import { useTheme } from '@/composables/useTheme'
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider'
import { StorageProvider } from '@/context/storage-context/storage-provider'
import { ThemeProvider } from '@/context/theme-context/theme-provider'
import { useStorage } from '@/composables/useStorage'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Diagram } from '@/lib/domain/diagram'

const { effectiveTheme } = useTheme()
const router = useRouter()
const { addDiagram, deleteDiagram } = useStorage()
const loadingExampleId = ref<string | null>(null)

const utilizeExample = async (example: Example) => {
  if (loadingExampleId.value) {
    return
  }
  
  loadingExampleId.value = example.id
  const { diagram } = example
  const { id } = diagram

  try {
    await deleteDiagram(id)

    const now = new Date()
    const diagramToAdd: Diagram = {
      ...diagram,
      createdAt: now,
      updatedAt: now,
    }

    await addDiagram({ diagram: diagramToAdd })
    router.push(`/diagrams/${id}`)
  } catch (error) {
    console.error('Error utilizing example:', error)
    loadingExampleId.value = null
  }
}
</script>

<template>
  <LocalConfigProvider>
    <StorageProvider>
      <ThemeProvider>
        <section class="flex w-screen flex-col bg-background">
          <nav class="flex h-12 flex-row items-center justify-between border-b px-4">
            <div class="flex flex-1 justify-start gap-x-3">
              <div class="flex items-center font-primary">
                <a
                  href="https://chartdb.io"
                  class="cursor-pointer"
                  rel="noreferrer"
                >
                  <img
                    :src="effectiveTheme === 'light' ? ChartDBLogo : ChartDBDarkLogo"
                    alt="chartDB"
                    class="h-4 max-w-fit"
                  />
                </a>
              </div>
            </div>
            <div class="group flex flex-1 flex-row items-center justify-center"></div>
            <div class="hidden flex-1 justify-end sm:flex"></div>
          </nav>
          <div class="flex flex-col px-3 pt-3 text-center md:px-28 md:text-left">
            <h1 class="font-primary text-2xl font-bold">
              Examples
            </h1>
            <h2 class="mt-1 font-primary text-base text-muted-foreground">
              A collection of examples to help you get started with
              ChartDB.
            </h2>
            <h2 class="mt-1 text-base font-semibold">
              Click on one 😀
            </h2>
            <div class="mt-6 grid grid-flow-row grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ExampleCard
                v-for="example in examples"
                :key="example.id"
                :example="example"
                :loading="loadingExampleId === example.id"
                @utilize="utilizeExample(example)"
              />
            </div>
          </div>
        </section>
      </ThemeProvider>
    </StorageProvider>
  </LocalConfigProvider>
</template>