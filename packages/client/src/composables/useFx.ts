import type { EntityId, GameSession, GameState } from '@game/sdk';
import type { FXSystem } from '@game/sdk/src/fx-system';
import { Container, type AnimatedSprite } from 'pixi.js';
import type { InjectionKey } from 'vue';
import type { GameUiContext } from './useGameUi';
import type { AnyFunction } from '@game/shared';
import { displayText } from './fx/displayText';
import { shakeEntity } from './fx/shakeEntity';
import { moveEntity } from './fx/moveEntity';
import { displayDamageIndicator } from './fx/displayDamageIndicator';
import { attack } from './fx/attack';

export type FxContext = {
  isPlaying: Ref<boolean>;
  ctx: FXSystem;
  provideState: (state: Ref<GameState>) => void;
  provideSession: (session: GameSession) => void;
  provideUi: (ui: GameUiContext) => void;
  registerSprite: (
    entityId: EntityId,
    sprite: MaybeRefOrGetter<AnimatedSprite | undefined>
  ) => void;
  registerEntityRootContainer: (entityId: EntityId, container: Container) => void;
  registerRoot: (container: Container) => void;
};

const FX_INJECTION_KEY = Symbol('fx') as InjectionKey<FxContext>;

export type FxCommand<T extends keyof FXSystem> = (
  ctx: {
    state: GameState;
    session: GameSession;
    ui: GameUiContext;
    spriteMap: Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>;
    entityRootMap: Map<EntityId, Container>;
    sceneRoot: Container;
    done: () => void;
  },
  ...args: Parameters<FXSystem[T]>
) => ReturnType<FXSystem[T]> extends Promise<infer U> ? U : ReturnType<FXSystem[T]>;

export const useFXProvider = () => {
  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');
  const isPlaying = ref(false);
  const spriteMap = new Map<EntityId, MaybeRefOrGetter<AnimatedSprite | undefined>>();
  const entityRootMap = new Map<EntityId, Container>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sceneRoot: Container;

  const provided: {
    state: Ref<GameState> | null;
    session: GameSession | null;
    ui: GameUiContext | null;
  } = {
    state: null,
    session: null,
    ui: null
  };

  const ensureProvided = () => {
    if (
      !isDefined(provided.state) ||
      !isDefined(provided.session || isDefined(provided.ui))
    ) {
      throw new Error('FX  Context has not received his necessary providers.');
    }

    return { state: provided.state!.value, session: provided.session!, ui: provided.ui! };
  };

  const executeCommand = <T extends AnyFunction>(cb: T) => {
    return new Promise<ReturnType<T>>(resolve => {
      if (isHidden.value) return Promise.resolve();
      const { state, session, ui } = ensureProvided();
      isPlaying.value = true;

      return cb({
        state,
        session,
        ui,
        spriteMap,
        entityRootMap,
        sceneRoot,
        done: (val: ReturnType<T>) => {
          nextTick(() => {
            isPlaying.value = false;
            resolve(val);
          });
        }
      });
    });
  };

  const ctx: FXSystem = {
    fadeOutEntity() {
      return Promise.resolve();
    },
    displayText(...args) {
      return executeCommand(ctx => {
        displayText(ctx, ...args);
      });
    },
    displayDamageIndicator(...args) {
      return executeCommand(ctx => {
        displayDamageIndicator(ctx, ...args);
      });
    },
    moveEntity(...args) {
      return executeCommand(ctx => {
        moveEntity(ctx, ...args);
      });
    },
    shakeEntity(...args) {
      return executeCommand(ctx => {
        shakeEntity(ctx, ...args);
      });
    },
    attack(...args) {
      return executeCommand(ctx => {
        attack(ctx, ...args);
      });
    }
  };

  const api: FxContext = {
    ctx,
    isPlaying,
    provideSession(session) {
      provided.session = session;
    },
    provideState(state) {
      provided.state = state;
    },
    provideUi(ui) {
      provided.ui = ui;
    },
    registerSprite(entityId, sprite) {
      spriteMap.set(entityId, sprite);
    },
    registerEntityRootContainer(entityId, container) {
      entityRootMap.set(entityId, container);
    },
    registerRoot(container) {
      sceneRoot = container;
    }
  };

  provide(FX_INJECTION_KEY, api);

  return api;
};

export const useFX = () => useSafeInject(FX_INJECTION_KEY);
