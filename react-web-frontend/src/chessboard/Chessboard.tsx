import React, { useState } from 'react';
import './Chessboard.css';
import ChessJS, { ChessInstance, Move, ShortMove, Square } from 'chess.js';
<<<<<<< HEAD
import { Chessboard as React_Chessboard } from 'react-chessboard';
=======
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
>>>>>>> 58f72c3... fixup refactor component

const Chess = (typeof ChessJS === "object")? ChessJS.Chess : ChessJS;

function Chessboard() {

  const [game, setGame] = useState<ChessInstance>(new Chess());

  function safeGameMutate(modify: (g:ChessInstance) => void) {
    setGame((game) => {
      const update = { ...game };
      modify(update);
      return update;
    });
  }

  function makeMove(move: ShortMove) {
    let confirm_move = null
    safeGameMutate((game) => {
      confirm_move = game.move(move);
    })
    return confirm_move;
  }

  function randomMove(g:ChessInstance): Move {
    const possibleMoves = g.moves({'verbose': true});
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {

    let confirm_move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });
    
    if (confirm_move === null) return false;
    
    if (!game.game_over()) {
      setTimeout(() => {
        makeMove(randomMove(game));
      }, 200);
    }

    return true;
  }

  return (
    <>
        <ReactChessboard
            position={game.fen()}
            onPieceDrop={onDrop}
        />

    </>
  );
}

export default Chessboard;