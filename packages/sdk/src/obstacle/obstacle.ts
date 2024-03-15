import { type Point3D, type Serializable, Vec3 } from '@game/shared';
import type { GameSession } from '../game-session';

export type ObstacleId = number;

export type SerializedObstacle = {
  id: ObstacleId;
  spriteId: string;
  position: Point3D;
};

export class Obstacle implements Serializable {
  readonly id: ObstacleId;
  readonly spriteId: string;
  position: Vec3;

  constructor(
    private session: GameSession,
    options: SerializedObstacle
  ) {
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.spriteId = options.spriteId;
  }

  clone() {
    return new Obstacle(this.session, this.serialize());
  }

  serialize() {
    return {
      id: this.id,
      position: this.position.serialize(),
      spriteId: this.spriteId
    };
  }
}
