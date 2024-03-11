import { GameSession } from '../game-session';
import type { JSONObject, Serializable } from '@game/shared';
import type { Entity } from '../entity/entity';
import {
  CHARACTER_BLUEPRINTS,
  type CharacterBlueprint,
  type CharacterBlueprintId
} from '../entity/character-blueprint';

export type PlayerId = string;

export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
  team: CharacterBlueprintId[];
};

export class Player implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  private teamIds: CharacterBlueprintId[];
  constructor(
    private session: GameSession,
    options: SerializedPlayer
  ) {
    this.id = options.id;
    this.name = options.name;
    this.teamIds = options.team;
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      team: this.teamIds
    };
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  clone() {
    return new Player(this.session, this.serialize());
  }

  get team() {
    return this.teamIds.map(id => CHARACTER_BLUEPRINTS[id]);
  }
}
