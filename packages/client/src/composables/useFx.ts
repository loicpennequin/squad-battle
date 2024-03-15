import type { EntityId, GameSession, GameState } from '@game/sdk';
import type { FXSystem } from '@game/sdk/src/fx-system';
import { Container, Text, type AnimatedSprite } from 'pixi.js';
import type { InjectionKey } from 'vue';
import type { GameUiContext } from './useGameUi';

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

  const ctx: FXSystem = {
    moveEntity(entityId, path) {
      const { state } = ensureProvided();
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        isPlaying.value = true;
        // we are grabbing the entity from the reactive state instead of entityManager otherwise the movement won't be rendered !
        // It's ok because the position wil be updated when the action execution is flushed after the fx sequence
        const entity = state.entities.find(e => e.id === entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const timeline = gsap.timeline({
          onComplete() {
            // we are waiting for nextTick because we dont want the entity position to be tweened again when the state update from the action happens
            nextTick(() => {
              isPlaying.value = false;
            });
            resolve();
          }
        });
        for (const { point, duration } of path) {
          timeline.to(entity.position, {
            x: point.x,
            y: point.y,
            z: point.z,
            duration,
            ease: Power1.easeOut
          });
        }

        timeline.play();
      });
    },

    displayText(text, entityId, { color, path, duration }) {
      if (isHidden.value) return Promise.resolve();

      return new Promise(resolve => {
        const { session, ui } = ensureProvided();
        const entity = session.entitySystem.getEntityById(entityId);
        if (!entity) {
          console.warn(`FXContext: entity not found for entityId ${entityId}`);
          return resolve();
        }

        const sprite = toValue(spriteMap.get(entityId));
        if (!sprite) {
          console.warn(`FXContext: sprite not found for entity ${entityId}`);
          return resolve();
        }
        const root = entityRootMap.get(entityId);
        if (!root) {
          console.warn(
            `FXContext: entity root container not found for entity ${entityId}`
          );
          return resolve();
        }

        const container = new Container();

        const textSprite = new Text(text, {
          fontSize: 30,
          fontWeight: '700',
          fill: color,
          stroke: 'black',
          strokeThickness: 4
        });

        container.addChild(textSprite);
        // gsap motionpath doesn't work with gsap pixi plugin, so we apply values to a dummy object and update the text on update
        const sentinel = Object.assign({ x: 0, y: 0, scale: 1, alpha: 1 }, path.shift()!);

        const onUpdate = () => {
          textSprite.position.set(sentinel.x, sentinel.y);
          // we divide the scale by 2 to avoid pixelated text since the game is zoomed in by default
          textSprite.scale.set(sentinel.scale * 0.5, sentinel.scale * 0.5);
          textSprite.alpha = sentinel.alpha;
        };
        onUpdate(); // set starting values on sprite

        ui.assignLayer(container, 'ui');
        root.addChild(container);
        gsap.to(sentinel, {
          motionPath: {
            path
          },
          duration,
          onUpdate,
          ease: Power2.easeOut,
          onComplete: () => {
            container.destroy();
            resolve();
          }
        });
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
