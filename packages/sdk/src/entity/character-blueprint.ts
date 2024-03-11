import { keyBy } from 'lodash-es';

export type CharacterBlueprint = {
  id: string;
  spriteId: string;

  maxHp: number;
  maxAp: number;

  attack: number;
  speed: number;
  initiative: number;

  skills: Array<any>;
};

export const CHARACTER_BLUEPRINTS = keyBy([], 'id') satisfies Record<
  string,
  CharacterBlueprint
>;
