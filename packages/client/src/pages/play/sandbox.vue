<script setup lang="ts">
definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});
</script>

<template>
  <div class="overflow-hidden">
    <ClientOnly>
      <Game />
      <template #fallback><div /></template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave.active {
  transition: all 0.3s;

  .player-loadout {
    transition: all 0.3s;
    transition-timing-function: var(--ease-out-2);
  }
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;

  .player-loadout {
    &:first-of-type {
      transform: translateX(-25%);
      opacity: 0;
    }
    &:last-of-type {
      transform: translateX(25%);
      opacity: 0;
      filter: sepia(100%);
    }
  }
}
</style>
