import { GameAction, type DefaultSchema, type SerializedAction } from './action';
import { GameSession } from '../game-session';
import type { Constructor, Serializable } from '@game/shared';
import { AttackAction } from './attack.action';
import { DeployAction } from './deploy.action';
import { EndTurnAction } from './end-turn.action';
import { MoveAction } from './move.action';
import { StartBattleAction } from './start-battle.action';

type GenericActionMap = Record<string, Constructor<GameAction<DefaultSchema>>>;

type ValidatedActionMap<T extends GenericActionMap> = {
  [Name in keyof T]: T[Name] extends Constructor<GameAction<DefaultSchema>>
    ? Name extends InstanceType<T[Name]>['name']
      ? T[Name]
      : never
    : never;
};

const validateActionMap = <T extends GenericActionMap>(data: ValidatedActionMap<T>) =>
  data;

const actionMap = validateActionMap({
  attack: AttackAction,
  deploy: DeployAction,
  endTurn: EndTurnAction,
  move: MoveAction,
  startBattle: StartBattleAction
});

export class ActionSystem implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private session: GameSession) {}

  async setup(rawHistory: SerializedAction[]) {
    for (const action of rawHistory) {
      await this.dispatch(action);
    }
  }

  private isActionType(type: string): type is keyof typeof actionMap {
    return Object.keys(actionMap).includes(type);
  }

  async dispatch({ type, payload }: SerializedAction) {
    if (!this.isActionType(type)) return;
    console.log(`%c[${type}]`, 'color: blue', payload);
    const ctor = actionMap[type];
    const action = new ctor(payload, this.session);
    await action.execute();

    this.history.push(action);
    this.session.emit('game:action', action);
  }

  getHistory() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(action => action.serialize());
  }
}
