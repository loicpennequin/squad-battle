<script setup lang="ts">
import type { Entity } from '@game/sdk';

const { entity, size = 'md' } = defineProps<{ entity: Entity; size?: 'md' | 'lg' }>();

const { assets, ui } = useGame();

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!assets.loaded.value) return null;

  const sheet = assets.getSpritesheet(entity.blueprint.spriteId);

  const slice = sheet?.data.meta.slices?.find(slice => slice.name === 'icon');
  const ratio = (el.value?.clientWidth ?? 1) / (slice?.keys[0].bounds.w ?? 1);

  return {
    entity,
    style: {
      '--bg': `url(/assets/units/${entity.blueprint.spriteId}.png)`,
      '--offset-x': `-${ratio * slice!.keys[0].bounds.x}px`,
      '--offset-y': `-${ratio * slice!.keys[0].bounds.y}px`
    }
  };
});
</script>

<template>
  <div
    v-if="item"
    ref="el"
    class="entity-icon"
    :class="size"
    :style="item.style"
    @mouseenter="
      () => {
        ui.hoverAt(item!.entity.position);
      }
    "
    @mouseleave="
      () => {
        ui.unhover();
      }
    "
  />
</template>

<style scoped lang="postcss">
.entity-icon {
  aspect-ratio: 1;
  width: 64px;

  background: url('/assets/ui/entity-border.png'), var(--bg),
    url('/assets/ui/entity-bg.png');
  background-position:
    0 0,
    var(--offset-x) var(--offset-y),
    0 0;
  background-size:
    cover,
    200% 200%,
    cover;
}
</style>
