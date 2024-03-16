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
  keyBy(
    [
      {
        id: 'test',
        spriteId: 'test',
        maxHp: 20,
        maxAp: 3,

        attack: 2,
        initiative: 7,

        skills: []
      },
      {
        id: 'test2',
        spriteId: 'test2',
        maxHp: 20,
        maxAp: 3,

        attack: 2,
        initiative: 6,

        skills: []
      },
      {
        id: 'test3',
        spriteId: 'test3',
        maxHp: 18,
        maxAp: 3,

        attack: 3,
        initiative: 8,

        skills: []
      },
      {
        id: 'test4',
        spriteId: 'test4',
        maxHp: 22,
        maxAp: 3,

        attack: 2,
        initiative: 5,

        skills: []
      }
    ],
    'id'
  );
