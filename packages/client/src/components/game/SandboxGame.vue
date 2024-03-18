<script setup lang="ts">
import { GameSession, type SerializedGameState } from '@game/sdk';

const WIDTH = 10;
const HEIGHT = 10;
const state: SerializedGameState = {
  activeEntityId: null,
  history: [],
  phase: 'deploy',
  timeline: [],
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
    },
    {
      id: 4,
      spriteId: 'column',
      position: { x: 2, y: 2, z: 1 }
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
        availableForDeploy: x < 2 ? 0 : x > 7 ? 1 : null
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
            availableForDeploy: x < 2 ? 0 : x > 7 ? 1 : null
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
      team: ['test', 'test2'],
      deployment: null
    },
    {
      id: '2',
      name: 'Player 2',
      team: ['test3', 'test4'],
      deployment: null
    }
  ]
};

const fx = useFXProvider();
const session = GameSession.createClientSession(state, 'seed', fx.ctx);

const dispatch = (
  type: Parameters<(typeof session)['dispatch']>[0]['type'],
  payload: any
) => {
  if (session.phase === 'deploy') {
    const players = session.playerSystem.getList();
    const idx = players[0].deployment ? 1 : 0;
    session.dispatch({
      type,
      payload: {
        ...payload,
        playerId: players[idx].id
      }
    });
  } else {
    session.dispatch({
      type,
      payload: {
        ...payload,
        playerId: session.atbSystem.activeEntity.player.id
      }
    });
  }
};
</script>

<template>
  <Game
    :game-session="session"
    :player-id="null"
    :game-type="GAME_TYPES.SANDBOX"
    @move="dispatch('move', $event)"
    @attack="dispatch('attack', $event)"
    @end-turn="dispatch('endTurn', $event)"
    @use-skill="dispatch('useSkill', $event)"
    @deploy="dispatch('deploy', $event)"
  />
</template>
