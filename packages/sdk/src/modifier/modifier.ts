import type { MaybePromise } from '@game/shared';
import type { CharacterBlueprint } from '../entity/character-blueprint';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { Keyword } from '../utils/keywords';

export type ModifierDescriptionContext = Pick<
  CharacterBlueprint,
  'attack' | 'initiative' | 'maxHp' | 'maxAp' | 'spellPower' | 'speed'
>;

export type ModifierId = string;

type ModifierBase = {
  id: ModifierId;
  name: string;
  iconId: string;
  keywords: Keyword[];
  getDescription(ctx: ModifierDescriptionContext): string;
  onApplied(session: GameSession, attachedTo: Entity): MaybePromise<void>;
  onRemoved(session: GameSession, attachedTo: Entity): MaybePromise<void>;
};

type StackableMixin =
  | {
      stackable: true;
      stacks: number;
    }
  | {
      stackable: false;
      stacks?: never;
      onReapply(session: GameSession, attachedTo: Entity): MaybePromise<void>;
    };

export type Modifier = ModifierBase & StackableMixin;
