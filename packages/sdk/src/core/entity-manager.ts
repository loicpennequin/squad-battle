import { isDefined } from '@game/shared';
import type { Point3D } from '../types';
import { Entity, type AnyEntity, type EntityId, type SerializedEntity } from './entity';
import { GameSession } from '../game-session';

export type EntityManagerOptions = {
  entities: AnyEntity[];
  nextEntityId: number;
};

export class EntityManager {
  private entityMap = new Map<EntityId, AnyEntity>();
  private nextEntityId = 0;

  constructor(private session: GameSession) {}

  setup(entities: SerializedEntity[]) {
    // entities.forEach(rawEntity => {
    //   const entity = new Entity(this.ctx, rawEntity);
    //   this.entityMap.set(entity.id, entity);
    //   this.addListeners(entity);
    // });
    // if (entities.length) {
    //   this.nextEntityId = Math.max(...this.getList().map(e => e.id));
    // }
  }

  getList() {
    return [...this.entityMap.values()];
  }

  getEntityById(id: EntityId) {
    return this.entityMap.get(id) ?? null;
  }

  getEntityAt(position: Point3D) {
    return this.getList().find(e => e.position.equals(position)) ?? null;
  }

  getNearbyEntities({ x, y, z }: Point3D) {
    // prettier-ignore
    return [
      // Same level
      this.getEntityAt({ x: x - 1, y: y - 1, z }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z}),  // left
      this.getEntityAt({ x: x + 1, y: y    , z}),  // right
      this.getEntityAt({ x: x - 1, y: y + 1, z }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z }), // bottom right,

      // below
      this.getEntityAt({ x: x - 1, y: y - 1, z: z - 1 }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z: z - 1 }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z: z - 1 }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z: z - 1 }), // left
      this.getEntityAt({ x: x    , y: y    , z: z - 1 }), // center
      this.getEntityAt({ x: x + 1, y: y    , z: z - 1 }), // right
      this.getEntityAt({ x: x - 1, y: y + 1, z: z - 1 }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z: z - 1 }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z: z - 1 }), // bottom right,

      // Above
      this.getEntityAt({ x: x - 1, y: y - 1, z: z + 1 }), // top left
      this.getEntityAt({ x: x    , y: y - 1, z: z + 1 }), // top
      this.getEntityAt({ x: x + 1, y: y - 1, z: z + 1 }), // top right
      this.getEntityAt({ x: x - 1, y: y    , z: z + 1 }), // left
      this.getEntityAt({ x: x    , y: y    , z: z + 1 }), // center
      this.getEntityAt({ x: x + 1, y: y    , z: z + 1 }), // right
      this.getEntityAt({ x: x - 1, y: y + 1, z: z + 1 }), // bottom left
      this.getEntityAt({ x: x    , y: y + 1, z: z + 1 }), // bottom
      this.getEntityAt({ x: x + 1, y: y + 1, z: z + 1 }), // bottom right,
    ].filter(isDefined).filter(entity => {
      // const referenceTile = this.ctx.map.getCellAt({x,y,z})!;
      // const tile = this.ctx.map.getCellAt(entity.position)!;
      // if (!referenceTile.isHalfTile &&  referenceTile.z > tile.z)  {
      //   return false;
      // }
      
      // if (!tile?.isHalfTile && referenceTile.z < tile.z) {
      //   return false;
      // }

      return true;
    })
  }

  // private addListeners(entity: Entity) {
  // entity.on('*', (type, payload) => {
  //   this.ctx.emitter.emit(`entity:${type}`, payload);
  // });
  // this.ctx.emitter.on('game:turn-start', player => {
  //   if (player.id === entity.playerId) {
  //     entity.startTurn();
  //   }
  // });
  // }

  addEntity(rawEntity: Omit<SerializedEntity, 'id'>, targets: Point3D[] = []) {
    // const id = ++this.nextEntityId;
    // const entity = new Entity(this.ctx, { ...rawEntity, id });
    // this.entityMap.set(id, entity);
    // this.addListeners(entity);
    // if (entity.unit.effects) {
    //   entity.unit.effects.forEach(effect => {
    //     effect.execute(this.ctx, entity, targets);
    //   });
    // }
    // this.ctx.emitter.emit('entity:created', entity);
    // return entity;
  }

  removeEntity(entity: AnyEntity) {
    this.entityMap.delete(entity.id);
    // this.ctx.emitter.emit('entity:destroyed', entity);
  }

  serialize() {
    return {
      entities: this.getList().map(e => e.serialize()),
      nextEntityId: this.nextEntityId
    };
  }
}
