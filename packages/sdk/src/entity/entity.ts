import { type Serializable, Vec3, type Values, clamp, type Nullable } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import EventEmitter from 'eventemitter3';
import type { PlayerId } from '../player/player';
import { CHARACTER_BLUEPRINTS } from './character-blueprint';
import { Interceptable, ReactiveValue, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';

export type EntityId = number;

export type SerializedEntity = {
  id: number;
  position: Point3D;
  blueprintId: string;
  playerId: PlayerId;
  atbSeed: number;
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

  atb = this.atbSeed;

  constructor(
    protected session: GameSession,
    options: SerializedEntity
  ) {
    super();
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.blueprintId = options.blueprintId;
    this.playerId = options.playerId;

    this.emit('created', this);
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  clone() {
    return new Entity(this.session, this.serialize());
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position.serialize(),
      blueprintId: this.blueprint.id,
      playerId: this.playerId,
      atbSeed: this.atbSeed
    };
  }

  get blueprint() {
    return CHARACTER_BLUEPRINTS[this.blueprintId];
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    initiative: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    maxAp: new Interceptable<number, Entity>(),
    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    damageTaken: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  private currentHp = new ReactiveValue(0, hp => {
    if (hp <= 0) {
      this.destroy();
    }
  });

  private currentAp = new ReactiveValue(0, ap => {
    if (ap <= 0) {
      this.session.actionSystem.dispatch({
        type: 'endTurn',
        payload: { playerId: this.playerId }
      });
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
    return this.interceptors.maxAp.getValue(this.blueprint.maxAp, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.blueprint.attack, this);
  }

  get initiative(): number {
    return this.interceptors.initiative.getValue(this.blueprint.attack, this);
  }

  canMove(distance: number) {
    return this.interceptors.canMove.getValue(distance <= this.ap, this);
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  canAttack(target: Entity) {
    return (
      this.interceptors.canAttack.getValue(this.ap > 0, { entity: this, target }) &&
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

  move(path: Point3D[]) {
    for (const point of path) {
      if (this.ap === 0) break;
      this.emit(ENTITY_EVENTS.BEFORE_MOVE, this);
      this.position = Vec3.fromPoint3D(point);
      this.ap--;
      this.emit(ENTITY_EVENTS.AFTER_MOVE, this);
    }
  }

  startTurn() {
    this.ap = this.maxAp;

    this.emit(ENTITY_EVENTS.TURN_STARTED, this);
  }

  endTurn() {
    this.atb = (this.ap / this.maxAp) * 100 + this.atbSeed;

    this.emit(ENTITY_EVENTS.TURN_ENDED, this);
  }

  dealDamage(power: number, target: Entity) {
    const payload = {
      entity: this,
      amount: power,
      target
    };
    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);

    target.takeDamage(power, this);

    this.emit(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  getTakenDamage(amount: number) {
    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount
    });
  }

  destroy() {
    this.session.entitySystem.removeEntity(this);
    this.emit('destroyed', this);
  }

  takeDamage(power: number, source: Nullable<Entity>) {
    const amount = this.getTakenDamage(power);
    const payload = {
      entity: this,
      amount,
      source
    };
    this.emit(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);
    this.hp -= amount;
    this.emit(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  performAttack(target: Entity) {
    this.dealDamage(this.attack, target);
    this.ap--;
  }

  isAlly(entityId: EntityId) {
    return isAlly(this.session, entityId, this.playerId);
  }

  isEnemy(entityId: EntityId) {
    return isEnemy(this.session, entityId, this.playerId);
  }

  get isActive() {
    const activeEntity = this.session.atbSystem.activeEntity;

    if (!activeEntity) return false;

    return this.equals(activeEntity);
  }
}
