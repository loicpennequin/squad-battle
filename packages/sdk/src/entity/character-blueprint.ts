import { keyBy } from 'lodash-es';
import type { Skill } from '../skill/skill';
import { isSelf } from '../utils/targeting';

export type CharacterBlueprintId = string;
export type CharacterBlueprint = {
  id: CharacterBlueprintId;
  name: string;
  spriteId: string;

  maxHp: number;
  maxAp: number;

  attack: number;
  spellPower: number;
  speed: number;
  initiative: number;

  skills: Array<Skill>;
};

const characters: CharacterBlueprint[] = [
  {
    id: 'test',
    name: 'Yasuo',
    spriteId: 'test',
    maxHp: 20,
    maxAp: 3,

    attack: 2,
    spellPower: 1,
    speed: 3,
    initiative: 7,

    skills: []
  },
  {
    id: 'test2',
    name: 'Dragan',
    spriteId: 'test2',
    maxHp: 20,
    maxAp: 3,

    attack: 2,
    spellPower: 1,
    speed: 3,
    initiative: 6,

    skills: []
  },
  {
    id: 'test3',
    name: 'Samira',
    spriteId: 'test3',
    maxHp: 18,
    maxAp: 3,

    attack: 3,
    spellPower: 1,
    speed: 3,
    initiative: 8,

    skills: [
      {
        apCost: 1,
        id: 'test-skill',
        name: 'Swiftness',
        iconId: 'wind',
        getDescription: () => 'Todo',
        minTargets: 1,
        maxTargets: 1,
        keywords: [],
        isTargetable(session, point, caster) {
          return isSelf(caster, session.entitySystem.getEntityAt(point));
        },
        isWithinRange(session, point, caster) {
          return isSelf(caster, session.entitySystem.getEntityAt(point));
        },
        isInAreaOfEffect(session, point, caster) {
          return isSelf(caster, session.entitySystem.getEntityAt(point));
        },
        execute(session, caster, targets, affectedCells) {
          console.log('execute test skil');
          return Promise.resolve();
        }
      }
    ]
  },
  {
    id: 'test4',
    name: 'Karazim',
    spriteId: 'test4',
    maxHp: 22,
    maxAp: 3,

    attack: 2,
    spellPower: 1,
    speed: 3,
    initiative: 5,

    skills: []
  }
];

export const CHARACTER_BLUEPRINTS: Record<CharacterBlueprintId, CharacterBlueprint> =
  keyBy(characters, 'id');
