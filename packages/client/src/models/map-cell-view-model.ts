import type { Cell, GameSession, GameState } from '@game/sdk';
import { TARGETING_MODES, type IGameUi } from './game-ui';
import type { IsoCamera } from './iso-camera';
import { match } from 'ts-pattern';
import type { State } from '~/composables/useGame';

export class MapCellViewModel {
  constructor(
    readonly cell: Cell,
    private session: GameSession,
    private ui: IGameUi,
    private camera: IsoCamera
  ) {}

  equals(vm: MapCellViewModel) {
    return vm.cell.equals(this.cell);
  }

  get terrain() {
    return this.cell.terrain;
  }

  get position() {
    return this.cell.position;
  }

  get isHovered() {
    return this.ui.hoveredCell?.equals(this);
  }

  get isHighlighted() {
    return match(this.ui.targetingMode)
      .with(TARGETING_MODES.ATTACK, () => false /* todo */)
      .with(TARGETING_MODES.SKILL, () => false /* todo */)
      .with(TARGETING_MODES.MOVE, () => {
        const distanceMap = this.ui.selectedEntity!.getDistanceMap();

        return this.ui.selectedEntity!.canMove(distanceMap.get(this.cell));
      })
      .with(TARGETING_MODES.NONE, () => false)
      .exhaustive();
  }

  getBitmask(state: State) {
    return getBitMask(this.session, state, this.cell, this.camera.angle, neighbor => {
      if (!neighbor) return false;

      return match(this.ui.targetingMode)
        .with(TARGETING_MODES.ATTACK, () => false /* todo */)
        .with(TARGETING_MODES.SKILL, () => false /* todo */)
        .with(TARGETING_MODES.MOVE, () => {
          const entity = this.ui.selectedEntity!;
          const distanceMap = entity.getDistanceMap();

          return entity.canMove(distanceMap.get(neighbor));
        })
        .with(TARGETING_MODES.NONE, () => false /* todo */)

        .exhaustive();
    });
  }
}
