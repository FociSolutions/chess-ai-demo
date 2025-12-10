# Single Player Chess Application - Feature Specification

**Feature ID**: 1-chess-application-mvp  
**Version**: 1.0  
**Date**: December 10, 2025  
**Status**: Ready for Implementation  

---

## Executive Summary

This specification defines a complete web-based single-player chess application where users compete against an AI opponent powered by Stockfish. The application provides four difficulty levels (Easy 200 ELO, Medium 800 ELO, Hard 1200 ELO, Very Hard 2000 ELO) and runs entirely in the browser with TypeScript-strict type safety, following React best practices and the project constitution.

---

## 1. Overview

### 1.1 What is this feature?

A fully functional, locally-runnable chess game where:
- Users play chess against an AI opponent
- Users can select difficulty before each game
- Users can play as white or black
- The board is interactive with drag-and-drop moves
- Game follows all standard FIDE chess rules
- Move history is displayed in standard algebraic notation

### 1.2 Who uses it?

- Chess players of all skill levels (beginners to advanced)
- People wanting to practice chess offline
- Developers/stakeholders evaluating chess AI in web browsers

### 1.3 Success looks like

1. A user arrives at the application
2. Selects difficulty (Easy, Medium, Hard, or Very Hard)
3. Chooses to play white or black
4. Clicks "Start Game"
5. Plays a complete chess game with the AI
6. Can undo moves, resign, or play to checkmate
7. Game correctly enforces all chess rules

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR-001: Game Initialization
- **Description**: Application loads with a start screen allowing difficulty and color selection
- **Acceptance Criteria**:
  - Start screen displays four difficulty options (Easy, Medium, Hard, Very Hard)
  - Start screen displays color selection (White, Black)
  - Default: Medium difficulty, White color
  - "Start Game" button initializes game with selected options
  - If Black selected, AI makes first move automatically

#### FR-002: Chess Board Display
- **Description**: Interactive chess board showing current game position
- **Acceptance Criteria**:
  - Board displays all 64 squares with correct colors
  - Board orientation matches player color (player at bottom)
  - All pieces render correctly
  - Board is responsive and scales with viewport
  - Legal moves show visual indicators when piece selected
  - Last move highlighted on board

#### FR-003: Move Input and Validation
- **Description**: Players can input moves via drag-and-drop
- **Acceptance Criteria**:
  - Drag piece from square to square
  - Only legal moves accepted
  - Invalid moves rejected silently (piece returns to origin)
  - Pawn promotion shows piece selector (Q, R, B, N)
  - Special moves work: castling (both sides), en passant

#### FR-004: AI Move Calculation
- **Description**: AI calculates and executes moves using Stockfish WASM engine
- **Acceptance Criteria**:
  - Easy level responds in < 100ms
  - Medium level responds in < 500ms
  - Hard level responds in < 1 second
  - Very Hard level responds in < 2 seconds
  - UI remains responsive (non-blocking calculation)
  - AI always promotes pawns to Queen

#### FR-005: Game State Visualization
- **Description**: Players see clear indication of game status
- **Acceptance Criteria**:
  - Current turn indicated ("Your move" or "AI thinking")
  - Check situation highlighted in red
  - Checkmate/stalemate/draw conditions detected and displayed
  - Move history shows all moves in algebraic notation
  - Captured pieces displayed

#### FR-006: Game Controls
- **Description**: Players can control game flow
- **Acceptance Criteria**:
  - New Game: Reset and return to start screen
  - Undo: Remove last move pair (player + AI response)
  - Resign: Concede the game
  - Flip Board: Change board perspective (view-only)
  - Buttons disabled while AI is thinking (except Flip)

#### FR-007: Draw Detection
- **Description**: Application correctly identifies all draw conditions
- **Acceptance Criteria**:
  - Stalemate detected automatically
  - Insufficient material detected automatically
  - Threefold repetition detected automatically
  - 50-move rule detected automatically
  - Draw message displayed to user

---

### 2.2 Non-Functional Requirements

#### NFR-001: Performance
- **Acceptance Criteria**:
  - Initial page load: < 3 seconds
  - Stockfish engine initialization: < 2 seconds
  - UI interaction response: < 100ms
  - No UI freezing during AI calculation
  - Memory usage: < 100MB stable

#### NFR-002: Browser Compatibility
- **Acceptance Criteria**:
  - Chrome 90+ ✓
  - Firefox 90+ ✓
  - Safari 15+ ✓
  - Edge 90+ ✓
  - WebAssembly support required

#### NFR-003: Type Safety
- **Acceptance Criteria**:
  - TypeScript strict mode enabled
  - No `any` types without documented rationale
  - All component props typed
  - All function parameters and returns typed

#### NFR-004: Code Quality
- **Acceptance Criteria**:
  - React best practices (hooks, dependency arrays, memoization justified)
  - No mocked production code (tests only)
  - SOLID principles applied
  - Constitution patterns enforced
  - No fallbacks without explicit approval

#### NFR-005: Accessibility
- **Acceptance Criteria**:
  - Keyboard navigation supported
  - Color contrast sufficient for readability
  - Move squares distinguishable (not color-blind only)

---

## 3. User Scenarios & Testing

### 3.1 Primary Flow: Play to Completion
```
User Story: Complete game to checkmate

1. User loads application
2. User selects "Easy" difficulty
3. User selects "White" color
4. User clicks "Start Game"
5. User makes first move (e.g., e2-e4)
6. AI responds with its move
7. User continues playing for several moves
8. Eventually: User checkmates the AI
9. Application displays "Checkmate! You win"
10. User clicks "New Game" to return to start screen

Expected: Game flows smoothly, all moves valid, no errors
```

### 3.2 Undo and Resign
```
User Story: Undo moves and resign

1. User starts a game
2. User makes a move
3. User realizes it was a mistake
4. User clicks "Undo"
5. Both player move and AI response removed
6. Board returned to position before the pair
7. User makes different move
8. After some moves, user is losing badly
9. User clicks "Resign"
10. Application displays result message

Expected: Undo works correctly, resign recognized as loss
```

### 3.3 Difficulty Progression
```
User Story: Test different difficulties

1. User plays game on Easy - makes occasional good moves
2. User plays game on Medium - faces tougher opposition
3. User plays game on Hard - must play carefully
4. User plays game on Very Hard - struggles significantly

Expected: Clear progression in AI strength across levels
```

### 3.4 Pawn Promotion
```
User Story: Advance pawn to back rank

1. User plays game with pawn advancing toward 8th rank
2. User moves pawn to 8th rank
3. Promotion dialog appears with Q, R, B, N options
4. User selects Queen
5. Queen placed on board

Expected: Promotion handled smoothly, piece selected appears
```

---

## 4. Key Entities

### 4.1 Game State
```typescript
enum GameStatus {
  START_SCREEN = 'START_SCREEN',
  PLAYER_TURN = 'PLAYER_TURN',
  AI_THINKING = 'AI_THINKING',
  GAME_OVER = 'GAME_OVER',
}

interface GameState {
  status: GameStatus;
  fen: string;                    // Board position in FEN format
  history: string[];              // Move history in algebraic notation
  playerColor: 'white' | 'black';
  difficulty: DifficultyLevel;
  result: GameResult | null;      // 'checkmate' | 'stalemate' | etc
  isCheck: boolean;
}
```

### 4.2 Difficulty Configuration
```typescript
interface DifficultyLevel {
  name: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  elo: number;           // 200, 800, 1200, 2000
  skillLevel: number;    // 0, 5, 10, 20 (Stockfish Skill Level)
  depth: number;         // 2, 6, 12, 15 (search depth)
}
```

### 4.3 Move
```typescript
interface Move {
  san: string;     // Standard Algebraic Notation (e.g., "e4")
  uci: string;     // UCI format (e.g., "e2e4")
  from: string;    // Source square (e.g., "e2")
  to: string;      // Destination square (e.g., "e4")
}
```

---

## 5. Architecture & Implementation Patterns

### 5.1 Tech Stack (Per Constitution)
- **Build**: Vite 5+
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Chess Logic**: chess.js
- **Board UI**: react-chessboard
- **Chess Engine**: Stockfish.js 17.1 WASM (lite, single-threaded)
- **Styling**: Tailwind CSS
- **Styling Method**: Utility-first CSS classes

### 5.2 Core Architecture
```
┌─────────────────────────────────────────────────────────┐
│                  React Application                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Custom Hooks Layer                    │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐ │   │
│  │  │ useChessGame()   │  │ useChessEngine()     │ │   │
│  │  │ Manages game     │  │ Manages Stockfish    │ │   │
│  │  │ state & logic    │  │ worker communication │ │   │
│  │  └──────────────────┘  └──────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Component Presentation Layer             │   │
│  │  ┌─────────────┐  ┌──────────┐  ┌────────────┐  │   │
│  │  │  ChessBoard │  │ Game     │  │ Move       │  │   │
│  │  │  Component  │  │ Controls │  │ History    │  │   │
│  │  └─────────────┘  └──────────┘  └────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         ChessEngine Singleton Class              │   │
│  │  Handles all Stockfish worker communication      │   │
│  │  - Worker lifecycle                             │   │
│  │  - UCI commands                                 │   │
│  │  - Move parsing & validation                    │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Web Worker (Stockfish Engine)             │   │
│  │  Location: /public/stockfish/[engine-file]      │   │
│  │  Path: '/stockfish/stockfish-nnue-17.1...'      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Web Worker Communication Pattern
- **Responsibility**: All Stockfish communication through `ChessEngine` class only
- **Lifecycle**: `useChessEngine` hook manages worker init/destroy
- **No direct `postMessage()`**: Only through ChessEngine methods
- **Non-blocking**: Worker runs off main thread, UI stays responsive

### 5.4 State Management Boundaries
- **Game State Owner**: `useChessGame` hook (single source of truth)
- **Components Receive**: Props only (fen, history, status, result)
- **No Component Logic**: Components are pure presentational
- **Chess.js Instance**: Private to `useChessGame`, never exposed

### 5.5 Move Validation Flow
1. User drags piece on board
2. Component calls `onDrop` callback
3. `useChessGame` validates via `chess.js`
4. If valid: Update state and request AI move
5. If invalid: Reject silently

### 5.6 Component Responsibilities
```
StartScreen.tsx
├─ Render difficulty selector
├─ Render color selector
└─ Render "Start Game" button
   └─ Disabled state: false (always enabled)

ChessBoard.tsx
├─ Display current position
├─ Handle drag-and-drop
├─ Show legal move indicators
└─ Receive props: fen, playerColor, onDrop, onFlip

GameControls.tsx
├─ Render: New Game, Undo, Resign, Flip Board buttons
├─ Calculate disabled states from GameStatus
└─ Disabled when: status === 'AI_THINKING' (except Flip)

GameStatus.tsx
├─ Display turn ("Your move" / "AI thinking")
├─ Display check status
├─ Display game result
└─ Disabled states: All readonly display

MoveHistory.tsx
├─ Display moves in algebraic notation
├─ Show numbered move pairs (1. e4 e5, etc)
└─ Receive prop: history array
```

### 5.7 Stockfish File Handling
- **Location**: `/public/stockfish/` (never bundled by Vite)
- **Files**: `stockfish-nnue-17.1-lite-single.js` + `.wasm`
- **Worker Path**: `new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js')`
- **Absolute URL**: Ensures bypass of Vite's module resolution

### 5.8 Difficulty Configuration
- **Single Source**: `DIFFICULTY_SETTINGS` constant
- **No Hardcoded Values**: All ELO, Skill, Depth in one place
- **Easy**: Skill 0, Depth 2 → ~200 ELO
- **Medium**: Skill 5, Depth 6 → ~800 ELO
- **Hard**: Skill 10, Depth 12 → ~1200 ELO
- **Very Hard**: Skill 20, Depth 15 → ~2000 ELO

### 5.9 UI State Synchronization
- **Button States**: Derived from `GameStatus` enum
- **AI_THINKING**: Disable New Game, Undo, Resign (enable Flip)
- **PLAYER_TURN**: Enable all buttons
- **START_SCREEN**: Enable difficulty/color, disable game controls
- **GAME_OVER**: Enable Undo, enable New Game, disable Resign

---

## 6. Success Criteria

### 6.1 Functional Success
- ✅ User can complete a full chess game from start to end
- ✅ All four difficulty levels demonstrate different playing strengths
- ✅ AI responds within specified time limits
- ✅ All chess rules correctly enforced (castling, en passant, promotion, checkmate, stalemate, draws)
- ✅ Undo works correctly (removes move pairs)
- ✅ Game state properly updates after each move

### 6.2 Code Quality Success
- ✅ TypeScript strict mode passes with no errors
- ✅ No mocked production code (tests only)
- ✅ SOLID principles applied throughout
- ✅ React best practices: hooks, proper dependency arrays, no memoization without justification
- ✅ Constitution patterns enforced: Worker communication, state boundaries, move validation
- ✅ No fallbacks implemented without explicit approval

### 6.3 Performance Success
- ✅ Page loads in < 3 seconds
- ✅ Engine initializes in < 2 seconds
- ✅ AI moves within difficulty limits (Easy <100ms, Medium <500ms, Hard <1s, Very Hard <2s)
- ✅ UI interaction < 100ms response time
- ✅ Memory usage < 100MB during extended play

### 6.4 User Experience Success
- ✅ Clear start screen with difficulty/color selection
- ✅ Responsive board that feels natural to play
- ✅ Game status always visible (turn, check, result)
- ✅ Move history accessible and readable
- ✅ Game controls intuitive and appropriately enabled/disabled
- ✅ No unexpected crashes or errors

---

## 7. Assumptions

1. Users have modern browsers with WebAssembly support (all modern browsers)
2. Users understand basic chess rules (no tutorial in MVP)
3. Users have minimum 2GB RAM on their device
4. Node.js 18+ available for local development
5. Stockfish WASM files downloaded and placed in `/public/stockfish/`

---

## 8. Dependencies

| Dependency | Type | Version | Purpose |
|------------|------|---------|---------|
| React | Framework | 18+ | Component-based UI |
| TypeScript | Language | 5+ | Type safety |
| Vite | Build tool | 5+ | Fast development/build |
| chess.js | Library | 1+ | Move validation, game state |
| react-chessboard | Library | 4+ | Interactive board UI |
| Stockfish.js | Engine | 17.1 | AI move calculation (WASM) |
| Tailwind CSS | Styling | 3+ | Utility-first CSS |

---

## 9. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stockfish bundling issues | High | High | Serve from `/public`, use absolute paths |
| AI too weak on Easy | Medium | Medium | Use Skill Level 0 + minimal depth |
| AI response slow on low-end devices | Medium | Medium | Use lite engine, optimized depth limits |
| Browser memory exhaustion | Low | Medium | Monitor memory, use single-threaded engine |
| TypeScript strict mode blocking dev | Medium | Low | Follow constitution patterns from start |

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Engine initialization and difficulty setting
- Move validation and game state updates
- Draw condition detection
- Undo functionality
- FEN/UCI conversion

### 10.2 Integration Tests
- Complete game flow (start to checkmate)
- AI move generation within time limits
- Undo with AI moves
- Difficulty changes
- Pawn promotion

### 10.3 Manual Testing
- All browsers (Chrome, Firefox, Safari, Edge)
- All difficulty levels
- Special moves (castling, en passant, promotion)
- Draw conditions (stalemate, insufficient, repetition, 50-move)
- UI responsiveness during AI thinking
- Button enabled/disabled states

---

## 11. Phase Summary

### Phase 3: Core Implementation
This specification covers Phase 3 work:
1. Initialize Vite + React + TypeScript project
2. Install dependencies
3. Download Stockfish WASM to `/public`
4. Create types and constants
5. Implement ChessEngine class
6. Create useChessGame and useChessEngine hooks
7. Build all React components
8. Integrate and test complete flow
9. Verify constitution compliance

---

## Document Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial specification |

---

## Sign-Off

**Specification Ready For**: Implementation  
**Constitution Compliance**: Required  
**Approved By**: Project team

