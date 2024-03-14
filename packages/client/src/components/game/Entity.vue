<script setup lang="ts">
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import type { Entity } from '@game/sdk';
import type { Filter } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';

const { entity } = defineProps<{ entity: Entity }>();

const { camera, assets, state, ui, fx } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(entity.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});
const activeTexture = computed(() => {
  const sheet = assets.getSpritesheet('selected-unit');
  return createSpritesheetFrameObject('idle', sheet);
});

const hoveredFilters = [
  new AdvancedBloomFilter({
    blur: 0,
    bloomScale: 0.9,
    threshold: 0.75
  }),
  new OutlineFilter(2, 0xffffff, 0.2, 0)
];

const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity));
const isSelected = computed(() => ui.selectedEntity.value?.equals(entity));
const isActive = computed(() => state.value.activeEntity.equals(entity));

watchEffect(() => {
  gsap.to(hoveredFilters[0], {
    duration: 0.2,
    blur: isHovered.value || isSelected.value ? 4 : 0,
    ease: Power2.easeOut
  });
  gsap.to(hoveredFilters[1], {
    duration: 0.2,
    alpha: isHovered.value || isSelected.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (isHovered.value || isSelected.value) {
    result.push(...hoveredFilters);
  }

  return result;
});

const shape = assets.getHitbox(entity.blueprint.spriteId);
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);

const scaleX = computed(() => {
  let value = entity.player.id === state.value.players[0].id ? 1 : -1;
  if (camera.angle.value === 90 || camera.angle.value === 180) {
    value *= -1;
  }

  return value;
});
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="entity.position"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container :y="-CELL_HEIGHT / 4">
      <EntityStats :entity="entity" />

      <animated-sprite
        v-if="isActive"
        :textures="activeTexture"
        event-mode="none"
        :anchor="0.5"
        :scale-x="scaleX"
        playing
      />
      <animated-sprite
        :textures="textures"
        :filters="filters"
        :hit-area="hitArea"
        :anchor="0.5"
        :scale-x="scaleX"
        @pointerenter="
          () => {
            ui.hoverAt(entity.position);
          }
        "
        @pointerup="isSelected ? ui.unselect() : ui.select(entity.id)"
      />
    </container>
  </IsoPositioner>
</template>
~/utils/hitbox
