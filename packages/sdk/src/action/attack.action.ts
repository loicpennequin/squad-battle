import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';

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

    this.session.atbSystem.activeEntity.performAttack(target);

    this.session.fxSystem.displayText(
      String(target?.getTakenDamage(this.session.atbSystem.activeEntity.attack)),
      target.id,
      {
        color: 0xff0000,
        duration: 1,
        path: [
          { x: 0, y: -64, alpha: 0, scale: 0 },
          { x: 0, y: -96, alpha: 0, scale: 1 },
          { x: 0, y: -96, alpha: 1, scale: 1 }
        ]
      }
    );

    return Promise.resolve();
  }
}
