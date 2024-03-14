<script setup lang="ts">
import { onTick } from 'vue3-pixi';
import { TextStyle, Ticker } from 'pixi.js';

const { ui, fx } = useGame();
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

const style = new TextStyle({ fill: 'white', fontSize: 12, fontFamily: 'monospace' });
</script>

<template>
  <pixi-text :x="30" :y="15" :style="style">{{ averageFPS.toFixed() }} FPS</pixi-text>
  <pixi-text :x="30" :y="30" :style="style">
    targeting mode: {{ ui.targetingMode }}
  </pixi-text>
  <pixi-text :x="30" :y="45" :style="style">
    hovered cell: {{ ui.hoveredCell.value?.id }}
  </pixi-text>
  <pixi-text :x="30" :y="60" :style="style">
    hovered entity: {{ ui.hoveredEntity.value?.id }}
  </pixi-text>
  <pixi-text :x="30" :y="75" :style="style">
    selected entity: {{ ui.selectedEntity.value?.id }}
  </pixi-text>
  <pixi-text :x="30" :y="90" :style="style">
    FX playing: {{ fx.isPlaying.value }}
  </pixi-text>
</template>
