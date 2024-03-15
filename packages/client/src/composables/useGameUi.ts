import type { Cell, Entity, EntityId, GameSession } from '@game/sdk';
import type { Nullable, Point3D, Values } from '@game/shared';
import type { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { match } from 'ts-pattern';
import type { InjectionKey } from 'vue';

export const TARGETING_MODES = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  SKILL: 'SKILL'
} as const;

type TargetingMode = Values<typeof TARGETING_MODES>;
type LayerName = 'ui' | 'scene';

export type GameUiContext = {
  hoveredCell: ComputedRef<Nullable<Cell>>;
  hoveredEntity: ComputedRef<Nullable<Entity>>;
  targetingMode: Ref<TargetingMode>;
  hoverAt(point: Point3D): void;
  unhover(): void;
  switchTargetingMode(mode: TargetingMode): void;
  registerLayer(layer: Layer, name: LayerName): void;
  assignLayer(obj: Nullable<DisplayObject>, layer: LayerName): void;
};

const GAME_UI_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const hoveredPosition = ref<Nullable<Point3D>>(null);
  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref()
  };
  session.on('entity:turn-ended', () => {
    api.switchTargetingMode(TARGETING_MODES.NONE);
  });

  const api: GameUiContext = {
    registerLayer(layer, name) {
      if (!layer) return;
      layers[name].value = layer;
      layer.group.enableSort = true;
      layer.sortableChildren = true;
    },
    assignLayer(obj, name) {
      if (!isDefined(obj)) return;
      obj.parentLayer = layers[name].value;
    },
    hoveredEntity: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.entitySystem.getEntityAt(hoveredPosition.value);
    }),
    hoveredCell: computed(() => {
      if (!hoveredPosition.value) return null;
      return session.map.getCellAt(hoveredPosition.value);
    }),
    hoverAt(point) {
      hoveredPosition.value = point;
    },
    unhover() {
      hoveredPosition.value = null;
    },
    switchTargetingMode(mode) {
      targetingMode.value = mode;
    },
    targetingMode
  };
  provide(GAME_UI_INJECTION_KEY, api);

  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
