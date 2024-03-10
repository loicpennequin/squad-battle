import { Vec3, isDefined, isString } from '@game/shared';
import type { Point3D } from '../types';
import { Cell, type CellId, type SerializedCell } from './cell';
import { cellIdToPoint } from '../utils/helpers';
import type { GameSession } from '../game-session';
import { DIRECTIONS_TO_DIFF, type Direction } from './map-utils';
import { Pathfinder } from './pathfinding';
import type { AnyEntity } from '../core/entity';

export type GameMapOptions = {
  cells: SerializedCell[];
  height: number;
  width: number;
};

export class GameMap {
  height!: number;

  width!: number;

  cells: Cell[] = [];

  cellsMap = new Map<CellId, Cell>();

  constructor(private session: GameSession) {}

  setup(definition: GameMapOptions) {
    this.height = definition.height;
    this.width = definition.width;
    this.cells = this.makeCells(definition.cells);
    this.cells.forEach(cell => {
      this.cellsMap.set(cell.id, cell);
    });
  }

  private makeCells(cells: GameMapOptions['cells']) {
    return cells.map(cell => {
      return new Cell(cell);
    });
  }

  serialize(): GameMapOptions {
    return {
      width: this.width,
      height: this.height,
      cells: this.cells.map(cell => cell.serialize())
    };
  }

  getCellAt(posOrKey: CellId | Point3D) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }

    return this.cellsMap.get(`${posOrKey.x}:${posOrKey.y}:${posOrKey.z}`) ?? null;
  }

  // given a position, determine where a unit would land if it were to move from than position
  getDestination(posOrKey: Point3D | CellId, direction: Direction): Point3D | null {
    const from = isString(posOrKey)
      ? Vec3.fromPoint3D(cellIdToPoint(posOrKey))
      : Vec3.fromPoint3D(posOrKey);

    const target = Vec3.add(from, DIRECTIONS_TO_DIFF[direction]);
    const targetAbove = Vec3.add(target, { x: 0, y: 0, z: 1 });
    const targetBelow = Vec3.add(target, { x: 0, y: 0, z: -1 });

    const currentCell = this.getCellAt(from);
    const cell = this.getCellAt(target);
    const cellBelow = this.getCellAt(targetBelow);
    const cellAbove = this.getCellAt(targetAbove);

    if (!currentCell) return null;
    if (!currentCell.isWalkable) return null;

    if (cellAbove) {
      return cellAbove.isWalkable ? cellAbove : null;
    }

    if (cell) {
      return cell.isWalkable ? cellAbove : null;
    }

    if (cellBelow) {
      return cellBelow.isWalkable ? cellAbove : null;
    }

    return null;
  }

  getDistanceMap(point: Point3D, maxDistance?: number) {
    const boundaries = maxDistance
      ? ([
          Vec3.sub(point, { x: maxDistance, y: maxDistance, z: maxDistance }),
          Vec3.add(point, { x: maxDistance, y: maxDistance, z: maxDistance })
        ] as [Vec3, Vec3])
      : undefined;
    return new Pathfinder(this.session, boundaries).getDistanceMap(point);
  }

  getPathTo(entity: AnyEntity, point: Point3D, maxDistance?: number) {
    const boundaries = maxDistance
      ? ([
          Vec3.sub(point, { x: maxDistance, y: maxDistance, z: maxDistance }),
          Vec3.add(point, { x: maxDistance, y: maxDistance, z: maxDistance })
        ] as [Vec3, Vec3])
      : undefined;

    const path = new Pathfinder(this.session, boundaries).findPath(
      entity.position,
      point
    );

    if (!path) return null;

    return {
      distance: path.distance,
      path: path.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p)))
    };
  }
}
