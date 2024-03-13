<script setup lang="ts">
import { type Filter } from 'pixi.js';
import { EntityViewModel } from '~/models/entity-view-model';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import shape from '@/assets/hitboxes/test.json';
import { Hitbox } from '~/models/hitbox';

const { entity } = defineProps<{ entity: EntityViewModel }>();

const { camera, assets, state, ui } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(entity.spriteId);
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

watchEffect(() => {
  gsap.to(hoveredFilters[0], {
    duration: 0.2,
    blur: entity.isHovered || entity.isSelected ? 4 : 0,
    ease: Power2.easeOut
  });
  gsap.to(hoveredFilters[1], {
    duration: 0.2,
    alpha: entity.isHovered || entity.isSelected ? 1 : 0,
    ease: Power2.easeOut
  });
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (entity.isHovered || entity.isSelected) {
    result.push(...hoveredFilters);
  }

  return result;
});

const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);
</script>

<template>
  <IsoPositioner
    animated
    v-bind="entity.position"
    :z-index-offset="2"
    :angle="camera.angle"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container :y="-CELL_HEIGHT / 4">
      <EntityStats :entity="entity" />

      <animated-sprite
        v-if="entity.isActive(state)"
        :textures="activeTexture"
        event-mode="none"
        :anchor="0.5"
        playing
      />
      <animated-sprite
        :textures="textures"
        :filters="filters"
        :hit-area="hitArea"
        :anchor="0.5"
        @pointerenter="
          () => {
            ui.hoverAt(entity.position);
          }
        "
        @pointerup="entity.isSelected ? entity.unselect() : entity.select()"
      />
    </container>
  </IsoPositioner>
</template>
