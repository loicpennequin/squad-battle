<script setup lang="ts">
import { CHARACTER_BLUEPRINTS } from '@game/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { match } from 'ts-pattern';

const { camera, state, session, assets, ui, gameType, playerId } = useGame();

const texture = computed(() => {
  if (!ui.selectedBlueprintId.value) return null;
  const blueprint = CHARACTER_BLUEPRINTS[ui.selectedBlueprintId.value];
  const sheet = assets.getSpritesheet(blueprint.spriteId);

  return createSpritesheetFrameObject('idle', sheet);
});

const playerIndex = computed(() => {
  return match(gameType)
    .with(GAME_TYPES.PVP, () => {
      return session.playerSystem.getList().find(p => p.id === playerId);
    })
    .with(GAME_TYPES.SANDBOX, () => {
      return state.value.players[0].deployment ? 1 : 0;
    })
    .exhaustive();
});

const scaleX = computed(() => {
  let value = playerIndex.value === 0 ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});
const invalidFilter = new ColorOverlayFilter(0xff0000, 0.5);
const filters = computed(() => {
  if (playerIndex.value !== ui.hoveredCell.value?.availableForDeploy)
    return [invalidFilter];
  return [];
});

const getTexture = (id: string) => {
  const sheet = assets.getSpritesheet(id);
  return createSpritesheetFrameObject('idle', sheet);
};

const getHitarea = (id: string) => {
  const shape = assets.getHitbox(id);
  return Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);
};
</script>

<template>
  <template v-if="state.phase === 'deploy'">
    <IsoPositioner
      v-if="ui.hoveredCell.value && texture"
      :animated="false"
      v-bind="ui.hoveredCell.value.position"
      :z-index-offset="3"
      :angle="camera.angle.value"
      :height="state.map.height"
      :width="state.map.width"
      :offset="{
        x: 0,
        y: -CELL_HEIGHT / 4
      }"
    >
      <animated-sprite
        :textures="texture"
        :alpha="0.6"
        event-mode="none"
        :anchor="0.5"
        :filters="filters"
        :scale-x="scaleX"
      />
    </IsoPositioner>
    <IsoPositioner
      v-for="(element, index) in ui.currentDeployment.value"
      :key="`${element.characterId}:${index}`"
      :animated="true"
      v-bind="element.position"
      :z-index-offset="3"
      :angle="camera.angle.value"
      :height="state.map.height"
      :width="state.map.width"
      :offset="{
        x: 0,
        y:
          -CELL_HEIGHT / 4 -
          (ui.selectedBlueprintId.value === element.characterId ? 10 : 0)
      }"
    >
      <animated-sprite
        :textures="getTexture(element.characterId)"
        :anchor="0.5"
        :hit-area="getHitarea(element.characterId)"
        :scale-x="scaleX"
        @pointerup="
          () => {
            if (ui.selectedBlueprintId.value) {
              ui.toggleCharacterDeployment(element.position);
            } else {
              ui.selectedBlueprintId.value = element.characterId;
            }
          }
        "
      />
    </IsoPositioner>
  </template>
</template>
