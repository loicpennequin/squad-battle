<script setup lang="ts">
import { Entity } from '@game/sdk';
const { entity } = defineProps<{ entity: Entity }>();

const { camera, assets, state } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(entity.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});
</script>

<template>
  <IsoPositioner
    animated
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z"
    :angle="camera.angle"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container event-mode="none" :y="-CELL_HEIGHT / 4">
      <EntityStats :entity="entity" />
      <animated-sprite :textures="textures" :anchor="0.5" />
    </container>
  </IsoPositioner>
</template>
