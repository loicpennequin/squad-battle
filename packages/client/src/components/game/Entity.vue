<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';
import type { Entity } from '@game/sdk';
import { Container, type Filter } from 'pixi.js';
import { Hitbox } from '~/utils/hitbox';
import { match } from 'ts-pattern';

const { entity } = defineProps<{ entity: Entity }>();

const { camera, assets, state, ui, fx, dispatch } = useGame();

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
] as const;

const activeFilter = new OutlineFilter(2, 0xffffff, 0.2, 1);

const isHovered = computed(() => ui.hoveredEntity.value?.equals(entity));
const isActive = computed(() => state.value.activeEntity.equals(entity));

watchEffect(() => {
  gsap.to(hoveredFilters[0], {
    duration: 0.2,
    blur: isHovered.value ? 4 : 0,
    ease: Power2.easeOut
  });
  gsap.to(hoveredFilters[1], {
    duration: 0.2,
    alpha: isHovered.value ? 1 : 0,
    ease: Power2.easeOut
  });
});

watchEffect(() => {
  hoveredFilters[1].color =
    ui.targetingMode.value === TARGETING_MODES.BASIC &&
    state.value.activeEntity.isEnemy(entity.id)
      ? 0xff0000
      : 0xffffff;
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (isHovered.value) {
    result.push(...hoveredFilters);
  }
  if (isActive.value) {
    result.push(activeFilter);
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

const isEnterAnimationDone = ref(false);
const onEnter = (container: Container) => {
  container.y = -200;
  container.alpha = 0;
  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    delay: Math.random() * 0.5,
    onStart() {
      container.alpha = 1;
    },
    onComplete() {
      isEnterAnimationDone.value = true;
    }
  });
};

const onPointerup = () => {
  match(ui.targetingMode.value)
    .with(TARGETING_MODES.NONE, () => {
      if (entity.equals(state.value.activeEntity)) {
        ui.switchTargetingMode(TARGETING_MODES.BASIC);
      }
    })
    .with(TARGETING_MODES.BASIC, () => {
      if (entity.equals(state.value.activeEntity)) {
        ui.switchTargetingMode(TARGETING_MODES.NONE);
        return;
      }

      if (
        entity.isEnemy(state.value.activeEntity.id) &&
        state.value.activeEntity.canAttack(entity) &&
        entity.canBeAttacked(state.value.activeEntity)
      ) {
        dispatch('attack', { targetId: entity.id });
      }
    })
    .with(TARGETING_MODES.SKILL, () => ({}))
    .exhaustive();
};
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="entity.position"
    :z-index-offset="3"
    :angle="camera.angle.value"
    :height="state.map.height"
    :width="state.map.width"
    :offset="{
      x: 0,
      y: -CELL_HEIGHT / 4
    }"
  >
    <container
      :ref="
        (container: any) => {
          if (container?.parent) {
            fx.registerEntityRootContainer(entity.id, container.parent);
          }
        }
      "
    >
      <PTransition
        appear
        :before-enter="{ alpha: 0 }"
        ,
        :enter="{ alpha: 1 }"
        :duration="{ leave: 0, enter: 500 }"
      >
        <container>
          <EntityStats v-if="isEnterAnimationDone" :entity="entity" />
        </container>
      </PTransition>

      <PTransition appear :duration="{ enter: 1000, leave: 0 }" @enter="onEnter">
        <container>
          <animated-sprite
            v-if="isActive"
            :textures="activeTexture"
            event-mode="none"
            :anchor="0.5"
            :scale-x="scaleX"
            playing
          />
          <animated-sprite
            :ref="(el: any) => fx.registerSprite(entity.id, el)"
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
            @pointerup="onPointerup"
          />
        </container>
      </PTransition>
    </container>
  </IsoPositioner>
</template>
