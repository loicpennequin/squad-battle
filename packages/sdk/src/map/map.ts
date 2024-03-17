import { Vec3, isDefined, isString } from '@game/shared';
import type { Point3D } from '../types';
import { Cell, type CellId, type SerializedCell } from './cell';
import { cellIdToPoint } from '../utils/helpers';
import type { GameSession } from '../game-session';
import { DIRECTIONS_TO_DIFF, type Direction } from './map-utils';
import { Pathfinder } from './pathfinding';
import type { Entity } from '../entity/entity';

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
      return new Cell(this.session, cell);
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
  getDestination(posOrKey: Point3D | CellId, direction: Direction): Cell | null {
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
    if (cellAbove?.isWalkable) {
      return cellAbove;
    }

    if (cell?.isWalkable) {
      return cell;
    }

    if (cellBelow?.isWalkable) {
      return cellBelow;
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

  getPathTo(entity: Entity, point: Point3D, maxDistance?: number) {
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

  getNeighbors(point: Point3D) {
    return [
      this.getCellAt({ x: point.x - 1, y: point.y - 1, z: point.z }),
      this.getCellAt({ x: point.x - 1, y: point.y, z: point.z }),
      this.getCellAt({ x: point.x - 1, y: point.y + 1, z: point.z }),
      this.getCellAt({ x: point.x, y: point.y - 1, z: point.z }),
      this.getCellAt({ x: point.x, y: point.y + 1, z: point.z }),
      this.getCellAt({ x: point.x + 1, y: point.y - 1, z: point.z }),
      this.getCellAt({ x: point.x + 1, y: point.y, z: point.z }),
      this.getCellAt({ x: point.x + 1, y: point.y + 1, z: point.z })
    ].filter(isDefined);
  }

  getNeighborsDestinations(point: Point3D) {
    return [
      ...new Set(
        [
          this.getDestination(point, 'north'),
          this.getDestination(point, 'north')?.getDestination('east'),
          this.getDestination(point, 'north')?.getDestination('west'),
          this.getDestination(point, 'south'),
          this.getDestination(point, 'south')?.getDestination('east'),
          this.getDestination(point, 'south')?.getDestination('west'),
          this.getDestination(point, 'east'),
          this.getDestination(point, 'east')?.getDestination('north'),
          this.getDestination(point, 'east')?.getDestination('south'),
          this.getDestination(point, 'west'),
          this.getDestination(point, 'west')?.getDestination('north'),
          this.getDestination(point, 'west')?.getDestination('south')
        ].filter(isDefined)
      )
    ];
  }
}
