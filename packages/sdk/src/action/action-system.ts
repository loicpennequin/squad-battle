import { GameAction, type DefaultSchema, type SerializedAction } from './action';
import { GameSession } from '../game-session';
import type { Constructor, Serializable } from '@game/shared';

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

const actionMap = validateActionMap({});

export class ActionSystem implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private session: GameSession) {}

  async setup(rawHistory: SerializedAction[]) {
    for (const action of rawHistory) {
      await this.dispatch(action);
    }
  }

  async dispatch({ type, payload }: SerializedAction) {
    if (!this.session.isAuthoritative) {
      throw new Error(
        'Non authoritative game session cannot receive player inputs. Use dispatchAction instead'
      );
    }

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
