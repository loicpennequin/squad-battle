import { type JSONObject, type Serializable, Vec3 } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import mitt, { type EventType } from 'mitt';

export type EntityId = number;

export type SerializedEntity = JSONObject & {
  id: number;
  position: Point3D;
};

export type AnyEntity = Entity<SerializedEntity, Record<string, any>>;

export abstract class Entity<
  TRaw extends SerializedEntity,
  TEvents extends Record<EventType, unknown>
> implements Serializable
{
  readonly id: EntityId;
  public position: Vec3;
  private emitter = mitt<TEvents>();

  constructor(
    private session: GameSession,
    options: SerializedEntity
  ) {
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
  }

  get on() {
    return this.emitter.on;
  }

  get off() {
    return this.emitter.off;
  }

  abstract serialize(): TRaw;

  abstract clone(): this;

  equals(entity: AnyEntity) {
    return entity.id === this.id;
  }
}
