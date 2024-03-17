<script setup lang="ts">
const { state } = useGame();
</script>

<template>
  <div class="list left-2">
    <EntityIcon
      v-for="entity in state.players[0].entities"
      :key="entity.id"
      size="lg"
      :entity="entity"
    />
  </div>

  <div class="list right-2">
    <EntityIcon
      v-for="entity in state.players[1].entities"
      :key="entity.id"
      size="lg"
      :entity="entity"
    />
  </div>
</template>

<style scoped lang="postcss">
.list {
  position: absolute;
  top: var(--size-11);

  display: flex;
  flex-direction: column;
  gap: var(--size-3);

  > div {
    width: 128px;
  }
}
</style>
