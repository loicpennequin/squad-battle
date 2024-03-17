import { GameSession } from '../game-session';
import type { JSONObject, Nullable, Point3D, Serializable } from '@game/shared';
import {
  CHARACTER_BLUEPRINTS,
  type CharacterBlueprintId
} from '../entity/character-blueprint';

export type PlayerId = string;

export type SerializedPlayer = JSONObject & {
  id: PlayerId;
  name: string;
  team: CharacterBlueprintId[];
  deployment: Nullable<PlayerDeployment>;
};

type PlayerDeployment = Array<{
  characterId: CharacterBlueprintId;
  position: Point3D;
}>;

export class Player implements Serializable {
  public readonly id: PlayerId;
  public readonly name: string;
  public deployment: Nullable<PlayerDeployment>;

  private teamIds: CharacterBlueprintId[];

  constructor(
    private session: GameSession,
    options: SerializedPlayer
  ) {
    this.id = options.id;
    this.name = options.name;
    this.deployment = options.deployment;
    this.teamIds = options.team;
  }

  serialize(): SerializedPlayer {
    return {
      id: this.id,
      name: this.name,
      team: this.teamIds,
      deployment: this.deployment ?? null
    };
  }

  clone() {
    return new Player(this.session, this.serialize());
  }

  equals(player: Player) {
    return player.id === this.id;
  }

  ownsActiveEntity() {
    return this.session.atbSystem.activeEntity.player.equals(this);
  }

  ownsCharacter(id: CharacterBlueprintId) {
    return this.team.some(character => character.id === id);
  }

  get team() {
    return this.teamIds.map(id => CHARACTER_BLUEPRINTS[id]);
  }

  get entities() {
    return this.session.entitySystem
      .getList()
      .filter(entity => entity.player.equals(this));
  }

  deployTeam() {
    if (!this.deployment) {
      throw new Error('Cannot deploy player with no deployment.');
    }

    this.deployment.forEach(({ characterId, position }) => {
      this.session.entitySystem.addEntity({
        atbSeed: this.session.rng(),
        blueprintId: characterId,
        position,
        playerId: this.id
      });
    });
  }
}
