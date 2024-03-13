import type { Cell, Entity, EntityId, GameSession } from '@game/sdk';
import type { Nullable, Point3D, Values } from '@game/shared';
import { match } from 'ts-pattern';
import type { InjectionKey } from 'vue';

export const TARGETING_MODES = {
  NONE: 'NONE',
  MOVE: 'MOVE',
  ATTACK: 'ATTACK',
  SKILL: 'SKILL'
} as const;

type TargetingMode = Values<typeof TARGETING_MODES>;

export type GameUiContext = {
  hoveredCell: ComputedRef<Nullable<Cell>>;
  hoveredEntity: ComputedRef<Nullable<Entity>>;
  selectedEntity: ComputedRef<Nullable<Entity>>;
  targetingMode: Ref<TargetingMode>;
  hoverAt(point: Point3D): void;
  unhover(): void;
  select(id: EntityId): void;
  unselect(): void;
  switchTargetingMode(mode: TargetingMode): void;
};

const GAME_UI_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const hoveredPosition = ref<Nullable<Point3D>>(null);
  const selectedEntityId = ref<Nullable<EntityId>>(null);
  const targetingMode = ref<TargetingMode>(TARGETING_MODES.NONE);

  const api: GameUiContext = {
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
    selectedEntity: computed(() => {
      if (!selectedEntityId.value) return;
      return session.entitySystem.getEntityById(selectedEntityId.value);
    }),
    select(id) {
      selectedEntityId.value = id;
    },
    unselect() {
      selectedEntityId.value = null;
    },
    switchTargetingMode(mode) {
      match(mode)
        .with(TARGETING_MODES.ATTACK, TARGETING_MODES.SKILL, TARGETING_MODES.MOVE, () => {
          if (!selectedEntityId.value) {
            throw new Error('cannot switch targeting mode without a selectedEntity.');
          }
          targetingMode.value = mode;
        })
        .with(TARGETING_MODES.NONE, () => {
          targetingMode.value = mode;
        })
        .exhaustive();
    },
    targetingMode
  };
  provide(GAME_UI_INJECTION_KEY, api);

  return api;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
