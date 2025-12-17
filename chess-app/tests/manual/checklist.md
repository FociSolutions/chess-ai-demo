# Manual Testing Checklist

## Game Setup
- [ ] **Start Screen**: Verify "Chess vs AI" title and "Ready to play!" message (after loading).
- [ ] **Difficulty Selection**: Select each difficulty (Easy, Medium, Hard, Very Hard). Verify selection persists.
- [ ] **Color Selection**: Select White and Black. Verify board orientation changes accordingly.
- [ ] **Start Game**: Click "Start Game". Verify board appears with correct orientation.

## Gameplay
- [ ] **Legal Moves**: Select a piece. Verify legal moves are highlighted (dots/corners).
- [ ] **Move Execution**: Drag and drop or click-click to move. Verify piece moves.
- [ ] **Illegal Moves**: Try to move a piece illegally. Verify it snaps back and board shakes/announces "Illegal move".
- [ ] **AI Response**: Make a move. Verify AI responds within expected time (Easy < 0.5s, Hard < 1s).
- [ ] **Capture**: Capture an opponent piece. Verify it appears in "Captured pieces" list.
- [ ] **Check**: Put King in check. Verify King square is highlighted red and status says "Check!".
- [ ] **Castling**: Perform King-side and Queen-side castling.
- [ ] **En Passant**: Perform en passant capture.
- [ ] **Promotion**: Move pawn to last rank. Verify promotion dialog appears. Select Queen/Knight. Verify promotion occurs.

## Game Controls
- [ ] **Undo**: Make a move, wait for AI. Click Undo. Verify board reverts 2 moves (player + AI).
- [ ] **Resign**: Click Resign. Verify "Game Over" and "You resigned" message.
- [ ] **New Game**: Click New Game. Verify return to Start Screen or board reset.
- [ ] **Flip Board**: Click Flip Board. Verify board rotates 180 degrees.

## Game Over Conditions
- [ ] **Checkmate**: Achieve checkmate (or be checkmated). Verify "Checkmate!" and winner message.
- [ ] **Stalemate**: Force stalemate. Verify "Stalemate" message.
- [ ] **Draw**: Verify draw by repetition or insufficient material (hard to force manually, but check if possible).

## Accessibility & Responsiveness
- [ ] **Keyboard Nav**: Tab to board. Use arrow keys to select squares. Enter/Space to select/move.
- [ ] **Screen Reader**: Enable screen reader. Verify move announcements ("Move from e2 to e4").
- [ ] **Mobile View**: Resize browser to mobile width. Verify board fits and controls stack vertically.
- [ ] **Dark Mode**: Toggle system dark mode. Verify app adapts (colors change).
