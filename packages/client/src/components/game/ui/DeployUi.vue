<script setup lang="ts"></script>

<template>
  <div class="title">Deploy Phase</div>
  <DeployBar />
</template>

<style scoped lang="postcss">
.title {
  position: absolute;
  top: var(--size-7);
  left: 50%;
  transform: translateX(-50%);

  font-size: var(--font-size-6);
  text-shadow: -2px 2px 1px black;
  letter-spacing: 10px;
}
</style>
