<!--
## Sync Impact Report

**Version Change**: 1.0.0 → 1.1.0 (MINOR bump - new principles/patterns added)

### Modified Principles
- None (existing 5 core principles unchanged)

### Added Sections
- **PRD Implementation Patterns** (new section containing 7 subsections):
  - VI. Web Worker Communication Pattern
  - VII. State Management Boundaries
  - VIII. Move Validation Flow
  - IX. Component Responsibility
  - X. Stockfish File Handling
  - XI. Difficulty Configuration
  - XII. UI State Synchronization

### Removed Sections
- None

### Templates Requiring Updates
- `.specify/templates/plan-template.md`: ⚠ pending review (new patterns may inform planning)
- `.specify/templates/spec-template.md`: ⚠ pending review (alignment check needed)
- `.specify/templates/tasks-template.md`: ⚠ pending review (task categorization)

### Follow-up TODOs
- None - all placeholders resolved

### Amendment Date
2025-12-10
-->

# AI Chess Demo Constitution

**Project**: Web-based single-player chess application with AI opponent  
**Repository**: FociSolutions/ai-agent-chess-demo-2  

## Core Principles

### I. React Best Practices (NON-NEGOTIABLE)
Follow React 18 best practices and patterns without exception:
- Functional components with hooks only (no class components)
- Custom hooks for shared stateful logic (e.g., `useChessGame`, `useChessEngine`)
- Proper dependency arrays in `useEffect`, `useMemo`, `useCallback`
- No direct DOM manipulation via `ref` except for specific use cases (peer review required)
- Memoization (`React.memo`, `useMemo`) only when justified by profiling
- Props drilling should not exceed 3 levels; use Context API or state management above that threshold

### II. No Mocked Code in Production (NON-NEGOTIABLE)
Production code must be fully real, testable implementations:
- Mock data and stub functions are ONLY permitted inside test files (`*.test.ts`, `*.test.tsx`)
- No fallback/placeholder implementations in source code (e.g., `const mockEngine = { getBestMove: () => 'e4' }`)
- If a dependency is not ready, the feature is marked incomplete; it does not ship with mocks
- All external dependencies must be properly initialized and error-handled in production code
- Exception: Test utilities in `test/` or `vitest/` directories are allowed

### III. SOLID Principles (MANDATORY)
Adhere to SOLID design principles across all code:
- **Single Responsibility**: Each class/function has one reason to change (e.g., `ChessEngine` handles only engine communication, not game state)
- **Open/Closed**: Open for extension, closed for modification (use inheritance, composition, and strategy patterns where needed)
- **Liskov Substitution**: Subtypes must be substitutable without breaking contracts (e.g., difficulty implementations)
- **Interface Segregation**: Depend on narrow, specific interfaces, not bloated ones (e.g., `Difficulty` interface contains only what's needed)
- **Dependency Inversion**: Depend on abstractions, not concrete implementations (e.g., inject `ChessEngine` as dependency, not hardcoded)

### IV. No Fallbacks Without Approval (NON-NEGOTIABLE)
Fallback behaviors, error recovery strategies, and graceful degradation require explicit approval before implementation:
- Do not implement fallback UI states (e.g., "Engine failed, show basic text interface") without approval
- Do not implement retry logic without approval
- Do not silently fall back to weaker AI levels without approval
- If a critical dependency fails, the application should fail cleanly with a user-facing error message
- Document any proposed fallback in a GitHub issue and wait for approval before coding

### V. Specification Compliance (NON-NEGOTIABLE)
All implementation must strictly follow the BRD and PRD documents:
- Any deviation from specified requirements requires GitHub issue creation and explicit approval
- Changes to game rules, UI layout, difficulty levels, or core functionality must be approved before implementation
- If BRD/PRD needs update, amend the specification first, then implement
- Use `#github-pull-request_copilot-coding-agent` tag with issue reference when asking for approval

## Architecture Patterns

### VI. Web Worker Communication (MANDATORY)
All Stockfish engine communication must follow these patterns:
- All Stockfish communication MUST go through the `ChessEngine` class (single point of contact)
- Never create `Worker` instances directly in components or hooks other than `useChessEngine`
- Worker lifecycle (`init()`/`destroy()`) managed exclusively by the `useChessEngine` hook
- No direct `postMessage()` calls outside of `ChessEngine` class methods

### VII. State Management Boundaries (MANDATORY)
Game state ownership and flow must be strictly controlled:
- Game state lives in `useChessGame` hook only (single source of truth)
- Components receive state via props; components NEVER manage game logic internally
- `chess.js` instance is private to `useChessGame`; components use derived state only (FEN, history, status)
- No component-level `useState` for game-related data (position, turn, check status, etc.)
- UI-only state (e.g., animation flags, hover effects) is allowed in components

### VIII. Move Validation Flow (MANDATORY)
All chess moves must follow this validation pipeline:
- All moves MUST be validated by `chess.js` before updating any UI state
- Never update board visuals optimistically before validation succeeds
- UCI → SAN conversion happens in one place only: the `uciToMove()` function
- Player moves validated via `game.move()` return value; null = invalid
- AI moves from Stockfish are validated identically to player moves

### IX. Component Responsibilities (MANDATORY)
Each component has a single, clearly defined responsibility:
- **`ChessBoard.tsx`**: Display only; receives position + callbacks as props; contains zero game logic
- **`GameControls.tsx`**: Button rendering + disabled state display; no business logic; callbacks only
- **`GameStatus.tsx`**: Display turn/check/result text; no state mutations; pure presentational
- **`MoveHistory.tsx`**: Display PGN move list; no game manipulation; receives history as prop
- **`DifficultySelector.tsx`**: Render difficulty options; disabled state from props; selection via callback
- If a component needs game logic, it belongs in `useChessGame` hook, not the component

### X. Stockfish File Handling (NON-NEGOTIABLE)
Engine files must be handled exactly as specified:
- Stockfish files MUST reside in `/public/stockfish/` directory (never processed by bundler)
- Worker instantiation MUST use absolute path: `new Worker('/stockfish/stockfish-nnue-17.1-lite-single.js')`
- No dynamic path construction for engine files (no template literals, no environment variables)
- If Stockfish version changes, update path in `ChessEngine` class AND copy new files to `/public/stockfish/`

### XI. Difficulty Configuration (MANDATORY)
Difficulty settings must be centralized and consistent:
- All difficulty settings defined in single source: `DIFFICULTY_SETTINGS` constant in `engine.ts` or `difficulty.ts`
- No hardcoded skill levels, depths, or ELO values outside the central configuration
- Components display difficulty names; only `ChessEngine` knows UCI option values
- Any changes to ELO mapping require PRD amendment first, then code update

### XII. UI State Synchronization (MANDATORY)
Interactive element states must be derived from game status:
- Button disabled states derived from `GameStatus` enum only (e.g., `status === 'aiThinking'`)
- No independent `isDisabled` state tracking in button components
- `AI_THINKING` status controls disabled state for: New Game, Undo, Resign buttons
- `Flip Board` button always enabled (view-only, doesn't affect game state)
- `START_SCREEN` status disables gameplay buttons; enables settings controls
- `GAME_OVER` status: Undo enabled, Resign disabled, New Game enabled

## Code Quality Standards

### Testing Requirements
- **Unit Tests**: All business logic (`useChessGame`, `useChessEngine`, `difficulty.ts`, game rule validation)
- **Integration Tests**: Stockfish worker communication, game flow state transitions
- **Manual Testing**: UI interactions, browser compatibility (Chrome, Firefox, Safari, Edge)
- Mock strategies: Use vitest with `vi.mock()` for worker/engine in tests, never in production code

### Type Safety
- TypeScript strict mode enabled (`strict: true`)
- No `any` types except with explicit rationale in a code comment
- Export types and interfaces for public APIs
- Use discriminated unions for game state types

### Error Handling
- Network/Worker errors: Log with context, display user-friendly message
- Invalid moves: Validate at `chess.js` layer before UI renders
- Engine failures: Fail fast with clear error boundary; do not retry automatically without approval

### Performance Constraints
- Engine response times per PRD: Easy <100ms, Medium <500ms, Hard <1s, Very Hard <2s
- Initial load time: <3 seconds (excluding engine init, <2s after init)
- UI responsiveness: <100ms for all interactions
- Memory: <100MB stable during extended play

## Development Workflow

### Branching & Commits
- Branch naming: `<phase-number>-<feature-slug>` (e.g., `3-game-board-component`)
- Commit messages: Clear, atomic changes with descriptive subjects
- Each phase ends with `.notes/<branch>/README.md` documenting deliverables

### Code Review Checklist
Before shipping code:
- ✅ Follows React best practices (hooks, dependencies, memoization justified)
- ✅ No mocked production code
- ✅ SOLID principles applied (single responsibility, dependency injection, etc.)
- ✅ TypeScript strict mode passes
- ✅ Unit tests pass
- ✅ Manual testing complete (game initialization, difficulty selection, gameplay)
- ✅ Matches BRD/PRD specifications (or approved deviation documented in GitHub issue)
- ✅ No fallback logic without prior approval

### Approval Required For
1. **Any specification deviation** (file GitHub issue with rationale)
2. **Fallback/error recovery behavior** (describe strategy, request approval)
3. **Third-party library additions** (justify necessity, review bundle impact)
4. **Performance optimizations** before profiling data provided
5. **Architectural changes** (discuss alternative designs)

## Governance

### Constitution Enforcement
- All PRs must verify compliance with this constitution
- Specification (BRD/PRD) is the source of truth; constitution ensures quality of implementation
- If constitution and spec conflict, constitution takes precedence (document issue if unclear)

### Amendment Process
1. Propose amendment via GitHub issue with rationale
2. Discuss impact on existing work and future phases
3. Document version bump (MAJOR.MINOR.PATCH per semantic versioning)
4. Update `.specify/memory/constitution.md`
5. Add to `.notes/<phase>/README.md` under "Constitution Updates"

### Version Semantics
- **MAJOR**: Principle removed/redefined, breaks existing work
- **MINOR**: New principle added, guidance expanded
- **PATCH**: Clarification, wording fixes, examples added

**Version**: 1.1.0 | **Ratified**: 2025-12-10 | **Last Amended**: 2025-12-10
