import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GAME_PHASES } from '../game-session';

const schema = defaultActionSchema.extend({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveAction extends GameAction<typeof schema> {
  readonly name = 'move';

  protected payloadSchema = schema;

  async impl() {
    if (this.session.phase !== GAME_PHASES.BATTLE) {
      throw new Error('Cannot move outside of the battle phase.');
    }

    if (!this.player.ownsActiveEntity()) {
      throw new Error(`Player ${this.player.name} doesn't own active entity.`);
    }
    const entity = this.session.atbSystem.activeEntity;
    const path = this.session.map.getPathTo(entity, this.payload);

    if (!path) throw new Error('No path found for movement.');

    if (!entity.canMove(path.distance)) {
      throw new Error(`Entity ${entity.id} cannot move to target cell.`);
    }

    await this.session.fxSystem.moveEntity(
      this.session.atbSystem.activeEntity.id,
      path.path.map(point => ({ point, duration: 0.3 }))
    );

    entity.move(path.path);
  }
}
