import type { CharacterBlueprint } from '../entity/character-blueprint';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Cell } from '../map/cell';
import type { Point3D } from '../types';
import { type Keyword } from '../utils/keywords';

export type SkillId = string;

export type SkillOptions = {
  name: string;
  iconId: string;
  minTargets?: number;
  maxTargets?: number;
  id: string;
  keyords?: Keyword[];
};

export type SkillDescriptionContext = Pick<
  CharacterBlueprint,
  'attack' | 'initiative' | 'maxHp' | 'maxAp' | 'spellPower' | 'speed'
>;

export type Skill = {
  id: SkillId;
  name: string;
  iconId: string;
  minTargets: number;
  maxTargets: number;
  keywords: Keyword[];
  apCost: number;
  getDescription(caster: SkillDescriptionContext): string;
  isTargetable(
    session: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;
  isWithinRange(
    session: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;
  isInAreaOfEffect(
    session: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;
  execute(
    session: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedCells: Cell[]
  ): Promise<void>;
};
