<script setup lang="ts">
import shape from '@/assets/hitboxes/tile.json';
import type { Cell } from '@game/sdk';
import { Hitbox } from '~/utils/hitbox';

const { cell } = defineProps<{ cell: Cell }>();

const { assets, camera, state, ui } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(cell.terrain);
  return sheet.animations[0];
});

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell));
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

const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);
</script>

<template>
  <IsoPositioner
    animated
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container>
      <animated-sprite
        :textures="textures"
        :anchor="0.5"
        :hit-area="hitArea"
        @pointerdown="ui.unselect()"
        @pointerenter="ui.hoverAt(cell.position)"
        @pointerleave="ui.unhover()"
      />

      <MapCellHighlights :cell="cell" />
      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>
</template>
~/utils/hitbox
