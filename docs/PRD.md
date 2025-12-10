# Product Requirements Document (PRD)
# Web-Based Chess Application

**Document Version:** 1.0  
**Date:** December 10, 2025  
**Project Name:** AI Chess Opponent  

---

## 1. Overview

### 1.1 Purpose

This document provides detailed product requirements and technical specifications for building a web-based, single-player chess application. The user competes against an AI opponent powered by Stockfish, with four configurable difficulty levels.

### 1.2 Goals

- Deliver a fully functional chess game running in the browser
- Provide AI opponents ranging from beginner (200 ELO) to expert (2000 ELO)
- Ensure responsive AI move calculation (< 2 seconds)
- Run entirely locally without server dependencies

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Build Tool** | Vite | 5.x | Fast development server, static build |
| **UI Framework** | React | 18.x | Component-based UI |
| **Language** | TypeScript | 5.x | Type safety |
| **Chess Board UI** | react-chessboard | 4.x | Interactive drag-and-drop board |
| **Chess Logic** | chess.js | 1.x | Move validation, game state, PGN |
| **Chess Engine** | Stockfish.js | 17.1 | AI move calculation (WASM) |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Package Manager** | npm | 10.x | Dependency management |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Game Controls  │  │   Chess Board   │  │ Move History │ │
│  │   Component     │  │   Component     │  │  Component   │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │         │
│           └────────────────────┼───────────────────┘         │
│                                │                             │
│                    ┌───────────▼───────────┐                 │
│                    │    useChessGame       │                 │
│                    │    (Custom Hook)      │                 │
│                    └───────────┬───────────┘                 │
│                                │                             │
│           ┌────────────────────┼────────────────────┐        │
│           │                    │                    │        │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼──────┐ │
│  │    chess.js     │  │  useChessEngine │  │  Game State  │ │
│  │ (Move Validation)│  │  (Custom Hook)  │  │   (React)    │ │
│  └─────────────────┘  └────────┬────────┘  └──────────────┘ │
│                                │                             │
├────────────────────────────────┼─────────────────────────────┤
│                    ┌───────────▼───────────┐                 │
│                    │     Web Worker        │                 │
│                    │    (Message Bridge)   │                 │
│                    └───────────┬───────────┘                 │
│                                │                             │
│                    ┌───────────▼───────────┐                 │
│                    │   Stockfish.js WASM   │                 │
│                    │   (/public/stockfish/)│                 │
│                    └───────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Project Structure

```
chess-app/
├── public/
│   └── stockfish/                    # Static engine files (NOT bundled)
│       ├── stockfish-nnue-17.1-lite-single.js
│       └── stockfish-nnue-17.1-lite-single.wasm
├── src/
│   ├── components/
│   │   ├── ChessBoard.tsx            # Board wrapper with react-chessboard
│   │   ├── GameControls.tsx          # New game, resign, undo, difficulty
│   │   ├── MoveHistory.tsx           # PGN move list display
│   │   ├── GameStatus.tsx            # Turn indicator, check/mate status
│   │   └── DifficultySelector.tsx    # Difficulty dropdown/buttons
│   ├── hooks/
│   │   ├── useChessGame.ts           # Main game state management
│   │   └── useChessEngine.ts         # Stockfish worker communication
│   ├── lib/
│   │   ├── engine.ts                 # Engine wrapper class
│   │   └── difficulty.ts             # ELO/Skill level mappings
│   ├── types/
│   │   └── chess.ts                  # TypeScript interfaces
│   ├── App.tsx                       # Main application component
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 3. Stockfish Integration

### 3.1 Critical: Avoiding Bundler Issues

**Problem:** Vite attempts to process Web Worker imports through its transform pipeline, causing path resolution failures with Stockfish's WASM files.

**Solution:** Serve Stockfish files from `/public` directory and create Worker with absolute URL path.

#### 3.1.1 Setup Steps

1. **Install Stockfish package:**
   ```bash
   npm install stockfish
   ```

2. **Copy engine files to public folder:**
   ```bash
   mkdir -p public/stockfish
   cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.js public/stockfish/
   cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.wasm public/stockfish/
   ```

3. **Create Worker with absolute path (bypasses Vite bundler):**
   ```typescript
   // ✅ CORRECT - absolute path, no bundler processing
   const worker = new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js');
   
   // ❌ WRONG - Vite will try to bundle this and fail
   // import StockfishWorker from 'stockfish?worker';
   ```

### 3.2 Engine Wrapper Implementation

```typescript
// src/lib/engine.ts

export type Difficulty = 'easy' | 'medium' | 'hard' | 'veryHard';

interface DifficultyConfig {
  skillLevel: number;
  depth: number;
  elo?: number;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  easy:     { skillLevel: 0,  depth: 2 },           // ~200 ELO
  medium:   { skillLevel: 5,  depth: 6 },           // ~800 ELO
  hard:     { skillLevel: 10, depth: 12 },          // ~1200 ELO
  veryHard: { skillLevel: 20, depth: 15, elo: 2000 } // ~2000 ELO
};

export class ChessEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private currentDifficulty: Difficulty = 'medium';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Absolute path - served from /public, bypasses Vite
        this.worker = new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js');
        
        this.worker.onmessage = (e: MessageEvent) => {
          const message = e.data;
          if (message === 'uciok') {
            this.isReady = true;
            this.worker?.postMessage('isready');
          }
          if (message === 'readyok') {
            resolve();
          }
        };

        this.worker.onerror = (error) => {
          reject(new Error(`Engine failed to load: ${error.message}`));
        };

        this.worker.postMessage('uci');
      } catch (error) {
        reject(error);
      }
    });
  }

  setDifficulty(difficulty: Difficulty): void {
    if (!this.worker) return;
    
    this.currentDifficulty = difficulty;
    const config = DIFFICULTY_SETTINGS[difficulty];

    // Reset options
    this.worker.postMessage('setoption name UCI_LimitStrength value false');
    
    // Set skill level (0-20, affects move selection randomness)
    this.worker.postMessage(`setoption name Skill Level value ${config.skillLevel}`);
    
    // For very hard, also use UCI_Elo for more accurate strength limiting
    if (config.elo) {
      this.worker.postMessage('setoption name UCI_LimitStrength value true');
      this.worker.postMessage(`setoption name UCI_Elo value ${config.elo}`);
    }
  }

  async getBestMove(fen: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.isReady) {
        reject(new Error('Engine not initialized'));
        return;
      }

      const config = DIFFICULTY_SETTINGS[this.currentDifficulty];

      const handleMessage = (e: MessageEvent) => {
        const message: string = e.data;
        if (message.startsWith('bestmove')) {
          this.worker?.removeEventListener('message', handleMessage);
          const bestMove = message.split(' ')[1];
          resolve(bestMove);
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${config.depth}`);
    });
  }

  newGame(): void {
    this.worker?.postMessage('ucinewgame');
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
    this.isReady = false;
  }
}
```

### 3.3 React Hook for Engine

```typescript
// src/hooks/useChessEngine.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChessEngine, Difficulty } from '../lib/engine';

export function useChessEngine() {
  const engineRef = useRef<ChessEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const engine = new ChessEngine();
    engineRef.current = engine;

    engine.init()
      .then(() => {
        setIsLoading(false);
        engine.setDifficulty('medium'); // Default
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      engine.destroy();
    };
  }, []);

  const getBestMove = useCallback(async (fen: string): Promise<string | null> => {
    if (!engineRef.current) return null;
    try {
      return await engineRef.current.getBestMove(fen);
    } catch {
      return null;
    }
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    engineRef.current?.setDifficulty(difficulty);
  }, []);

  const newGame = useCallback(() => {
    engineRef.current?.newGame();
  }, []);

  return {
    isLoading,
    error,
    getBestMove,
    setDifficulty,
    newGame
  };
}
```

---

## 4. Difficulty Level Implementation

### 4.1 ELO Mapping Strategy

Stockfish's `UCI_Elo` option has a minimum of **1320 ELO**, which is too strong for Easy and Medium levels. We use a combination of techniques:

| Difficulty | Target ELO | Implementation |
|------------|------------|----------------|
| **Easy** | ~200 | `Skill Level: 0` + `depth: 2` |
| **Medium** | ~800 | `Skill Level: 5` + `depth: 6` |
| **Hard** | ~1200 | `Skill Level: 10` + `depth: 12` |
| **Very Hard** | ~2000 | `UCI_LimitStrength: true` + `UCI_Elo: 2000` + `depth: 15` |

### 4.2 How Stockfish Weakening Works

1. **Skill Level (0-20):** At lower levels, Stockfish:
   - Searches to a shallower depth (`depth = 1 + Skill Level`)
   - Adds random score bonuses to suboptimal moves
   - Intentionally selects weaker moves

2. **Depth Limiting:** Restricts how many moves ahead the engine calculates
   - `depth: 2` = Only looks 2 moves ahead (very weak)
   - `depth: 15` = Looks 15 moves ahead (strong tactical play)

3. **UCI_Elo:** Official ELO strength limiter (minimum 1320)

### 4.3 Expected Response Times

| Difficulty | Depth | Expected Time |
|------------|-------|---------------|
| Easy | 2 | < 100ms |
| Medium | 6 | 100-300ms |
| Hard | 12 | 300ms - 1s |
| Very Hard | 15 | 500ms - 2s |

---

## 5. Functional Requirements

### 5.1 Game Board (FR-001)

| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-001.1 | Display 8x8 chess board with standard piece positions | Must |
| FR-001.2 | Support drag-and-drop piece movement | Must |
| FR-001.3 | Support click-to-select, click-to-move as alternative | Should |
| FR-001.4 | Highlight legal moves when piece is selected | Must |
| FR-001.5 | Highlight last move (from/to squares) | Must |
| FR-001.6 | Highlight king when in check | Must |
| FR-001.7 | Flip board orientation (white/black perspective) | Should |
| FR-001.8 | Animate piece movement | Should |
| FR-001.9 | Board orientation defaults to player's color (Black at bottom if playing Black) | Must |

### 5.2 Game Controls (FR-002)

| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-002.1 | New Game button - reset to starting position | Must |
| FR-002.2 | Difficulty selector - Easy/Medium/Hard/Very Hard (disabled during active game) | Must |
| FR-002.3 | Choose color - play as White or Black (disabled during active game) | Must |
| FR-002.4 | Resign button - concede current game | Should |
| FR-002.5 | Undo button - take back last move pair (human + AI), can be used multiple times | Should |
| FR-002.6 | Display current difficulty setting | Must |
| FR-002.7 | All game buttons disabled while AI is thinking (except view-only controls) | Must |
| FR-002.8 | Start Game button - begins game after color/difficulty selection | Must |

### 5.3 Game State Display (FR-003)

| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-003.1 | Show whose turn it is (You / AI) | Must |
| FR-003.2 | Display check status | Must |
| FR-003.3 | Display game result message (Checkmate, Stalemate, Draw) when game ends | Must |
| FR-003.4 | Show AI "thinking" indicator during calculation | Must |
| FR-003.5 | Display captured pieces for both sides | Should |
| FR-003.6 | After game over: board remains viewable, Undo available to review moves | Must |

### 5.4 Move History (FR-004)

| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-004.1 | Display moves in standard algebraic notation | Must |
| FR-004.2 | Format as numbered move pairs (1. e4 e5 2. Nf3 Nc6) | Must |
| FR-004.3 | Auto-scroll to latest move | Should |
| FR-004.4 | Highlight current move in list | Should |

### 5.5 Pawn Promotion (FR-005)

| Requirement | Description | Priority |
|-------------|-------------|----------|
| FR-005.1 | Detect when pawn reaches back rank | Must |
| FR-005.2 | Display promotion piece selector (Q, R, B, N) | Must |
| FR-005.3 | Default to Queen if auto-promote enabled | Should |
| FR-005.4 | AI always promotes to Queen | Must |

---

## 6. User Interface Design

### 6.1 Start Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header                                   │
│                    "Chess vs AI"                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌───────────────────────┐                     │
│                    │                       │                     │
│                    │   Select Difficulty   │                     │
│                    │   ┌─────────────────┐ │                     │
│                    │   │ ○ Easy   (200)  │ │                     │
│                    │   │ ● Medium (800)  │ │                     │
│                    │   │ ○ Hard   (1200) │ │                     │
│                    │   │ ○ V.Hard (2000) │ │                     │
│                    │   └─────────────────┘ │                     │
│                    │                       │                     │
│                    │   Play as             │                     │
│                    │   ┌─────────────────┐ │                     │
│                    │   │ ● White         │ │                     │
│                    │   │ ○ Black         │ │                     │
│                    │   └─────────────────┘ │                     │
│                    │                       │                     │
│                    │   [ Start Game ]      │                     │
│                    │                       │                     │
│                    └───────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Game Screen Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header                                   │
│                    "Chess vs AI"                                 │
├───────────────────────────────────┬─────────────────────────────┤
│                                   │                             │
│                                   │      Game Controls          │
│                                   │  ┌───────────────────────┐  │
│                                   │  │ Difficulty: Medium    │  │
│                                   │  │ Playing as: White     │  │
│         Chess Board               │  │                       │  │
│         (responsive)              │  │ [New Game] [Undo]     │  │
│                                   │  │ [Resign]  [Flip]      │  │
│   Board oriented to player's      │  │                       │  │
│   color (player at bottom)        │  │ (Disabled while AI    │  │
│                                   │  │  is thinking)         │  │
│                                   │  └───────────────────────┘  │
│                                   │                             │
│                                   │      Game Status            │
│                                   │  ┌───────────────────────┐  │
│                                   │  │ Turn: Your move       │  │
│                                   │  │ Status: In progress   │  │
│                                   │  └───────────────────────┘  │
│                                   │                             │
│                                   │      Move History           │
│                                   │  ┌───────────────────────┐  │
│                                   │  │ 1. e4    e5           │  │
│                                   │  │ 2. Nf3   Nc6          │  │
│                                   │  │ 3. Bb5   a6           │  │
│                                   │  │ 4. ...                │  │
│                                   │  └───────────────────────┘  │
│                                   │                             │
├───────────────────────────────────┴─────────────────────────────┤
│                         Footer (optional)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Desktop (> 1024px) | Side-by-side: Board left, controls/history right |
| Tablet (768-1024px) | Board on top, controls below |
| Mobile (< 768px) | Stacked: Board, then controls, then history (collapsible) |

### 6.4 Color Scheme

| Element | Light Theme | Purpose |
|---------|-------------|---------|
| Light squares | `#f0d9b5` | Classic wood tone |
| Dark squares | `#b58863` | Classic wood tone |
| Selected piece | `#829769` | Green highlight |
| Legal move dots | `rgba(0,0,0,0.1)` | Subtle indicators |
| Last move | `#cdd26a` | Yellow highlight |
| Check highlight | `#e54545` | Red warning |

---

## 7. Game Flow

### 7.1 State Machine

```
                    ┌─────────────────┐
                    │   INITIALIZING  │
                    │ (Loading Engine)│
                    └────────┬────────┘
                             │ Engine Ready
                             ▼
                    ┌─────────────────┐
          ┌────────│   START_SCREEN  │◄────────────┐
          │        │ (Select Color/  │             │
          │        │  Difficulty)    │             │
          │        └────────┬────────┘             │
          │                 │ Click "Start Game"  │
          │                 ▼                      │
          │        ┌─────────────────┐             │
          │        │ (If Black: AI   │             │
          │        │  moves first)   │             │
          │        └────────┬────────┘             │
          │                 ▼                      │
          │        ┌─────────────────┐             │
          │   ┌───►│  PLAYER_TURN    │             │
          │   │    └────────┬────────┘             │
          │   │             │ Valid Move           │
          │   │             ▼                      │
          │   │    ┌─────────────────┐             │
          │   │    │ AI_THINKING     │             │
          │   │    │ (Buttons disabled)            │
          │   │    └────────┬────────┘             │
          │   │             │ AI Move              │
          │   │             ▼                      │
          │   │    ┌─────────────────┐             │
          │   └────┤ Check Game Over?├─────────────┤
          │        └────────┬────────┘   No        │
          │                 │ Yes                  │
          │                 ▼                      │
          │        ┌─────────────────┐             │
          │        │   GAME_OVER     │             │
          │        │ (Result message,│             │
          │        │  Undo available)│─────────────┘
          │        └─────────────────┘  New Game
          │
          └──────── Resign / New Game
```

### 7.2 AI Turn Sequence

1. Player makes valid move
2. Update board state
3. Check for game over → If yes, display result message
4. Set state to "AI thinking"
5. **Disable all game control buttons** (New Game, Undo, Resign)
6. Send FEN position to Stockfish worker
7. Wait for "bestmove" response
8. Parse and validate AI move (force Queen promotion if pawn reaches back rank)
9. Animate AI move on board
10. Update move history
11. **Re-enable game control buttons**
12. Check for game over → If yes, display result message
13. Return to player turn

### 7.3 Start Game Sequence

1. User arrives at Start Screen
2. User selects difficulty (default: Medium)
3. User selects color (default: White)
4. User clicks "Start Game"
5. Board orientation set to player's perspective (player's color at bottom)
6. If player chose Black → AI makes first move immediately
7. If player chose White → Wait for player's first move

### 7.4 Undo Behavior

| Scenario | Behavior |
|----------|----------|
| No moves made yet | Undo button does nothing (no-op) |
| AI is thinking | Wait for AI to complete, then undo |
| Normal gameplay | Undo removes last move pair (player + AI) |
| Multiple undos | Allowed - can undo back to starting position |
| After game over | Undo available to review previous positions |
| Player is Black, only AI has moved | Undo removes AI's opening move |

---

## 8. Technical Specifications

### 8.1 Chess.js Integration

```typescript
// src/hooks/useChessGame.ts

import { useState, useCallback } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { useChessEngine } from './useChessEngine';

export type GameStatus = 
  | 'initializing'
  | 'startScreen'
  | 'playerTurn' 
  | 'aiThinking' 
  | 'gameOver';

export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  history: Move[];
  status: GameStatus;
  result: string | null;
  playerColor: 'w' | 'b';
}

export function useChessGame() {
  const [game] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState>(getGameState(game, 'initializing', 'w'));
  const { isLoading, getBestMove, setDifficulty, newGame: resetEngine } = useChessEngine();

  // ... implementation
}

function getGameState(game: Chess, status: GameStatus, playerColor: 'w' | 'b'): GameState {
  return {
    fen: game.fen(),
    turn: game.turn(),
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isStalemate: game.isStalemate(),
    isDraw: game.isDraw(),
    history: game.history({ verbose: true }),
    status,
    result: getResult(game),
    playerColor
  };
}

function getResult(game: Chess): string | null {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
  }
  if (game.isStalemate()) return 'Draw by stalemate';
  if (game.isDraw()) return 'Draw';
  return null;
}
```

### 8.2 UCI Protocol Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `uci` | Initialize UCI mode | Sent on worker creation |
| `isready` | Check engine is ready | Wait for `readyok` |
| `setoption name X value Y` | Set engine option | `setoption name Skill Level value 5` |
| `ucinewgame` | Reset for new game | Sent on "New Game" |
| `position fen X` | Set board position | `position fen rnbqkbnr/...` |
| `go depth X` | Calculate best move | `go depth 10` |
| `stop` | Stop calculation | For cancelling |

### 8.3 Move Format Conversion

Stockfish returns moves in UCI format (e.g., `e2e4`), but chess.js and react-chessboard use SAN (e.g., `e4`). Conversion:

```typescript
function uciToMove(game: Chess, uci: string): Move | null {
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length === 5 ? uci[4] : undefined;
  
  return game.move({ from, to, promotion });
}
```

---

## 9. Development Setup

### 9.1 Prerequisites

- Node.js 18+ 
- npm 10+
- Modern browser (Chrome, Firefox, Safari, Edge)

### 9.2 Installation Steps

```bash
# 1. Create Vite + React + TypeScript project
npm create vite@latest chess-app -- --template react-ts
cd chess-app

# 2. Install dependencies
npm install chess.js react-chessboard stockfish
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Copy Stockfish to public folder (CRITICAL)
mkdir -p public/stockfish
cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.js public/stockfish/
cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.wasm public/stockfish/

# 4. Start development server
npm run dev
```

### 9.3 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No special configuration needed - Stockfish served from /public
});
```

### 9.4 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "setup:stockfish": "mkdir -p public/stockfish && cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.* public/stockfish/"
  }
}
```

---

## 10. Testing Requirements

### 10.1 Unit Tests

| Component | Test Cases |
|-----------|------------|
| `engine.ts` | Engine initialization, difficulty setting, move parsing |
| `useChessGame` | Move validation, game over detection, undo functionality |
| Difficulty mapping | Correct Skill Level and depth for each ELO target |

### 10.2 Integration Tests

| Scenario | Expected Behavior |
|----------|-------------------|
| Complete game to checkmate | Game ends, result displayed correctly |
| Undo after AI move | Both AI and player moves undone |
| Change difficulty mid-game | Next AI move uses new settings |
| Pawn promotion | Promotion UI appears, correct piece placed |

### 10.3 Manual Testing Checklist

- [ ] New game starts with correct initial position
- [ ] All four difficulty levels respond within time limits
- [ ] Easy AI makes noticeable mistakes
- [ ] Very Hard AI plays strong moves
- [ ] Castling works (kingside and queenside)
- [ ] En passant capture works
- [ ] Pawn promotion shows piece selector
- [ ] Check is visually highlighted
- [ ] Checkmate ends game with correct result
- [ ] Stalemate ends game as draw
- [ ] Undo works correctly
- [ ] Resign ends game
- [ ] Flip board changes perspective
- [ ] Move history updates correctly

---

## 11. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | < 2 seconds | Time to interactive |
| Engine initialization | < 2 seconds | Time from load to first move ready |
| AI move (Easy) | < 100ms | Time from player move to AI response |
| AI move (Medium) | < 500ms | Time from player move to AI response |
| AI move (Hard) | < 1 second | Time from player move to AI response |
| AI move (Very Hard) | < 2 seconds | Time from player move to AI response |
| UI responsiveness | < 100ms | Drag/drop, click response |
| Memory usage | < 100MB | Stable during extended play |

---

## 12. Future Enhancements (Out of Scope for MVP)

| Feature | Description | Phase |
|---------|-------------|-------|
| Game clock | Timed games with configurable time controls | 2 |
| PGN export | Download game as PGN file | 2 |
| Position setup | Custom starting positions | 2 |
| Analysis mode | Show engine evaluation and best moves | 2 |
| Themes | Multiple board and piece styles | 2 |
| Sound effects | Move sounds, check alerts | 2 |
| Puzzle mode | Tactical puzzles from famous games | 3 |
| Opening explorer | Show opening names and common continuations | 3 |
| Game history | Save and review past games (localStorage) | 3 |
| Multiplayer | Play against other humans (requires server) | 4 |

---

## 13. Appendix

### 13.1 Stockfish UCI Options Reference

| Option | Type | Range | Default | Purpose |
|--------|------|-------|---------|---------|
| `Threads` | spin | 1-1024 | 1 | CPU threads (single-thread version ignores) |
| `Hash` | spin | 1-33554432 | 16 | Hash table size in MB |
| `Skill Level` | spin | 0-20 | 20 | Playing strength (0 = weakest) |
| `UCI_LimitStrength` | check | true/false | false | Enable ELO limiting |
| `UCI_Elo` | spin | 1320-3190 | 1320 | Target ELO when limited |
| `MultiPV` | spin | 1-500 | 1 | Number of best moves to find |

### 13.2 FEN Format Reference

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
│                                            │ │    │ │ │
│                                            │ │    │ │ └─ Fullmove number
│                                            │ │    │ └─── Halfmove clock
│                                            │ │    └───── En passant square
│                                            │ └────────── Castling rights
│                                            └──────────── Active color
└───────────────────────────────────────────────────────── Piece placement
```

### 13.3 Algebraic Notation Reference

| Symbol | Meaning |
|--------|---------|
| K | King |
| Q | Queen |
| R | Rook |
| B | Bishop |
| N | Knight |
| (none) | Pawn |
| x | Capture |
| + | Check |
| # | Checkmate |
| O-O | Kingside castle |
| O-O-O | Queenside castle |
| = | Promotion (e.g., e8=Q) |

---

## 14. Behavior Clarifications

This section documents specific behavior decisions for edge cases and ambiguous scenarios.

### 14.1 Game Setup

| Question | Answer |
|----------|--------|
| When does game start? | User must click "Start Game" button after selecting difficulty and color |
| Default difficulty? | Medium (800 ELO) |
| Default player color? | White |
| What happens if player selects Black? | After clicking Start Game, AI immediately makes the first move |
| Board orientation? | Player's color always at the bottom of the board |

### 14.2 Undo Behavior

| Scenario | Behavior |
|----------|----------|
| No moves made yet | Undo button does nothing (no-op, button can be disabled) |
| AI is currently thinking | Wait for AI to complete its move, then allow undo |
| Normal gameplay | Undo removes last move pair (player move + AI response) |
| Multiple consecutive undos | Allowed - can undo all the way back to starting position |
| After game over | Undo is available to review previous positions |
| Player is Black, only AI has moved | Undo removes AI's opening move, returns to start position |

### 14.3 Difficulty and Color Selection

| Scenario | Behavior |
|----------|----------|
| Change difficulty mid-game? | Not allowed - difficulty selector disabled during active game |
| Change color mid-game? | Not allowed - color selector disabled during active game |
| How to change settings? | Click "New Game" to return to Start Screen |

### 14.4 Game Over State

| Question | Answer |
|----------|--------|
| What displays on game over? | Result message (e.g., "Checkmate! You win" or "Checkmate! AI wins") |
| Is the board interactive after game over? | Board is viewable but no new moves allowed |
| Is Undo available after game over? | Yes, to review the final moves |
| How to start a new game? | Click "New Game" button to return to Start Screen |

### 14.5 Button States During AI Thinking

| Button | State While AI Thinking |
|--------|-------------------------|
| New Game | Disabled |
| Undo | Disabled |
| Resign | Disabled |
| Flip Board | Enabled (view-only, doesn't affect game state) |

### 14.6 AI Behavior

| Question | Answer |
|----------|--------|
| Pawn promotion | AI always promotes to Queen |
| Move timing | AI moves as fast as possible within depth limit (no artificial delay) |
| Randomness | Lower difficulty levels have randomness in move selection (via Skill Level) |

### 14.7 Draw Handling

| Draw Type | Handling |
|-----------|----------|
| Stalemate | Automatically detected, game ends with "Draw by stalemate" message |
| Insufficient material | Automatically detected, game ends with "Draw" message |
| Threefold repetition | Automatically detected when position repeats 3 times |
| 50-move rule | Automatically detected after 50 moves without pawn move or capture |
| Draw by agreement | Not supported (single player vs AI) |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | | Initial version |
