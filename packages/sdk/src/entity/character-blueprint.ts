import { keyBy } from 'lodash-es';
import type { Skill } from '../skill/skill';
import { isAxisAligned, isSelf } from '../utils/targeting';
import { Vec3, isDefined } from '@game/shared';
import type { Modifier } from '../modifier/modifier';

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
        getDescription: () => 'Samira gains +2 speed for 2 turns.',
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
        execute(session, caster) {
          let duration = 2;
          const interceptor = (val: number) => val + 2;

          caster.addModifier({
            keywords: [],
            id: 'swiftness',
            name: 'Swiftness',
            iconId: 'swiftness',
            getDescription() {
              return '+2 speed for 2 turns.';
            },
            onApplied() {
              caster.addInterceptor('speed', interceptor);
              const listener = () => {
                duration--;
                console.log('turn ended', duration);
                if (duration === 0) {
                  caster.off('turn-ended', listener);
                  caster.removeModifier('swiftness');
                }
              };
              caster.on('turn-ended', listener);
            },
            onRemoved() {
              console.log('on removed');
              caster.removeInterceptor('speed', interceptor);
            },
            onReapply() {
              duration = 2;
            },
            stackable: false
          });

          return Promise.resolve();
        }
      },
      {
        apCost: 1,
        id: 'chakram-strike',
        name: 'Chakram Strike',
        iconId: 'chakram',
        getDescription: () => 'Todo',
        minTargets: 1,
        maxTargets: 1,
        keywords: [],
        isTargetable(session, point, caster) {
          return (
            isAxisAligned(point, caster.position) &&
            !isSelf(caster, session.entitySystem.getEntityAt(point))
          );
        },
        isWithinRange(session, point, caster) {
          return (
            isAxisAligned(point, caster.position) &&
            !isSelf(caster, session.entitySystem.getEntityAt(point))
          );
        },
        isInAreaOfEffect(session, point, caster, targets) {
          const diffs = [[0], [-1, +1], [-1, +1], [0]];
          const [target] = targets;
          if (!target) return false;

          return diffs
            .map((nums, index) => {
              return nums.map(diff => {
                if (target.y === caster.position.y) {
                  return Vec3.add(caster.position, {
                    x: (index + 1) * (target.x < caster.position.x ? -1 : 1),
                    y: diff,
                    z: 0
                  });
                }

                if (target.x === caster.position.x) {
                  return Vec3.add(caster.position, {
                    x: diff,
                    y: (index + 1) * (target.y < caster.position.y ? -1 : 1),
                    z: 0
                  });
                }
              });
            })
            .flat()
            .filter(isDefined)
            .some(vec3 => vec3.equals(point));
        },
        execute(session, caster, targets, affectedCells) {
          return Promise.all(
            affectedCells.map(cell => {
              const entity = session.entitySystem.getEntityAt(cell);
              if (entity && entity?.isEnemy(caster.id)) {
                caster.dealDamage(4, entity);
              }
            })
          );
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
