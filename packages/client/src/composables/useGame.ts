// import type { Values, UnionToIntersection } from '@game/shared';
import type { GameSession, GameState } from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUi, IGameUi } from '~/models/game-ui';
import { EntityViewModel } from '~/models/entity-view-model';
import type { Override } from '@game/shared';
import { MapCellViewModel } from '~/models/map-cell-view-model';

// type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
//   Values<{
//     [K in keyof T]: (evt: K, ...args: T[K]) => void;
//   }>
// >;

export type GameEmits = {
  // move: [Point3D & { entityId: EntityId }];
  // 'end-turn': [];
  // surrender: [];
  // 'use-skill': [{ entityId: number; skillId: SkillId; targets: Point3D[] }];
  // summon: [{ unitId: UnitId; position: Point3D; targets: Point3D[] }];
  // end: [{ winner: Player }];
};

export type State = Override<
  GameState,
  {
    entities: EntityViewModel[];
    activeEntity: EntityViewModel;
    map: Override<GameState['map'], { cells: MapCellViewModel[] }>;
  }
>;

export type GameContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  session: GameSession;
  state: Ref<State>;
  ui: Ref<IGameUi>;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();

  const getState = (): State => {
    const sessionState = session.getState();
    return {
      ...sessionState,
      entities: sessionState.entities.map(e => new EntityViewModel(e, session, ui.value)),
      activeEntity: new EntityViewModel(sessionState.activeEntity, session, ui.value),
      map: {
        ...sessionState.map,
        cells: sessionState.map.cells.map(
          cell => new MapCellViewModel(cell, session, ui.value, camera.value)
        )
      }
    };
  };
  const state = ref(getState()) as Ref<State>;

  session.on('game:action', () => {
    state.value = getState();

    // if (action.name === 'END_TURN') {
    //   context.ui.selectedEntity.value = null;
    //   context.ui.targetMode.value = null;
    // }
    // if (action.name === 'END_GAME') {
    //   emit('end', { winner: session.playerManager.getPlayerById(session.winner!)! });
    // }
  });

  onUnmounted(() => {
    session.removeAllListeners();
  });

  const ctx: GameContext = { camera, assets, session, state, ui };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
