import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';
import type { Entity } from '../entity/entity';

const schema = defaultActionSchema.extend({
  targetId: z.number()
});

export class AttackAction extends GameAction<typeof schema> {
  readonly name = 'attack';

  protected payloadSchema = schema;

  async impl() {
    if (this.session.phase !== GAME_PHASES.BATTLE) {
      throw new Error('Cannot attack outside of the battle phase.');
    }

    if (!this.player.ownsActiveEntity()) {
      throw new Error(`Player ${this.player.name} doesn't own active entity.`);
    }

    const target = this.session.entitySystem.getEntityById(this.payload.targetId);
    if (!target) throw new Error(`Entity not found: ${this.payload.targetId}`);

    await this.session.atbSystem.activeEntity.performAttack(target);
  }
}
