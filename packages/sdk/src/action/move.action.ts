import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { getEntityIfOwnerMatches } from '../entity/entity-utils';

const moveEventSchema = defaultActionSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveAction extends GameAction<typeof moveEventSchema> {
  readonly name = 'move';

  protected payloadSchema = moveEventSchema;

  impl() {
    const entity = getEntityIfOwnerMatches(
      this.session,
      this.payload.entityId,
      this.payload.playerId
    );
    if (!entity) return Promise.resolve();

    const path = this.session.map.getPathTo(entity, this.payload);

    if (!path) return Promise.resolve();

    if (!entity.canMove(path.distance)) return Promise.resolve();

    entity.move(path.path);

    return Promise.resolve();
  }
}
