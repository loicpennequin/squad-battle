import type { Point3D } from '@game/shared';
import { GameSession } from '../game-session';
import { Obstacle, type ObstacleId, type SerializedObstacle } from './obstacle';

export class ObstacleSystem {
  private obstacleMap = new Map<ObstacleId, Obstacle>();
  private nextObstacleId = 0;

  constructor(private session: GameSession) {}

  setup(obstacles: SerializedObstacle[]) {
    obstacles.forEach(rawObstacle => {
      const obstacle = new Obstacle(this.session, rawObstacle);
      this.obstacleMap.set(obstacle.id, obstacle);
    });
    if (obstacles.length) {
      this.nextObstacleId = Math.max(...this.getList().map(e => e.id));
    }
  }

  getList() {
    return [...this.obstacleMap.values()];
  }

  getObstacleById(id: ObstacleId) {
    return this.obstacleMap.get(id);
  }

  getObstacleAt(position: Point3D) {
    return this.getList().find(e => e.position.equals(position)) ?? null;
  }

  addObstacle(obstacle: Omit<SerializedObstacle, 'id'>) {
    const id = ++this.nextObstacleId;

    this.obstacleMap.set(id, new Obstacle(this.session, { ...obstacle, id }));
  }

  removePlayer(obstacleId: ObstacleId) {
    this.obstacleMap.delete(obstacleId);
  }
}
