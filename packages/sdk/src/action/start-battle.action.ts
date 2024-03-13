import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema;

export class StartBattleAction extends GameAction<typeof schema> {
  readonly name = 'startBattle';

  protected payloadSchema = schema;

  async impl() {
    this.session.playerSystem.getList().forEach(player => {
      player.deployTeam();
    });
    this.session.phase = GAME_PHASES.BATTLE;
    this.session.atbSystem.tickUntilActiveEntity(this.session.entitySystem.getList());
    this.session.atbSystem.activeEntity.startTurn();
  }
}
