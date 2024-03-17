<script setup lang="ts"></script>

<template>
  <div class="timeline-wrapper">
    <Timeline />
  </div>
</template>

<style scoped lang="postcss">
.timeline-wrapper {
  position: absolute;
  top: var(--size-2);
  left: 50%;
  transform: translateX(-50%);
}
</style>
