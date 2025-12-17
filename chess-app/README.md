# Single-Player Chess vs AI

A browser-based chess application where users can compete against an AI opponent (Stockfish) with configurable difficulty levels.

## Features

- **Play against AI**: Challenge Stockfish at 4 difficulty levels (Easy, Medium, Hard, Very Hard).
- **Full Chess Rules**: Supports all standard moves including castling, en passant, and promotion.
- **Game Controls**: Undo moves, resign, reset game, and flip board.
- **Move History**: View the full history of moves in standard algebraic notation.
- **Accessibility**: Keyboard navigation, screen reader support, and high contrast compliance.
- **Offline Capable**: Runs entirely in the browser using WebAssembly.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js
- **Board UI**: react-chessboard
- **AI Engine**: Stockfish 17.1 (WASM)
- **Testing**: Vitest, React Testing Library

## Setup & Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Run Tests**:
    ```bash
    npm run test
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    ```

## Architecture

- **`src/components/`**: UI components (ChessBoard, GameControls, etc.)
- **`src/hooks/`**: Custom hooks for game logic (`useChessGame`) and engine integration (`useChessEngine`).
- **`src/lib/`**: Utilities for chess engine communication, difficulty mapping, and notation.
- **`src/types/`**: TypeScript definitions.
- **`public/stockfish/`**: Stockfish WebAssembly files.

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
