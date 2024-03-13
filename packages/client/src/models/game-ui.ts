import type { EntityId, GameSession } from '@game/sdk';
import type { CellId } from '@game/sdk/src/map/cell';
import { pointToCellId } from '@game/sdk/src/utils/helpers';
import type { Nullable, Point3D } from '@game/shared';

export class GameUi {
  private selectedEntityId: Nullable<EntityId> = null;
  private hoveredCellId: Nullable<CellId> = null;
  private hoveredEntityId: Nullable<EntityId> = null;

  constructor(private session: GameSession) {}

  get selectedEntity() {
    if (!isDefined(this.selectedEntityId)) return null;

    return this.session.entitySystem.getEntityById(this.selectedEntityId);
  }

  get hoveredEntity() {
    if (!isDefined(this.hoveredEntityId)) return null;

    return this.session.entitySystem.getEntityById(this.hoveredEntityId);
  }

  get hoveredCell() {
    if (!this.hoveredCellId) return null;
    return this.session.map.getCellAt(this.hoveredCellId);
  }

  selectEntity(entityId: EntityId) {
    this.selectedEntityId = entityId;
  }

  unselectEntity() {
    this.selectedEntityId = null;
  }

  hoverAt(position: Point3D) {
    this.hoveredCellId = pointToCellId(position);
    this.hoveredEntityId = this.session.entitySystem.getEntityAt(position)?.id ?? null;
  }

  unhoverCell() {
    this.hoveredCellId = null;
  }
}
