import React, { useState } from 'react';
import './Chessboard.css';
import ChessJS, { ChessInstance, Move, ShortMove, Square } from 'chess.js';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const Chess = (typeof ChessJS === "object")? ChessJS.Chess : ChessJS;

function Chessboard() {

  const [game, setGame] = useState<ChessInstance>(new Chess());
  const [playerSide, setPlayerSide] = useState<"white"|"black">("white");
  const [openStartDialog, setOpenStartDialog] = useState<boolean>(true);
  const [openEndDialog, setOpenEndDialog] = useState<boolean>(false);

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

    if (game.turn() !== playerSide[0])
      return false;

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

    if (game.game_over()) {
      setTimeout(() => {
        setOpenEndDialog(() => true);
      }, 200);
    }
     
    return true;
  }

  return (
    <>
        <ReactChessboard
            position={game.fen()}
            boardOrientation={playerSide}
            onPieceDrop={onDrop}
        />

        <Dialog // Start Dialog
            open={openStartDialog}
            aria-labelledby='start-dialog-title'
        >
            <DialogTitle id='start-dialog-title'>
                {'Choose side'}
            </DialogTitle>
            <DialogActions>
                <Button onClick={
                    () => {
                        setPlayerSide(() => 'white');
                        setOpenStartDialog(() => false);
                    }
                }>
                    White
                </Button>
                
                <Button onClick={
                    () => {
                        setPlayerSide(() => 'black');
                        setOpenStartDialog(() => false);
                        setTimeout(() => {
                            makeMove(randomMove(game))
                        }, 1000);
                    }
                }>
                    Black
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog // End Dialog
            open={openEndDialog}
            aria-labelledby='end-dialog-title'
            aria-describedby='end-dialog-description'
        >
            <DialogTitle id='end-dialog-title'>
                {'Game Over'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id='end-dialog-description'>
                   {
                       game.in_draw()?
                        "Game is drawn.":
                        (game.turn() !== "w"? "White": "Black") + " won by checkmate."
                   } 
                </DialogContentText>
            </DialogContent>
        </Dialog>
    </>
  );
}

export default Chessboard;