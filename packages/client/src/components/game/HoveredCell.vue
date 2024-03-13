<script setup lang="ts">
const { camera, ui, assets, state } = useGame();
const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSpritesheet('hovered-cell'))
);
</script>

<template>
  <IsoPositioner
    v-if="ui.hoveredCell"
    :x="ui.hoveredCell.x"
    :y="ui.hoveredCell.y"
    :z="ui.hoveredCell.z"
    :z-index-offset="1.5"
    :height="state.map.height"
    :width="state.map.width"
    :angle="camera.angle"
    :animated="false"
  >
    <animated-sprite
      :x="0"
      :event-mode="'none'"
      :anchor="0.5"
      playing
      :textures="textures"
    />
  </IsoPositioner>
</template>
