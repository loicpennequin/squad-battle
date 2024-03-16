<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const WIDTH = 10;
const HEIGHT = 10;
const state: SerializedGameState = {
  activeEntityId: null,
  history: [],
  phase: 'deploy',
  obstacles: [
    {
      id: 1,
      spriteId: 'tree',
      position: { x: 6, y: 7, z: 0 }
    },
    {
      id: 2,
      spriteId: 'tree',
      position: { x: 4, y: 3, z: 1 }
    },
    {
      id: 3,
      spriteId: 'tree',
      position: { x: 3, y: 3, z: 1 }
    },
    {
      id: 3,
      spriteId: 'column',
      position: { x: 1, y: 2, z: 1 }
    }
  ],
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
        terrain: y > 7 ? 'water' : 'ground',
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
            terrain: 'ground',
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
        },
        {
          characterId: 'test3',
          position: { x: 4, y: 4, z: 1 }
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
        },
        {
          characterId: 'test4',
          position: { x: 6, y: 6, z: 0 }
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
  <Game
    :game-session="session"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
  />
</template>
