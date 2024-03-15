<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});

const WIDTH = 10;
const HEIGHT = 10;
const state: SerializedGameState = {
  activeEntityId: null,
  history: [],
  phase: 'deploy',
  map: {
    height: HEIGHT,
    width: WIDTH,
    cells: Array.from({ length: HEIGHT }, (_, y) =>
      Array.from({ length: WIDTH }, (_, x) => ({
        position: {
          x,
          y,
          z: 0
        },
        terrain: x === 0 && y === 0 ? 'water' : 'ground',
        availableForDeploy: null
      }))
    )
      .concat(
        Array.from({ length: HEIGHT / 2 }, (_, y) =>
          Array.from({ length: WIDTH / 2 }, (_, x) => ({
            position: {
              x,
              y,
              z: 1
            },
            terrain: x === 0 && y === 0 ? 'water' : 'ground',
            availableForDeploy: null
          }))
        )
      )
      .flat()
  },
  entities: [],
  players: [
    {
      id: '1',
      name: 'Player 1',
      team: [],
      deployment: [
        {
          characterId: 'test',
          position: { x: 3, y: 4, z: 1 }
        }
      ]
    },
    {
      id: '2',
      name: 'Player 2',
      team: [],
      deployment: [
        {
          characterId: 'test2',
          position: { x: 5, y: 5, z: 0 }
        }
      ]
    }
  ]
};

const fx = useFXProvider();
const session = GameSession.createClientSession(state, 'seed', fx.ctx);
session.onReady(() => {
  session.transitionToBattle();
});

const dispatch = (
  type: Parameters<(typeof session)['dispatch']>[0]['type'],
  payload: any
) => {
  session.dispatch({
    type,
    payload: {
      ...payload,
      playerId: session.atbSystem.activeEntity.player.id
    }
  });
};
</script>

<template>
  <div class="overflow-hidden" style="background: black">
    <ClientOnly>
      <Game
        :game-session="session"
        @move="dispatch('move', $event)"
        @attack="dispatch('attack', $event)"
      />
      <template #fallback>
        <div class="overflow-hidden h-screen" style="background: black"></div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave.active {
  transition: all 0.3s;

  .player-loadout {
    transition: all 0.3s;
    transition-timing-function: var(--ease-out-2);
  }
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;

  .player-loadout {
    &:first-of-type {
      transform: translateX(-25%);
      opacity: 0;
    }
    &:last-of-type {
      transform: translateX(25%);
      opacity: 0;
      filter: sepia(100%);
    }
  }
}
</style>
