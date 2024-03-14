import type { Point3D } from '@game/shared';
import type { EntityId } from './entity/entity';

export type FXSystem = {
  moveEntity(entityId: EntityId, to: Point3D, duration: number): Promise<void>;
};

export const noopFXContext: FXSystem = {
  moveEntity() {
    return Promise.resolve();
  }
};
