<script setup lang="ts">
import sky1 from '@/assets/backgrounds/sky-1.png';
import sky2 from '@/assets/backgrounds/sky-2.png';
import sky4 from '@/assets/backgrounds/sky-4.png';
import { useApplication } from 'vue3-pixi';
const { state } = useGame();

const app = useApplication();

const SKY_SIZE = { x: 576, y: 324 };
const skyScale = Math.max(
  app.value.view.width / SKY_SIZE.x,
  app.value.view.height / SKY_SIZE.y
);
console.log(skyScale);
</script>

<template>
  <sprite :texture="sky1" :scale="skyScale" />
  <sprite :texture="sky2" :scale="skyScale" />
  <sprite :texture="sky4" :scale="skyScale" />
</template>
