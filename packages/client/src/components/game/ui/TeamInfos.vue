<script setup lang="ts">
const { state, ui } = useGame();
</script>

<template>
  <div class="list left-2">
    <div v-for="entity in state.players[0].entities" :key="entity.id" class="flex gap-1">
      <EntityIcon
        :sprite-id="entity.blueprint.spriteId"
        @mouseenter="
          () => {
            ui.hoverAt(entity.position);
          }
        "
        @mouseleave="
          () => {
            ui.unhover();
          }
        "
      />
      <EntityModifiers :entity-id="entity.id" />
    </div>
  </div>

  <div class="list right-2">
    <div
      v-for="entity in state.players[1].entities"
      :key="entity.id"
      class="flex gap-1 justify-end"
    >
      <EntityModifiers :entity-id="entity.id" />
      <EntityIcon
        :sprite-id="entity.blueprint.spriteId"
        @mouseenter="
          () => {
            ui.hoverAt(entity.position);
          }
        "
        @mouseleave="
          () => {
            ui.unhover();
          }
        "
      />
    </div>
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
