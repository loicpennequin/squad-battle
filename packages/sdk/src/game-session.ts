import mitt from 'mitt';
import { EntityManager } from './entity/entity-manager';
import { PlayerManager } from './player/player-manager';
import { GameMap } from './map/map';

export type GameState = {
  id: string;
};

export type SerializedGameState = {
  id: string;
};

type GlobalGameEvents = {
  'game:ready': void;
};

export class GameSession {
  static createServerSession(state: SerializedGameState) {
    return new GameSession(state, true);
  }

  static createClientSession(state: SerializedGameState) {
    return new GameSession(state, false);
  }

  entityManager = new EntityManager(this);

  playerManager = new PlayerManager(this);

  map = new GameMap(this);

  emitter = mitt<GlobalGameEvents>();

  isReady = false;

  private constructor(
    private initialState: SerializedGameState,
    readonly isAuthoritative: boolean
  ) {
    this.setup();
  }

  private async setup() {
    if (this.isReady) return;
    this.isReady = true;
    this.emitter.emit('game:ready');
  }

  getState(): Readonly<GameState> {
    return {
      id: 'id'
    };
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.emitter.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      id: 'id'
    };
  }
}
