import type { Constructor, JSONValue } from '@game/shared';
import { type DefaultSchema, GameAction, type SerializedAction } from './action';
import { GameSession } from '../game-session';

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

export class ActionReducer {
  constructor(private ctx: GameSession) {}

  reduce({ type, payload }: SerializedAction) {
    if (!this.ctx.isAuthoritative) {
      throw new Error(
        'Non authoritative game session cannot receive player inputs. Use dispatchAction instead'
      );
    }

    const input = actionMap[type];

    new input(payload, this.ctx).execute();
  }
}
