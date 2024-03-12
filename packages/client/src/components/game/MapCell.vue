<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { useApplication } from 'vue3-pixi';
import { CELL_WIDTH, CELL_HEIGHT } from '../../utils/constants';

const { cell } = defineProps<{ cell: Cell }>();

const app = useApplication();

const assets = useAssets();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(cell.terrain);
  return sheet.animations[0];
});

// const hitArea = computed(() => {
//   const STEP = CELL_SIZE / 4;
//   const hitAreaYOffset = cell.isHalfTile ? STEP / 2 : 0;
//   //prettier-ignore
//   const p = new Polygon([
//     { x: STEP * -2, y: STEP + hitAreaYOffset },
//     { x: 0        , y: 0 + hitAreaYOffset },
//     { x: STEP * 2 , y: STEP  + hitAreaYOffset },
//     { x: STEP * 2 , y: STEP * 3 },
//     { x: 0        , y: STEP * 4 },
//     { x: STEP * -2, y: STEP * 3 }
//   ]);

//   return p;
// });
</script>

<template>
  <IsoPositioner
    animated
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z"
    :angle="0"
    :height="10"
    :width="15"
  >
    <container event-mode="none">
      <animated-sprite :textures />
    </container>
  </IsoPositioner>
</template>
