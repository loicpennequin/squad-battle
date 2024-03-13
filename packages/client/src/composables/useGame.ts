// import type { Values, UnionToIntersection } from '@game/shared';
import type { GameSession, GameState } from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUiContext } from './useGameUi';
import type { PathfindingContext } from './usePathfinding';

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

export type GameContext = {
  camera: IsoCameraContext;
  assets: AssetsContext;
  session: GameSession;
  state: Ref<GameState>;
  ui: GameUiContext;
  pathfinding: PathfindingContext;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();
  const pathfinding = usePathfindingProvider(session);

  const state = ref(session.getState()) as Ref<GameState>;

  session.on('game:action', () => {
    state.value = session.getState();

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

  const ctx: GameContext = { camera, assets, session, state, ui, pathfinding };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
