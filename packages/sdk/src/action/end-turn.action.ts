import { GameAction, defaultActionSchema } from './action';

const endTurnSchema = defaultActionSchema;

export class EndTurnAction extends GameAction<typeof endTurnSchema> {
  readonly name = 'endTurn';

  protected payloadSchema = endTurnSchema;

  impl() {
    this.session.atbSystem.activeEntity.endTurn();
    this.session.atbSystem.tickUntilActiveEntity(this.session.entitySystem.getList());
    this.session.atbSystem.activeEntity.startTurn();

    return Promise.resolve();
  }
}
