<script setup lang="ts">
import { Cell } from '@game/sdk';

// watchEffect(() => {
//   if (gameObjectsLayer.value) {
//     gameObjectsLayer.value.group.enableSort = true;
//     gameObjectsLayer.value.sortableChildren = true;
//   }
// });
const WIDTH = 15;
const HEIGHT = 10;
const map = {
  height: HEIGHT,
  width: WIDTH,
  cells: Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => ({
      position: {
        x,
        y,
        z: 0
      },
      terrain: 'ground',
      availableForDeploy: null
    }))
  )
    .flat()
    .map(c => new Cell(c))
};
</script>

<template>
  <Camera :map="map">
    <MapCell v-for="cell in map.cells" :key="cell.id" :cell="cell" />
  </Camera>

  <Fps />
</template>
