import type { Entity, EntityId, GameSession } from '@game/sdk';
import type { DistanceMap } from '@game/sdk/src/map/pathfinding';
import type { Point3D } from '@game/shared';

export type PathfindingContext = {
  canMoveTo(entity: Entity, position: Point3D): boolean;
};

const PATHFINDING_INJECTION_KEY = Symbol(
  'pathfinding'
) as InjectionKey<PathfindingContext>;

export const usePathfindingProvider = (session: GameSession) => {
  const cache = new Map<EntityId, DistanceMap>();

  session.on('game:action', () => {
    cache.clear();
  });

  const api: PathfindingContext = {
    canMoveTo(entity, point) {
      if (!cache.has(entity.id)) {
        const dm = session.map.getDistanceMap(entity.position, entity.ap);
        cache.set(entity.id, dm);
      }
      const distanceMap = cache.get(entity.id)!;

      return entity.canMove(distanceMap.get(point));
    }
  };

  provide(PATHFINDING_INJECTION_KEY, api);

  return api;
};

export const usePathfinding = () => useSafeInject(PATHFINDING_INJECTION_KEY);
