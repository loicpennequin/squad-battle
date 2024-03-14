<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';
import { PTransition } from 'vue3-pixi';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, state, pathfinding } = useGame();
const movementTileset = computed(() => assets.getSpritesheet('bitmask-movement-ally'));
const attackTileset = computed(() => assets.getSpritesheet('bitmask-danger'));

const isMovementHighlightDisplayed = (cell: Cell) => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.ATTACK, TARGETING_MODES.SKILL, () => false)
    .with(TARGETING_MODES.MOVE, () => {
      if (!ui.selectedEntity.value) return false;
      if (!ui.selectedEntity.value.isActive) return false;
      return pathfinding.canMoveTo(ui.selectedEntity.value, cell);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (ui.hoveredEntity.value.isActive) return false;
      return pathfinding.canMoveTo(ui.hoveredEntity.value, cell);
    })
    .exhaustive();
};

const isDangerHighlightDisplayed = (cell: Cell) => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.ATTACK, TARGETING_MODES.SKILL, () => false)
    .with(TARGETING_MODES.MOVE, TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (ui.hoveredEntity.value.isAlly(state.value.activeEntity.id)) return false;

      return pathfinding.canAttackAt(ui.hoveredEntity.value, cell);
    })
    .exhaustive();
};

const movementBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMovementHighlightDisplayed(neighbor);
  });
});

const attackBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isDangerHighlightDisplayed(neighbor);
  });
});

const movementTexture = computed(() => {
  if (!isDefined(movementBitmask.value)) return;

  return getTextureIndexFromBitMask(movementBitmask.value, movementTileset.value);
});

const dangerTexture = computed(() => {
  if (!isDefined(attackBitmask.value)) return;

  return getTextureIndexFromBitMask(attackBitmask.value, attackTileset.value);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="movementTexture && isMovementHighlightDisplayed(cell)"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="movementTexture" :anchor="0.5" />
    </container>
    <container
      v-if="dangerTexture && isDangerHighlightDisplayed(cell)"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="dangerTexture" :anchor="0.5" />
    </container>
  </PTransition>
</template>