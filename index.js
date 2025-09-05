import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Data from data/footballers.ts
const footballers = [
  { id: 1, name: "Lionel Messi", club: "Inter Miami", nationality: "Argentina", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Lionel_Messi_WC2022.jpg/800px-Lionel_Messi_WC2022.jpg" },
  { id: 2, name: "Cristiano Ronaldo", club: "Al Nassr", nationality: "Portugal", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_-_2.jpg/800px-Cristiano_Ronaldo_playing_for_Al_Nassr_FC_against_Persepolis%2C_September_2023_-_2.jpg" },
  { id: 3, name: "Neymar Jr.", club: "Al Hilal", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Neymar_Jr._in_2023.jpg/800px-Neymar_Jr._in_2023.jpg" },
  { id: 4, name: "Kylian Mbappé", club: "Real Madrid", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kylian_Mbappe_2018.jpg/800px-Kylian_Mbappe_2018.jpg" },
  { id: 5, name: "Erling Haaland", club: "Manchester City", nationality: "Norway", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Erling_Haaland_2023.jpg/800px-Erling_Haaland_2023.jpg" },
  { id: 6, name: "Kevin De Bruyne", club: "Manchester City", nationality: "Belgium", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_2023.jpg/800px-Kevin_De_Bruyne_2023.jpg" },
  { id: 7, name: "Mohamed Salah", club: "Liverpool", nationality: "Egypt", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mohamed_Salah_2023.jpg/800px-Mohamed_Salah_2023.jpg" },
  { id: 8, name: "Virgil van Dijk", club: "Liverpool", nationality: "Netherlands", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Virgil_van_Dijk_2023.jpg/800px-Virgil_van_Dijk_2023.jpg" },
  { id: 9, name: "Luka Modrić", club: "Real Madrid", nationality: "Croatia", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Luka_Modri%C4%87_2023.jpg/800px-Luka_Modri%C4%87_2023.jpg" },
  { id: 10, name: "Robert Lewandowski", club: "Barcelona", nationality: "Poland", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Robert_Lewandowski_2023.jpg/800px-Robert_Lewandowski_2023.jpg" },
  { id: 11, name: "Vinícius Júnior", club: "Real Madrid", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Vin%C3%ADcius_J%C3%BAnior_2023.jpg/800px-Vin%C3%ADcius_J%C3%BAnior_2023.jpg" },
  { id: 12, name: "Jude Bellingham", club: "Real Madrid", nationality: "England", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Jude_Bellingham_2023.jpg/800px-Jude_Bellingham_2023.jpg" },
  { id: 13, name: "Zinedine Zidane", club: "Real Madrid (Leyenda)", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg/800px-Zinedine_Zidane_by_Tasnim_03.jpg" },
  { id: 14, name: "Ronaldinho", club: "Barcelona (Leyenda)", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ronaldinho_13_November_2022.jpg/800px-Ronaldinho_13_November_2022.jpg" },
  { id: 15, name: "Ronaldo Nazario", club: "Real Madrid (Leyenda)", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Ronaldo_Nazario_in_2018.jpg/800px-Ronaldo_Nazario_in_2018.jpg" },
  { id: 16, name: "Diego Maradona", club: "Napoli (Leyenda)", nationality: "Argentina", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_con_la_copa.jpg/800px-Maradona-Mundial_86_con_la_copa.jpg" },
  { id: 17, name: "Pelé", club: "Santos (Leyenda)", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pele_by_John_Mathew_Smith.jpg/800px-Pele_by_John_Mathew_Smith.jpg" },
  { id: 18, name: "Johan Cruyff", club: "Ajax (Leyenda)", nationality: "Netherlands", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Johan_Cruijff_1974c.jpg/800px-Johan_Cruijff_1974c.jpg" },
  { id: 19, name: "Andrés Iniesta", club: "Barcelona (Leyenda)", nationality: "Spain", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Andr%C3%A9s_Iniesta_2017.jpg/800px-Andr%C3%A9s_Iniesta_2017.jpg" },
  { id: 20, name: "Xavi Hernández", club: "Barcelona (Leyenda)", nationality: "Spain", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Xavi_Hernandez_2009-05-02.jpg/800px-Xavi_Hernandez_2009-05-02.jpg" },
  { id: 21, name: "Thierry Henry", club: "Arsenal (Leyenda)", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Thierry_Henry_2007-07-26.jpg/800px-Thierry_Henry_2007-07-26.jpg" },
  { id: 22, name: "Paolo Maldini", club: "AC Milan (Leyenda)", nationality: "Italy", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Paolo_Maldini_at_the_2018_Best_FIFA_Football_Awards.jpg/800px-Paolo_Maldini_at_the_2018_Best_FIFA_Football_Awards.jpg" },
  { id: 23, name: "Harry Kane", club: "Bayern Munich", nationality: "England", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Harry_Kane_in_2023.jpg/800px-Harry_Kane_in_2023.jpg" },
  { id: 24, name: "Son Heung-min", club: "Tottenham Hotspur", nationality: "South Korea", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Son_Heung-min_at_the_2022_FIFA_World_Cup_2.jpg/800px-Son_Heung-min_at_the_2022_FIFA_World_Cup_2.jpg" },
  { id: 25, name: "Sadio Mané", club: "Al Nassr", nationality: "Senegal", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sadio_Man%C3%A9_Senegal_v_Benin_2022.jpg/800px-Sadio_Man%C3%A9_Senegal_v_Benin_2022.jpg" },
  { id: 26, name: "N'Golo Kanté", club: "Al-Ittihad", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/N%27Golo_Kant%C3%A9_in_2018.jpg/800px-N%27Golo_Kant%C3%A9_in_2018.jpg" },
  { id: 27, name: "Karim Benzema", club: "Al-Ittihad", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Karim_Benzema_wearing_Real_Madrid_home_kit_2021-2022.jpg/800px-Karim_Benzema_wearing_Real_Madrid_home_kit_2021-2022.jpg" },
  { id: 28, name: "Sergio Ramos", club: "Sevilla", nationality: "Spain", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Sergio_Ramos_in_2018.jpg/800px-Sergio_Ramos_in_2018.jpg" },
  { id: 29, name: "Luis Suárez", club: "Inter Miami", nationality: "Uruguay", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Luis_Su%C3%A1rez_in_2018.jpg/800px-Luis_Su%C3%A1rez_in_2018.jpg" },
  { id: 30, name: "Ángel Di María", club: "Benfica", nationality: "Argentina", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/%C3%81ngel_Di_Mar%C3%ADa_2023.jpg/800px-%C3%81ngel_Di_Mar%C3%ADa_2023.jpg" },
  { id: 31, name: "Antoine Griezmann", club: "Atlético Madrid", nationality: "France", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Antoine_Griezmann_in_2023.jpg/800px-Antoine_Griezmann_in_2023.jpg" },
  { id: 32, name: "Toni Kroos", club: "Real Madrid", nationality: "Germany", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Toni_Kroos_2017.jpg/800px-Toni_Kroos_2017.jpg" },
  { id: 33, name: "Fede Valverde", club: "Real Madrid", nationality: "Uruguay", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Federico_Valverde_in_2023.jpg/800px-Federico_Valverde_in_2023.jpg" },
  { id: 34, name: "Lautaro Martínez", club: "Inter Milan", nationality: "Argentina", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Lautaro_Martinez_2023.jpg/800px-Lautaro_Martinez_2023.jpg" },
  { id: 35, name: "Julián Álvarez", club: "Manchester City", nationality: "Argentina", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Juli%C3%A1n_%C3%81lvarez_2023.jpg/800px-Juli%C3%A1n_%C3%81lvarez_2023.jpg" },
  { id: 36, name: "Bukayo Saka", club: "Arsenal", nationality: "England", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Bukayo_Saka_2023.jpg/800px-Bukayo_Saka_2023.jpg" },
  { id: 37, name: "Phil Foden", club: "Manchester City", nationality: "England", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Phil_Foden_2023.jpg/800px-Phil_Foden_2023.jpg" },
  { id: 38, name: "Jamal Musiala", club: "Bayern Munich", nationality: "Germany", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Jamal_Musiala_on_12_August_2023.jpg/800px-Jamal_Musiala_on_12_August_2023.jpg" },
  { id: 39, name: "Gavi", club: "Barcelona", nationality: "Spain", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Gavi_2023.jpg/800px-Gavi_2023.jpg" },
  { id: 40, name: "Pedri", club: "Barcelona", nationality: "Spain", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Pedri_2023.jpg/800px-Pedri_2023.jpg" },
  { id: 41, name: "Alisson Becker", club: "Liverpool", nationality: "Brazil", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Alisson_Becker_2019.jpg/800px-Alisson_Becker_2019.jpg" },
  { id: 42, name: "Thibaut Courtois", club: "Real Madrid", nationality: "Belgium", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Thibaut_Courtois_2018.jpg/800px-Thibaut_Courtois_2018.jpg" }
];

// Enum from types.ts
const GamePhase = {
  HOME: 0,
  LOBBY: 1,
  ROLE_REVEAL: 2,
  CLUES: 3,
  DEBATE: 4,
  VOTING: 5,
  RESULT: 6,
  END_GAME: 7,
};

// Icons from components/icons.tsx (converted to React.createElement)
const SoccerBallIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: `h-6 w-6 inline-block mr-2 ${props?.className || ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.5-8.5l-2 1.15v3.7l2 1.15 2-1.15v-3.7l-2-1.15zm9 0l-2 1.15v3.7l2 1.15 2-1.15v-3.7l-2-1.15zm-4.5 2.3l2-1.15 2 1.15v2.3l-2 1.15-2-1.15v-2.3zM12 5.5L7.5 8 12 10.5 16.5 8 12 5.5z" }));
const SpyIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: `h-6 w-6 ${props?.className || ''}`, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" }));
const ClipboardIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: props?.className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }));
const CheckIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: props?.className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 3 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }));
const UserIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: props?.className || "h-10 w-10", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" }));
const WhistleIcon = (props) => React.createElement("svg", { ...props, className: props?.className || "h-6 w-6", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, React.createElement("path", { d: "M7 10C8.65685 10 10 8.65685 10 7C10 5.34315 8.65685 4 7 4C5.34315 4 4 5.34315 4 7C4 8.65685 5.34315 10 7 10Z", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), React.createElement("path", { d: "M10 7H14C15.1046 7 16 7.89543 16 9V13C16 14.1046 15.1046 15 14 15H8", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), React.createElement("path", { d: "M16 11H20", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), React.createElement("path", { d: "M8 15V19L10 17", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }));
const LogoutIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: props?.className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }));
const ChevronLeftIcon = (props) => React.createElement("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", className: props?.className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 3 }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }));

// Initial State and Reducer
const initialState = {
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

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_GAME': {
      const { playerName, gameMode } = action.payload;
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const hostPlayer = { id: crypto.randomUUID(), name: playerName, isHost: true, role: null, isEliminated: false, score: 0 };
      return { ...initialState, phase: GamePhase.LOBBY, gameCode, players: [hostPlayer], gameMode };
    }
    case 'JOIN_GAME': // This is a placeholder for multiplayer, for now we add players in lobby
    case 'ADD_PLAYER': {
      if (state.players.length >= 10) return state;
      const newPlayer = { id: crypto.randomUUID(), name: action.payload.playerName, isHost: false, role: null, isEliminated: false, score: 0 };
      return { ...state, players: [...state.players, newPlayer] };
    }
    case 'START_GAME': {
      if (state.players.length < 3) return state;

      const impostorIndex = Math.floor(Math.random() * state.players.length);
      const playersWithRoles = state.players.map((player, index) => ({
        ...player,
        isEliminated: false,
        role: index === impostorIndex ? 'impostor' : 'squad',
      }));

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
      const newClue = { playerId: currentPlayer.id, clue: action.payload.clue };
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
      }, {});

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
const Page = ({ children }) => React.createElement("div", { className: "min-h-screen text-white flex flex-col items-center justify-center p-4 text-center relative overflow-hidden" }, React.createElement("div", { className: "w-full max-w-md mx-auto z-10" }, children));
const Button = (props) => React.createElement("button", { ...props, className: `w-full px-4 py-3 font-bold text-lg rounded-lg transition-transform transform hover:scale-105 duration-200 uppercase tracking-wider shadow-lg ${props.disabled ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-300 text-green-900'} ${props.className || ''}` });
const SecondaryButton = (props) => React.createElement("button", { ...props, className: `w-full px-4 py-3 font-bold text-lg rounded-lg transition-transform transform hover:scale-105 duration-200 uppercase tracking-wider shadow-md bg-green-600 hover:bg-green-500 text-white ${props.className || ''}` });
const Input = (props) => React.createElement("input", { ...props, className: `w-full px-4 py-3 bg-green-900 bg-opacity-75 border-2 border-green-300 rounded-lg focus:outline-none focus:border-yellow-400 text-white text-lg ${props.className || ''}` });
const Card = ({ children, className }) => React.createElement("div", { className: `bg-green-800 bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-2xl border-2 border-yellow-400/50 ${className || ''}` }, children);

const ScreenHeader = ({ onBack, title }) => React.createElement("div", { className: "absolute top-0 left-0 right-0 p-4 flex items-center h-20 z-20" },
    React.createElement("button", { onClick: onBack, className: "absolute left-4 p-2 rounded-full hover:bg-white/10 transition-colors", "aria-label": "Go back" },
        React.createElement(ChevronLeftIcon, { className: "w-8 h-8" })
    ),
    React.createElement("h2", { className: "text-xl font-semibold uppercase tracking-wider text-center w-full" }, title)
);

const QuitButton = ({ onQuit }) => {
    const handleQuit = () => {
        if (window.confirm("¿Seguro que quieres abandonar la partida? Perderás todo el progreso.")) {
            onQuit();
        }
    };
    return React.createElement("button", { onClick: handleQuit, className: "absolute top-6 right-4 flex items-center gap-2 text-sm text-yellow-300 hover:text-white transition-colors z-20", "aria-label": "Quit game" },
        React.createElement(LogoutIcon, { className: "w-5 h-5" }),
        " Salir"
    );
};

const HelpModal = ({ onClose }) => React.createElement("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50", onClick: onClose },
    React.createElement("div", { className: "bg-green-800 rounded-xl p-6 shadow-2xl border-2 border-yellow-400/50 max-w-lg w-full text-left", onClick: e => e.stopPropagation() },
        React.createElement("h2", { className: "text-2xl font-bold mb-4 text-yellow-400" }, "¿Cómo Jugar?"),
        React.createElement("div", { className: "space-y-3 text-gray-200" },
            React.createElement("p", null, React.createElement("strong", null, "Objetivo:"), " ¡Encontrar al impostor que no sabe quién es el futbolista secreto!"),
            React.createElement("p", null, React.createElement("strong", null, "Roles:")),
            React.createElement("ul", { className: "list-disc list-inside ml-4" },
                React.createElement("li", null, React.createElement("strong", { className: "text-blue-400" }, "Miembro del Equipo:"), " Sabes quién es el futbolista. Tu objetivo es dar pistas para que los demás te crean y votar para eliminar al impostor."),
                React.createElement("li", null, React.createElement("strong", { className: "text-red-500" }, "Impostor:"), " No sabes quién es el futbolista. Tu objetivo es engañar a todos, hacerles creer que eres del equipo y sobrevivir a las votaciones.")
            ),
            React.createElement("p", null, React.createElement("strong", null, "Flujo del Juego (Online):")),
            React.createElement("ol", { className: "list-decimal list-inside ml-4" },
                React.createElement("li", null, React.createElement("strong", null, "Pistas:"), " Cada jugador da una pista sobre el futbolista. ¡El impostor debe improvisar!"),
                React.createElement("li", null, React.createElement("strong", null, "Debate:"), " Discutid las pistas para encontrar contradicciones."),
                React.createElement("li", null, React.createElement("strong", null, "Votación:"), " Todos votan para eliminar al jugador que creen que es el impostor.")
            ),
            React.createElement("p", null, React.createElement("strong", null, "Flujo del Juego (Offline):"), " Es más simple. No hay pistas, solo debate y votación directa."),
            React.createElement("p", null, "¡El equipo gana si elimina al impostor! ¡El impostor gana si sobrevive hasta que solo queden 2 jugadores!")
        ),
        React.createElement(Button, { onClick: onClose, className: "mt-6" }, "Entendido")
    )
);

const LoginScreen = ({ onLogin }) => {
    const [playerName, setPlayerName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            onLogin(playerName.trim());
        }
    };
    return React.createElement(Page, null,
        React.createElement("div", { className: "flex flex-col items-center" },
            React.createElement(SoccerBallIcon, null),
            React.createElement("h1", { className: "text-5xl font-bold my-4 uppercase tracking-wider" }, "El Impostor Futbolero"),
            React.createElement("p", { className: "text-xl text-gray-200 mb-8" }, "¿Quién es el que no conoce al futbolista?"),
            React.createElement(Card, { className: "w-full" },
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement(Input, { placeholder: "Introduce tu nombre", value: playerName, onChange: (e) => setPlayerName(e.target.value), className: "mb-4 text-center", "aria-label": "Player Name" }),
                    React.createElement(Button, { type: "submit", disabled: !playerName.trim() }, "Entrar")
                )
            )
        )
    );
};

const ModeSelectionScreen = ({ loggedInUser, dispatch, onLogout }) => {
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    return React.createElement(Page, null,
        isHelpVisible && React.createElement(HelpModal, { onClose: () => setIsHelpVisible(false) }),
        React.createElement("div", { className: "absolute top-4 right-4" },
            React.createElement("button", { onClick: onLogout, className: "flex items-center gap-2 text-sm text-yellow-300 hover:text-white transition-colors" },
                React.createElement(LogoutIcon, { className: "w-5 h-5" }), " Salir"
            )
        ),
        React.createElement("div", { className: "flex flex-col items-center" },
            React.createElement(WhistleIcon, { className: "w-16 h-16 text-yellow-400 mb-4" }),
            React.createElement("h1", { className: "text-4xl font-bold mb-2" }, "¡Hola, ", loggedInUser, "!"),
            React.createElement("p", { className: "text-xl text-gray-200 mb-8" }, "Elige un modo de juego"),
            React.createElement(Card, { className: "w-full space-y-4" },
                React.createElement(Button, { onClick: () => dispatch({ type: 'CREATE_GAME', payload: { playerName: loggedInUser, gameMode: 'offline' } }) }, "Jugar Offline (Pass & Play)"),
                React.createElement(Button, { onClick: () => dispatch({ type: 'CREATE_GAME', payload: { playerName: loggedInUser, gameMode: 'online' } }) }, "Crear Partida Online"),
                React.createElement(Button, { disabled: true }, "Unirse a Partida Online (Próximamente)"),
                React.createElement(SecondaryButton, { onClick: () => setIsHelpVisible(true), className: "!bg-transparent border-2 border-yellow-400 text-yellow-400 hover:!bg-yellow-400/20" }, "Cómo Jugar")
            )
        )
    );
};

const LobbyScreen = ({ state, dispatch }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [copied, setCopied] = useState(false);
    const { players, gameCode, gameMode } = state;

    const handleAddPlayer = (e) => {
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

    return React.createElement(Page, null,
        React.createElement(ScreenHeader, { title: "Sala de Espera", onBack: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement(Card, { className: "mt-20" },
            gameMode === 'online' && React.createElement("div", { className: "flex justify-between items-center bg-green-900 px-4 py-2 rounded-lg mb-6 border border-green-400" },
                React.createElement("div", { className: "text-left" },
                    React.createElement("span", { className: "text-gray-300 text-sm" }, "CÓDIGO DE PARTIDA"),
                    React.createElement("p", { className: "text-2xl font-bold tracking-widest text-yellow-400" }, gameCode)
                ),
                React.createElement("button", { onClick: handleCopyCode, className: "p-2 rounded-lg hover:bg-green-700 transition-colors", title: "Copiar código" },
                    copied ? React.createElement(CheckIcon, { className: "w-8 h-8 text-yellow-400" }) : React.createElement(ClipboardIcon, { className: "w-8 h-8" })
                )
            ),
            React.createElement("h2", { className: "text-2xl font-semibold mb-4" }, "Jugadores (", players.length, "/10)"),
            React.createElement("div", { className: "space-y-3 mb-6 max-h-60 overflow-y-auto pr-2" },
                players.map(p => React.createElement("div", { key: p.id, className: "flex items-center bg-green-900/50 p-3 rounded-lg" },
                    React.createElement(UserIcon, { className: "w-8 h-8 text-gray-300 mr-4" }),
                    React.createElement("span", { className: "text-lg font-medium" }, p.name),
                    p.isHost && React.createElement("span", { className: "ml-auto text-xs font-bold text-yellow-400 bg-green-900 px-2 py-1 rounded" }, "HOST")
                ))
            ),
            players.length < 10 && state.gameMode === 'offline' && React.createElement("form", { onSubmit: handleAddPlayer, className: "flex gap-2 mb-6" },
                React.createElement(Input, { placeholder: "Nombre del nuevo jugador", value: newPlayerName, onChange: (e) => setNewPlayerName(e.target.value) }),
                React.createElement(Button, { type: "submit", className: "w-auto px-4 !text-base", disabled: !newPlayerName.trim() }, "Añadir")
            ),
            React.createElement(Button, { onClick: () => dispatch({ type: 'START_GAME' }), disabled: !canStart }, canStart ? 'Empezar Juego' : `Faltan ${3 - players.length} jugadores`)
        )
    );
};

const RoleRevealScreen = ({ state, dispatch }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const { players, currentPlayerTurnIndex, secretFootballer } = state;
    const currentPlayer = players[currentPlayerTurnIndex];
    const isLastPlayer = currentPlayerTurnIndex === players.length - 1;

    useEffect(() => {
        setIsFlipped(false);
    }, [currentPlayerTurnIndex]);

    const handleContinue = () => {
        if (isLastPlayer) {
            dispatch({ type: 'FINISH_ROLE_REVEAL' });
        } else {
            dispatch({ type: 'ADVANCE_ROLE_REVEAL' });
        }
    };

    return React.createElement(Page, null,
        React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement("div", { className: "w-full max-w-sm mx-auto card-flip-container", onClick: () => setIsFlipped(!isFlipped) },
            React.createElement("div", { className: `card-flipper w-full h-[500px] ${isFlipped ? 'flipped' : ''}` },
                React.createElement("div", { className: "card-front absolute w-full h-full" },
                    React.createElement(Card, { className: "w-full h-full flex flex-col items-center justify-center" },
                        React.createElement("p", { className: "text-xl mb-2" }, "Turno de"),
                        React.createElement("h1", { className: "text-4xl font-bold text-yellow-400 mb-6" }, currentPlayer.name),
                        React.createElement("h2", { className: "text-3xl font-bold mb-4" }, "Tu Identidad Secreta"),
                        React.createElement(SoccerBallIcon, { className: "w-12 h-12" }),
                        React.createElement("p", { className: "text-lg my-6" }, "Toca la carta para revelar tu rol"),
                        React.createElement("p", { className: "text-sm text-gray-400" }, "(Vuelve a tocarla para ocultarlo)")
                    )
                ),
                React.createElement("div", { className: "card-back absolute w-full h-full" },
                    React.createElement(Card, { className: "w-full h-full flex flex-col items-center justify-center" },
                        React.createElement("div", { className: "mb-6 p-4 border-2 border-dashed border-gray-400 rounded-lg" },
                            React.createElement("h2", { className: "text-xl font-bold mb-2" }, "Tu rol es:"),
                            currentPlayer.role === 'impostor' ? React.createElement("div", { className: "flex items-center justify-center gap-2" },
                                React.createElement(SpyIcon, null),
                                React.createElement("span", { className: "text-2xl font-bold text-red-500" }, "IMPOSTOR")
                            ) : React.createElement("div", { className: "flex items-center justify-center gap-2" },
                                React.createElement(SoccerBallIcon, null),
                                React.createElement("span", { className: "text-2xl font-bold text-blue-400" }, "MIEMBRO DEL EQUIPO")
                            )
                        ),
                        currentPlayer.role === 'squad' && secretFootballer && React.createElement("div", { className: "mb-6 text-center" },
                            React.createElement("p", { className: "text-md mb-2" }, "El futbolista secreto es:"),
                            React.createElement("h3", { className: "text-xl font-bold text-yellow-400 mb-2" }, secretFootballer.name),
                            React.createElement("img", { src: secretFootballer.imageUrl, alt: secretFootballer.name, className: "w-24 h-24 object-cover rounded-full mx-auto border-4 border-yellow-400" })
                        ),
                        currentPlayer.role === 'impostor' && React.createElement("p", { className: "text-md mb-6 text-center" }, "No sabes quién es el futbolista. ¡Engáñalos a todos!")
                    )
                )
            )
        ),
        React.createElement(Button, { onClick: handleContinue, className: "mt-8" }, isLastPlayer ? 'Comenzar' : 'Entendido, pasar al siguiente')
    );
};

const CluesScreen = ({ state, dispatch }) => {
    const [clue, setClue] = useState('');
    const livingPlayers = useMemo(() => state.players.filter(p => !p.isEliminated), [state.players]);
    const currentPlayer = livingPlayers[state.currentPlayerTurnIndex];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (clue.trim()) {
            dispatch({ type: 'SUBMIT_CLUE', payload: { clue: clue.trim() } });
            setClue('');
        }
    };

    return React.createElement(Page, null,
        React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement(Card, null,
            React.createElement("h1", { className: "text-3xl font-bold mb-2" }, "Ronda de Pistas"),
            React.createElement("p", { className: "text-xl mb-6" }, "Turno de ", React.createElement("span", { className: "font-bold text-yellow-400" }, currentPlayer.name)),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement(Input, { placeholder: "Escribe tu pista sobre el futbolista...", value: clue, onChange: (e) => setClue(e.target.value), className: "mb-4 text-center" }),
                React.createElement(Button, { type: "submit", disabled: !clue.trim() }, "Enviar Pista")
            ),
            React.createElement("div", { className: "mt-6 text-sm text-gray-300" }, currentPlayer.role === 'impostor' ? "Finge que sabes quién es. ¡No levantes sospechas!" : `El futbolista es: ${state.secretFootballer?.name}`)
        )
    );
};

const DebateScreen = ({ state, dispatch }) => {
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

    return React.createElement(Page, null,
        React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement(Card, null,
            React.createElement("div", { className: "absolute -top-5 right-1/2 translate-x-1/2 bg-yellow-400 text-green-900 px-4 py-1 rounded-full text-2xl font-bold shadow-lg" }, minutes, ":", seconds.toString().padStart(2, '0')),
            React.createElement("h1", { className: "text-3xl font-bold mb-4 pt-4" }, "Fase de Debate"),
            React.createElement("p", { className: "text-lg mb-6" }, "Discutid las pistas y decidid quién es el impostor."),
            React.createElement("div", { className: "bg-green-900/70 p-4 rounded-lg mb-6 border border-green-400" },
                React.createElement("h2", { className: "text-xl font-bold mb-3 text-yellow-400" }, "Pistas de la Ronda:"),
                React.createElement("ul", { className: "space-y-2 text-left" },
                    state.clues.map((c, index) => {
                        const player = state.players.find(p => p.id === c.playerId);
                        return React.createElement("li", { key: index, className: "p-2 bg-green-800 rounded" },
                            React.createElement("strong", { className: "text-yellow-300" }, player?.name, ":"),
                            React.createElement("span", { className: "italic" }, "\" ", c.clue, " \"")
                        );
                    })
                )
            ),
            React.createElement(Button, { onClick: () => dispatch({ type: 'START_VOTING' }) }, "Ir a Votación")
        )
    );
};


const VotingScreen = ({ state, dispatch }) => {
    const livingPlayers = useMemo(() => state.players.filter(p => !p.isEliminated), [state.players]);
    const [votes, setVotes] = useState([]);
    const [voterIndex, setVoterIndex] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [votingPhase, setVotingPhase] = useState('CONFIRM_VOTER');
    const currentVoter = livingPlayers[voterIndex];
    
    const handleNextVoter = () => {
        setVoterIndex(voterIndex + 1);
        setSelectedPlayerId(null);
        setVotingPhase('CONFIRM_VOTER');
    };

    const handleVote = () => {
        if (!selectedPlayerId) return;
        const finalVotes = [...votes, { voterId: currentVoter.id, votedPlayerId: selectedPlayerId }];
        setVotes(finalVotes);

        if (voterIndex < livingPlayers.length - 1) {
            handleNextVoter();
        } else {
            dispatch({ type: 'SUBMIT_VOTE', payload: { votes: finalVotes } });
        }
    };

    if (state.gameMode === 'offline' && votingPhase === 'CONFIRM_VOTER') {
        return React.createElement(Page, null,
            React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
            React.createElement(Card, null,
                React.createElement("h1", { className: "text-2xl font-bold mb-2" }, "Turno de Votar"),
                React.createElement("p", { className: "text-yellow-400 text-4xl font-bold mb-6" }, currentVoter.name),
                React.createElement("p", { className: "text-lg mb-6" }, "Pásale el móvil y que vote en secreto."),
                React.createElement(Button, { onClick: () => setVotingPhase('VOTING_IN_PROGRESS') }, "Estoy listo para votar")
            )
        );
    }

    return React.createElement(Page, null,
        React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement(Card, null,
            React.createElement("h1", { className: "text-3xl font-bold mb-2" }, "¿Quién es el Impostor?"),
            React.createElement("p", { className: "text-xl mb-6" }, "Voto de ", React.createElement("span", { className: "font-bold text-yellow-400" }, currentVoter.name)),
            React.createElement("div", { className: "w-full flex flex-col space-y-3 mb-6" },
                livingPlayers.filter(p => p.id !== currentVoter.id).map(player => React.createElement("button", {
                    key: player.id,
                    onClick: () => setSelectedPlayerId(player.id),
                    className: `w-full px-4 py-3 font-bold text-lg rounded-lg transition-all duration-200 uppercase tracking-wider shadow-md text-white ${selectedPlayerId === player.id ? 'bg-yellow-500 ring-4 ring-yellow-300 scale-105' : 'bg-green-600 hover:bg-green-500'}`
                }, player.name))
            ),
            React.createElement(Button, { onClick: handleVote, disabled: !selectedPlayerId }, "Confirmar Voto")
        )
    );
};

const ResultScreen = ({ state, dispatch }) => {
    const { eliminatedPlayerId, tiedPlayerIds, players, votes } = state;
    const getPlayerName = (id) => players.find(p => p.id === id)?.name || 'Desconocido';

    const renderContent = () => {
        if (eliminatedPlayerId) {
            const eliminatedPlayer = players.find(p => p.id === eliminatedPlayerId);
            if (!eliminatedPlayer) return null;
            return React.createElement(React.Fragment, null,
                React.createElement("h1", { className: "text-3xl font-bold text-red-500 mb-4" }, "¡Jugador Eliminado!"),
                React.createElement("p", { className: "text-4xl font-bold mb-4" }, eliminatedPlayer.name),
                React.createElement("p", { className: "text-xl mb-6" }, "Su rol era: ", React.createElement("span", { className: `font-bold ${eliminatedPlayer.role === 'impostor' ? 'text-red-400' : 'text-blue-400'}` }, eliminatedPlayer.role?.toUpperCase()))
            );
        }

        if (tiedPlayerIds && tiedPlayerIds.length > 0) {
            const tiedPlayers = players.filter(p => tiedPlayerIds.includes(p.id));
            return React.createElement(React.Fragment, null,
                React.createElement("h1", { className: "text-3xl font-bold text-yellow-500 mb-4" }, "¡Hay un Empate!"),
                React.createElement("p", { className: "text-xl mb-4" }, "El voto estuvo empatado entre:"),
                React.createElement("div", { className: "font-bold text-2xl mb-6" }, tiedPlayers.map(p => p.name).join(', ')),
                React.createElement("p", { className: "text-xl" }, "Nadie es eliminado en esta ronda.")
            );
        }

        return React.createElement(React.Fragment, null,
            React.createElement("h1", { className: "text-3xl font-bold text-yellow-500 mb-4" }, "Sin Mayoría"),
            React.createElement("p", { className: "text-xl" }, "No hubo votos suficientes para eliminar a un jugador.")
        );
    };

    return React.createElement(Page, null,
        React.createElement(QuitButton, { onQuit: () => dispatch({ type: 'GO_HOME' }) }),
        React.createElement(Card, null,
            renderContent(),
            React.createElement("div", { className: "bg-green-900/70 p-4 rounded-lg my-6 border border-green-400" },
                React.createElement("h2", { className: "text-xl font-bold mb-3 text-yellow-400" }, "Desglose de Votos:"),
                React.createElement("ul", { className: "space-y-2 text-left" },
                    votes.map((vote, index) => React.createElement("li", { key: index, className: "p-2 bg-green-800 rounded flex justify-between" },
                        React.createElement("span", null, getPlayerName(vote.voterId)),
                        React.createElement("span", { className: "font-bold text-yellow-300" }, " -> ", getPlayerName(vote.votedPlayerId))
                    ))
                )
            ),
            React.createElement(Button, { onClick: () => dispatch({ type: 'NEXT_ROUND' }), className: "mt-4" }, "Siguiente Ronda")
        )
    );
};

const Confetti = () => {
    const confettiCount = 50;
    const colors = ['#fde047', '#facc15', '#fbbf24', '#f59e0b', '#d97706'];

    return React.createElement("div", { className: "absolute top-0 left-0 w-full h-full pointer-events-none" },
        Array.from({ length: confettiCount }).map((_, i) => React.createElement("div", {
            key: i,
            className: "confetti",
            style: {
                left: `${Math.random() * 100}%`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                animationDelay: `${Math.random() * 3}s`,
                transform: `scale(${Math.random() * 0.8 + 0.5})`
            }
        }))
    );
};

const EndGameScreen = ({ state, dispatch }) => {
    const { winner, players, secretFootballer } = state;
    const impostor = players.find(p => p.role === 'impostor');
    
    return React.createElement(Page, null,
        React.createElement(Confetti, null),
        React.createElement(Card, null,
            React.createElement("h1", { className: "text-5xl font-bold mb-6" }, "¡Fin del Partido!"),
            winner === 'squad' ? React.createElement("div", { className: "text-center" },
                React.createElement("h2", { className: "text-3xl font-bold text-blue-400 mb-4" }, "¡EL EQUIPO GANA!"),
                React.createElement("p", { className: "text-xl mb-4" }, "Habéis descubierto al impostor."),
                impostor && React.createElement("p", { className: "text-lg text-gray-200" }, "El impostor era ", React.createElement("span", { className: "font-bold text-red-400" }, impostor.name), ".")
            ) : React.createElement("div", { className: "text-center" },
                React.createElement("h2", { className: "text-3xl font-bold text-red-500 mb-4" }, "¡EL IMPOSTOR GANA!"),
                impostor && React.createElement("p", { className: "text-xl mb-4" }, "¡", React.createElement("span", { className: "font-bold text-red-400" }, impostor.name), " ha engañado a todos!")
            ),
            React.createElement("p", { className: "text-md mt-4 text-gray-300" }, "El futbolista secreto era ", React.createElement("span", { className: "font-bold text-yellow-400" }, secretFootballer?.name), "."),
            React.createElement("div", { className: "my-8" },
                React.createElement("h3", { className: "text-2xl font-semibold mb-4 border-b-2 border-green-400 pb-2" }, "Tabla de Goleadores"),
                players.sort((a,b) => b.score - a.score).map(p => React.createElement("div", { key: p.id, className: "flex justify-between items-center text-lg py-1" },
                    React.createElement("span", null, p.name, " (", p.role, ")"),
                    React.createElement("span", { className: "font-bold text-yellow-400" }, p.score, " pts")
                ))
            ),
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Button, { onClick: () => dispatch({ type: 'PLAY_AGAIN' }) }, "Jugar de Nuevo"),
                React.createElement(SecondaryButton, { onClick: () => dispatch({ type: 'GO_HOME' }) }, "Volver al Menú Principal")
            )
        )
    );
};

const App = () => {
    const [loggedInUser, setLoggedInUser] = useState(null);
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

    const handleLogin = (name) => {
        localStorage.setItem('footballImpostorPlayerName', name);
        setLoggedInUser(name);
    };

    const handleLogout = () => {
        localStorage.removeItem('footballImpostorPlayerName');
        setLoggedInUser(null);
        dispatch({ type: 'GO_HOME' });
    };

    if (!loggedInUser) {
        return React.createElement(LoginScreen, { onLogin: handleLogin });
    }

    switch (state.phase) {
        case GamePhase.HOME:
            return React.createElement(ModeSelectionScreen, { loggedInUser: loggedInUser, dispatch: dispatch, onLogout: handleLogout });
        case GamePhase.LOBBY:
            return React.createElement(LobbyScreen, { state: state, dispatch: dispatch });
        case GamePhase.ROLE_REVEAL:
            return React.createElement(RoleRevealScreen, { key: state.players[state.currentPlayerTurnIndex]?.id, state: state, dispatch: dispatch });
        case GamePhase.CLUES:
            return React.createElement(CluesScreen, { state: state, dispatch: dispatch });
        case GamePhase.DEBATE:
            return React.createElement(DebateScreen, { state: state, dispatch: dispatch });
        case GamePhase.VOTING:
            return React.createElement(VotingScreen, { state: state, dispatch: dispatch });
        case GamePhase.RESULT:
            return React.createElement(ResultScreen, { state: state, dispatch: dispatch });
        case GamePhase.END_GAME:
            return React.createElement(EndGameScreen, { state: state, dispatch: dispatch });
        default:
            return React.createElement(ModeSelectionScreen, { loggedInUser: loggedInUser, dispatch: dispatch, onLogout: handleLogout });
    }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
);
