import type { Point3D } from '@game/shared';
import type { EntityId } from './entity/entity';

export type FXSystem = {
  moveEntity(
    entityId: EntityId,
    path: Array<{ point: Point3D; duration: number }>
  ): Promise<void>;

  displayDamageIndicator(from: EntityId, to: EntityId, amount: number): Promise<void>;

  attack(attackerId: EntityId, targetId: EntityId): Promise<void>;

  fadeOutEntity(entityId: EntityId, duration: number): Promise<void>;

  displayText(
    text: string,
    entityId: EntityId,
    options: {
      color: string | string[] | number | number[];
      path: { x?: number; y?: number; scale?: number; alpha?: number }[];
      duration: number;
    }
  ): Promise<void>;

  shakeEntity(
    entityId: EntityId,
    opts?: {
      count?: number;
      axis?: 'x' | 'y' | 'both';
      amount?: number;
      totalDuration?: number;
    }
  ): Promise<void>;
};

export const noopFXContext: FXSystem = {
  moveEntity() {
    return Promise.resolve();
  },

  displayDamageIndicator() {
    return Promise.resolve();
  },

  displayText() {
    return Promise.resolve();
  },

  shakeEntity() {
    return Promise.resolve();
  },

  attack() {
    return Promise.resolve();
  },

  fadeOutEntity() {
    return Promise.resolve();
  }
};
