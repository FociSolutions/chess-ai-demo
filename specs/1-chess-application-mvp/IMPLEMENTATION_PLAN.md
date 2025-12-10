# Chess Application Implementation Plan

**Phase**: 4 - Core Implementation  
**Branch**: 004-chess-app-implementation  
**Status**: Ready to Execute  
**Date Created**: December 10, 2025  

---

## Executive Summary

This plan outlines the complete implementation roadmap for the chess application across 4 major workstreams: **Project Setup**, **Core Engine**, **Components & UI**, and **Integration & Testing**.

Total estimated effort: **40-60 developer hours** for a single developer.

---

## Workstream 1: Project Setup & Configuration

### 1.1 TypeScript & Build Configuration
**Effort**: 2 hours | **Status**: Not Started

- ✅ TypeScript strict mode (`strict: true`)
- ✅ Configure `tsconfig.json` with proper paths
- ✅ Set up ESLint with React hooks rules
- ✅ Configure Vite with React plugin
- ✅ Set up PostCSS for Tailwind

**Deliverables**:
- `tsconfig.json` configured
- `eslintrc.js` configured
- `vite.config.ts` configured
- `.postcssrc.js` configured
- Build passes `tsc --noEmit`

**Dependencies**: None (first task)

---

### 1.2 Tailwind CSS Setup
**Effort**: 1 hour | **Status**: Blocked by 1.1

- ✅ Install Tailwind, PostCSS, autoprefixer
- ✅ Create `tailwind.config.js` with custom colors (board squares, highlights)
- ✅ Create `src/index.css` with Tailwind directives
- ✅ Create utility classes for board squares

**Custom Tailwind Colors Needed**:
```javascript
// tailwind.config.js
colors: {
  'board-light': '#f0d9b5',
  'board-dark': '#b58863',
  'selected': '#829769',
  'last-move': '#cdd26a',
  'check': '#e54545',
}
```

**Deliverables**:
- Tailwind fully configured
- Custom color palette working
- CSS builds without errors

**Dependencies**: 1.1 (TypeScript config)

---

### 1.3 Stockfish WASM Setup
**Effort**: 1.5 hours | **Status**: Blocked by 1.1

**Critical**: This requires manual file copying and verification.

- ✅ Install `stockfish` npm package
- ✅ Create `/public/stockfish/` directory
- ✅ Copy `stockfish-nnue-17.1-lite-single.js` to `/public/stockfish/`
- ✅ Copy `stockfish-nnue-17.1-lite-single.wasm` to `/public/stockfish/`
- ✅ Verify files exist and are readable
- ✅ Update `.gitignore` to preserve `/public/stockfish/`

**Verification Steps**:
```bash
# Verify files copied correctly
ls -lah public/stockfish/
file public/stockfish/stockfish-nnue-17.1-lite-single.wasm
# Should show: Wasm (WebAssembly) Module

# Verify package.json has correct version
npm list stockfish
# Should show: stockfish@17.1.x
```

**Deliverables**:
- Stockfish files in `/public/stockfish/`
- Both `.js` and `.wasm` files present
- Files can be served via HTTP
- No Vite bundling interference

**Dependencies**: None (can run in parallel with 1.1, 1.2)

---

## Workstream 2: Core Engine & Hooks

### 2.1 Type Definitions
**Effort**: 1.5 hours | **Status**: Blocked by 1.1

**File**: `src/types/chess.ts`

```typescript
// Key types to define:
- GameStatus enum (START_SCREEN, PLAYER_TURN, AI_THINKING, GAME_OVER)
- DifficultyLevel interface
- GameState interface
- Move interface
- PlayerColor type ('white' | 'black')
- GameResult type
```

**Specification Reference**: PRD Section 8.1, Spec Section 4

**Deliverables**:
- `src/types/chess.ts` with all required types
- All types exported and documented
- TypeScript strict mode passes

**Dependencies**: 1.1 (TypeScript config)

---

### 2.2 Difficulty Configuration
**Effort**: 1 hour | **Status**: Blocked by 2.1

**File**: `src/lib/difficulty.ts`

**Per PRD Section 4.1 - ELO Mapping Strategy**:

```typescript
const DIFFICULTY_SETTINGS = {
  easy: { skillLevel: 0, depth: 2, elo: undefined },
  medium: { skillLevel: 5, depth: 6, elo: undefined },
  hard: { skillLevel: 10, depth: 12, elo: undefined },
  veryHard: { skillLevel: 20, depth: 15, elo: 2000 }
};
```

**Deliverables**:
- `src/lib/difficulty.ts` with DIFFICULTY_SETTINGS constant
- Functions to get settings by difficulty name
- Type-safe exports

**Dependencies**: 2.1 (Type definitions)

---

### 2.3 ChessEngine Class (Stockfish Wrapper)
**Effort**: 3 hours | **Status**: Blocked by 2.1, 1.3

**File**: `src/lib/engine.ts`

**Per PRD Section 3.2 - Engine Wrapper Implementation**:

**Key Methods**:
- `init()`: Initialize worker, send UCI commands
- `setDifficulty(difficulty)`: Set Skill Level and depth
- `getBestMove(fen)`: Request move from position
- `newGame()`: Send `ucinewgame` command
- `destroy()`: Terminate worker

**Critical Implementation Details**:
- ✅ Use absolute path: `new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js')`
- ✅ Handle UCI protocol correctly (uci, isready, readyok, setoption, position, go, bestmove)
- ✅ Difficulty setting logic (Skill Level for Easy-Hard, UCI_Elo for Very Hard)
- ✅ Promise-based API for getBestMove()
- ✅ Error handling for worker failures

**Test Requirements**:
```typescript
// Unit tests needed:
- init() resolves successfully
- getBestMove() returns valid UCI move
- setDifficulty() applies correct options
- newGame() sends ucinewgame
- destroy() terminates worker
```

**Deliverables**:
- `src/lib/engine.ts` with ChessEngine class
- Full UCI protocol implementation
- All methods typed and documented
- Error handling complete

**Dependencies**: 2.1 (types), 2.2 (difficulty), 1.3 (Stockfish files)

---

### 2.4 useChessEngine Hook
**Effort**: 2 hours | **Status**: Blocked by 2.3

**File**: `src/hooks/useChessEngine.ts`

**Per PRD Section 3.3 - React Hook for Engine**:

**Key Features**:
- ✅ Initialize ChessEngine on mount
- ✅ Cleanup on unmount (destroy worker)
- ✅ Expose methods: getBestMove, setDifficulty, newGame
- ✅ Loading and error states
- ✅ Prevent multiple initializations

**Hook API**:
```typescript
const {
  isLoading,      // bool: engine initializing
  error,          // string | null
  getBestMove,    // (fen: string) => Promise<string>
  setDifficulty,  // (difficulty: Difficulty) => void
  newGame         // () => void
} = useChessEngine();
```

**Dependencies**: 2.3 (ChessEngine class)

**Deliverables**:
- `src/hooks/useChessEngine.ts` hook
- Proper cleanup with AbortController
- TypeScript strict mode compliant

---

### 2.5 useChessGame Hook
**Effort**: 4 hours | **Status**: Blocked by 2.1, 2.4

**File**: `src/hooks/useChessGame.ts`

**Per PRD Section 8.1 - Chess.js Integration & Spec Section 5.4**:

**Key Responsibilities** (Per Constitution Pattern VII):
- ✅ Owns game state (single source of truth)
- ✅ Manages chess.js instance (private to hook)
- ✅ Validates moves via chess.js before UI updates
- ✅ Handles undo (removes move pairs)
- ✅ Detects game over conditions
- ✅ Triggers AI moves
- ✅ Handles pawn promotion

**State Structure**:
```typescript
interface GameState {
  status: GameStatus;
  fen: string;
  history: string[];
  playerColor: 'white' | 'black';
  difficulty: DifficultyLevel;
  result: GameResult | null;
  isCheck: boolean;
}
```

**Public API**:
```typescript
const {
  gameState,          // Current game state
  makeMove,           // (from: string, to: string) => Promise<boolean>
  undo,               // () => Promise<void>
  resign,             // () => void
  newGame,            // () => void
  setDifficulty,      // (d: Difficulty) => void
  setPlayerColor,     // (c: PlayerColor) => void
  startGame           // () => Promise<void>
} = useChessGame();
```

**Critical Clarifications** (Per CLARIFICATIONS.md):
- Q1: Undo disabled while AI thinking (button disabled)
- Q3: Move history shows incomplete pairs (e.g., "7. Nf3")
- Q4: Threefold repetition auto-draw
- Q5: Game over board readonly with result below

**Test Cases**:
- Valid moves accepted, invalid rejected
- Checkmate detection
- Stalemate detection
- Threefold repetition auto-draw
- 50-move rule detection
- Undo removes move pairs
- Game resets on newGame
- Pawn promotion handling

**Deliverables**:
- `src/hooks/useChessGame.ts` hook (200+ lines)
- All game logic implemented
- Proper error handling
- Move validation via chess.js

**Dependencies**: 2.1 (types), 2.4 (useChessEngine)

---

## Workstream 3: React Components

### 3.1 StartScreen Component
**Effort**: 1.5 hours | **Status**: Blocked by 2.5

**File**: `src/components/StartScreen.tsx`

**Per Spec Section 3.1 & PRD Section 6.1**:

**UI Elements**:
- ✅ Difficulty selector (Easy, Medium, Hard, Very Hard)
- ✅ Color selector (White, Black)
- ✅ "Start Game" button
- ✅ Default selections (Medium, White)

**Props** (Per Constitution Pattern IX):
```typescript
interface StartScreenProps {
  onStartGame: (difficulty: Difficulty, color: PlayerColor) => void;
  isLoading: boolean;  // Show loading while engine initializes
}
```

**Styling**: Tailwind CSS centered card layout

**Deliverables**:
- `src/components/StartScreen.tsx`
- Fully styled with Tailwind
- Accessibility: keyboard navigation

**Dependencies**: 2.5 (useChessGame for interface)

---

### 3.2 ChessBoard Component
**Effort**: 2 hours | **Status**: Blocked by 2.5, 1.2

**File**: `src/components/ChessBoard.tsx`

**Per Spec Section 5.6 & PRD Section 5.1-5.2**:

**Features** (Per Constitution Pattern IX - Display Only):
- ✅ Display current position (receives FEN as prop)
- ✅ Handle drag-and-drop (call onDrop callback)
- ✅ Show legal move indicators
- ✅ Highlight last move (yellow)
- ✅ Highlight check (red)
- ✅ Board orientation (player's color at bottom)
- ✅ Flip board button

**Library**: `react-chessboard` with custom styling

**Props** (Read-Only Display):
```typescript
interface ChessBoardProps {
  fen: string;                              // Current position
  playerColor: PlayerColor;                 // Orientation
  onDrop: (from: string, to: string) => Promise<boolean>;  // Drag callback
  lastMove?: { from: string; to: string };  // Yellow highlight
  isCheck: boolean;                         // Red highlight on king
  isDisabled: boolean;                      // Disable during AI thinking
  onFlipBoard?: () => void;                 // View-only flip
}
```

**Custom Styling**:
- Light squares: `#f0d9b5`
- Dark squares: `#b58863`
- Selected: `#829769`
- Last move: `#cdd26a`
- Check: `#e54545`

**Deliverables**:
- `src/components/ChessBoard.tsx`
- react-chessboard configured with custom colors
- Pawn promotion modal (Q, R, B, N)
- Proper TypeScript types

**Dependencies**: 2.5 (game state), 1.2 (Tailwind colors)

---

### 3.3 GameControls Component
**Effort**: 1.5 hours | **Status**: Blocked by 2.5

**File**: `src/components/GameControls.tsx`

**Per Spec Section 5.6 & PRD Section 5.2**:

**Buttons**:
- New Game
- Undo
- Resign
- Flip Board

**Props** (Read-Only Buttons):
```typescript
interface GameControlsProps {
  status: GameStatus;           // Derive disabled states from this
  difficulty: DifficultyLevel;  // Display current
  playerColor: PlayerColor;     // Display current
  onNewGame: () => void;
  onUndo: () => Promise<void>;
  onResign: () => void;
  onFlip: () => void;
}
```

**Button States** (Per Spec Section 5.9 & CLARIFICATIONS.md):
```
START_SCREEN:  [disabled] [disabled] [disabled] [enabled]
PLAYER_TURN:   [enabled]  [enabled]  [enabled]  [enabled]
AI_THINKING:   [disabled] [disabled] [disabled] [enabled]  ← Q1: Undo disabled
GAME_OVER:     [enabled]  [disabled] [disabled] [disabled]  ← Q5: Only New Game
```

**Deliverables**:
- `src/components/GameControls.tsx`
- Proper button state derivation
- Accessible button styling with Tailwind

**Dependencies**: 2.5 (game state for button states)

---

### 3.4 GameStatus Component
**Effort**: 1 hour | **Status**: Blocked by 2.5

**File**: `src/components/GameStatus.tsx`

**Per Spec Section 5.6 & PRD Section 5.3**:

**Display** (Read-Only):
- Current turn ("Your move" or "AI thinking")
- Check status
- Game result (checkmate, stalemate, draw, resignation)

**Props**:
```typescript
interface GameStatusProps {
  status: GameStatus;
  isCheck: boolean;
  result: GameResult | null;
  playerColor: PlayerColor;
  turn: 'white' | 'black';
}
```

**Deliverables**:
- `src/components/GameStatus.tsx`
- Clear status messages
- Result message per Q5: displayed below board, readable

**Dependencies**: 2.5 (game state)

---

### 3.5 MoveHistory Component
**Effort**: 1 hour | **Status**: Blocked by 2.5

**File**: `src/components/MoveHistory.tsx`

**Per Spec Section 5.6, Q3 Clarification**:

**Features**:
- ✅ Display moves in SAN notation (e.g., "e4")
- ✅ Format as numbered pairs (1. e4 e5 2. Nf3 Nc6)
- ✅ Show incomplete moves at game end (e.g., "7. Nf3")
- ✅ Auto-scroll to latest move

**Props**:
```typescript
interface MoveHistoryProps {
  moves: string[];  // Array of SAN moves in order
  currentMoveIndex?: number;
}
```

**Deliverables**:
- `src/components/MoveHistory.tsx`
- Proper formatting of move pairs
- Scrollable container

**Dependencies**: 2.5 (game state provides moves)

---

### 3.6 App Component (Main Layout)
**Effort**: 1.5 hours | **Status**: Blocked by 3.1-3.5

**File**: `src/App.tsx`

**Responsibilities**:
- ✅ Coordinate all hooks (useChessGame, useChessEngine)
- ✅ Render correct screen (START_SCREEN vs GAME_SCREEN)
- ✅ Layout: Desktop (board left, controls right), Mobile (stacked)
- ✅ Pass props to components
- ✅ Handle top-level error boundaries

**Layout** (Per PRD Section 6.3):
```
Desktop (>1024px):  Board [left 70%] | Controls [right 30%]
Tablet (768-1024): Board [top] / Controls [bottom]
Mobile (<768px):   Board / Controls / History (collapsible)
```

**Deliverables**:
- `src/App.tsx` (100+ lines)
- Responsive layout with Tailwind
- Proper component composition

**Dependencies**: 2.4, 2.5, 3.1-3.5

---

## Workstream 4: Integration & Testing

### 4.1 Integration Testing
**Effort**: 4 hours | **Status**: Blocked by 3.6

**Test Scenarios** (Per PRD Section 10.2):

| Scenario | Steps | Expected |
|----------|-------|----------|
| Complete game to checkmate | Play moves → checkmate | Game ends, result displays |
| Undo move pair | Make 2 moves, click Undo | Both moves removed, position reset |
| AI move timing | Make move on each difficulty | Easy <100ms, Medium <500ms, Hard <1s, Very Hard <2s |
| Pawn promotion | Advance pawn to 8th rank | Modal dialog appears with Q/R/B/N |
| Draw conditions | Play to stalemate/repetition/50-move | Auto-detect, result displays |
| Game over state | Play to end | Board readonly, buttons disabled per Q5 |

**Tools**: Vitest + React Testing Library

**Deliverables**:
- `src/__tests__/integration.test.ts`
- All key scenarios covered
- Performance measurements

**Dependencies**: 3.6 (full app)

---

### 4.2 Unit Tests
**Effort**: 3 hours | **Status**: Blocked by 2.1-2.5

**Components to Test**:

| Component | Tests |
|-----------|-------|
| ChessEngine | init(), getBestMove(), setDifficulty(), newGame(), destroy() |
| useChessGame | makeMove(), undo(), resign(), newGame(), pawn promotion |
| useChessEngine | isLoading, error, getBestMove() |
| Difficulty config | ELO → Skill Level mapping correct |

**Tools**: Vitest + vi.mock() for worker

**Deliverables**:
- `src/lib/__tests__/engine.test.ts`
- `src/hooks/__tests__/useChessGame.test.ts`
- `src/lib/__tests__/difficulty.test.ts`

**Dependencies**: 2.1-2.5

---

### 4.3 Manual Testing Checklist
**Effort**: 2 hours | **Status**: Blocked by 3.6

**Per PRD Section 10.3**:

```
Game Initialization:
- [ ] Start screen displays with defaults (Medium, White)
- [ ] Can select all 4 difficulties
- [ ] Can select White/Black
- [ ] Start Game button works

Gameplay:
- [ ] Board displays correctly
- [ ] Drag-and-drop moves work
- [ ] Only legal moves accepted
- [ ] Turn indicator updates
- [ ] Check highlighted red
- [ ] Last move highlighted yellow

Special Moves:
- [ ] Kingside castling works
- [ ] Queenside castling works
- [ ] En passant works
- [ ] Pawn promotion shows modal (Q/R/B/N)

AI:
- [ ] Easy makes mistakes
- [ ] Medium plays basic tactics
- [ ] Hard plays solidly
- [ ] Very Hard plays strong moves
- [ ] All within time limits

Game End:
- [ ] Checkmate detected and displayed
- [ ] Stalemate detected
- [ ] Insufficient material detected
- [ ] Threefold repetition auto-draws (Q4)
- [ ] 50-move rule auto-draws
- [ ] Board readonly after game (Q5)
- [ ] Only "New Game" button enabled (Q5)

Undo:
- [ ] Undo removes both player and AI moves
- [ ] Can undo multiple times
- [ ] Undo disabled while AI thinking (Q1)
- [ ] Undo available after game over

Other:
- [ ] Resign ends game as loss
- [ ] Flip board works
- [ ] Move history displays correctly (Q3)
- [ ] No TypeScript errors (strict mode)
```

**Platforms**: Chrome, Firefox, Safari, Edge

**Deliverables**:
- Manual testing completed and signed off
- All checklist items verified

**Dependencies**: 3.6 (full app)

---

### 4.4 Performance Verification
**Effort**: 1.5 hours | **Status**: Blocked by 3.6

**Per NFR-001 & PRD Section 11**:

| Metric | Target | Tool |
|--------|--------|------|
| Page load | < 3s | Lighthouse |
| Engine init | < 2s | Performance API |
| UI interaction | < 100ms | Performance API |
| Easy AI move | < 100ms | Profiler |
| Medium AI move | < 500ms | Profiler |
| Hard AI move | < 1s | Profiler |
| Very Hard AI move | < 2s | Profiler |
| Memory usage | < 100MB | DevTools |

**Deliverables**:
- Performance measurements recorded
- Lighthouse report
- All targets met or documented

**Dependencies**: 3.6 (full app)

---

## Workstream 5: Polish & Documentation

### 5.1 Code Documentation
**Effort**: 2 hours | **Status**: Blocked by 3.6

- ✅ JSDoc comments on all public functions
- ✅ Type definitions documented
- ✅ Complex algorithms explained
- ✅ UCI protocol comments in engine.ts

**Deliverables**:
- All files documented per TSDoc standard

**Dependencies**: 3.6 (all code done)

---

### 5.2 README & Setup Guide
**Effort**: 1 hour | **Status**: Blocked by 3.6

**Content**:
- Project overview
- Installation steps
- Running locally (`npm run dev`)
- Building (`npm run build`)
- Testing (`npm run test`)
- Troubleshooting Stockfish setup

**Deliverables**:
- Updated README.md

**Dependencies**: 3.6 (all code done)

---

## Dependency Graph

```
1.1 TypeScript Config
  ├─ 1.2 Tailwind CSS
  ├─ 2.1 Type Definitions
  │   ├─ 2.2 Difficulty Config
  │   ├─ 2.3 ChessEngine
  │   │   └─ 2.4 useChessEngine
  │   │       └─ 2.5 useChessGame
  │   │           ├─ 3.1 StartScreen
  │   │           ├─ 3.2 ChessBoard
  │   │           ├─ 3.3 GameControls
  │   │           ├─ 3.4 GameStatus
  │   │           └─ 3.5 MoveHistory
  │   │               └─ 3.6 App
  │   │                   ├─ 4.1 Integration Tests
  │   │                   ├─ 4.2 Unit Tests
  │   │                   ├─ 4.3 Manual Testing
  │   │                   └─ 4.4 Performance
  │   └─ 4.2 Unit Tests
  └─ 1.3 Stockfish Setup (parallel)

5.1 Documentation (after 3.6)
5.2 README (after 3.6)
```

---

## Critical Path

**Fastest possible completion** (sequential critical path):

1. 1.1 TypeScript Config (2h)
2. 1.3 Stockfish Setup (1.5h) [parallel with 1.1]
3. 2.1 Types (1.5h)
4. 2.3 ChessEngine (3h)
5. 2.4 useChessEngine (2h)
6. 2.5 useChessGame (4h)
7. 3.6 App Component (1.5h)
8. 3.1-3.5 Components (7.5h)
9. 4.1-4.4 Testing (10.5h)
10. 5.1-5.2 Documentation (3h)

**Total Critical Path**: ~37 hours (assuming good parallel work on setup)

---

## Implementation Sequence

### Phase 4A: Foundation (8 hours)
1. 1.1 TypeScript Config
2. 1.2 Tailwind CSS
3. 1.3 Stockfish Setup (parallel)
4. 2.1 Type Definitions
5. 2.2 Difficulty Configuration

### Phase 4B: Core Engine (9 hours)
1. 2.3 ChessEngine class
2. 2.4 useChessEngine hook
3. 2.5 useChessGame hook (largest task)

### Phase 4C: UI Components (8 hours)
1. 3.1 StartScreen
2. 3.2 ChessBoard (uses react-chessboard)
3. 3.3 GameControls
4. 3.4 GameStatus
5. 3.5 MoveHistory
6. 3.6 App (integrate all)

### Phase 4D: Testing & Verification (12 hours)
1. 4.2 Unit Tests
2. 4.1 Integration Tests
3. 4.3 Manual Testing Checklist
4. 4.4 Performance Verification

### Phase 4E: Polish (3 hours)
1. 5.1 Code Documentation
2. 5.2 README & Setup Guide
3. Final review and fixes

---

## Key Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stockfish bundling issues | High | High | Use absolute paths from start; test early |
| AI response too slow | Medium | High | Profile difficulty depths; optimize if needed |
| Pawn promotion complexity | Medium | Medium | Use modal dialog (simplest approach) |
| TypeScript strict mode blocking | Medium | Low | Follow constitution patterns; type carefully |
| react-chessboard customization | Medium | Medium | Study library docs; test colors early |

---

## Success Criteria

✅ **Phase 4 Complete When:**

1. **Functional**:
   - User can complete full game to checkmate
   - All 4 difficulty levels work
   - All special moves (castling, en passant, promotion) work
   - Game detects all draw conditions
   - Undo, resign, flip board all work

2. **Code Quality**:
   - TypeScript strict mode passes
   - No mocked production code
   - SOLID principles applied
   - Constitution patterns enforced
   - All components have <200 lines

3. **Performance**:
   - Page loads < 3s
   - Engine initializes < 2s
   - AI moves within difficulty time limits
   - Memory < 100MB

4. **Testing**:
   - Unit tests > 80% coverage
   - Integration tests pass
   - Manual checklist 100% pass
   - No console errors

---

## Sign-Off

**Plan Status**: ✅ READY FOR EXECUTION

**Next Action**: Create branch `004-chess-app-implementation` and begin Phase 4A

**Estimated Completion**: 40-60 developer hours

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial implementation plan |

