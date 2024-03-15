<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Obstacle } from '@game/sdk';
import { Container, type Filter } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';
import { match } from 'ts-pattern';

const { obstacle } = defineProps<{ obstacle: Obstacle }>();

const { camera, assets, state, ui, fx, dispatch } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(obstacle.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const shape = assets.getHitbox(obstacle.spriteId);
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);

const onEnter = (container: Container) => {
  container.y = -200;
  container.alpha = 0;
  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    delay: Math.random() * 0.5,
    onStart() {
      container.alpha = 1;
    }
  });
};
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="obstacle.position"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="state.map.height"
    :width="state.map.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT / 4
    }"
  >
    <PTransition appear :duration="{ enter: 1000, leave: 0 }" @enter="onEnter">
      <animated-sprite
        :ref="(el: any) => fx.registerSprite(obstacle.id, el)"
        :textures="textures"
        :hit-area="hitArea"
        :anchor="0.5"
      />
    </PTransition>
  </IsoPositioner>
</template>
