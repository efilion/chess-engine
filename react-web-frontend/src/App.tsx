import React, { useState } from 'react';
import './App.css';
import ChessJS, { ChessInstance, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const Chess = (typeof ChessJS === 'object')? ChessJS.Chess : ChessJS;

function App() {

  const [game, setGame] = useState<ChessInstance>(new Chess())

  function safeGameMutate(modify: (g: ChessInstance) => void) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex])
    });
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    let move = null;
    safeGameMutate((game) => {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });
    });
    if (move === null) return false;
    setTimeout(makeRandomMove, 200);
    return true;
  }

  return (
    <div className="App">
      <Chessboard position={game.fen()} onPieceDrop={onDrop} />
    </div>
  );
}

export default App;
