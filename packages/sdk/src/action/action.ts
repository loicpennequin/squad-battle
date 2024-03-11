import { z } from 'zod';
import type { JSONValue, Serializable } from '@game/shared';
import { GameSession } from '../game-session';

export const defaultActionSchema = z.object({
  playerId: z.string()
});
export type DefaultSchema = typeof defaultActionSchema;

export type SerializedAction = {
  type: string;
  payload: JSONValue;
};

export type AnyGameAction = GameAction<any>;

export abstract class GameAction<TSchema extends DefaultSchema> implements Serializable {
  abstract readonly name: string;

  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;

  constructor(
    protected rawPayload: JSONValue,
    protected session: GameSession
  ) {}

  protected abstract impl(): Promise<void>;

  execute() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);

    if (!parsed.success) return;
    this.payload = parsed.data;

    return this.impl();
  }

  serialize(): SerializedAction {
    return { type: this.name, payload: this.rawPayload };
  }
}
