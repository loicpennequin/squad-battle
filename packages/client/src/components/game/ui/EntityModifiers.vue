<script setup lang="ts">
import type { EntityId } from '@game/sdk';

const { entityId } = defineProps<{ entityId: EntityId }>();

const entity = useGameSelector(session => session.entitySystem.getEntityById(entityId));
</script>

<template>
  <ul v-if="entity">
    <li v-for="modifier in entity.modifiers" :key="modifier.id">
      <img :src="`/assets/modifiers/${modifier.iconId}.png`" />
    </li>
  </ul>
</template>

<style scoped lang="postcss">
ul {
  display: grid;
  gap: var(--size-1);
}
</style>
