import type { GameState } from '@game/sdk';
import type { FXSystem } from '@game/sdk/src/fx-system';
import type { InjectionKey } from 'vue';

export type FxContext = {
  isPlaying: Ref<boolean>;
  ctx: FXSystem;
  provideState: (state: Ref<GameState>) => void;
};

const FX_INJECTION_KEY = Symbol('fx') as InjectionKey<FxContext>;

export const useFXProvider = () => {
  const visibility = useDocumentVisibility();
  const isHidden = computed(() => visibility.value === 'hidden');
  const isPlaying = ref(false);

  const provided: { state: Ref<GameState> | null } = {
    state: null
  };
  const ensureState = () => {
    if (!isDefined(provided.state)) {
      throw new Error('Cannot use the fx context before provided the state ref first !');
    }

    return provided.state.value;
  };

  const ctx: FXSystem = {
    moveEntity(entityId, path) {
      const state = ensureState();
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
    }
  };

  const api: FxContext = {
    ctx,
    isPlaying,
    provideState(state) {
      provided.state = state;
    }
  };

  provide(FX_INJECTION_KEY, api);

  return api;
};

export const useFX = () => useSafeInject(FX_INJECTION_KEY);
