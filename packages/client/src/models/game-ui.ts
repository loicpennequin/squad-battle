import type { Entity, EntityId, GameSession } from '@game/sdk';
import type { CellId } from '@game/sdk/src/map/cell';
import { pointToCellId } from '@game/sdk/src/utils/helpers';
import type { Nullable, Point3D, Prettify, Values } from '@game/shared';
import { match } from 'ts-pattern';
import { EntityViewModel } from './entity-view-model';
import type { MapCellViewModel } from './map-cell-view-model';

export const TARGETING_MODES = {
  NONE: 'NONE',
  MOVE: 'MOVE',
  ATTACK: 'ATTACK',
  SKILL: 'SKILL'
} as const;

type TargetingMode = Values<typeof TARGETING_MODES>;

type IGameUiBase = {
  readonly hoveredEntity: Nullable<EntityViewModel>;
  readonly hoveredCell: Nullable<MapCellViewModel>;
  selectEntity: (id: EntityId) => void;
  unselectEntity: () => void;
  hoverAt: (position: Point3D) => void;
  unhover: () => void;
  switchTargetingMode: (mode: TargetingMode) => void;
};

export type IGameUi = Prettify<
  IGameUiBase &
    (
      | {
          readonly selectedEntity: EntityViewModel;
          readonly targetingMode: Exclude<TargetingMode, typeof TARGETING_MODES.NONE>;
        }
      | {
          readonly selectedEntity: Nullable<EntityViewModel>;
          readonly targetingMode: Extract<TargetingMode, typeof TARGETING_MODES.NONE>;
        }
    )
>;

export class GameUi {
  private selectedEntityId: Nullable<EntityId> = null;
  private hoveredCellId: Nullable<CellId> = null;
  private hoveredEntityId: Nullable<EntityId> = null;
  private _targetingMode: TargetingMode = TARGETING_MODES.NONE;

  constructor(private session: GameSession) {}

  get targetingMode() {
    return this._targetingMode;
  }

  get selectedEntity() {
    if (!isDefined(this.selectedEntityId)) return null;

    const entity = this.session.entitySystem.getEntityById(this.selectedEntityId);
    if (!entity) return null;

    return new EntityViewModel(entity, this.session, this as IGameUi);
  }

  get hoveredEntity() {
    if (!isDefined(this.hoveredEntityId)) return null;

    const entity = this.session.entitySystem.getEntityById(this.hoveredEntityId);
    if (!entity) return null;

    return new EntityViewModel(entity, this.session, this as IGameUi);
  }

  get hoveredCell() {
    if (!this.hoveredCellId) return null;
    return this.session.map.getCellAt(this.hoveredCellId);
  }

  selectEntity(entityId: EntityId) {
    this.selectedEntityId = entityId;
    this._targetingMode = TARGETING_MODES.MOVE;
  }

  unselectEntity() {
    this.selectedEntityId = null;
    this._targetingMode = TARGETING_MODES.NONE;
  }

  hoverAt(position: Point3D) {
    this.hoveredCellId = pointToCellId(position);
    this.hoveredEntityId = this.session.entitySystem.getEntityAt(position)?.id ?? null;
  }

  unhover() {
    this.hoveredCellId = null;
  }

  switchTargetingMode(mode: TargetingMode) {
    match(mode)
      .with(TARGETING_MODES.ATTACK, TARGETING_MODES.SKILL, TARGETING_MODES.MOVE, () => {
        if (!this.selectedEntityId) {
          throw new Error('cannot switch targeting mode without a selectedEntity.');
        }
        this._targetingMode = mode;
      })
      .with(TARGETING_MODES.NONE, () => {
        this._targetingMode = mode;
      })
      .exhaustive();
  }
}
