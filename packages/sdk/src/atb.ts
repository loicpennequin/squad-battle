import type { Nullable } from '@game/shared';
import { Entity, type EntityId } from './entity/entity';
import type { GameSession } from './game-session';

export const MAX_ATB = 100;

export class ATBSystem {
  private _activeEntity!: Entity;

  get activeEntity() {
    return this._activeEntity;
  }

  constructor(private session: GameSession) {}

  setup(activeEntityId: Nullable<EntityId>) {
    if (this.session.phase === 'deploy') return;

    if (activeEntityId) {
      this._activeEntity = this.session.entitySystem.getEntityById(activeEntityId)!;
    } else {
      this.tickUntilActiveEntity(this.session.entitySystem.getList());
    }
  }

  getHighestActiveEntity(entities: Entity[]) {
    return entities
      .filter(e => e.atb >= MAX_ATB)
      .sort((a, b) => b.atb - a.atb)
      .at(0);
  }

  tickUntilActiveEntity(entities: Entity[], dryRun?: boolean) {
    if (!entities.length) {
      throw new Error('Cannot tick until active entitity if there are no entities.');
    }
    let activeEntity = this.getHighestActiveEntity(entities);
    while (!activeEntity) {
      entities.forEach(e => {
        e.atb += e.initiative;
      });

      activeEntity = this.getHighestActiveEntity(entities);
    }
    if (!dryRun) {
      this._activeEntity = activeEntity;
    }
    return activeEntity;
  }

  getTimeline(entities: Entity[], length: number) {
    const timeline: Entity[] = [];

    const clones = entities.map(entity => entity.clone());

    for (let i = 0; i <= length; i++) {
      const active = this.tickUntilActiveEntity(clones, true);
      timeline.push(active);
      active.atb = active.atbSeed;
    }

    return timeline;
  }
}
