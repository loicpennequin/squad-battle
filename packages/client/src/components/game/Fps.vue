<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import { Ticker } from 'pixi.js';

const fps = ref<number[]>([60]);
const HISTORY_LIMIT = 30;
onTick(() => {
  fps.value.push(Ticker.shared.FPS);
  if (fps.value.length > HISTORY_LIMIT) {
    fps.value.shift();
  }
});

const averageFPS = computed(() => {
  return fps.value.reduce((total, x) => total + x) / fps.value.length;
});
</script>

<template>
  <text :x="30" :y="15" :style="{ fill: 'white', fontSize: 12, fontFamily: 'monospace' }">
    {{ averageFPS.toFixed() }} FPS
  </text>
</template>
