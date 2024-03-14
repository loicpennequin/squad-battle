<script setup lang="ts">
import shape from '@/assets/hitboxes/tile.json';
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';
import { Hitbox } from '~/utils/hitbox';

const { cell } = defineProps<{ cell: Cell }>();

const { assets, camera, state, ui, dispatch, pathfinding, fx } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(cell.terrain);
  return sheet.animations[0];
});

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell));

const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="state.map.height"
    :width="state.map.width"
  >
    <container>
      <animated-sprite
        :textures="textures"
        :anchor="0.5"
        :hit-area="hitArea"
        @pointerenter="ui.hoverAt(cell.position)"
        @pointerleave="ui.unhover()"
        @pointerup="
          () => {
            match(ui.targetingMode.value)
              .with(TARGETING_MODES.MOVE, () => {
                if (pathfinding.canMoveTo(state.activeEntity, cell)) {
                  dispatch('move', cell.position);
                } else {
                  ui.unselect();
                }
              })
              .otherwise(() => {
                ui.unselect();
              });
            if (ui.targetingMode.value === TARGETING_MODES.MOVE) {
            }
          }
        "
      />

      <MapCellHighlights :cell="cell" />
      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>
</template>
