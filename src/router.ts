import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import type { TemplatePageLoaderData } from './pages/template-page/template-page';
import type { TemplatesPageLoaderData } from './pages/templates-page/templates-page';
import { getTemplatesAndAllTags } from './templates-data/template-utils';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('./pages/editor-page/EditorPage.vue'),
    },
    {
        path: '/diagrams/:diagramId',
        component: () => import('./pages/editor-page/EditorPage.vue'),
    },
    {
        path: '/examples',
        component: () => import('./pages/examples-page/ExamplesPage.vue'),
    },
    {
        path: '/templates',
        component: () => import('./pages/templates-page/TemplatesPage.vue'),
        beforeEnter: async (to, from, next) => {
            try {
                const { tags, templates } = await getTemplatesAndAllTags();
                to.meta.loaderData = {
                    allTags: tags,
                    templates,
                } as TemplatesPageLoaderData;
                next();
            } catch (error) {
                console.error('Failed to load templates data:', error);
                next(false);
            }
        },
    },
    {
        path: '/templates/featured',
        component: () => import('./pages/templates-page/TemplatesPage.vue'),
        beforeEnter: async (to, from, next) => {
            try {
                const { tags, templates } = await getTemplatesAndAllTags({
                    featured: true,
                });
                to.meta.loaderData = {
                    allTags: tags,
                    templates,
                } as TemplatesPageLoaderData;
                next();
            } catch (error) {
                console.error('Failed to load templates data:', error);
                next(false);
            }
        },
    },
    {
        path: '/templates/tags/:tag',
        component: () => import('./pages/templates-page/TemplatesPage.vue'),
        beforeEnter: async (to, from, next) => {
            try {
                const { tags, templates } = await getTemplatesAndAllTags({
                    tag: to.params.tag?.toString().replace(/-/g, ' '),
                });
                to.meta.loaderData = {
                    allTags: tags,
                    templates,
                } as TemplatesPageLoaderData;
                next();
            } catch (error) {
                console.error('Failed to load templates data:', error);
                next(false);
            }
        },
    },
    {
        path: '/templates/:templateSlug',
        component: () => import('./pages/template-page/TemplatePage.vue'),
        beforeEnter: async (to, from, next) => {
            try {
                const { templates } = await import('./templates-data/templates-data');
                const template = templates.find(
                    (template) => template.slug === to.params.templateSlug
                );
                to.meta.loaderData = {
                    template,
                } as TemplatePageLoaderData;
                next();
            } catch (error) {
                console.error('Failed to load template data:', error);
                next(false);
            }
        },
    },
    {
        path: '/templates/clone/:templateSlug',
        component: () => import('./pages/clone-template-page/CloneTemplatePage.vue'),
        beforeEnter: async (to, from, next) => {
            try {
                const { templates } = await import('./templates-data/templates-data');
                const template = templates.find(
                    (template) => template.slug === to.params.templateSlug
                );
                to.meta.loaderData = {
                    template,
                };
                next();
            } catch (error) {
                console.error('Failed to load template data:', error);
                next(false);
            }
        },
    },
    {
        path: '/:pathMatch(.*)*',
        component: () => import('./pages/not-found-page/NotFoundPage.vue'),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
