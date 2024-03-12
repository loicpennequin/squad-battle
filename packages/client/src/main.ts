import 'open-props/postcss/style';
import 'open-props/colors-hsl';
import '@/styles/global.css';
import { createApp } from 'vue';
import { enableCache, disableCache } from '@iconify/vue';
import { createConvexVue } from '@convex-vue/core';
import { createRouter, createWebHistory } from 'vue-router/auto';

import App from './App.vue';

enableCache('session');
disableCache('local');

const router = createRouter({
  history: createWebHistory()
});
createApp(App)
  .use(router)
  .use(
    createConvexVue({
      convexUrl: import.meta.env.VITE_CONVEX_URL
    })
  )
  .mount('#app');
