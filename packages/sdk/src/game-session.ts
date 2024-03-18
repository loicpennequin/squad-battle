import EventEmitter from 'eventemitter3';
import { EntitySystem } from './entity/entity-system';
import { GameMap, type GameMapOptions } from './map/map';
import { ATBSystem } from './atb-system';
import { PlayerSystem } from './player/player-system';
import type {
  Entity,
  EntityEvent,
  EntityEventMap,
  EntityId,
  SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable, Values } from '@game/shared';
import type { Player, SerializedPlayer } from './player/player';
import { ActionSystem } from './action/action-system';
import randoomSeed from 'seedrandom';
import { noopFXContext, type FXSystem } from './fx-system';
import type { Obstacle, SerializedObstacle } from './obstacle/obstacle';
import { ObstacleSystem } from './obstacle/obstacle-system';

export type GameState = {
  map: Pick<GameMap, 'height' | 'width' | 'cells'>;
  entities: Entity[];
  players: Player[];
  winner?: Player;
  activeEntity: Entity;
  history: GameAction<any>[];
  phase: GamePhase;
  obstacles: Obstacle[];
  timeline: Entity[];
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  obstacles: SerializedObstacle[];
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  activeEntityId: Nullable<EntityId>;
  phase: GamePhase;
  timeline: SerializedEntity[];
};

type GlobalEntityEvents = {
  [Event in EntityEvent as `entity:${Event}`]: Event extends EntityEvent
    ? EntityEventMap[Event]
    : Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'game:action': [GameAction<any>];
  'game:ready': [];
};

export const GAME_PHASES = {
  DEPLOY: 'deploy',
  BATTLE: 'battle'
} as const;
export type GamePhase = Values<typeof GAME_PHASES>;

export class GameSession extends EventEmitter<GlobalGameEvents> {
  static createServerSession(state: SerializedGameState, seed: string) {
    return new GameSession(state, {
      seed,
      isAuthoritative: true,
      fxSystem: noopFXContext
    });
  }

  static createClientSession(
    state: SerializedGameState,
    seed: string,
    fxSystem: FXSystem
  ) {
    return new GameSession(state, { seed, isAuthoritative: false, fxSystem });
  }

  seed: string;

  rng: randoomSeed.PRNG;

  phase: GamePhase = GAME_PHASES.DEPLOY;

  actionSystem = new ActionSystem(this);

  atbSystem = new ATBSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  obstacleSystem = new ObstacleSystem(this);

  map = new GameMap(this);

  isReady = false;

  readonly isAuthoritative: boolean;

  fxSystem: FXSystem;

  private constructor(
    private initialState: SerializedGameState,
    options: {
      isAuthoritative: boolean;
      seed: string;
      fxSystem: FXSystem;
    }
  ) {
    super();
    this.isAuthoritative = options.isAuthoritative;
    this.fxSystem = options.fxSystem;
    this.seed = options.seed;
    this.rng = randoomSeed(this.seed);
    this.setup();
  }

  private async setup() {
    if (this.isReady) return;
    this.isReady = true;

    this.phase = this.initialState.phase;

    this.map.setup(this.initialState.map);
    this.obstacleSystem.setup(this.initialState.obstacles);
    this.playerSystem.setup(this.initialState.players);
    this.entitySystem.setup(this.initialState.entities);
    this.atbSystem.setup(this.initialState.activeEntityId);
    await this.actionSystem.setup(this.initialState.history);

    this.emit('game:ready');
  }

  dispatch(action: SerializedAction) {
    this.actionSystem.dispatch(action);
  }

  getState(): Readonly<GameState> {
    return {
      map: {
        height: this.map.height,
        width: this.map.width,
        cells: this.map.cells.map(cell => cell.clone())
      },
      entities: this.entitySystem.getList().map(entity => entity.clone()),
      obstacles: this.obstacleSystem.getList().map(obstacle => obstacle.clone()),
      players: this.playerSystem.getList().map(player => player.clone()),
      activeEntity: this.atbSystem.activeEntity,
      history: this.actionSystem.getHistory(),
      phase: this.phase,
      timeline: this.atbSystem.getTimeline(this.entitySystem.getList(), 10),
      winner: undefined
    };
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  transitionToBattle() {
    this.actionSystem.dispatch({ type: 'startBattle', payload: { playerId: '' } });
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      history: this.actionSystem.serialize()
    };
  }
}
