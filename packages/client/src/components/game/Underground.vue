<script setup lang="ts">
const { state, camera, fx, assets } = useGame();

const DEPTH = 4;
const UNDERGROUND_SPRITE_SIZE = 4;

const edgeCells = computed(() =>
  state.value.map.cells.filter(
    cell =>
      cell.z === 0 &&
      (cell.x === 0 ||
        cell.y === 0 ||
        cell.x === state.value.map.width - 1 ||
        cell.y === state.value.map.height - 1)
  )
);

const textures = computed(() => {
  const sheet = assets.getSpritesheet('underground');
  return sheet.animations[0];
});
</script>

<template>
  <template v-for="cell in edgeCells">
    <IsoPositioner
      v-for="i in DEPTH"
      :key="`${cell.id}:${i}`"
      :animated="!fx.isPlaying.value"
      v-bind="cell.position"
      :z="-i * UNDERGROUND_SPRITE_SIZE + 2"
      :angle="camera.angle.value"
      :height="state.map.height"
      :width="state.map.width"
    >
      <animated-sprite :textures="textures" :anchor="0.5" event-mode="none" />
    </IsoPositioner>
  </template>
</template>
