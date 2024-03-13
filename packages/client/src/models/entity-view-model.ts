import type { Entity, GameSession } from '@game/sdk';
import type { IGameUi } from './game-ui';
import type { State } from '~/composables/useGame';

export class EntityViewModel {
  constructor(
    readonly entity: Entity,
    private session: GameSession,
    private ui: IGameUi
  ) {}

  get entityId() {
    return this.entity.id;
  }

  equals(vm: EntityViewModel) {
    return vm.entity.equals(this.entity);
  }

  select() {
    this.ui.selectEntity(this.entity.id);
  }

  unselect() {
    this.ui.unselectEntity();
  }

  isActive(state: State) {
    return state.activeEntity?.equals(this);
  }

  canMove(distance: number) {
    return this.entity.canMove(distance);
  }

  getDistanceMap() {
    return this.session.map.getDistanceMap(this.position, this.entity.ap);
  }

  get spriteId() {
    return this.entity.blueprint.spriteId;
  }

  get position() {
    return this.entity.position;
  }

  get isSelected() {
    return this.ui.selectedEntity?.equals(this);
  }

  get isHovered() {
    return this.ui.hoveredEntity?.equals(this);
  }

  get distanceMap() {
    return this.session.map.getDistanceMap(this.entity.position, this.entity.ap);
  }
}
