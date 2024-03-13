<script setup lang="ts">
import { Entity } from '@game/sdk';
import { type Filter } from 'pixi.js';
import { EntityViewModel } from '~/models/entity-view-model';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import shape from '@/assets/hitboxes/test.json';
import { Hitbox } from '~/models/hitbox';

const { entity } = defineProps<{ entity: Entity }>();

const { camera, assets, state, ui } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(entity.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const vm = computed(() => new EntityViewModel(entity, ui.value));

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
    blur: vm.value.isHovered ? 4 : 0,
    ease: Power2.easeOut
  });
  gsap.to(hoveredFilters[1], {
    duration: 0.2,
    alpha: vm.value.isHovered ? 1 : 0,
    ease: Power2.easeOut
  });
});
const filters = computed(() => {
  const result: Filter[] = [];
  if (vm.value.isHovered) {
    result.push(...hoveredFilters);
  }
  return result;
});

const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source.width / 2);
</script>

<template>
  <IsoPositioner
    animated
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z"
    :z-index-offset="2"
    :angle="camera.angle"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container :y="-CELL_HEIGHT / 4">
      <EntityStats :entity="entity" />
      <animated-sprite
        :textures="textures"
        :filters="filters"
        :hit-area="hitArea"
        :anchor="0.5"
        @pointerenter="
          () => {
            ui.hoverAt(vm.entity.position);
          }
        "
        @pointerup="vm.isSelected ? vm.unselect() : vm.select()"
      />
    </container>
  </IsoPositioner>
</template>
