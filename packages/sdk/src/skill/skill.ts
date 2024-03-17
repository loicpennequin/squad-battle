import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Cell } from '../map/cell';
import type { Point3D } from '../types';
import { KEYWORDS, type Keyword } from '../utils/keywords';

export type SkillId = string;

export type SkillOptions = {
  name: string;
  iconId: string;
  minTargets?: number;
  maxTargets?: number;
  id: string;
  keyords?: Keyword[];
};

export type SkillDescriptionContext = {
  attack: number;
  speed: number;
};

export abstract class Skill {
  readonly id: SkillId;
  readonly name: string;
  readonly iconId: string;
  readonly minTargets: number;
  readonly maxTargets: number;
  readonly keywords: Keyword[];

  constructor(options: SkillOptions) {
    this.id = options.id;
    this.name = options.name;
    this.keywords = options.keyords ?? [];
    this.iconId = options.iconId;
    this.minTargets = options.minTargets ?? 1;
    this.maxTargets = options.maxTargets ?? 1;
  }

  abstract getDescription(caster: SkillDescriptionContext): string;

  abstract isTargetable(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isWithinRange(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract isInAreaOfEffect(
    ctx: GameSession,
    point: Point3D,
    caster: Entity,
    targets: Point3D[]
  ): boolean;

  abstract execute(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedCells: Cell[]
  ): Promise<void>;
}
