<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { Cell } from '@game/sdk';
// eslint-disable-next-line import/no-unresolved
import { CELL_HEIGHT, CELL_WIDTH } from '@/utils/constants';

const app = useApplication();
const { map } = defineProps<{ map: { width: number; height: number; cells: Cell[] } }>();
const screenViewport = shallowRef<Viewport>();

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    screenViewport.value
      ?.drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      .mouseEdges({
        distance: 10,
        speed: 18,
        allowButtons: true
      })
      .clamp({
        direction: 'all'
      })
      .clampZoom({ minScale: 1, maxScale: 3 })
      .zoomPercent(1, false);
    // .moveCenter(center.isoX, cente r.isoY);
  });

// watchEffect(() => {
//   if (gameObjectsLayer.value) {
//     gameObjectsLayer.value.group.enableSort = true;
//     gameObjectsLayer.value.sortableChildren = true;
//   }
// });

const { cells } = map;

const isoCells = cells.map(cell => toIso(cell.position, 0, { height: 0, width: 0 }));
const minX = Math.min(...isoCells.map(c => c.isoX));
const maxX = Math.max(...isoCells.map(c => c.isoX));
const minY = Math.min(...isoCells.map(c => c.isoY - c.isoZ));
const maxY = Math.max(...isoCells.map(c => c.isoY - c.isoZ));
const isoBoundingRect = {
  topLeft: { x: minX, y: minY },
  bottomRight: { x: maxX, y: maxY }
};

const worldSize = {
  width: isoBoundingRect.bottomRight.x - isoBoundingRect.topLeft.x + CELL_WIDTH,
  height: isoBoundingRect.bottomRight.y - isoBoundingRect.topLeft.y + CELL_HEIGHT
};
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="worldSize.width"
    :world-height="worldSize.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <container :sortable-children="true" :x="-minX">
      <slot />
    </container>
  </viewport>

  <Fps />
</template>
