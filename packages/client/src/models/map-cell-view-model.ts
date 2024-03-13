import type { Cell, Entity, GameSession } from '@game/sdk';
import type { GameUi } from './game-ui';

export class MapCellViewModel {
  constructor(
    readonly cell: Cell,
    private session: GameSession,
    private ui: GameUi
  ) {}

  get isHovered() {
    return this.ui.hoveredCell?.equals(this.cell);
  }
}
