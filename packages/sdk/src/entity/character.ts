import { clamp, type Values } from '@game/shared';
import { Entity, type SerializedEntity } from './entity';
import type { GameSession } from '../game-session';
import { Interceptable, ReactiveValue } from '../utils/helpers';
import { CHARACTER_BLUEPRINTS, type CharacterBlueprint } from './character-blueprint';

export const CHARACTER_EVENTS = {
  MOVE: 'move'
} as const;

export type CharacterEvent = Values<typeof CHARACTER_EVENTS>;

export type CharacterEventMap = {
  [CHARACTER_EVENTS.MOVE]: Character;
};

export type SerializedCharacter = SerializedEntity & { blueprintId: string };

export class Character extends Entity<SerializedCharacter, CharacterEventMap> {
  blueprint: CharacterBlueprint;

  constructor(session: GameSession, options: SerializedCharacter) {
    super(session, options);
    this.blueprint = CHARACTER_BLUEPRINTS[options.blueprintId];
  }

  private interceptors = {
    attack: new Interceptable<number, Character>(),
    speed: new Interceptable<number, Character>(),
    initiative: new Interceptable<number, Character>(),
    maxHp: new Interceptable<number, Character>(),
    maxAp: new Interceptable<number, Character>()
  };

  private currentHp = new ReactiveValue(0, hp => {
    if (hp <= 0) {
      // die
    }
  });

  private currentAp = new ReactiveValue(0, ap => {
    if (ap <= 0) {
      // end turn
    }
  });

  get hp() {
    return this.currentHp.value;
  }

  private set hp(val: number) {
    this.currentHp.value = clamp(val, 0, this.maxHp);
  }

  get ap() {
    return this.currentAp.value;
  }

  private set ap(val: number) {
    this.currentAp.value = clamp(val, 0, this.maxAp);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get maxAp(): number {
    return this.interceptors.maxAp.getValue(this.blueprint.maxHp, this);
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.blueprint.speed, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get initiative(): number {
    return this.interceptors.initiative.getValue(this.blueprint.attack, this);
  }

  clone() {
    return new Character(this.session, this.serialize());
  }

  serialize(): SerializedCharacter {
    return {
      id: this.id,
      position: this.position.serialize(),
      blueprintId: this.blueprint.id
    };
  }
}
