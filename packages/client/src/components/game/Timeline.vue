<script setup lang="ts">
import type { Entity } from '@game/sdk';
// import { useScreen } from 'vue3-pixi';

const { state, assets } = useGame();

const getTextures = (entity: Entity) => {
  const sheet = assets.getSpritesheet(entity.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
};
// const screen = useScreen();

const totalWidth = computed(() => state.value.timeline.length * 96);
</script>

<template>
  <container :pivot-x="-totalWidth / 2.5">
    <graphics
      @render="
        g => {
          g.clear();
          g.beginFill('black');
          g.drawRect(0, 0, totalWidth - 110, 96);
        }
      "
    />
    <animated-sprite
      v-for="(entity, index) in state.timeline"
      :key="`${entity.id}:${index}`"
      :textures="getTextures(entity)"
      :x="index * 80"
    />
  </container>
</template>
