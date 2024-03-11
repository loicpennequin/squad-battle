import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  characters: z
    .object({
      characterId: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      })
    })
    .array()
});

export class DeployAction extends GameAction<typeof schema> {
  readonly name = 'endTurn';

  protected payloadSchema = schema;

  async impl() {
    if (this.session.phase !== GAME_PHASES.DEPLOY) {
      throw new Error('Cannot deploy outside of the deploy phase.');
    }

    if (this.player.deployment) {
      throw new Error("'Player has already deployed");
    }

    const isValid = this.payload.characters.every(({ characterId }) =>
      this.player.ownsCharacter(characterId)
    );
    if (!isValid) {
      throw new Error('Invalid deployment.');
    }

    this.player.deployment = this.payload.characters;

    const isReadyForBattle = this.session.playerSystem
      .getList()
      .every(player => player.deployment);

    if (isReadyForBattle) {
      this.session.transitionToBattle();
    }
  }
}
