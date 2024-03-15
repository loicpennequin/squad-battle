import { GameSession } from '../game-session';
import { type PlayerId, Player, type SerializedPlayer } from './player';

export class PlayerSystem {
  private playerMap = new Map<PlayerId, Player>();

  constructor(private session: GameSession) {}

  setup(players: [SerializedPlayer, SerializedPlayer]) {
    players
      .map(player => new Player(this.session, player))
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

  addPlayer(player: Player) {
    this.playerMap.set(player.id, player);
  }

  removePlayer(playerId: PlayerId) {
    this.playerMap.delete(playerId);
  }

  serialize() {
    return {
      players: this.getList().map(player => player.serialize())
    };
  }
}
