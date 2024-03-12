<script setup lang="ts">
import sky1 from '@/assets/backgrounds/sky-1.png';
// watchEffect(() => {
//   if (gameObjectsLayer.value) {
//     gameObjectsLayer.value.group.enableSort = true;
//     gameObjectsLayer.value.sortableChildren = true;
//   }
// });
const { state } = useGame();
</script>

<template>
  <Sky />
  <Camera>
    <MapCell v-for="cell in state.map.cells" :key="cell.id" :cell="cell" />

    <Entity v-for="entity in state.entities" :key="entity.id" :entity="entity" />
  </Camera>

  <Fps />
</template>
