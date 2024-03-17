import { Assets, type AssetsManifest, Spritesheet, Texture, extensions } from 'pixi.js';
import type { InjectionKey } from 'vue';

export type SpritesheetWithAnimations = Spritesheet & {
  animations: Record<string, Texture[]>;
};
export type AssetsContext = {
  loaded: Ref<boolean>;
  getSpritesheet(key: string, falback?: string): SpritesheetWithAnimations;
  getTexture(key: string): Texture;
  getHitbox(key: string): any;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  const loaded = ref(false);
  const load = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser);

    Assets.cache.reset();
    const manifest = await $fetch<AssetsManifest>('/assets/assets-manifest.json');
    Assets.init({ manifest });

    await Promise.all([
      Assets.loadBundle('tiles'),
      Assets.loadBundle('ui'),
      Assets.loadBundle('units'),
      Assets.loadBundle('tilesets'),
      Assets.loadBundle('interactables'),
      Assets.loadBundle('fx'),
      Assets.loadBundle('hitboxes')
    ]);
    loaded.value = true;
  };

  const api: AssetsContext = {
    loaded,
    load,
    getSpritesheet(key: string) {
      return Assets.get<SpritesheetWithAnimations>(key);
    },
    getTexture(key: string) {
      return Assets.get<Texture>(key);
    },
    getHitbox(key) {
      return Assets.get<any>(`hitbox-${key}`);
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
