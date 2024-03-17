<script setup lang="ts">
const { assets, state } = useGame();

const items = computed(() => {
  if (!assets.loaded.value) return [];

  return state.value.timeline.map((entity, index) => {
    const sheet = assets.getSpritesheet(entity.blueprint.spriteId);

    const slice = sheet?.data.meta.slices?.find(slice => slice.name === 'icon');

    return {
      id: `${entity.id}:${index}`,
      style: {
        '--bg': `url(/assets/units/${entity.blueprint.spriteId}.png)`,
        '--bg-position': `-${slice?.keys[0].bounds.x}px -${slice?.keys[0].bounds.y}px`
      }
    };
  });
});
// const bgTexture = assets.getTexture('timeline-item.png');
// const maskTexture = assets.getTexture('timeline-mask.png');

const totalWidth = computed(() => state.value.timeline.length * 64);
</script>

<template>
  <div v-if="assets.loaded" class="timeline flex">
    <div v-for="item in items" :key="item.id" :style="item.style" />
  </div>
</template>

<style scoped lang="postcss">
.timeline {
  width: calc(1px * v-bind(totalWidth));

  > div {
    position: relative;

    aspect-ratio: 1;
    width: 64px;

    background-image: url('/assets/ui/timeline-item.png');
    background-size: cover;
    &::after {
      content: '';

      position: absolute;
      inset: 0;

      background-image: var(--bg);
      background-position: var(--bg-position);

      mask-image: url('/assets/ui/timeline-mask.png');
    }
  }
}
</style>
