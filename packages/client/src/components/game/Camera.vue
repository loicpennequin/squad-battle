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

const { cells, height, width } = map;

const { camera } = useGame();

useEventListener('keydown', e => {
  if (e.repeat) return;

  if (e.code === 'KeyQ') {
    camera.value.rotateCCW();
  } else if (e.code === 'KeyE') {
    camera.value.rotateCW();
  }
});

const isoCells = computed(() =>
  cells.map(cell => toIso(cell.position, camera.value.angle, { width, height }))
);
const minX = computed(() => Math.min(...isoCells.value.map(c => c.isoX)));
const maxX = computed(() => Math.max(...isoCells.value.map(c => c.isoX)));
const minY = computed(() => Math.min(...isoCells.value.map(c => c.isoY - c.isoZ)));
const maxY = computed(() => Math.max(...isoCells.value.map(c => c.isoY - c.isoZ)));
const isoBoundingRect = computed(() => ({
  topLeft: { x: minX.value, y: minY.value },
  bottomRight: { x: maxX.value, y: maxY.value }
}));

const worldSize = computed(() => ({
  width:
    isoBoundingRect.value.bottomRight.x - isoBoundingRect.value.topLeft.x + CELL_WIDTH,
  height:
    isoBoundingRect.value.bottomRight.y - isoBoundingRect.value.topLeft.y + CELL_HEIGHT
}));

watchEffect(() => {
  console.log(minX.value);
});
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
    <graphics
      :alpha="0"
      @render="
        g => {
          g.clear();
          g.beginFill('red');
          g.drawRect(0, 0, worldSize.width, worldSize.height);
          g.endFill();
        }
      "
    />
    <container :sortable-children="true" :x="-minX" :y="-minY">
      <slot />
    </container>
  </viewport>

  <Fps />
</template>
