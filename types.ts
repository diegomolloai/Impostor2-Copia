export interface Footballer {
  id: number;
  name: string;
  club: string;
  nationality: string;
  imageUrl: string;
}

export interface Player {
  id: string;
  name:string;
  isHost: boolean;
  role: 'squad' | 'impostor' | null;
  isEliminated: boolean;
  score: number;
}

export enum GamePhase {
  HOME,
  LOBBY,
  ROLE_REVEAL,
  CLUES,
  DEBATE,
  VOTING,
  RESULT,
  END_GAME,
}

export interface Clue {
  playerId: string;
  clue: string;
}

export interface Vote {
  voterId: string;
  votedPlayerId: string;
}

export interface GameState {
  phase: GamePhase;
  gameCode: string | null;
  players: Player[];
  secretFootballer: Footballer | null;
  currentPlayerTurnIndex: number; // For role reveal and clues
  clues: Clue[];
  votes: Vote[];
  eliminatedPlayerId: string | null;
  tiedPlayerIds: string[] | null;
  winner: 'squad' | 'impostor' | null;
  gameMode: 'offline' | 'online' | null;
  usedFootballerIds: number[];
}