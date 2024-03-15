import { type Nullable, isDefined } from '@game/shared';
import { GameSession } from '../game-session';
import { type Point3D } from '../types';
import { Entity, type EntityId } from './entity';

export const getEntityIfOwnerMatches = (
  ctx: GameSession,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entitySystem.getEntityById(entityId);
  if (!entity) return null;

  if (entity.player.id !== playerId) return null;

  return entity;
};

export const isAlly = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) return false;

  return entity.player.id === playerId;
};

export const isEnemy = (
  session: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = session.entitySystem.getEntityById(entityId);
  if (!entity) return false;

  return entity.player.id !== playerId;
};

export const isEmpty = (session: GameSession, point: Point3D) => {
  return (
    !session.entitySystem.getEntityAt(point) &&
    !session.obstacleSystem.getObstacleAt(point)
  );
};

export const pointsToEntities = (session: GameSession, points: Point3D[]): Entity[] =>
  points.map(point => session.entitySystem.getEntityAt(point)).filter(isDefined);

export const pointsToEntityIds = (session: GameSession, points: Point3D[]): EntityId[] =>
  pointsToEntities(session, points).map(e => e.id);
