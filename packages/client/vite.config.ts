import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import VueRouter from 'unplugin-vue-router/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import { isCustomElement, transformAssetUrls } from 'vue3-pixi/compiler';
import UnoCSS from 'unocss/vite';

import glsl from 'vite-plugin-glsl';

const customElements = ['viewport', 'layer'];
const prefix = 'pixi-';

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: fileURLToPath(new URL('./src/pages', import.meta.url)),
      dts: './typed-router.d.ts'
    }),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement(name) {
            let normalizedName = name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
            if (normalizedName.startsWith('-')) normalizedName = normalizedName.slice(1);

            const isPixiElement = customElements.includes(normalizedName);
            const isPrefixElement =
              normalizedName.startsWith(prefix) &&
              customElements.includes(normalizedName.slice(prefix.length));

            return isCustomElement(name) || isPixiElement || isPrefixElement;
          }
        },
        transformAssetUrls
      }
    }),
    glsl(),
    UnoCSS(),
    AutoImport({
      dirs: ['./src/**/composables', './src/**/composables/**', './src/utils'],
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          '@tanstack/vue-query': [
            'useQuery',
            'useQueries',
            'useMutation',
            'useInfiniteQuery',
            'useQueryClient'
          ]
        }
      ]
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
