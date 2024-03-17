import type { Cell, Entity, GameSession, Skill } from '@game/sdk';
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
  selectedSkill: Ref<Nullable<Skill>>;
  targetingMode: Ref<TargetingMode>;
  skillTargets: Ref<Point3D[]>;
  hoverAt(point: Point3D): void;
  unhover(): void;
  selectSkill(skill: Skill): void;
  unselectSkill(): void;
  switchTargetingMode(mode: TargetingMode): void;
  registerLayer(layer: Layer, name: LayerName): void;
  assignLayer(obj: Nullable<DisplayObject>, layer: LayerName): void;
};

const GAME_UI_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const hoveredPosition = ref<Nullable<Point3D>>(null);
  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);
  const selectedSkill = ref<Nullable<Skill>>();
  const skillTargets = ref<Point3D[]>([]);
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
      match(mode)
        .with(TARGETING_MODES.NONE, () => {
          targetingMode.value = mode;
        })
        .with(TARGETING_MODES.BASIC, () => {
          targetingMode.value = mode;
        })
        .with(TARGETING_MODES.SKILL, () => {
          targetingMode.value = mode;
          skillTargets.value = [];
        })
        .exhaustive();
    },
    selectSkill(skill) {
      selectedSkill.value = skill;
      api.switchTargetingMode(TARGETING_MODES.SKILL);
      skillTargets.value = [];
    },
    unselectSkill() {
      selectedSkill.value = null;
      api.switchTargetingMode(TARGETING_MODES.NONE);
      skillTargets.value = [];
    },
    skillTargets,
    targetingMode,
    selectedSkill
  };
  provide(GAME_UI_INJECTION_KEY, api);

  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
