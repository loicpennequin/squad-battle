import { keyBy } from 'lodash-es';

export type CharacterBlueprintId = string;
export type CharacterBlueprint = {
  id: CharacterBlueprintId;
  spriteId: string;

  maxHp: number;
  maxAp: number;

  attack: number;
  initiative: number;

  skills: Array<any>;
};

export const CHARACTER_BLUEPRINTS: Record<CharacterBlueprintId, CharacterBlueprint> =
  keyBy([], 'id');
