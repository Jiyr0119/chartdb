import { createApp } from 'vue';
import './index.css';
import './globals.css';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import { i18n } from './i18n/vue-i18n';

const app = createApp(App);

// 创建Pinia状态管理
const pinia = createPinia();
app.use(pinia);

// 使用i18n
app.use(i18n);

// 使用router
app.use(router);

app.mount('#root');
