import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import type { GameState, Player, Clue, Vote, Footballer } from './types.ts';
import { GamePhase } from './types.ts';
import { footballers } from './data/footballers.ts';
import { SoccerBallIcon, SpyIcon, ClipboardIcon, CheckIcon, UserIcon, WhistleIcon, LogoutIcon, ChevronLeftIcon } from './components/icons.tsx';

type Action =
  | { type: 'CREATE_GAME'; payload: { playerName: string; gameMode: 'offline' | 'online' } }
  | { type: 'JOIN_GAME'; payload: { gameCode: string; playerName: string } }
  | { type: 'ADD_PLAYER'; payload: { playerName: string } }
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_ROLE_REVEAL' }
  | { type: 'FINISH_ROLE_REVEAL' }
  | { type: 'SUBMIT_CLUE'; payload: { clue: string } }
  | { type: 'START_DEBATE' }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; payload: { votes: Vote[] } }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME'; payload: { winner: 'squad' | 'impostor' } }
  | { type: 'PLAY_AGAIN' }
  | { type: 'GO_HOME' };

const initialState: GameState = {
  phase: GamePhase.HOME,
  gameCode: null,
  players: [],
  secretFootballer: null,
  currentPlayerTurnIndex: 0,
  clues: [],
  votes: [],
  eliminatedPlayerId: null,
  tiedPlayerIds: null,
  winner: null,
  gameMode: null,
  usedFootballerIds: [],
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'CREATE_GAME': {
      const { playerName, gameMode } = action.payload;
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const hostPlayer: Player = { id: crypto.randomUUID(), name: playerName, isHost: true, role: null, isEliminated: false, score: 0 };
      return { ...initialState, phase: GamePhase.LOBBY, gameCode, players: [hostPlayer], gameMode };
    }
    case 'JOIN_GAME': // This is a placeholder for multiplayer, for now we add players in lobby
    case 'ADD_PLAYER': {
      if (state.players.length >= 10) return state;
      const newPlayer: Player = { id: crypto.randomUUID(), name: action.payload.playerName, isHost: false, role: null, isEliminated: false, score: 0 };
      return { ...state, players: [...state.players, newPlayer] };
    }
    case 'START_GAME': {
      if (state.players.length < 3) return state;

      const impostorIndex = Math.floor(Math.random() * state.players.length);
      const playersWithRoles = state.players.map((player, index) => ({
        ...player,
        isEliminated: false,
        role: index === impostorIndex ? 'impostor' : 'squad',
      })) as Player[];

      const shuffledPlayersWithRoles = [...playersWithRoles];
      for (let i = shuffledPlayersWithRoles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayersWithRoles[i], shuffledPlayersWithRoles[j]] = [shuffledPlayersWithRoles[j], shuffledPlayersWithRoles[i]];
      }

      let availableFootballers = footballers.filter(f => !state.usedFootballerIds.includes(f.id));
      let currentUsedIds = state.usedFootballerIds;

      if (availableFootballers.length === 0) {
          availableFootballers = footballers;
          currentUsedIds = [];
      }

      const secretFootballer = availableFootballers[Math.floor(Math.random() * availableFootballers.length)];
      const updatedUsedIds = [...currentUsedIds, secretFootballer.id];
      
      return {
        ...state,
        phase: GamePhase.ROLE_REVEAL,
        players: shuffledPlayersWithRoles,
        secretFootballer,
        usedFootballerIds: updatedUsedIds,
        currentPlayerTurnIndex: 0,
        clues: [],
        votes: [],
        eliminatedPlayerId: null,
        tiedPlayerIds: null,
      };
    }
    case 'ADVANCE_ROLE_REVEAL':
        return {...state, currentPlayerTurnIndex: state.currentPlayerTurnIndex + 1};
    case 'FINISH_ROLE_REVEAL':
        return {
            ...state, 
            phase: state.gameMode === 'offline' ? GamePhase.VOTING : GamePhase.CLUES, 
            currentPlayerTurnIndex: 0
        };
    case 'SUBMIT_CLUE': {
      const currentPlayer = state.players.filter(p => !p.isEliminated)[state.currentPlayerTurnIndex];
      const newClue: Clue = { playerId: currentPlayer.id, clue: action.payload.clue };
      const nextIndex = state.currentPlayerTurnIndex + 1;
      const newClues = [...state.clues, newClue];
      
      if (nextIndex >= state.players.filter(p => !p.isEliminated).length) {
          return { ...state, clues: newClues, phase: GamePhase.DEBATE, currentPlayerTurnIndex: 0 };
      }
      return { ...state, clues: newClues, currentPlayerTurnIndex: nextIndex };
    }
    case 'START_DEBATE':
        return { ...state, phase: GamePhase.DEBATE };
    case 'START_VOTING': {
        return { ...state, phase: GamePhase.VOTING };
    }
    case 'SUBMIT_VOTE': {
      const votes = action.payload.votes;
      const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.votedPlayerId] = (acc[vote.votedPlayerId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const maxVotes = Math.max(0, ...Object.values(voteCounts));
      
      if (maxVotes === 0) {
        return { ...state, votes, phase: GamePhase.RESULT, eliminatedPlayerId: null, tiedPlayerIds: [] };
      }

      const potentialEliminations = Object.keys(voteCounts).filter(
        id => voteCounts[id] === maxVotes
      );
      
      if (potentialEliminations.length !== 1) { 
        return { ...state, votes, phase: GamePhase.RESULT, eliminatedPlayerId: null, tiedPlayerIds: potentialEliminations };
      }
      
      const eliminatedPlayerId = potentialEliminations[0];
      const eliminatedPlayer = state.players.find(p => p.id === eliminatedPlayerId);

      if (!eliminatedPlayer) return { ...state, votes, phase: GamePhase.RESULT };

      const baseStateUpdate = { ...state, votes, tiedPlayerIds: null, eliminatedPlayerId };

      if (eliminatedPlayer.role === 'impostor') {
        const impostorVoters = votes
            .filter(v => v.votedPlayerId === eliminatedPlayerId)
            .map(v => v.voterId);

        const playersWithNewScores = state.players.map(p => {
            let scoreToAdd = 0;
            if (p.role === 'squad' && !p.isEliminated) {
                scoreToAdd += 1; // Win point
                if (impostorVoters.includes(p.id)) {
                    scoreToAdd += 1; // Bonus for correct vote
                }
            }
            return { ...p, score: p.score + scoreToAdd };
        });

        return { ...baseStateUpdate, phase: GamePhase.END_GAME, winner: 'squad', players: playersWithNewScores };
      }
      
      const updatedPlayers = state.players.map(p => p.id === eliminatedPlayerId ? { ...p, isEliminated: true } : p);
      const remainingPlayers = updatedPlayers.filter(p => !p.isEliminated);

      if (remainingPlayers.length <= 2) {
        const playersWithNewScores = updatedPlayers.map(p => {
            if (p.role === 'impostor') {
                return { ...p, score: p.score + 3 };
            }
            return p;
        });
        return { ...baseStateUpdate, phase: GamePhase.END_GAME, winner: 'impostor', players: playersWithNewScores };
      }

      return { ...baseStateUpdate, players: updatedPlayers, phase: GamePhase.RESULT };
    }
    case 'NEXT_ROUND':
        return {
            ...state,
            phase: state.gameMode === 'offline' ? GamePhase.VOTING : GamePhase.CLUES,
            clues: [],
            votes: [],
            eliminatedPlayerId: null,
            tiedPlayerIds: null,
            currentPlayerTurnIndex: 0,
        };
    case 'PLAY_AGAIN':
        return {
            ...initialState,
            phase: GamePhase.LOBBY,
            gameCode: state.gameCode,
            gameMode: state.gameMode,
            players: state.players.map(p => ({...p, role: null, isEliminated: false, score: p.score})),
            usedFootballerIds: state.usedFootballerIds,
        };
    case 'GO_HOME':
        return {...initialState, phase: GamePhase.HOME, players: state.players.map(p => ({...p, score: p.score}))};
    default:
      return state;
  }
};

// UI Components
const Page = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="w-full max-w-md mx-auto z-10">{children}</div>
    </div>
);

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={`w-full px-4 py-3 font-bold text-lg rounded-lg transition-transform transform hover:scale-105 duration-200 uppercase tracking-wider shadow-lg ${
            props.disabled
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-300 text-green-900'
        } ${props.className || ''}`}
    />
);

const SecondaryButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        className={`w-full px-4 py-3 font-bold text-lg rounded-lg transition-transform transform hover:scale-105 duration-200 uppercase tracking-wider shadow-md bg-green-600 hover:bg-green-500 text-white ${props.className || ''}`}
    />
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full px-4 py-3 bg-green-900 bg-opacity-75 border-2 border-green-300 rounded-lg focus:outline-none focus:border-yellow-400 text-white text-lg ${props.className || ''}`}
    />
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-green-800 bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-2xl border-2 border-yellow-400/50 ${className || ''}`}>
        {children}
    </div>
);

const ScreenHeader = ({ onBack, title }: { onBack: () => void; title: string }) => (
    <div className="absolute top-0 left-0 right-0 p-4 flex items-center h-20 z-20">
        <button onClick={onBack} className="absolute left-4 p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Go back">
            <ChevronLeftIcon className="w-8 h-8" />
        </button>
        <h2 className="text-xl font-semibold uppercase tracking-wider text-center w-full">{title}</h2>
    </div>
);

const QuitButton = ({ onQuit }: { onQuit: () => void }) => {
    const handleQuit = () => {
        if (window.confirm("¿Seguro que quieres abandonar la partida? Perderás todo el progreso.")) {
            onQuit();
        }
    };
    return (
        <button onClick={handleQuit} className="absolute top-6 right-4 flex items-center gap-2 text-sm text-yellow-300 hover:text-white transition-colors z-20" aria-label="Quit game">
            <LogoutIcon className="w-5 h-5"/> Salir
        </button>
    );
};

const HelpModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-green-800 rounded-xl p-6 shadow-2xl border-2 border-yellow-400/50 max-w-lg w-full text-left" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">¿Cómo Jugar?</h2>
            <div className="space-y-3 text-gray-200">
                <p><strong>Objetivo:</strong> ¡Encontrar al impostor que no sabe quién es el futbolista secreto!</p>
                <p><strong>Roles:</strong></p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong className="text-blue-400">Miembro del Equipo:</strong> Sabes quién es el futbolista. Tu objetivo es dar pistas para que los demás te crean y votar para eliminar al impostor.</li>
                    <li><strong className="text-red-500">Impostor:</strong> No sabes quién es el futbolista. Tu objetivo es engañar a todos, hacerles creer que eres del equipo y sobrevivir a las votaciones.</li>
                </ul>
                <p><strong>Flujo del Juego (Online):</strong></p>
                 <ol className="list-decimal list-inside ml-4">
                    <li><strong>Pistas:</strong> Cada jugador da una pista sobre el futbolista. ¡El impostor debe improvisar!</li>
                    <li><strong>Debate:</strong> Discutid las pistas para encontrar contradicciones.</li>
                    <li><strong>Votación:</strong> Todos votan para eliminar al jugador que creen que es el impostor.</li>
                </ol>
                 <p><strong>Flujo del Juego (Offline):</strong> Es más simple. No hay pistas, solo debate y votación directa.</p>
                 <p>¡El equipo gana si elimina al impostor! ¡El impostor gana si sobrevive hasta que solo queden 2 jugadores!</p>
            </div>
            <Button onClick={onClose} className="mt-6">Entendido</Button>
        </div>
    </div>
);


// Screen Components
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
    const [playerName, setPlayerName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (playerName.trim()) {
            onLogin(playerName.trim());
        }
    };

    return (
        <Page>
            <div className="flex flex-col items-center">
                <SoccerBallIcon />
                <h1 className="text-5xl font-bold my-4 uppercase tracking-wider">El Impostor Futbolero</h1>
                <p className="text-xl text-gray-200 mb-8">¿Quién es el que no conoce al futbolista?</p>
                <Card className="w-full">
                    <form onSubmit={handleSubmit}>
                        <Input 
                            placeholder="Introduce tu nombre" 
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="mb-4 text-center"
                            aria-label="Player Name"
                        />
                        <Button type="submit" disabled={!playerName.trim()}>Entrar</Button>
                    </form>
                </Card>
            </div>
        </Page>
    );
};

const ModeSelectionScreen = ({ loggedInUser, dispatch, onLogout }: { loggedInUser: string, dispatch: React.Dispatch<Action>, onLogout: () => void }) => {
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    return (
        <Page>
            {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
            <div className="absolute top-4 right-4">
                <button onClick={onLogout} className="flex items-center gap-2 text-sm text-yellow-300 hover:text-white transition-colors">
                    <LogoutIcon className="w-5 h-5"/> Salir
                </button>
            </div>
            <div className="flex flex-col items-center">
                <WhistleIcon className="w-16 h-16 text-yellow-400 mb-4" />
                <h1 className="text-4xl font-bold mb-2">¡Hola, {loggedInUser}!</h1>
                <p className="text-xl text-gray-200 mb-8">Elige un modo de juego</p>
                <Card className="w-full space-y-4">
                    <Button onClick={() => dispatch({ type: 'CREATE_GAME', payload: { playerName: loggedInUser, gameMode: 'offline' } })}>
                        Jugar Offline (Pass & Play)
                    </Button>
                     <Button onClick={() => dispatch({ type: 'CREATE_GAME', payload: { playerName: loggedInUser, gameMode: 'online' } })}>
                        Crear Partida Online
                    </Button>
                    <Button disabled>Unirse a Partida Online (Próximamente)</Button>
                    <SecondaryButton onClick={() => setIsHelpVisible(true)} className="!bg-transparent border-2 border-yellow-400 text-yellow-400 hover:!bg-yellow-400/20">
                        Cómo Jugar
                    </SecondaryButton>
                </Card>
            </div>
        </Page>
    );
};

const LobbyScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [copied, setCopied] = useState(false);
    const { players, gameCode } = state;

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim() && players.length < 10) {
            dispatch({ type: 'ADD_PLAYER', payload: { playerName: newPlayerName.trim() } });
            setNewPlayerName('');
        }
    };
    
    const handleCopyCode = () => {
        if (gameCode) {
            navigator.clipboard.writeText(gameCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const canStart = players.length >= 3;

    return (
        <Page>
            <ScreenHeader title="Sala de Espera" onBack={() => dispatch({ type: 'GO_HOME' })} />
            <Card className="mt-20">
                <div className="flex justify-between items-center bg-green-900 px-4 py-2 rounded-lg mb-6 border border-green-400">
                    <div className="text-left">
                        <span className="text-gray-300 text-sm">CÓDIGO DE PARTIDA</span>
                        <p className="text-2xl font-bold tracking-widest text-yellow-400">{gameCode}</p>
                    </div>
                    <button onClick={handleCopyCode} className="p-2 rounded-lg hover:bg-green-700 transition-colors" title="Copiar código">
                        {copied ? <CheckIcon className="w-8 h-8 text-yellow-400" /> : <ClipboardIcon className="w-8 h-8" />}
                    </button>
                </div>

                <h2 className="text-2xl font-semibold mb-4">Jugadores ({players.length}/10)</h2>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center bg-green-900/50 p-3 rounded-lg">
                            <UserIcon className="w-8 h-8 text-gray-300 mr-4"/>
                            <span className="text-lg font-medium">{p.name}</span>
                            {p.isHost && <span className="ml-auto text-xs font-bold text-yellow-400 bg-green-900 px-2 py-1 rounded">HOST</span>}
                        </div>
                    ))}
                </div>

                {players.length < 10 && state.gameMode === 'offline' && (
                    <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
                        <Input 
                            placeholder="Nombre del nuevo jugador" 
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                        />
                        <Button type="submit" className="w-auto px-4 !text-base" disabled={!newPlayerName.trim()}>Añadir</Button>
                    </form>
                )}

                <Button onClick={() => dispatch({ type: 'START_GAME' })} disabled={!canStart}>
                    {canStart ? 'Empezar Juego' : `Faltan ${3 - players.length} jugadores`}
                </Button>
            </Card>
        </Page>
    );
};

const RoleRevealScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const { players, currentPlayerTurnIndex, secretFootballer } = state;
    const currentPlayer = players[currentPlayerTurnIndex];
    const isLastPlayer = currentPlayerTurnIndex === players.length - 1;

    useEffect(() => {
        setIsRevealed(false);
        setIsFlipped(false);
    }, [currentPlayerTurnIndex]);

    const handleContinue = () => {
        if (isLastPlayer) {
            dispatch({ type: 'FINISH_ROLE_REVEAL' });
        } else {
            dispatch({ type: 'ADVANCE_ROLE_REVEAL' });
        }
    };
    
    if (!isRevealed) {
        return (
            <Page>
                <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
                <Card>
                    <p className="text-xl mb-4">Pásale el móvil a</p>
                    <h1 className="text-4xl font-bold text-yellow-400 mb-8">{currentPlayer.name}</h1>
                    <Button onClick={() => setIsRevealed(true)}>
                        Listo, muéstrame mi rol
                    </Button>
                </Card>
            </Page>
        );
    }

    return (
        <Page>
            <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
            <div className="w-full max-w-sm mx-auto card-flip-container" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`card-flipper w-full h-[500px] ${isFlipped ? 'flipped' : ''}`}>
                    {/* Card Front */}
                    <div className="card-front absolute w-full h-full">
                        <Card className="w-full h-full flex flex-col items-center justify-center">
                            <h1 className="text-3xl font-bold mb-4">Tu Identidad Secreta</h1>
                             <SoccerBallIcon />
                            <p className="text-lg my-8">Toca la carta para revelar tu rol</p>
                            <p className="text-sm text-gray-400">(Vuelve a tocarla para ocultarlo)</p>
                        </Card>
                    </div>
                    {/* Card Back */}
                    <div className="card-back absolute w-full h-full">
                        <Card className="w-full h-full flex flex-col items-center justify-center">
                             <div className="mb-6 p-4 border-2 border-dashed border-gray-400 rounded-lg">
                                <h2 className="text-xl font-bold mb-2">Tu rol es:</h2>
                                {currentPlayer.role === 'impostor' ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <SpyIcon />
                                        <span className="text-2xl font-bold text-red-500">IMPOSTOR</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                         <SoccerBallIcon />
                                        <span className="text-2xl font-bold text-blue-400">MIEMBRO DEL EQUIPO</span>
                                    </div>
                                )}
                            </div>

                            {currentPlayer.role === 'squad' && secretFootballer && (
                                <div className="mb-6 text-center">
                                    <p className="text-md mb-2">El futbolista secreto es:</p>
                                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{secretFootballer.name}</h3>
                                     <img src={secretFootballer.imageUrl} alt={secretFootballer.name} className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-yellow-400" />
                                </div>
                            )}
                            {currentPlayer.role === 'impostor' && (
                                <p className="text-md mb-6 text-center">No sabes quién es el futbolista. ¡Engáñalos a todos!</p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
             <Button onClick={handleContinue} className="mt-8">
                {isLastPlayer ? 'Comenzar' : 'Entendido, pasar al siguiente'}
            </Button>
        </Page>
    );
};

const CluesScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const [clue, setClue] = useState('');
    const livingPlayers = useMemo(() => state.players.filter(p => !p.isEliminated), [state.players]);
    const currentPlayer = livingPlayers[state.currentPlayerTurnIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (clue.trim()) {
            dispatch({ type: 'SUBMIT_CLUE', payload: { clue: clue.trim() } });
            setClue('');
        }
    };

    return (
        <Page>
            <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
            <Card>
                <h1 className="text-3xl font-bold mb-2">Ronda de Pistas</h1>
                <p className="text-xl mb-6">Turno de <span className="font-bold text-yellow-400">{currentPlayer.name}</span></p>
                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder="Escribe tu pista sobre el futbolista..."
                        value={clue}
                        onChange={(e) => setClue(e.target.value)}
                        className="mb-4 text-center"
                    />
                    <Button type="submit" disabled={!clue.trim()}>Enviar Pista</Button>
                </form>
                 <div className="mt-6 text-sm text-gray-300">
                    {currentPlayer.role === 'impostor' ? "Finge que sabes quién es. ¡No levantes sospechas!" : `El futbolista es: ${state.secretFootballer?.name}`}
                </div>
            </Card>
        </Page>
    );
};

const DebateScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const [timer, setTimer] = useState(120); // 2 minutes

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            dispatch({ type: 'START_VOTING' });
        }
    }, [timer, dispatch]);

    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
        <Page>
            <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
            <Card>
                <div className="absolute -top-5 right-1/2 translate-x-1/2 bg-yellow-400 text-green-900 px-4 py-1 rounded-full text-2xl font-bold shadow-lg">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <h1 className="text-3xl font-bold mb-4 pt-4">Fase de Debate</h1>
                <p className="text-lg mb-6">Discutid las pistas y decidid quién es el impostor.</p>
                
                <div className="bg-green-900/70 p-4 rounded-lg mb-6 border border-green-400">
                    <h2 className="text-xl font-bold mb-3 text-yellow-400">Pistas de la Ronda:</h2>
                    <ul className="space-y-2 text-left">
                        {state.clues.map((c, index) => {
                            const player = state.players.find(p => p.id === c.playerId);
                            return (
                                <li key={index} className="p-2 bg-green-800 rounded">
                                    <strong className="text-yellow-300">{player?.name}:</strong>
                                    <span className="italic">" {c.clue} "</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                
                <Button onClick={() => dispatch({ type: 'START_VOTING' })}>
                    Ir a Votación
                </Button>
            </Card>
        </Page>
    );
};


const VotingScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const livingPlayers = useMemo(() => state.players.filter(p => !p.isEliminated), [state.players]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [voterIndex, setVoterIndex] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [votingPhase, setVotingPhase] = useState<'CONFIRM_VOTER' | 'VOTING_IN_PROGRESS' | 'VOTE_SUBMITTED'>('CONFIRM_VOTER');

    const currentVoter = livingPlayers[voterIndex];

    const handleVote = () => {
        if (!selectedPlayerId) return;
        const newVotes = [...votes, { voterId: currentVoter.id, votedPlayerId: selectedPlayerId }];
        setVotes(newVotes);

        if (voterIndex < livingPlayers.length - 1) {
            setVotingPhase('VOTE_SUBMITTED');
        } else {
            dispatch({ type: 'SUBMIT_VOTE', payload: { votes: newVotes } });
        }
    };
    
    const handleNextVoter = () => {
        setVoterIndex(voterIndex + 1);
        setSelectedPlayerId(null);
        setVotingPhase('CONFIRM_VOTER');
    };

    if (state.gameMode === 'offline' && votingPhase === 'CONFIRM_VOTER') {
        return (
            <Page>
                <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
                <Card>
                    <h1 className="text-2xl font-bold mb-2">Turno de Votar</h1>
                    <p className="text-yellow-400 text-4xl font-bold mb-6">{currentVoter.name}</p>
                    <p className="text-lg mb-6">Pásale el móvil y que vote en secreto.</p>
                    <Button onClick={() => setVotingPhase('VOTING_IN_PROGRESS')}>Estoy listo para votar</Button>
                </Card>
            </Page>
        );
    }
    
    if (state.gameMode === 'offline' && votingPhase === 'VOTE_SUBMITTED') {
        return (
            <Page>
                 <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
                <Card>
                    <h1 className="text-2xl font-bold mb-4">Voto Registrado</h1>
                    <CheckIcon className="w-16 h-16 text-yellow-400 mx-auto my-4" />
                    <p className="text-lg mb-6">Pasa el móvil al siguiente jugador.</p>
                    <Button onClick={handleNextVoter}>Siguiente Votante</Button>
                </Card>
            </Page>
        );
    }

    return (
        <Page>
            <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
            <Card>
                <h1 className="text-3xl font-bold mb-2">¿Quién es el Impostor?</h1>
                <p className="text-xl mb-6">Voto de <span className="font-bold text-yellow-400">{currentVoter.name}</span></p>
                <div className="w-full flex flex-col space-y-3 mb-6">
                    {livingPlayers.filter(p => p.id !== currentVoter.id).map(player => (
                        <button
                            key={player.id}
                            onClick={() => setSelectedPlayerId(player.id)}
                            className={`w-full px-4 py-3 font-bold text-lg rounded-lg transition-all duration-200 uppercase tracking-wider shadow-md text-white
                                ${selectedPlayerId === player.id ? 'bg-yellow-500 ring-4 ring-yellow-300 scale-105' : 'bg-green-600 hover:bg-green-500'}`}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>
                 <Button onClick={handleVote} disabled={!selectedPlayerId}>
                    Confirmar Voto
                </Button>
            </Card>
        </Page>
    );
};

const ResultScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const { eliminatedPlayerId, tiedPlayerIds, players, votes } = state;

    const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Desconocido';

    const renderContent = () => {
        if (eliminatedPlayerId) {
            const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
            if (!eliminatedPlayer) return null;
            return (
                <>
                    <h1 className="text-3xl font-bold text-red-500 mb-4">¡Jugador Eliminado!</h1>
                    <p className="text-4xl font-bold mb-4">{eliminatedPlayer.name}</p>
                    <p className="text-xl mb-6">Su rol era: <span className={`font-bold ${eliminatedPlayer.role === 'impostor' ? 'text-red-400' : 'text-blue-400'}`}>{eliminatedPlayer.role?.toUpperCase()}</span></p>
                </>
            );
        }

        if (tiedPlayerIds && tiedPlayerIds.length > 0) {
            const tiedPlayers = players.filter(p => tiedPlayerIds.includes(p.id));
            return (
                <>
                    <h1 className="text-3xl font-bold text-yellow-500 mb-4">¡Hay un Empate!</h1>
                    <p className="text-xl mb-4">El voto estuvo empatado entre:</p>
                    <div className="font-bold text-2xl mb-6">
                        {tiedPlayers.map(p => p.name).join(', ')}
                    </div>
                    <p className="text-xl">Nadie es eliminado en esta ronda.</p>
                </>
            );
        }

        return (
            <>
                <h1 className="text-3xl font-bold text-yellow-500 mb-4">Sin Mayoría</h1>
                <p className="text-xl">No hubo votos suficientes para eliminar a un jugador.</p>
            </>
        );
    };

    return (
        <Page>
            <QuitButton onQuit={() => dispatch({ type: 'GO_HOME' })} />
            <Card>
                {renderContent()}
                <div className="bg-green-900/70 p-4 rounded-lg my-6 border border-green-400">
                    <h2 className="text-xl font-bold mb-3 text-yellow-400">Desglose de Votos:</h2>
                    <ul className="space-y-2 text-left">
                        {votes.map((vote, index) => (
                             <li key={index} className="p-2 bg-green-800 rounded flex justify-between">
                                <span>{getPlayerName(vote.voterId)}</span>
                                <span className="font-bold text-yellow-300"> -> {getPlayerName(vote.votedPlayerId)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Button onClick={() => dispatch({ type: 'NEXT_ROUND' })} className="mt-4">
                    Siguiente Ronda
                </Button>
            </Card>
        </Page>
    );
};

const Confetti = () => {
    const confettiCount = 50;
    const colors = ['#fde047', '#facc15', '#fbbf24', '#f59e0b', '#d97706'];

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 3}s`,
                        transform: `scale(${Math.random() * 0.8 + 0.5})`
                    }}
                />
            ))}
        </div>
    );
};


const EndGameScreen = ({ state, dispatch }: { state: GameState; dispatch: React.Dispatch<Action> }) => {
    const { winner, players, secretFootballer } = state;
    const impostor = players.find(p => p.role === 'impostor');
    
    return (
        <Page>
            <Confetti />
            <Card>
                <h1 className="text-5xl font-bold mb-6">¡Fin del Partido!</h1>
                {winner === 'squad' ? (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-blue-400 mb-4">¡EL EQUIPO GANA!</h2>
                        <p className="text-xl mb-4">Habéis descubierto al impostor.</p>
                        {impostor && (
                            <p className="text-lg text-gray-200">El impostor era <span className="font-bold text-red-400">{impostor.name}</span>.</p>
                        )}
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-red-500 mb-4">¡EL IMPOSTOR GANA!</h2>
                         {impostor && (
                            <p className="text-xl mb-4">¡<span className="font-bold text-red-400">{impostor.name}</span> ha engañado a todos!</p>
                        )}
                    </div>
                )}
                <p className="text-md mt-4 text-gray-300">El futbolista secreto era <span className="font-bold text-yellow-400">{secretFootballer?.name}</span>.</p>
                <div className="my-8">
                    <h3 className="text-2xl font-semibold mb-4 border-b-2 border-green-400 pb-2">Tabla de Goleadores</h3>
                    {players.sort((a,b) => b.score - a.score).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-lg py-1">
                            <span>{p.name} ({p.role})</span>
                            <span className="font-bold text-yellow-400">{p.score} pts</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <Button onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
                        Jugar de Nuevo
                    </Button>
                    <SecondaryButton onClick={() => dispatch({ type: 'GO_HOME' })}>
                        Volver al Menú Principal
                    </SecondaryButton>
                </div>
            </Card>
        </Page>
    );
};

const App = () => {
    const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        const storedName = localStorage.getItem('footballImpostorPlayerName');
        if (storedName) {
            setLoggedInUser(storedName);
        }

        const imageUrls = footballers.map(f => f.imageUrl);
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, []);

    const handleLogin = (name: string) => {
        localStorage.setItem('footballImpostorPlayerName', name);
        setLoggedInUser(name);
    };

    const handleLogout = () => {
        localStorage.removeItem('footballImpostorPlayerName');
        setLoggedInUser(null);
        dispatch({ type: 'GO_HOME' });
    };

    if (!loggedInUser) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    switch (state.phase) {
        case GamePhase.HOME:
            return <ModeSelectionScreen loggedInUser={loggedInUser} dispatch={dispatch} onLogout={handleLogout} />;
        case GamePhase.LOBBY:
            return <LobbyScreen state={state} dispatch={dispatch} />;
        case GamePhase.ROLE_REVEAL:
            return <RoleRevealScreen key={state.players[state.currentPlayerTurnIndex]?.id} state={state} dispatch={dispatch} />;
        case GamePhase.CLUES:
            return <CluesScreen state={state} dispatch={dispatch} />;
        case GamePhase.DEBATE:
            return <DebateScreen state={state} dispatch={dispatch} />;
        case GamePhase.VOTING:
            return <VotingScreen state={state} dispatch={dispatch} />;
        case GamePhase.RESULT:
            return <ResultScreen state={state} dispatch={dispatch} />;
        case GamePhase.END_GAME:
            return <EndGameScreen state={state} dispatch={dispatch} />;
        default:
            return <ModeSelectionScreen loggedInUser={loggedInUser} dispatch={dispatch} onLogout={handleLogout} />;
    }
};

export default App;
