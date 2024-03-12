<script setup lang="ts"></script>

<template>
  <graphics
    @render="
      g => {
        g.clear();
        g.beginFill(0xff0000);
        g.drawRect(100, 100, 200, 200);
        g.endFill();
      }
    "
  />
</template>
