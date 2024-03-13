import type { GameSession } from '@game/sdk';
import type { InjectionKey } from 'vue';
import { GameUi, type IGameUi } from '~/models/game-ui';

export type GameUiContext = Ref<IGameUi>;
const GAME_UI_INJECTION_KEY = Symbol('iso-camera') as InjectionKey<GameUiContext>;

export const useGameUiProvider = (session: GameSession) => {
  const ui = ref(new GameUi(session)) as Ref<IGameUi>;

  provide(GAME_UI_INJECTION_KEY, ui);

  return ui;
};

export const useGameUi = () => useSafeInject(GAME_UI_INJECTION_KEY);
