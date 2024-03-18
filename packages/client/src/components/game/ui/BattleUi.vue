<script setup lang="ts"></script>

<template>
  <Timeline />
  <TeamInfos />
  <ActionBar />
</template>

<style scoped lang="postcss">
.timeline-wrapper {
  position: absolute;
  top: var(--size-2);
  left: 50%;
  transform: translateX(-50%);
}
</style>
