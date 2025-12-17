# Tasks: Single-Player Chess Experience

**Input**: Design documents from `/specs/001-single-player-chess/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Included based on plan.md specifications (Vitest + React Testing Library)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Source**: `chess-app/src/`
- **Tests**: `chess-app/tests/`
- **Public assets**: `chess-app/public/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project structure and install dependencies

- [X] T001 Create Vite React TypeScript project with `npm create vite@latest chess-app -- --template react-ts`
- [X] T002 Install runtime dependencies: `npm install chess.js react-chessboard stockfish` in chess-app/
- [X] T003 Install dev dependencies: `npm install -D tailwindcss postcss autoprefixer @testing-library/react @testing-library/jest-dom vitest jsdom @types/node` in chess-app/
- [X] T004 [P] Configure Tailwind CSS with `npx tailwindcss init -p` and update chess-app/tailwind.config.js
- [X] T005 [P] Configure Vitest in chess-app/vite.config.ts with jsdom environment and test setup
- [X] T006 [P] Create test setup file in chess-app/tests/setup.ts with Testing Library configuration
- [X] T007 Copy Stockfish WASM files to chess-app/public/stockfish/ directory (stockfish-nnue-17.1-lite-single.js and .wasm)
- [X] T008 [P] Create TypeScript types file in chess-app/src/types/chess.ts with GameState, Move, Settings, Difficulty, AIOpponent interfaces
- [X] T009 [P] Update chess-app/src/index.css with Tailwind directives and base styles
- [X] T010 Create project folder structure: chess-app/src/{components,hooks,lib}/ and chess-app/tests/{unit,integration}/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T011 Implement difficulty mapping in chess-app/src/lib/difficulty.ts with ELO-to-UCI Skill Level configuration for Easy (~200), Medium (~800), Hard (~1200), Very Hard (~2000)
- [X] T012 Implement UCI/SAN notation utilities in chess-app/src/lib/notation.ts with move conversion functions
- [X] T013 Implement ChessEngine class in chess-app/src/lib/engine.ts with Web Worker wrapper for Stockfish communication
- [X] T014 Implement useChessEngine hook in chess-app/src/hooks/useChessEngine.ts with worker lifecycle, getBestMove, error handling
- [X] T015 Implement useChessGame hook in chess-app/src/hooks/useChessGame.ts with game state machine (startScreen → playerTurn → aiThinking → gameOver), chess.js integration, move validation
- [X] T016 [P] Create unit test for difficulty mapping in chess-app/tests/unit/difficulty.test.ts
- [X] T017 [P] Create unit test for notation utilities in chess-app/tests/unit/notation.test.ts
- [X] T018 [P] Create unit test for engine wrapper in chess-app/tests/unit/engine.test.ts

**Checkpoint**: Foundation ready - useChessEngine and useChessGame hooks are functional, Stockfish integration verified

---

## Phase 3: User Story 1 - Start and Play vs AI (Priority: P1) 🎯 MVP

**Goal**: Enable players to start a new game, pick difficulty and color, and play a complete game with legal moves enforced and AI responses within time targets.

**Independent Test**: Launch the app, choose difficulty and color, complete a full game from start to finish with only legal moves allowed and AI responses within time targets.

### Implementation for User Story 1

- [X] T019 [US1] Create StartScreen component in chess-app/src/components/StartScreen.tsx with difficulty selector, color choice, and Start button
- [X] T020 [US1] Create DifficultySelector component in chess-app/src/components/DifficultySelector.tsx with four difficulty options and player color toggle
- [X] T021 [US1] Create ChessBoard component in chess-app/src/components/ChessBoard.tsx wrapping react-chessboard with game state, legal move highlighting, and move handlers
- [X] T022 [US1] Create GameStatus component in chess-app/src/components/GameStatus.tsx displaying turn indicator, check/checkmate/stalemate/draw status
- [X] T023 [US1] Create PromotionSelector component in chess-app/src/components/PromotionSelector.tsx as modal for pawn promotion piece choice (queen, rook, bishop, knight)
- [X] T024 [US1] Wire App component in chess-app/src/App.tsx to integrate StartScreen, ChessBoard, GameStatus, and game hooks
- [X] T025 [US1] Implement special move validation in useChessGame hook: castling (kingside/queenside), en passant, promotion detection
- [X] T026 [US1] Implement game-over detection in useChessGame hook: checkmate, stalemate, draw conditions (threefold repetition, 50-move rule, insufficient material)
- [X] T027 [US1] Create integration test for full game flow in chess-app/tests/integration/game-flow.test.tsx covering start → moves → checkmate/draw
- [X] T028 [US1] Create integration test for AI response in chess-app/tests/integration/ai-response.test.tsx verifying response times per difficulty
- [X] T029 [US1] Create integration test for move validation in chess-app/tests/integration/move-validation.test.tsx covering illegal move rejection, special moves

**Checkpoint**: User Story 1 complete - players can start a game, choose difficulty/color, play legal moves, receive AI responses, and reach game-over states

---

## Phase 4: User Story 2 - Manage Game Flow (Priority: P2)

**Goal**: Provide controls for New Game, Resign, Undo, Flip Board and display move history while keeping game state consistent.

**Independent Test**: Start a game, play several moves, undo the last player + AI moves, flip the board, resign, and start a new game while ensuring move history and state reset correctly.

### Implementation for User Story 2

- [X] T030 [US2] Create GameControls component in chess-app/src/components/GameControls.tsx with New Game, Resign, Undo, Flip Board buttons
- [X] T031 [US2] Create MoveHistory component in chess-app/src/components/MoveHistory.tsx displaying moves in standard algebraic notation with current position highlight
- [X] T032 [US2] Implement undo logic in useChessGame hook: revert last full turn (player move + AI reply), update move history
- [X] T033 [US2] Implement resign logic in useChessGame hook: end game with AI win, update game status
- [X] T034 [US2] Implement new game logic in useChessGame hook: reset board, clear move history, cancel pending AI moves
- [X] T035 [US2] Implement flip board logic in chess-app/src/components/ChessBoard.tsx: toggle board orientation without affecting game state
- [X] T036 [US2] Integrate GameControls and MoveHistory into App component in chess-app/src/App.tsx
- [X] T037 [US2] Handle edge case: New Game during AI thinking - cancel pending AI response cleanly in useChessEngine hook
- [X] T038 [US2] Handle edge case: Undo immediately after checkmate/stalemate - correctly revert status in useChessGame hook
- [X] T039 [US2] Create integration test for game controls in chess-app/tests/integration/game-controls.test.tsx covering undo, resign, new game, flip board

**Checkpoint**: User Story 2 complete - players can control game flow and view move history

---

## Phase 5: User Story 3 - Visibility and Accessibility (Priority: P3)

**Goal**: Provide visual cues, keyboard navigation, and accessibility features for clear game state perception.

**Independent Test**: Navigate the board and controls via keyboard, observe turn indicators, check warnings, legal move highlights, and verify color contrast and move announcements assist visibility.

### Implementation for User Story 3

- [X] T040 [P] [US3] Implement keyboard navigation for piece selection and movement in chess-app/src/components/ChessBoard.tsx with focus management and arrow key support
- [X] T041 [P] [US3] Add legal move highlighting on piece selection in chess-app/src/components/ChessBoard.tsx with visual indicators for valid target squares
- [X] T042 [P] [US3] Add last move highlighting in chess-app/src/components/ChessBoard.tsx with distinct from/to square colors
- [X] T043 [US3] Add check warning visual indicator in chess-app/src/components/ChessBoard.tsx highlighting king square when in check
- [X] T044 [US3] Add captured pieces display in chess-app/src/components/GameStatus.tsx showing taken pieces by each side
- [X] T045 [US3] Implement move announcements for screen readers in chess-app/src/components/ChessBoard.tsx using ARIA live regions
- [X] T046 [US3] Add turn and status text cues in chess-app/src/components/GameStatus.tsx with clear textual indicators compatible with assistive technologies
- [X] T047 [US3] Verify and adjust color contrast for WCAG 2.1 Level AA compliance in chess-app/src/index.css
- [X] T048 [US3] Add keyboard shortcuts for game controls (New Game, Undo, Resign) in chess-app/src/components/GameControls.tsx
- [X] T049 [US3] Create integration test for keyboard navigation in chess-app/tests/integration/keyboard-navigation.test.tsx

**Checkpoint**: User Story 3 complete - game is accessible via keyboard with proper visual cues and screen reader support

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, documentation, and validation

- [X] T050 [P] Add loading state UI during Stockfish engine initialization in chess-app/src/components/StartScreen.tsx
- [X] T051 [P] Add error handling UI for AI timeout/failure in chess-app/src/components/GameStatus.tsx with user-friendly error messages
- [X] T052 [P] Implement responsive layout styles in chess-app/src/index.css for mobile and tablet viewports
- [X] T053 [P] Add illegal move feedback (visual shake or message) in chess-app/src/components/ChessBoard.tsx
- [X] T054 Update chess-app/README.md with setup instructions, development workflow, and architecture overview
- [X] T055 Create manual testing checklist in chess-app/tests/manual/checklist.md covering all acceptance scenarios from spec.md
- [X] T056 Run full test suite and verify all tests pass: `npm run test` in chess-app/
- [X] T057 Build production bundle and verify: `npm run build` in chess-app/
- [X] T058 Validate offline functionality: verify gameplay works without network after initial load

---

## Phase 7: UI/UX Improvements (Chess.com Style Polish)

**Purpose**: Elevate the visual quality and user experience to match professional chess platforms.

- [X] T059 [P] Install `lucide-react` and replace text buttons in `GameControls` with professional icons (Undo, Flag/Resign, Flip, Plus/New Game) with tooltips.
- [X] T060 [P] Create `CapturedPieces` component to visualize captured material with icons and "material advantage" score (e.g., +3) in `GameStatus`.
- [X] T061 [P] Refactor `MoveHistory` to use a structured table layout (Move # | White | Black) with scroll-to-bottom behavior and better typography.
- [X] T062 [P] Implement `useSound` hook and add sound effects for: Move, Capture, Check, Castle, and Game Over (using free/open assets).
- [X] T063 [P] Update `ChessBoard` theme to use professional colors (e.g., "Green" theme: #769656/#eeeed2) and ensure responsive sizing fills available space efficiently.
- [X] T064 [P] Refine `App` layout to a strict "Board + Sidebar" grid on desktop, ensuring the board is the focal point and the sidebar (History/Controls) is fixed height.
- [X] T065 [P] Add "Thinking" indicator directly on the board (e.g., highlighting the AI's King or a subtle progress bar) instead of just text status.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion; integrates with US1 components
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion; builds on US1/US2 components
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on ChessBoard and game hooks from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on components from US1/US2

### Within Each User Story

- Models/types before hooks
- Hooks before components
- Core components before integration
- Integration before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (T001-T010)**:
- T004, T005, T006 can run in parallel after T003
- T008, T009 can run in parallel

**Foundational Phase (T011-T018)**:
- T011, T012 can run in parallel (different files)
- T016, T017, T018 can run in parallel (test files)

**User Story 1 (T019-T029)**:
- T019, T020 can run in parallel (independent components)
- T021, T022, T023 depend on hooks being complete

**User Story 3 (T040-T049)**:
- T040, T041, T042 can run in parallel (independent features)

**Polish Phase (T050-T058)**:
- T050, T051, T052, T053 can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase is complete:

# Parallel batch 1 - Independent components:
Task T019: "Create StartScreen component in chess-app/src/components/StartScreen.tsx"
Task T020: "Create DifficultySelector component in chess-app/src/components/DifficultySelector.tsx"

# Parallel batch 2 - Game UI components (after batch 1):
Task T021: "Create ChessBoard component in chess-app/src/components/ChessBoard.tsx"
Task T022: "Create GameStatus component in chess-app/src/components/GameStatus.tsx"
Task T023: "Create PromotionSelector component in chess-app/src/components/PromotionSelector.tsx"

# Sequential - Integration and advanced features:
Task T024: "Wire App component"
Task T025: "Implement special move validation"
Task T026: "Implement game-over detection"

# Parallel batch 3 - Tests (after implementation):
Task T027: "Create integration test for full game flow"
Task T028: "Create integration test for AI response"
Task T029: "Create integration test for move validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T018) - CRITICAL
3. Complete Phase 3: User Story 1 (T019-T029)
4. **STOP and VALIDATE**: Test US1 independently - play a full game
5. Deploy/demo if ready - this is a working chess game!

### Incremental Delivery

1. Setup + Foundational → Engine and hooks ready
2. Add User Story 1 → Full playable chess game (MVP!)
3. Add User Story 2 → Game controls and history
4. Add User Story 3 → Accessibility and visual polish
5. Each story adds value without breaking previous stories

### Suggested MVP Scope

**User Story 1** alone delivers a complete, playable chess experience:
- Start a game with chosen difficulty and color
- Play legal moves against Stockfish AI
- See game-over conditions (checkmate, stalemate, draw)

This is sufficient for initial validation and demo.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Stockfish WASM files MUST be in public/stockfish/ (not bundled by Vite)
- AI time budget violations are defects - implement proper error handling
