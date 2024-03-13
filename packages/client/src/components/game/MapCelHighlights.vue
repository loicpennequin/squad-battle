<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { MapCellViewModel } from '~/models/map-cell-view-model';

const { cell } = defineProps<{ cell: MapCellViewModel }>();

const { assets, state } = useGame();
const tileset = computed(() => assets.getSpritesheet('bitmask-movement-ally'));

const texture = computed(() => {
  const bitMask = cell.getBitmask(state.value);
  if (!isDefined(bitMask)) return;

  return getTextureIndexFromBitMask(bitMask, tileset.value);
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
      v-if="texture && cell.isHighlighted"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
      :x="-CELL_WIDTH / 2"
    >
      <sprite :texture="texture" />
    </container>
  </PTransition>
</template>
