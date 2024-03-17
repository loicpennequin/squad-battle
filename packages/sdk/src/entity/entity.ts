import { type Serializable, Vec3, type Values, clamp, type Nullable } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { PlayerId } from '../player/player';
import { CHARACTER_BLUEPRINTS } from './character-blueprint';
import { Interceptable, ReactiveValue, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import type { Skill, SkillId } from '../skill/skill';

export type EntityId = number;

export type SerializedEntity = {
  id: number;
  position: Point3D;
  blueprintId: string;
  playerId: PlayerId;
  atbSeed: number;
  atb?: number;
  ap?: number;
  hp?: number;
  movementSpent?: number;
  actionsTaken?: number;
};

export const ENTITY_EVENTS = {
  DESTROYED: 'destroyed',
  CREATED: 'created',

  BEFORE_MOVE: 'before-move',
  AFTER_MOVE: 'after-move',

  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',

  BEFORE_TAKE_DAMAGE: 'before_take_damage',
  AFTER_TAKE_DAMAGE: 'after_take_damage',

  BEFORE_USE_SKILL: 'before_use_skill',
  AFTER_USE_SKILL: 'after_use_skill',

  TURN_STARTED: 'turn-started',
  TURN_ENDED: 'turn-ended'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

type DealDamageEvent = {
  entity: Entity;
  target: Entity;
  amount: number;
};
type TakeDamageEvent = {
  entity: Entity;
  source: Nullable<Entity>;
  amount: number;
};

export type EntityEventMap = {
  [ENTITY_EVENTS.CREATED]: [entity: Entity];
  [ENTITY_EVENTS.DESTROYED]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_MOVE]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_MOVE]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_DEAL_DAMAGE]: [event: DealDamageEvent];
  [ENTITY_EVENTS.AFTER_DEAL_DAMAGE]: [event: DealDamageEvent];

  [ENTITY_EVENTS.BEFORE_TAKE_DAMAGE]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_TAKE_DAMAGE]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.TURN_STARTED]: [entity: Entity];
  [ENTITY_EVENTS.TURN_ENDED]: [entity: Entity];
};

type EntityInterceptor = Entity['interceptors'];

export class Entity extends EventEmitter<EntityEventMap> implements Serializable {
  private blueprintId: string;

  private playerId: PlayerId;

  readonly id: EntityId;

  position: Vec3;

  atbSeed = 0;

  atb: number;

  private movementSpent: number;
  private actionsTaken: number;

  currentAp: number;

  private currentHp = new ReactiveValue(0, hp => {
    if (hp <= 0) {
      this.destroy();
    }
  });

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    speed: new Interceptable<number, Entity>(),
    initiative: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    maxAp: new Interceptable<number, Entity>(),
    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canUseSkill: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    damageTaken: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  constructor(
    protected session: GameSession,
    options: SerializedEntity
  ) {
    super();
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.blueprintId = options.blueprintId;
    this.playerId = options.playerId;
    this.atb = options.atb ?? this.atbSeed;
    this.movementSpent = options?.movementSpent ?? 0;
    this.actionsTaken = options?.actionsTaken ?? 0;
    this.currentAp = options.ap ?? this.maxAp;
    this.currentHp.lazySetInitialValue(options.hp ?? this.maxHp);

    this.emit('created', this);
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  clone() {
    const clone = new Entity(this.session, this.serialize());
    clone.interceptors = this.interceptors;

    return clone;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position.serialize(),
      blueprintId: this.blueprint.id,
      playerId: this.playerId,
      atbSeed: this.atbSeed,
      atb: this.atb,
      ap: this.ap,
      hp: this.hp,
      movementSpent: this.movementSpent
    };
  }

  get blueprint() {
    return CHARACTER_BLUEPRINTS[this.blueprintId];
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get hp() {
    return this.currentHp.value;
  }

  private set hp(val: number) {
    this.currentHp.value = clamp(val, 0, this.maxHp);
  }

  get ap() {
    return this.currentAp;
  }

  set ap(val) {
    this.currentAp = clamp(val, 0, this.maxAp);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get maxAp(): number {
    return this.interceptors.maxAp.getValue(this.blueprint.maxAp, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get speed(): number {
    return this.interceptors.attack.getValue(this.blueprint.speed, this);
  }

  get initiative(): number {
    return this.interceptors.initiative.getValue(this.blueprint.initiative, this);
  }

  get isActive() {
    const activeEntity = this.session.atbSystem.activeEntity;

    if (!activeEntity) return false;

    return this.equals(activeEntity);
  }

  get skills() {
    return this.blueprint.skills;
  }

  getRremainingMovement(movementSpent: number) {
    return this.speed - movementSpent;
  }

  canMove(distance: number, simulatedMovementSpent?: number) {
    return this.interceptors.canMove.getValue(
      distance <=
        this.getRremainingMovement(simulatedMovementSpent ?? this.movementSpent),
      this
    );
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  hasSkill(skillId: SkillId) {
    return this.skills.some(s => s.id === skillId);
  }

  getSkill(skillId: SkillId) {
    return this.skills.find(s => s.id === skillId);
  }

  canUseSkillAt(skill: Skill, point: Point3D, otherTargets: Point3D[]) {
    if (!this.hasSkill(skill.id)) return false;

    if (otherTargets.length === skill.maxTargets) return false;

    return skill.isTargetable(this.session, point, this, otherTargets);
  }

  canUseSkill(skill: Skill, targets: Point3D[]) {
    if (this.actionsTaken >= 1) return false;
    if (!this.hasSkill(skill.id)) return false;
    if (targets.length < skill.minTargets) return false;
    if (targets.length > skill.maxTargets) return false;
    if (this.ap < skill.apCost) return false;

    return targets.every(target =>
      skill.isTargetable(this.session, target, this, targets)
    );
  }

  canAttackAt(point: Point3D, simulatedPosition?: Point3D) {
    return isWithinCells(simulatedPosition ?? this.position, point, 1);
  }

  canAttack(target: Entity) {
    if (this.actionsTaken >= 1) return false;
    if (!this.canAttackAt(target.position)) return false;

    const baseValue =
      this.canAttackAt(target.position) &&
      isEnemy(this.session, target.id, this.playerId);

    return (
      this.interceptors.canAttack.getValue(baseValue, { entity: this, target }) &&
      target.canBeAttacked(this)
    );
  }

  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    isFinal = false
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].add(interceptor, isFinal);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].remove(interceptor);
  }

  startTurn() {
    this.ap++;
    this.movementSpent = 0;
    this.actionsTaken = 0;

    this.emit(ENTITY_EVENTS.TURN_STARTED, this);
  }

  endTurn() {
    this.atb = this.atbSeed;
    this.emit(ENTITY_EVENTS.TURN_ENDED, this);
  }

  destroy() {
    this.session.entitySystem.removeEntity(this);
    this.emit('destroyed', this);
  }

  move(path: Point3D[]) {
    for (const point of path) {
      if (this.movementSpent === this.speed) break;
      this.emit(ENTITY_EVENTS.BEFORE_MOVE, this);
      this.position = Vec3.fromPoint3D(point);
      this.movementSpent++;
      this.emit(ENTITY_EVENTS.AFTER_MOVE, this);
    }
  }

  getTakenDamage(amount: number) {
    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount
    });
  }

  async dealDamage(power: number, target: Entity) {
    const payload = {
      entity: this,
      amount: power,
      target
    };
    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);

    target.takeDamage(power, this);

    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  async takeDamage(power: number, source: Nullable<Entity>) {
    const amount = this.getTakenDamage(power);
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);
    this.hp -= amount;

    Promise.all([
      this.session.fxSystem.shakeEntity(this.id, {
        count: 6,
        totalDuration: 0.4,
        axis: 'x',
        amount: 2
      }),
      this.session.fxSystem.displayDamageIndicator(
        this.session.atbSystem.activeEntity.id,
        this.id,
        this.session.atbSystem.activeEntity.attack
      )
    ]);
    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  async performAttack(target: Entity) {
    await this.session.fxSystem.attack(this.id, target.id);
    this.dealDamage(this.attack, target);
    this.actionsTaken++;
  }

  async useSkill(skill: Skill, targets: Point3D[]) {
    this.ap -= skill.apCost;
    this.actionsTaken++;
    await skill.execute(
      this.session,
      this,
      targets,
      this.session.map.cells.filter(cell =>
        skill.isInAreaOfEffect(this.session, cell, this, targets)
      )
    );
  }

  isAlly(entityId: EntityId) {
    return isAlly(this.session, entityId, this.playerId);
  }

  isEnemy(entityId: EntityId) {
    return isEnemy(this.session, entityId, this.playerId);
  }
}
