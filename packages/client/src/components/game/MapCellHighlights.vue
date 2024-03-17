<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';
import { PTransition } from 'vue3-pixi';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, state, pathfinding, fx } = useGame();
const movementTileset = computed(() => assets.getSpritesheet('bitmask-movement-ally'));
const attackTileset = computed(() => assets.getSpritesheet('bitmask-danger'));
const skillTileset = computed(() => assets.getSpritesheet('skill-targeting'));

const matchMovement = (cellToTest: Cell) => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.SKILL, () => false)
    .with(TARGETING_MODES.BASIC, () => {
      return pathfinding.canMoveTo(state.value.activeEntity, cellToTest);
    })
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (!ui.hoveredEntity.value.isActive) return false;
      return pathfinding.canMoveTo(ui.hoveredEntity.value, cellToTest);
    })
    .exhaustive();
};

const matchAttack = (cell: Cell) => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.BASIC, TARGETING_MODES.SKILL, () => false)
    .with(TARGETING_MODES.NONE, () => {
      if (!ui.hoveredEntity.value) return false;
      if (ui.hoveredEntity.value.isAlly(state.value.activeEntity.id)) return false;
      return pathfinding.canAttackAt(ui.hoveredEntity.value, cell);
    })
    .exhaustive();
};

const matchSkillTarget = (cell: Cell) => {
  return match(ui.targetingMode.value)
    .with(TARGETING_MODES.NONE, TARGETING_MODES.BASIC, () => false)
    .with(TARGETING_MODES.SKILL, () => {
      if (!ui.selectedSkill.value) return false;

      return state.value.activeEntity.canUseSkillAt(
        ui.selectedSkill.value,
        cell,
        ui.skillTargets.value
      );
    })
    .exhaustive();
};
const isMovementDisplayed = computed(() => !fx.isPlaying.value && matchMovement(cell));
const isAttackDisplayed = computed(() => !fx.isPlaying.value && matchAttack(cell));
const isSkillTargetDisplayed = computed(
  () => !fx.isPlaying.value && matchSkillTarget(cell)
);

const movementBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchMovement(neighbor);
  });
});

const attackBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchAttack(neighbor);
  });
});

const skillTargetBitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return matchSkillTarget(neighbor);
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

const skillTargetTexture = computed(() => {
  if (!isDefined(attackBitmask.value)) return;

  return getTextureIndexFromBitMask(skillTargetBitmask.value, skillTileset.value);
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
      v-if="movementTexture && isMovementDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="movementTexture" :anchor="0.5" />
    </container>
  </PTransition>

  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="dangerTexture && isAttackDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="dangerTexture" :anchor="0.5" />
    </container>
  </PTransition>

  <PTransition
    appear
    :duration="{ enter: 300, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="skillTargetTexture && isSkillTargetDisplayed"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
    >
      <sprite :texture="skillTargetTexture" :anchor="0.5" />
      <pixi-text :scale="0.5" :anchor="0.5">{{ skillTargetBitmask }}</pixi-text>
    </container>
  </PTransition>
</template>
