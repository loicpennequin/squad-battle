// import type { Values, UnionToIntersection } from '@game/shared';
import type { AssetsContext } from './useAssets';
import type { IsoCameraContext } from './useIsoCamera';

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
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<GameContext>;

export const useGameProvider = () => {
  const camera = useIsoCameraProvider();
  const assets = useAssetsProvider();

  const ctx: GameContext = { camera, assets };
  provide(GAME_INJECTION_KEY, ctx);

  return ctx;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
