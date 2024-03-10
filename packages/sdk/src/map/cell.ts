import { Vec3, type Serializable } from '@game/shared';
import type { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
// import { Tile } from './tile';

export type CellId = `${string}:${string}:${string}`;

export type SerializedCell = {
  terrain: string;
  position: Point3D;
};

export class Cell implements Serializable {
  public position: Vec3;
  public readonly terrain: string;

  constructor(options: SerializedCell) {
    this.position = Vec3.fromPoint3D(options.position);
    this.terrain = options.terrain;
  }

  clone() {
    const clone = new Cell(this.serialize());

    return clone;
  }

  get id(): CellId {
    return pointToCellId(this);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get z() {
    return this.position.z;
  }

  get isWalkable() {
    return true;
  }

  serialize() {
    return {
      position: this.position.serialize(),
      terrain: this.terrain
    };
  }
}