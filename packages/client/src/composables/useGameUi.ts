import type { Cell, Entity, GameSession, Skill } from '@game/sdk';
import { Vec3, type Nullable, type Point3D, type Values } from '@game/shared';
import type { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { match } from 'ts-pattern';
import type { InjectionKey } from 'vue';
import type { GameContext } from './useGame';

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
  toggleSkillTarget(point: Point3D): void;
  unselectSkill(): void;
  switchTargetingMode(mode: TargetingMode): void;
  registerLayer(layer: Layer, name: LayerName): void;
  assignLayer(obj: Nullable<DisplayObject>, layer: LayerName): void;
};

const GAME_UI_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (
  session: GameSession,
  dispatch: GameContext['dispatch']
) => {
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
          selectedSkill.value = null;
          targetingMode.value = mode;
        })
        .with(TARGETING_MODES.BASIC, () => {
          selectedSkill.value = null;
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
    toggleSkillTarget(point) {
      const idx = skillTargets.value.findIndex(pt => Vec3.fromPoint3D(pt).equals(point));
      if (idx === -1) {
        skillTargets.value.push(point);
      } else {
        skillTargets.value.splice(idx, 1);
      }
      if (skillTargets.value.length === selectedSkill.value?.maxTargets) {
        dispatch('useSkill', {
          skillId: selectedSkill.value.id,
          targets: skillTargets.value
        });
        api.switchTargetingMode(TARGETING_MODES.BASIC);
      }
    },
    skillTargets,
    targetingMode,
    selectedSkill
  };
  provide(GAME_UI_INJECTION_KEY, api);

  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
