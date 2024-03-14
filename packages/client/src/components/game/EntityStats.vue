<script setup lang="ts">
import { clamp } from '@game/shared';
import { config, type Entity } from '@game/sdk';
import { Graphics } from 'pixi.js';

const { entity } = defineProps<{ entity: Entity }>();

const { assets } = useGame();

const sheet = assets.getSpritesheet('entity-stat-bars');

const mask = ref<Graphics>();

const textures = computed(() => {
  return createSpritesheetFrameObject(
    tweenedAtb.value >= config.MAX_ATB ? 'ready' : 'idle',
    sheet
  );
});

const tweenedAtb = ref(entity.atb);
const tweenedHp = ref(entity.atb);

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
</script>

<template>
  <container :y="-CELL_HEIGHT * 1.15" :x="-CELL_WIDTH * 0.3">
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
          g.beginFill('black');
          g.drawRect(0, 0, sheet.data.meta.size!.w, sheet.data.meta.size!.h);
          g.endFill();
          g.beginHole();
          slices.forEach(([slice, stat, max]) => {
            if (!slice) return;
            const { bounds } = slice.keys[0];
            const xOffset = clamp(Math.round(bounds.w * (stat / max)), 0, bounds.w);
            g.drawRect(bounds.x + xOffset, bounds.y, bounds.w - xOffset, bounds.h);
          });
          g.endHole();
        }
      "
    />
    <container :mask="mask">
      <animated-sprite :textures="textures" playing loop />
    </container>
  </container>
</template>
