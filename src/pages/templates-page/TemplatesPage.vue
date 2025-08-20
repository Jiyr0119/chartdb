<script setup lang="ts">
import ChartDBLogo from '@/assets/logo-light.png'
import ChartDBDarkLogo from '@/assets/logo-dark.png'
import { useTheme } from '@/composables/useTheme'
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider'
import { ThemeProvider } from '@/context/theme-context/theme-provider'
import { Component, Star } from 'lucide-vue-next'
import { ListMenu } from '@/components/list-menu'
import TemplateCard from './template-card/TemplateCard.vue'
import { useRoute } from 'vue-router'
import type { Template } from '@/templates-data/templates-data'
import { Spinner } from '@/components/spinner'
import { ref, computed, onMounted } from 'vue'

// TODO: 实现模板数据加载
const templates = ref<Template[] | undefined>(undefined)
const allTags = ref<string[] | undefined>(undefined)

const route = useRoute()
const { effectiveTheme } = useTheme()

// TODO: 实现路由匹配逻辑
const isFeatured = computed(() => route.name === 'templates_featured')
const isAllTemplates = computed(() => route.name === 'templates')

// TODO: 实现标签参数解析
const tagParam = computed(() => route.params.tag as string | undefined)
const tag = computed(() => {
  if (!allTags.value || !tagParam.value) return undefined
  return allTags.value.find(
    (currentTag) =>
      tagParam.value?.toLowerCase().replace(/-/g, ' ') ===
      currentTag.toLowerCase()
  )
})

// TODO: 实现模板数据加载
onMounted(async () => {
  // 模拟数据加载
  setTimeout(() => {
    // 这里应该从API或store中获取数据
    templates.value = [] // 替换为实际的模板数据
    allTags.value = [] // 替换为实际的标签数据
  }, 1000)
})
</script>

<template>
  <LocalConfigProvider>
    <ThemeProvider>
      <section class="flex w-screen flex-col bg-background">
        <nav class="flex h-12 shrink-0 flex-row items-center justify-between border-b px-4">
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
          <div class="flex flex-1 justify-end">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=chartdb&repo=chartdb&type=star&size=large&text=false"
              width="40"
              height="30"
              title="GitHub"
            ></iframe>
          </div>
        </nav>
        <div class="flex flex-col p-3 text-center md:px-28 md:text-left">
          <h1 class="font-primary text-2xl font-bold">
            <template v-if="isFeatured">
              Featured database schema templates
            </template>
            <template v-else-if="tag">
              Database schema templates for {{ tag }}
            </template>
            <template v-else>
              Database schema templates
            </template>
          </h1>
          <h2 class="mt-1 font-primary text-base text-muted-foreground">
            Discover a collection of real-world database schema diagrams
            <template v-if="tag">
              for <span class="font-semibold">{{ tag }}</span>
            </template>
            , featuring example applications and popular open-source projects.
          </h2>
          <div v-if="!templates" class="mt-20 flex justify-center">
            <Spinner size="lg" class="text-pink-600" />
          </div>
          <div v-else class="mt-6 flex w-full flex-col-reverse gap-4 md:flex-row">
            <div class="relative top-0 flex h-fit w-full shrink-0 flex-col md:sticky md:top-1 md:w-44">
              <ListMenu
                :items="[
                  {
                    title: 'Featured',
                    href: '/templates/featured',
                    icon: Star,
                    selected: isFeatured,
                  },
                  {
                    title: 'All Templates',
                    href: '/templates',
                    icon: Component,
                    selected: isAllTemplates,
                  },
                ]"
              />

              <h4 class="mt-4 text-left text-sm font-semibold">
                Tags
              </h4>
              <ListMenu
                v-if="allTags"
                class="mt-1 shrink-0"
                :items="allTags.map((currentTag) => ({
                  title: currentTag,
                  href: `/templates/tags/${currentTag.toLowerCase().replace(/ /g, '-')}`,
                  selected: tag === currentTag,
                }))"
              />
            </div>
            <div class="grid flex-1 grid-flow-row grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
              <TemplateCard
                v-for="template in templates"
                :key="template.slug"
                :template="template"
              />
            </div>
          </div>
        </div>
      </section>
    </ThemeProvider>
  </LocalConfigProvider>
</template>