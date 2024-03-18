<script setup lang="ts">
import { match } from 'ts-pattern';
import { CHARACTER_BLUEPRINTS } from '@game/sdk';
const { state, ui, gameType, playerId, session, camera, dispatch } = useGame();

const blueprints = computed(() => {
  return match(gameType)
    .with(GAME_TYPES.PVP, () => session.playerSystem.getPlayerById(playerId!)!.team)
    .with(GAME_TYPES.SANDBOX, () => {
      if (state.value.players[0].deployment) {
        console.log(state.value.players[1]);
        return state.value.players[1].team;
      }
      return state.value.players[0].team;
    })
    .exhaustive();
});

const player = computed(() => {
  return match(gameType)
    .with(GAME_TYPES.PVP, () => {
      return session.playerSystem.getList().find(p => p.id === playerId);
    })
    .with(GAME_TYPES.SANDBOX, () => {
      const idx = state.value.players[0].deployment ? 1 : 0;
      return state.value.players[idx];
    })
    .exhaustive();
});

const canDeploy = computed(
  () => player.value?.team.length === ui.currentDeployment.value.length
);
</script>

<template>
  <div class="deploy-bar">
    <label v-for="blueprint in blueprints" :key="blueprint.id">
      <input
        v-model="ui.selectedBlueprintId.value"
        type="radio"
        :value="blueprint.id"
        class="sr-only"
      />
      <EntityIcon :sprite-id="CHARACTER_BLUEPRINTS[blueprint.id].spriteId" />
    </label>
    <UiFancyButton
      :disabled="!canDeploy"
      @click="
        () => {
          dispatch('deploy', { characters: ui.currentDeployment.value });
          ui.currentDeployment.value = [];
        }
      "
    >
      Deploy
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.deploy-bar {
  position: absolute;
  bottom: var(--size-3);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-3);

  > label {
    cursor: pointer;
    aspect-ratio: 1;
    width: 128px;

    &:focus-within {
      filter: brightness(120%);
      outline: solid var(--border-size-2) var(--primary);
    }
    > div {
      width: 100%;
    }
  }
}
</style>
