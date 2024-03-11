import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof schema> {
  readonly name = 'endTurn';

  protected payloadSchema = schema;

  async impl() {
    if (this.session.phase !== GAME_PHASES.BATTLE) {
      throw new Error('Cannot end turn outside of the battle phase.');
    }

    if (!this.player.ownsActiveEntity()) {
      throw new Error(`Player ${this.player.name} doesn't own active entity.`);
    }

    this.session.atbSystem.activeEntity.endTurn();
    this.session.atbSystem.tickUntilActiveEntity(this.session.entitySystem.getList());
    this.session.atbSystem.activeEntity.startTurn();
  }
}
