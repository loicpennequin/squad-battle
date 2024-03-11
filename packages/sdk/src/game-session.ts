import EventEmitter from 'eventemitter3';
import { EntitySystem } from './entity/entity-system';
import { GameMap, type GameMapOptions } from './map/map';
import { ATBSystem } from './atb';
import { PlayerSystem, type SerializedPlayer } from './player/player-manager';
import type {
  Entity,
  EntityEvent,
  EntityEventMap,
  EntityId,
  SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable } from '@game/shared';
import type { Player } from './player/player';
import { ActionSystem } from './action/action-system';

export type GameState = {
  map: Pick<GameMap, 'height' | 'width' | 'cells'>;
  entities: Entity[];
  players: Player[];
  winner?: Player;
  activeEntity: Entity;
  history: GameAction<any>[];
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  activeEntityId: Nullable<EntityId>;
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

  actionSystem = new ActionSystem(this);

  atbSystem = new ATBSystem(this);

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

    this.map.setup(this.initialState.map);
    this.playerSystem.setup(this.initialState.players);
    this.entitySystem.setup(this.initialState.entities);
    this.atbSystem.setup(this.initialState.activeEntityId);
    await this.actionSystem.setup(this.initialState.history);

    this.emit('game:ready');
  }

  getState(): Readonly<GameState> {
    return {
      map: {
        height: this.map.height,
        width: this.map.width,
        cells: this.map.cells.map(cell => cell.clone())
      },
      entities: this.entitySystem.getList().map(entity => entity.clone()),
      players: this.playerSystem.getList().map(player => player.clone()),
      activeEntity: this.atbSystem.activeEntity,
      history: this.actionSystem.getHistory(),
      winner: undefined
    };
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      history: this.actionSystem.serialize()
    };
  }
}
