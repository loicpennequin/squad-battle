import { GameSession } from '../game-session';
import type { JSONObject, Serializable } from '@game/shared';
import type { Entity } from './entity';

export type PlayerId = string;

export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
};

export class Player implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;

  constructor(
    private session: GameSession,
    options: SerializedPlayer
  ) {
    this.id = options.id;
    this.name = options.name;
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name
    };
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  clone() {
    return new Player(this.session, this.serialize());
  }

  get team() {
    return [] as Entity<any>[];
  }
}
