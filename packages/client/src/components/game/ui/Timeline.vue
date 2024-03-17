<script setup lang="ts">
const { state } = useGame();

const totalWidth = computed(() => state.value.timeline.length * 64);
</script>

<template>
  <div class="timeline flex">
    <EntityIcon
      v-for="(entity, index) in state.timeline"
      :key="`${entity.id}:${index}`"
      :entity="entity"
    />
  </div>
</template>

<style scoped lang="postcss">
.timeline {
  position: absolute;
  top: var(--size-2);
  left: 50%;
  transform: translateX(-50%);

  width: calc(1px * v-bind(totalWidth));
}
</style>
