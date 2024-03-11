import EventEmitter from 'eventemitter3';
import { EntitySystem } from './entity/entity-system';
import { GameMap } from './map/map';
import { ATBSystem } from './atb';
import { PlayerSystem } from './player/player-manager';
import type { Entity, EntityEvent, EntityEventMap } from './entity/entity';
import type { GameAction } from './action/action';

export type GameState = {
  id: string;
};

export type SerializedGameState = {
  id: string;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in
    | EntityEvent
    | EntityLifecycleEvent as `entity:${Event}`]: Event extends EntityEvent
    ? EntityEventMap[Event]
    : Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'game:action': [GameAction<any>];
  'game:ready': [];
};

export class GameSession extends EventEmitter<GlobalGameEvents> {
  static createServerSession(state: SerializedGameState) {
    return new GameSession(state, true);
  }

  static createClientSession(state: SerializedGameState) {
    return new GameSession(state, false);
  }

  atbSystem = new ATBSystem();

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  map = new GameMap(this);

  isReady = false;

  private constructor(
    private initialState: SerializedGameState,
    readonly isAuthoritative: boolean
  ) {
    super();
    this.setup();
  }

  private async setup() {
    if (this.isReady) return;
    this.isReady = true;
    this.emit('game:ready');
  }

  getState(): Readonly<GameState> {
    return {
      id: 'id'
    };
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      id: 'id'
    };
  }
}
