# Implementation Quick Reference Guide

**For**: Phase 4 Chess Application Implementation  
**Last Updated**: December 10, 2025  

---

## 📁 File Structure (What to Create)

```
src/
├── types/
│   └── chess.ts                 # GameStatus, DifficultyLevel, GameState, Move, etc
├── lib/
│   ├── engine.ts                # ChessEngine class (Stockfish wrapper)
│   ├── difficulty.ts            # DIFFICULTY_SETTINGS constant
│   └── __tests__/
│       ├── engine.test.ts
│       └── difficulty.test.ts
├── hooks/
│   ├── useChessEngine.ts        # Engine initialization & communication
│   ├── useChessGame.ts          # Game state, move validation, AI triggers
│   └── __tests__/
│       └── useChessGame.test.ts
├── components/
│   ├── StartScreen.tsx          # Difficulty & color selection
│   ├── ChessBoard.tsx           # Board with drag-drop (uses react-chessboard)
│   ├── GameControls.tsx         # Buttons (New Game, Undo, Resign, Flip)
│   ├── GameStatus.tsx           # Turn, check, result display
│   ├── MoveHistory.tsx          # Move list in SAN notation
│   └── __tests__/
│       └── integration.test.ts
├── App.tsx                      # Main layout
├── main.tsx                     # React entry point
└── index.css                    # Tailwind imports

public/
└── stockfish/
    ├── stockfish-nnue-17.1-lite-single.js
    └── stockfish-nnue-17.1-lite-single.wasm
```

---

## 🔑 Key Constants & Configurations

### Difficulty Settings
```typescript
// src/lib/difficulty.ts
export const DIFFICULTY_SETTINGS = {
  easy:     { skillLevel: 0,  depth: 2 },           // ~200 ELO
  medium:   { skillLevel: 5,  depth: 6 },           // ~800 ELO
  hard:     { skillLevel: 10, depth: 12 },          // ~1200 ELO
  veryHard: { skillLevel: 20, depth: 15, elo: 2000 } // ~2000 ELO
};
```

### Game Status Enum
```typescript
// src/types/chess.ts
enum GameStatus {
  START_SCREEN = 'START_SCREEN',
  PLAYER_TURN = 'PLAYER_TURN',
  AI_THINKING = 'AI_THINKING',
  GAME_OVER = 'GAME_OVER',
}
```

### Tailwind Custom Colors
```javascript
// tailwind.config.js
colors: {
  'board-light': '#f0d9b5',      // Light squares
  'board-dark': '#b58863',       // Dark squares
  'selected': '#829769',         // Selected piece
  'last-move': '#cdd26a',        // Last move highlight
  'check': '#e54545',            // Check highlight
}
```

---

## ⚠️ Critical Implementation Notes

### 1. Stockfish Worker Path (MUST BE ABSOLUTE)
```typescript
// ✅ CORRECT
const worker = new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js');

// ❌ WRONG (will fail to load WASM)
import StockfishWorker from 'stockfish?worker';
const worker = new StockfishWorker();
```

### 2. UCI Protocol Commands (in order)
```typescript
// Initialize
worker.postMessage('uci');                    // Sends back 'uciok'
worker.postMessage('isready');                // Responds 'readyok'

// Configure for difficulty
worker.postMessage('setoption name Skill Level value 5');

// For Very Hard difficulty
worker.postMessage('setoption name UCI_LimitStrength value true');
worker.postMessage('setoption name UCI_Elo value 2000');

// Get move
worker.postMessage('position fen ' + fen);
worker.postMessage('go depth 6');             // Responds 'bestmove e2e4'

// New game
worker.postMessage('ucinewgame');
```

### 3. Move Validation Flow (ALWAYS Before UI Update)
```typescript
// 1. User drags piece
// 2. Component calls onDrop(from, to)
// 3. Hook validates with chess.js
if (!game.move({ from, to, promotion })) {
  return false;  // Invalid - piece returns to origin
}
// 4. THEN update state and request AI move
```

### 4. Game Over State (Per Clarification Q5)
```typescript
// When game ends:
- Board: Visible but readonly (isDisabled: true)
- Result: Display message BELOW board
- Buttons: Only "New Game" enabled
- Undo: Disabled (per Q5 clarification)
```

### 5. Button States (Per Clarification Q1)
```typescript
// While AI is thinking (status === 'AI_THINKING'):
- New Game: Disabled
- Undo: Disabled         // Q1: Button disabled (not queued)
- Resign: Disabled
- Flip Board: Enabled    // View-only, no game impact
```

### 6. Pawn Promotion (Per Clarification Q2)
```typescript
// When pawn reaches 8th rank:
- Show: Modal dialog (blocks board)
- Options: Q, R, B, N
- AI: Always promotes to Queen
// Modal must be dismissed (user selects piece)
```

### 7. Move History Display (Per Clarification Q3)
```typescript
// Display ALL moves, including incomplete pairs:
"1. e4 e5"
"2. Nf3 Nc6"
"3. Bb5 a6"
"4. Ba4"        // ← Incomplete pair (AI hasn't moved yet)
```

### 8. Threefold Repetition (Per Clarification Q4)
```typescript
// Auto-draw (no player action needed)
// chess.js detects this automatically via isDraw()
if (game.isDraw()) {
  result = 'Draw by repetition';
}
```

---

## 🎯 Component Props Reference

### StartScreen
```typescript
interface Props {
  onStartGame: (difficulty: Difficulty, color: PlayerColor) => void;
  isLoading: boolean;
}
```

### ChessBoard
```typescript
interface Props {
  fen: string;
  playerColor: PlayerColor;
  onDrop: (from: string, to: string) => Promise<boolean>;
  lastMove?: { from: string; to: string };
  isCheck: boolean;
  isDisabled: boolean;
  onFlipBoard?: () => void;
}
```

### GameControls
```typescript
interface Props {
  status: GameStatus;
  difficulty: DifficultyLevel;
  playerColor: PlayerColor;
  onNewGame: () => void;
  onUndo: () => Promise<void>;
  onResign: () => void;
  onFlip: () => void;
}
```

### GameStatus
```typescript
interface Props {
  status: GameStatus;
  isCheck: boolean;
  result: GameResult | null;
  playerColor: PlayerColor;
  turn: 'white' | 'black';
}
```

### MoveHistory
```typescript
interface Props {
  moves: string[];          // Array of SAN moves
  currentMoveIndex?: number;
}
```

---

## 📋 Hook APIs

### useChessEngine()
```typescript
const {
  isLoading,                          // bool
  error,                              // string | null
  getBestMove: (fen: string) => Promise<string>,
  setDifficulty: (d: Difficulty) => void,
  newGame: () => void
} = useChessEngine();
```

### useChessGame()
```typescript
const {
  gameState,                          // GameState object
  makeMove: (from, to) => Promise<boolean>,
  undo: () => Promise<void>,
  resign: () => void,
  newGame: () => void,
  setDifficulty: (d: Difficulty) => void,
  setPlayerColor: (c: PlayerColor) => void,
  startGame: () => Promise<void>
} = useChessGame();
```

---

## 🧪 Testing Checklist

### Unit Tests (Vitest)
- [ ] ChessEngine initializes and loads WASM
- [ ] getBestMove() returns valid UCI moves
- [ ] setDifficulty() applies correct Skill Level/Elo
- [ ] useChessGame validates moves via chess.js
- [ ] Checkmate, stalemate, draw detection
- [ ] Undo removes move pairs correctly
- [ ] Pawn promotion handling

### Integration Tests
- [ ] Complete game flow start → checkmate
- [ ] Undo works with AI moves
- [ ] All 4 difficulties respond within time limits
- [ ] Game over state (Q5: board readonly, buttons correct)
- [ ] Pawn promotion modal (Q2: blocks board)
- [ ] Move history formats correctly (Q3: incomplete pairs)

### Manual Testing
- [ ] All browsers: Chrome, Firefox, Safari, Edge
- [ ] Special moves: Castling (both), en passant
- [ ] Button states per GameStatus
- [ ] No TypeScript errors
- [ ] Performance targets met

---

## 🚀 Build & Run Commands

```bash
# Install dependencies
npm install

# Setup Stockfish (if not already copied)
mkdir -p public/stockfish
cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.js public/stockfish/
cp node_modules/stockfish/src/stockfish-nnue-17.1-lite-single.wasm public/stockfish/

# Development
npm run dev

# Type checking
tsc --noEmit

# Linting
npm run lint

# Testing
npm run test

# Build for production
npm run build
```

---

## 📚 Key Library Docs to Review

1. **react-chessboard**: Custom board styling, onDrop callback
2. **chess.js**: Move validation, FEN format, game state
3. **Stockfish.js**: UCI protocol, worker creation, best move format

---

## ✅ Definition of Done

A task is complete when:

1. **Code written** following constitution patterns
2. **TypeScript strict mode** passes (no errors/warnings)
3. **Unit tests** written (>80% coverage)
4. **Integration tests** pass
5. **Manual testing** verification (checklist)
6. **Documentation** (JSDoc/comments)
7. **Git commit** with clear message
8. **Code review** approved

---

## 🤔 Common Questions

**Q: Where do I put component styles?**  
A: Use Tailwind CSS utility classes in JSX. No separate CSS files needed.

**Q: How do I handle TypeScript types for chess.js?**  
A: Install `@types/chess.js` or use the types exported from chess.js itself.

**Q: What if Stockfish doesn't load?**  
A: Check:
1. Files exist in `/public/stockfish/`
2. Worker path is absolute: `/stockfish/...`
3. Browser console for CORS/loading errors
4. Check that `.wasm` file exists and is accessible

**Q: How do I test the AI moves?**  
A: Profile with DevTools; use FEN positions; measure actual move times vs targets.

**Q: Can I modify difficulty mid-game?**  
A: Per spec, difficulty is disabled during active game. Must use "New Game" to change.

---

## 📞 Need Help?

Reference documents:
- `specs/1-chess-application-mvp/spec.md` - Full specification
- `specs/1-chess-application-mvp/CLARIFICATIONS.md` - Q&A clarifications
- `specs/1-chess-application-mvp/IMPLEMENTATION_PLAN.md` - Detailed plan
- `docs/PRD.md` - Technical architecture
- `.specify/memory/constitution.md` - Code standards

---

