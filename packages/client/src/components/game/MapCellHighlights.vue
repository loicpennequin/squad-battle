<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';
import { PTransition } from 'vue3-pixi';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, state, camera, ui, pathfinding } = useGame();
const tileset = computed(() => assets.getSpritesheet('bitmask-movement-ally'));

const isHighlighted = computed(() => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.ATTACK, () => false /* todo */)
    .with(TARGETING_MODES.SKILL, () => false /* todo */)
    .with(TARGETING_MODES.MOVE, () => {
      if (!ui.selectedEntity.value) return false;
      return pathfinding.canMoveTo(ui.selectedEntity.value, cell);
    })
    .with(TARGETING_MODES.NONE, () => false)
    .exhaustive();
});

const bitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return match(ui.targetingMode.value)
      .with(TARGETING_MODES.ATTACK, () => false /* todo */)
      .with(TARGETING_MODES.SKILL, () => false /* todo */)
      .with(TARGETING_MODES.MOVE, () => {
        if (!ui.selectedEntity.value) return false;
        return pathfinding.canMoveTo(ui.selectedEntity.value, cell);
      })
      .with(TARGETING_MODES.NONE, () => false /* todo */)

      .exhaustive();
  });
});

const texture = computed(() => {
  if (!isDefined(bitmask.value)) return;

  return getTextureIndexFromBitMask(bitmask.value, tileset.value);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 500, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="texture && isHighlighted"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
      :x="-CELL_WIDTH / 2"
      :y="-CELL_HEIGHT / 2"
    >
      <sprite :texture="texture" />
    </container>
  </PTransition>
</template>
