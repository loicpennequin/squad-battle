import { isDefined } from '@game/shared';
import { type CellId } from './cell';
import {
  type Edge,
  type GraphAdapter,
  dijkstra,
  findShortestPath
} from '../utils/dijakstra';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { Vec3 } from '../utils/vector';
import { GameSession } from '../game-session';

export type DistanceMap = {
  costs: ReturnType<typeof dijkstra>['costs'];
  get: (point: Point3D) => number;
};

export class Pathfinder {
  private cache = new Map<CellId, Edge<CellId>[]>();

  constructor(
    private session: GameSession,
    private boundaries?: [Point3D, Point3D]
  ) {}

  private makeAdapter(origin: Point3D): GraphAdapter<CellId> {
    const originVec = Vec3.fromPoint3D(origin);

    return {
      getEdges: node => {
        if (!this.cache.has(node)) {
          const edges = [
            this.session.map.getDestination(node, 'north'),
            this.session.map.getDestination(node, 'south'),
            this.session.map.getDestination(node, 'west'),
            this.session.map.getDestination(node, 'east')
          ];
          this.cache.set(
            node,
            edges
              .filter(isDefined)
              .filter(point => {
                if (!this.session.entitySystem.getEntityAt(point)) return false;
                if (this.boundaries) {
                  return (
                    originVec.dist(point) <= originVec.dist(this.boundaries[0]) &&
                    originVec.dist(point) <= originVec.dist(this.boundaries[1])
                  );
                }
                return true;
              })
              .map(point => {
                return {
                  node: pointToCellId(point),
                  weight: 1
                };
              })
          );
        }

        return this.cache.get(node)!;
      }
    };
  }

  findPath(from: Point3D, to: Point3D) {
    return findShortestPath<CellId>(
      this.makeAdapter(from),
      pointToCellId(from),
      pointToCellId(to)
    );
  }

  getDistanceMap(from: Point3D): DistanceMap {
    const map = dijkstra(this.makeAdapter(from), pointToCellId(from));

    return {
      costs: map.costs,
      get(pt: Point3D) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }
}
