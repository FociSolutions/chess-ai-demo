# Implementation Plan: Single-Player Chess Experience

**Branch**: `001-single-player-chess` | **Date**: December 12, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-single-player-chess/spec.md`

---

## Summary

Deliver a browser-based, single-player chess application where users compete against an AI opponent with four configurable difficulty levels (200–2000 ELO). The application enforces standard chess rules, provides responsive AI moves via Stockfish WebAssembly, and runs entirely client-side without server dependencies. Core value: Play complete, rule-enforced chess games against a tunable AI within 10 seconds of page load.

---

## Technical Context

**Language/Version**: TypeScript 5.x + React 18.x  
**Primary Dependencies**: Vite 5.x, chess.js 1.x, react-chessboard 4.x, Stockfish.js 17.1 (WASM)  
**Storage**: N/A (local session state only; no persistence)  
**Testing**: Vitest + React Testing Library (unit/integration), manual game flow testing  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+); WebAssembly required  
**Project Type**: Web (frontend-only single-page application)  
**Performance Goals**: AI response < 0.5s (Easy/Medium), < 1s (Hard), < 2s (Very Hard); page load < 10s; UI responsiveness < 100ms  
**Constraints**: Browser-only execution; 7–75MB engine files (serve from `/public`); no network calls during gameplay  
**Scale/Scope**: Single-player, single board, 4 difficulty levels, full FIDE chess rules

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **No violations detected.** The specification is aligned with:
- Technology choices clearly scoped to browser stack (TypeScript, React, Vite)
- Architectural constraints justified (WebAssembly Stockfish, no backend)
- Performance targets reasonable for stated platform
- Scope tightly bounded to MVP (single-player, no multiplayer, no persistence)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-single-player-chess/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Research findings (TBD)
├── data-model.md        # Phase 1: Entity definitions (TBD)
├── quickstart.md        # Phase 1: Getting started guide (TBD)
├── contracts/           # Phase 1: API/interface contracts (TBD)
│   ├── game-api.md
│   ├── engine-api.md
│   └── component-interface.md
├── checklists/
│   └── requirements.md   # Quality checklist
└── tasks.md             # Phase 2: Task breakdown (TBD)
```

### Source Code (repository root)

```text
chess-app/
├── public/
│   └── stockfish/                          # Static engine files (NOT bundled)
│       ├── stockfish-nnue-17.1-lite-single.js
│       └── stockfish-nnue-17.1-lite-single.wasm
│
├── src/
│   ├── components/
│   │   ├── ChessBoard.tsx                  # Board wrapper + react-chessboard
│   │   ├── GameControls.tsx                # Buttons: New Game, Resign, Undo, Flip
│   │   ├── MoveHistory.tsx                 # Move list in algebraic notation
│   │   ├── GameStatus.tsx                  # Turn, check, checkmate, draw indicators
│   │   ├── DifficultySelector.tsx          # Difficulty + color selection pre-game
│   │   ├── PromotionSelector.tsx           # Modal for pawn promotion piece choice
│   │   └── StartScreen.tsx                 # Game setup (difficulty, color, Start button)
│   │
│   ├── hooks/
│   │   ├── useChessGame.ts                 # Game state machine, move validation
│   │   └── useChessEngine.ts               # Stockfish worker communication
│   │
│   ├── lib/
│   │   ├── engine.ts                       # ChessEngine class (worker wrapper)
│   │   ├── difficulty.ts                   # ELO-to-UCI mapping (Skill Level, depth)
│   │   └── notation.ts                     # UCI↔SAN move conversion, PGN formatting
│   │
│   ├── types/
│   │   └── chess.ts                        # TypeScript interfaces (GameState, Move, etc.)
│   │
│   ├── App.tsx                             # Root component
│   ├── main.tsx                            # React entry point
│   └── index.css                           # Tailwind + custom styles
│
├── tests/
│   ├── unit/
│   │   ├── engine.test.ts
│   │   ├── difficulty.test.ts
│   │   └── notation.test.ts
│   │
│   ├── integration/
│   │   ├── game-flow.test.tsx              # Full game scenarios
│   │   ├── ai-response.test.tsx            # Engine integration
│   │   └── move-validation.test.tsx        # chess.js rule enforcement
│   │
│   └── manual/
│       └── checklist.md                    # Manual testing scenarios
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

**Structure Decision**: Single-project web application. React frontend-only with no backend service. All game logic (chess.js), AI (Stockfish WASM), and state management (React hooks) colocated in `/src`. Stockfish engine files served statically from `/public` to bypass Vite bundler (CRITICAL workaround documented in PRD §3.1).

---

## Phase 0: Research & Clarifications

**Deliverable**: `research.md`

### Known Clarifications (Already Resolved)

From spec Clarifications § Session 2025-12-12:
- ✅ AI time budget overruns are defects; no runtime downgrades or random moves.

### Research Tasks

1. **Stockfish WASM Integration Best Practices**
   - How to correctly serve engine files from `/public` with Vite
   - Common bundler pitfalls and verified workarounds
   - Web Worker initialization patterns for WASM

2. **Chess.js & react-chessboard Compatibility**
   - Exact version constraints (chess.js 1.x compatibility, react-chessboard 4.x)
   - Move validation flow: UI → chess.js → board state
   - Promotion handling (when/how to show selector)

3. **React Hooks for Game State**
   - useChessGame: state machine transitions (START_SCREEN → PLAYER_TURN → AI_THINKING → check game over)
   - useChessEngine: worker lifecycle, message passing, error handling
   - Undo state management (history tracking, revert logic)

4. **TypeScript Types for Chess**
   - FEN validation and generation
   - Move representation (UCI vs SAN, promotion notation)
   - GameState type: all required fields, turn indicators

5. **Stockfish Difficulty Mapping Validation**
   - Skill Level (0–20) vs UCI_Elo (1320–3190) ranges
   - Depth settings for each difficulty tier
   - Expected response times on standard hardware

6. **Accessibility & Keyboard Navigation**
   - WCAG 2.1 Level AA requirements for board interaction
   - Screen reader friendly move announcements
   - Keyboard controls for piece selection/movement

---

## Phase 1: Design & Contracts

**Deliverables**: `data-model.md`, `contracts/`, `quickstart.md`

### 1.1 Data Model (`data-model.md`)

#### Entity: GameState

```typescript
type GameStatus = 
  | 'initializing'    // Engine loading
  | 'startScreen'     // Awaiting difficulty/color/start
  | 'playerTurn'      // Player's move expected
  | 'aiThinking'      // Engine calculating
  | 'gameOver';       // Checkmate, stalemate, draw, or resign

interface GameState {
  fen: string;                              // Current board position
  turn: 'w' | 'b';                          // Active color
  moves: Move[];                            // Full game history
  status: GameStatus;
  playerColor: 'w' | 'b';                   // Player's pieces
  aiColor: 'w' | 'b';                       // AI's pieces (opposite)
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  drawReason?: 'stalemate' | 'repetition' | '50-move' | 'insufficient';
  resultMessage: string | null;             // "You win", "AI wins", "Draw", etc.
  lastMoveFrom?: Square;
  lastMoveTo?: Square;
}
```

#### Entity: Move

```typescript
interface Move {
  san: string;                              // Standard algebraic notation (e.g., "e4", "Nf3", "O-O")
  uci: string;                              // UCI format (e.g., "e2e4")
  actor: 'player' | 'ai';
  timestamp: number;                        // Milliseconds since game start
  flags: {
    capture?: boolean;
    promotion?: 'q' | 'r' | 'b' | 'n';
    castling?: 'k' | 'q';                  // kingside or queenside
    enPassant?: boolean;
    check?: boolean;
  };
}
```

#### Entity: Settings

```typescript
interface Settings {
  difficulty: Difficulty;                   // 'easy' | 'medium' | 'hard' | 'veryHard'
  playerColor: 'w' | 'b';
  boardFlipped: boolean;                    // User perspective
  soundEnabled: boolean;
  announceMovesEnabled: boolean;
}
```

#### Entity: AIOpponent

```typescript
interface AIOpponent {
  difficulty: Difficulty;
  skillLevel: number;                       // 0–20 UCI_Skill_Level
  depth: number;                            // Ply depth limit
  elo?: number;                             // For very hard: UCI_Elo target
  responseTimeMs: number;                   // Actual move latency (for monitoring)
}
```

---

### 1.2 API Contracts (`contracts/`)

#### **contracts/game-api.md** – Public Game Functions

```typescript
// Game lifecycle
startNewGame(difficulty: Difficulty, playerColor: 'w' | 'b'): GameState
makePlayerMove(from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): { success: boolean; gameState: GameState; error?: string }
undoLastMoveSet(): GameState                // Undo player move + AI response
resignGame(): GameState                     // End game, AI wins
flipBoard(): void                           // Change perspective, no state change

// Queries
getGameState(): GameState
getLegalMoves(square?: Square): Square[]    // All legal moves, or from specific square
getLastMove(): Move | null
getMoveHistory(): Move[]
```

#### **contracts/engine-api.md** – Stockfish Integration

```typescript
// useChessEngine hook exports
interface ChessEngineAPI {
  isLoading: boolean;
  error: string | null;
  
  // Methods
  getBestMove(fen: string, difficulty: Difficulty): Promise<string | null>  // Returns UCI move or null on error
  setDifficulty(difficulty: Difficulty): void
  newGame(): void
  destroy(): void
}
```

#### **contracts/component-interface.md** – React Components

```typescript
// ChessBoard component
export interface ChessBoardProps {
  gameState: GameState;
  onMoveMade: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => void;
  onPromotionRequired: (fromSquare: Square, toSquare: Square) => void;
  isPlayerTurn: boolean;
  legalMoves: Square[];
  lastMoveFrom?: Square;
  lastMoveTo?: Square;
}

// GameStatus component
export interface GameStatusProps {
  gameState: GameState;
  isThinking: boolean;
}

// GameControls component
export interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
  isPlayerTurn: boolean;
  canUndo: boolean;
}

// DifficultySelector component
export interface DifficultySelectorProps {
  difficulty: Difficulty;
  playerColor: 'w' | 'b';
  onStart: (difficulty: Difficulty, color: 'w' | 'b') => void;
  isLoading: boolean;
}

// PromotionSelector component
export interface PromotionSelectorProps {
  fromSquare: Square;
  toSquare: Square;
  playerColor: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}
```

---

### 1.3 Quick Start (`quickstart.md`)

**Abbreviated development workflow** (full guide TBD in quickstart.md):

```bash
# Setup
npm create vite@latest chess-app -- --template react-ts
cd chess-app
npm install chess.js react-chessboard stockfish
npm install -D tailwindcss @testing-library/react vitest

# Copy Stockfish to public (CRITICAL for bundler bypass)
mkdir -p public/stockfish
cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.* public/stockfish/

# Start dev
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

---

## Phase 2: Task Breakdown & Implementation

**Deliverable**: `tasks.md` (generated by `/speckit.tasks` command, NOT by `/speckit.plan`)

### Estimated Scope (Pre-tasks)

| Component | Estimated LOC | Complexity |
|-----------|---------------|------------|
| Stockfish engine wrapper + hooks | 300–400 | High (worker lifecycle, UCI protocol) |
| Game state machine (useChessGame) | 400–500 | High (move validation, undo, game over) |
| React components (board, controls, status, history) | 600–800 | Medium (UI composition, event handling) |
| Move notation conversion (UCI ↔ SAN) | 150–200 | Medium (chess notation rules) |
| Difficulty/ELO mapping | 100–150 | Low (configuration + setup) |
| Styling & responsive layout | 200–300 | Low–Medium (Tailwind + custom CSS) |
| Unit + integration tests | 500–700 | Medium (game flow, edge cases) |
| **Total** | **~2500–3050 LOC** | — |

### Suggested Implementation Order

1. **Engine integration** (lib/engine.ts, useChessEngine hook)
   - Verify Stockfish WASM loads correctly
   - Test worker message passing
   - Confirm difficulty-to-UCI mapping

2. **Game state machine** (useChessGame hook)
   - Initialize chess.js instance
   - Handle move validation via chess.js
   - Implement state transitions (START_SCREEN → PLAYER_TURN → AI_THINKING → game over)
   - Test undo logic

3. **Core UI components** (ChessBoard, GameStatus, GameControls)
   - Wire game state to react-chessboard
   - Implement turn/status indicators
   - Add buttons and handlers

4. **Advanced features** (promotion selector, move history, accessibility)
   - Pawn promotion modal
   - Move history display
   - Keyboard navigation

5. **Testing & refinement** (unit, integration, manual)
   - Test all difficulty levels for response times
   - Verify all draw conditions
   - Full game flow scenarios

---

## Success Criteria (Per Spec)

| Criterion | Verification Method |
|-----------|---------------------|
| SC-001: 95% ready within 10s page load + 2s AI ready | Measure time from page load to first move |
| SC-002: 95% of AI moves within time budgets per difficulty | Run 100 games per level, measure response times |
| SC-003: Zero illegal moves; all special moves & draws detected | Automated test: attempt all illegal moves, verify rejection |
| SC-004: 90% usability in testing (new game, difficulty, undo) | Usability testing with 10+ participants |
| SC-005: No network calls post-load; offline gameplay works | Monitor network tab, test offline |
| SC-006: Keyboard navigation + accessibility compliance | WCAG 2.1 Level AA audit + assistive tech testing |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stockfish WASM bundler issues | High | High | Pre-verify public/ serving setup; use absolute `/stockfish/` path (PRD §3.1) |
| AI slower than time budgets on low-end devices | Medium | Medium | Use lite engine (7MB); profile on target hardware early |
| Undo state corruption | Medium | Medium | Implement immutable move history; test undo exhaustively |
| Promotion logic conflicts with chess.js | Low | Medium | Test pawn → back rank → promotion flow carefully |
| Browser compatibility with WASM | Low | High | Verify on Chrome, Firefox, Safari, Edge; use feature detection |

---

## Next Steps

1. Execute `/speckit.plan` → generates `research.md` with Phase 0 findings
2. Review Phase 0 research and confirm no NEEDS CLARIFICATION items remain
3. Execute Phase 1 design workflow → generate `data-model.md`, contracts, `quickstart.md`
4. Update agent context with technology stack (via `.specify/scripts/bash/update-agent-context.sh copilot`)
5. Execute `/speckit.tasks` → generate `tasks.md` with granular development tasks
6. Begin implementation following task order

---

**Plan Approved**: Ready for Phase 0 research and Phase 1 design.
