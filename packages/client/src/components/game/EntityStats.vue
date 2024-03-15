<script setup lang="ts">
import { clamp } from '@game/shared';
import { config, type Entity } from '@game/sdk';
import { Graphics } from 'pixi.js';

const { entity } = defineProps<{ entity: Entity }>();

const { assets, ui } = useGame();

const sheet = assets.getSpritesheet('entity-stat-bars');

const mask = ref<Graphics>();

const textures = computed(() => {
  return createSpritesheetFrameObject(
    tweenedAtb.value >= config.MAX_ATB ? 'ready' : 'idle',
    sheet
  );
});
const apTextures = computed(() => {
  return createSpritesheetFrameObject('idle', assets.getSpritesheet('ap'));
});

const tweenedAtb = ref(entity.atb);
const tweenedHp = ref(entity.hp);

watch(
  () => entity.atb,
  (newAtb, oldAtb) => {
    if (oldAtb > newAtb) {
      tweenedAtb.value = 0;
    }
    gsap.to(tweenedAtb, {
      value: newAtb,
      duration: 0.5
    });
  }
);
watch(
  () => entity.hp,
  newHp => {
    gsap.to(tweenedHp, {
      value: newHp,
      duration: 0.5
    });
  }
);

const apXOffset = computed(() => {
  const base = 7;
  return base - (entity.ap - 3) * 8;
});
</script>

<template>
  <container
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="-CELL_HEIGHT * 1.2"
    :x="-CELL_WIDTH * 0.3"
    event-mode="none"
  >
    <container>
      <animated-sprite :textures="textures" playing loop />
    </container>

    <pixi-graphics
      ref="mask"
      @render="
        g => {
          const slices = [
            [
              sheet.data.meta.slices?.find(atbSlice => atbSlice.name === 'atb'),
              tweenedAtb,
              config.MAX_ATB
            ] as const,
            [
              sheet.data.meta.slices?.find(atbSlice => atbSlice.name === 'hp'),
              tweenedHp,
              entity.maxHp
            ] as const
          ];
          g.clear();
          g.beginFill(0x665555);
          slices.forEach(([slice, stat, max]) => {
            if (!slice) return;
            const { bounds } = slice.keys[0];
            const xOffset = clamp(Math.round(bounds.w * (stat / max)), 0, bounds.w);
            g.drawRect(bounds.x + xOffset, bounds.y, bounds.w - xOffset, bounds.h);
          });

          g.endFill();
        }
      "
    />
  </container>

  <container
    :ref="(container: any) => ui.assignLayer(container, 'ui')"
    :y="-CELL_HEIGHT * 0.88"
    :x="apXOffset"
    event-mode="none"
  >
    <animated-sprite
      v-for="(_, i) in entity.ap"
      :key="i"
      :x="i * 8"
      :textures="apTextures"
    />
  </container>
</template>
