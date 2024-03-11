import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';

const attackSchema = defaultActionSchema.extend({
  targetId: z.number()
});

export class EttackAction extends GameAction<typeof attackSchema> {
  readonly name = 'attack';

  protected payloadSchema = attackSchema;

  impl() {
    const target = this.session.entitySystem.getEntityById(this.payload.targetId);
    if (!target) return Promise.resolve();

    const entity = this.session.atbSystem.activeEntity;
    entity.dealDamage(entity.attack, target);

    return Promise.resolve();
  }
}
