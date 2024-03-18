import type { Values, UnionToIntersection, Point3D } from '@game/shared';
import type { EntityId, GameSession, GameState, PlayerId, SkillId } from '@game/sdk';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';
import type { GameUiContext } from './useGameUi';
import type { PathfindingContext } from './usePathfinding';
import type { FxContext } from './useFx';
import type { CharacterBlueprintId } from '@game/sdk/src/entity/character-blueprint';

type ShortEmits<T extends Record<string, any>> = UnionToIntersection<
  Values<{
    [K in keyof T]: (evt: K, ...args: T[K]) => void;
  }>
>;

export const GAME_TYPES = {
  PVP: 'pvp',
  SANDBOX: 'sandbox'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameEmits = {
  move: [Point3D];
  attack: [{ targetId: EntityId }];
  endTurn: [];
  useSkill: [{ skillId: SkillId; targets: Point3D[] }];
  deploy: [
    { characters: Array<{ position: Point3D; characterId: CharacterBlueprintId }> }
  ];
  // surrender: [];
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
  gameType: GameType;
  playerId: PlayerId | null;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = ({
  session,
  emit,
  playerId,
  gameType
}: {
  session: GameSession;
  emit: ShortEmits<GameEmits>;
  playerId: PlayerId | null;
  gameType: GameType;
}) => {
  const ui = useGameUiProvider(session, emit);
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();
  const pathfinding = usePathfindingProvider(session);
  const fx = useFX();

  const state = ref(session.getState()) as Ref<GameState>;
  fx.provideState(state);
  fx.provideSession(session);
  fx.provideUi(ui);

  session.on('game:action', () => {
    state.value = session.getState();
  });

  onUnmounted(() => {
    session.removeAllListeners();
  });

  const ctx: GameContext = {
    playerId,
    gameType,
    camera,
    assets,
    session,
    state,
    ui,
    pathfinding,
    dispatch: emit,
    fx
  };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
