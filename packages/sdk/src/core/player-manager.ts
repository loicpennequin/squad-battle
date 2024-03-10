import { GameSession } from '../game-session';
import { type PlayerId, Player } from './player';

export type SerializedPlayer = {
  id: PlayerId;
  name: string;
};
export class PlayerManager {
  private playerMap = new Map<PlayerId, Player>();
  private activePlayerId!: PlayerId;

  constructor(private ctx: GameSession) {}

  setup(activePlayerId: PlayerId, players: [SerializedPlayer, SerializedPlayer]) {
    this.activePlayerId = activePlayerId;

    players
      .map(p => new Player(this.ctx, p))
      .forEach(player => {
        this.addPlayer(player);
      });
  }

  getList() {
    return [...this.playerMap.values()];
  }

  getPlayerById(id: PlayerId) {
    return this.playerMap.get(id);
  }

  getOpponent(id: PlayerId) {
    return this.getList().find(p => p.id !== id)!;
  }

  getActivePlayer() {
    return this.getPlayerById(this.activePlayerId)!;
  }

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return {
      players: this.getList().map(player => player.serialize()) as [
        SerializedPlayer,
        SerializedPlayer
      ],
      activePlayerId: this.activePlayerId
    };
  }
}
