<script setup lang="ts">
import { Entity } from '@game/sdk';
const { entity } = defineProps<{ entity: Entity }>();

const { assets } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet('entity-stat-bars');
  return createSpritesheetFrameObject('idle', sheet);
});
</script>

<template>
  <container event-mode="none">
    <animated-sprite :textures="textures" :anchor="0.5" :y="-CELL_HEIGHT * 0.85" />
  </container>
</template>
