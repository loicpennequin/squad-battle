import { z } from 'zod';
import { GAME_PHASES } from '../game-session';
import { GameAction, defaultActionSchema } from './action';

const schema = defaultActionSchema.extend({
  skillId: z.string(),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array()
});

export class UseSkillAction extends GameAction<typeof schema> {
  readonly name = 'useSkill';

  protected payloadSchema = schema;

  async impl() {
    if (this.session.phase !== GAME_PHASES.BATTLE) {
      throw new Error('Cannot use a skill outside of the battle phase.');
    }

    if (!this.player.ownsActiveEntity()) {
      throw new Error(`Player ${this.player.name} doesn't own active entity.`);
    }

    const skill = this.session.atbSystem.activeEntity.getSkill(this.payload.skillId);
    if (!skill) {
      throw new Error('Active entity does not possess this skill');
    }

    const canUse = this.session.atbSystem.activeEntity.canUseSkill(
      skill,
      this.payload.targets
    );

    if (!canUse) {
      throw new Error('Skill cannot be used.');
    }

    await this.session.atbSystem.activeEntity.useSkill(skill, this.payload.targets);
  }
}
