<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter } from 'pixi.js';
import { match } from 'ts-pattern';
import { Hitbox } from '~/utils/hitbox';

const { cell } = defineProps<{ cell: Cell }>();

const { assets, camera, state, ui, dispatch, pathfinding, fx, session } = useGame();

const textures = computed(() => {
  const sheet = assets.getSpritesheet(cell.terrain);
  return sheet.animations[0];
});

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell));

const shape = assets.getHitbox('tile');
const hitArea = Hitbox.from(shape.shapes[0].points, shape.shapes[0].source, 0.5);

const pathFilter = new ColorOverlayFilter(0x4455bb, 0.5);
const attackFilter = new ColorOverlayFilter(0xff0000, 0.5);
const isMovePathHighlighted = computed(() => {
  if (!ui.hoveredCell.value) return false;
  if (ui.targetingMode.value !== TARGETING_MODES.BASIC) return false;

  const entityOnCell = session.entitySystem.getEntityAt(cell);

  const canMoveTo = pathfinding.canMoveTo(state.value.activeEntity, cell);
  if (!canMoveTo) return false;

  const path = pathfinding.getPath(
    state.value.activeEntity,
    ui.hoveredCell.value,
    state.value.activeEntity.ap
  );

  if (!path) return false;

  const isInPath = path.some(vec => vec.equals(cell.position));

  return isInPath || entityOnCell?.equals(state.value.activeEntity);
});

const filters = computed(() => {
  const result: Filter[] = [];
  if (fx.isPlaying.value) return result;
  if (isMovePathHighlighted.value) result.push(pathFilter);

  if (
    ui.hoveredCell.value?.equals(cell) &&
    ui.hoveredEntity.value?.isEnemy(state.value.activeEntity.id) &&
    state.value.activeEntity.canAttack(ui.hoveredEntity.value) &&
    ui.targetingMode.value === TARGETING_MODES.BASIC
  ) {
    result.push(attackFilter);
  }
  return result;
});
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
        :filters="filters"
        @pointerenter="ui.hoverAt(cell.position)"
        @pointerleave="ui.unhover()"
        @pointerup="
          () => {
            match(ui.targetingMode.value)
              .with(TARGETING_MODES.BASIC, () => {
                if (pathfinding.canMoveTo(state.activeEntity, cell)) {
                  dispatch('move', cell.position);
                } else {
                  ui.switchTargetingMode(TARGETING_MODES.NONE);
                }
              })
              .with(TARGETING_MODES.SKILL, () => {
                if (
                  ui.selectedSkill.value &&
                  state.activeEntity.canUseSkillAt(
                    ui.selectedSkill.value,
                    cell,
                    ui.skillTargets.value
                  )
                ) {
                  ui.toggleSkillTarget(cell.position);
                } else {
                  ui.switchTargetingMode(TARGETING_MODES.NONE);
                }
              })
              .otherwise(() => {
                ui.switchTargetingMode(TARGETING_MODES.NONE);
              });
          }
        "
      />

      <MapCellHighlights :cell="cell" />
      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>
</template>
