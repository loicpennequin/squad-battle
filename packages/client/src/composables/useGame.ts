import type { Values, UnionToIntersection, Point3D } from '@game/shared';
import type { GameSession, GameState } from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUiContext } from './useGameUi';
import type { PathfindingContext } from './usePathfinding';
import type { FxContext } from './useFx';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export type GameEmits = {
  move: [Point3D];
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
  dispatch: ShortEmits<GameEmits>;
  fx: FxContext;
};

// sendInput: (type, payload?) => {
//       if (!toValue(isActivePlayer) && type !== 'surrender') return;
//       // @ts-expect-error
//       emit(type, payload);
//       context.ui.targetMode.value = null;
//       context.ui.selectedSkill.value = null;
//       context.ui.selectedSummon.value = null;
//       context.ui.summonSpawnPoint.value = null;
//       context.ui.summonTargets.value.clear();
//       context.ui.skillTargets.value.clear();
//     }

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = (session: GameSession, emit: ShortEmits<GameEmits>) => {
  const ui = useGameUiProvider(session);
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();
  const pathfinding = usePathfindingProvider(session);
  const fx = useFX();

  const state = ref(session.getState()) as Ref<GameState>;
  fx.provideState(state);

  const dispatch: ShortEmits<GameEmits> = (type, payload) => {
    emit(type, payload);
  };

  watch(
    () => state.value.activeEntity.id,
    () => {
      ui.unselect();
    }
  );

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

  const ctx: GameContext = {
    camera,
    assets,
    session,
    state,
    ui,
    pathfinding,
    dispatch,
    fx
  };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
