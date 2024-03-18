<script setup lang="ts">
const { dispatch, ui, state } = useGame();
</script>

<template>
  <div class="action-bar">
    <button
      v-for="skill in state.activeEntity.skills"
      :key="skill.id"
      class="skill-button"
      :class="{ selected: ui.selectedSkill.value?.id === skill.id }"
      :style="{ '--bg': `url('/assets/skills/${skill.iconId}.png')` }"
      :disabled="!state.activeEntity.canUseSkill(skill)"
      @click="ui.selectSkill(skill)"
    />
    <UiFancyButton
      :style="{ '--hue': '10DEG', '--hue2': '20DEG' }"
      @click="dispatch('endTurn')"
    >
      End turn
    </UiFancyButton>
  </div>
</template>

<style scoped lang="postcss">
.action-bar {
  position: absolute;
  bottom: var(--size-3);
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: var(--size-3);

  height: 70px;
}

.skill-button {
  box-sizing: content-box;
  aspect-ratio: 1;
  width: 64px;
  padding: 0;

  background: var(--bg);
  background-size: cover;
  border: solid 3px black;

  transition: transform 0.2s;
  &.selected {
    transform: scale(1.05);
    outline: solid 2px var(--primary);
  }

  &:disabled {
    filter: grayscale(100%);
  }
}
</style>
