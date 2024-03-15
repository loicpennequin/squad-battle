import type { Point3D } from '@game/shared';
import type { EntityId } from './entity/entity';

export type FXSystem = {
  moveEntity(
    entityId: EntityId,
    path: Array<{ point: Point3D; duration: number }>
  ): Promise<void>;

  displayText(
    text: string,
    entityId: EntityId,
    options: {
      color: string | string[] | number | number[];
      path: { x?: number; y?: number; scale?: number; alpha?: number }[];
      duration: number;
    }
  ): Promise<void>;
};

export const noopFXContext: FXSystem = {
  moveEntity() {
    return Promise.resolve();
  },

  displayText() {
    return Promise.resolve();
  }
};
