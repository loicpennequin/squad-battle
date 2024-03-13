import type { Entity } from '@game/sdk';
import type { GameUi } from './game-ui';

export class EntityViewModel {
  constructor(
    readonly entity: Entity,
    private ui: GameUi
  ) {}

  select() {
    this.ui.selectEntity(this.entity.id);
  }

  unselect() {
    this.ui.unselectEntity();
  }

  get isSelected() {
    return this.ui.selectedEntity?.equals(this.entity);
  }

  get isHovered() {
    return this.ui.hoveredEntity?.equals(this.entity);
  }
}
