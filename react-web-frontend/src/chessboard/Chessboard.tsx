import React, { useCallback, useEffect, useState } from 'react';
import './Chessboard.css';
import ChessJS, { ChessInstance, ShortMove, Square } from 'chess.js';
import { Chessboard as ReactChessboard } from 'react-chessboard';

const Chess = (typeof ChessJS === "object")? ChessJS.Chess : ChessJS;
export type GameResult = 'drawn' | 'white' | 'black'

export type BoardProps = {
  onStartGame: () => Promise<'white'|'black'>,
  onGameOver: (r:GameResult) => void,
  engineMove: (fen: string) => Promise<ShortMove>,
  fen?: string,
  animationDuration?: number,
  engineDelay?: number
}
function Chessboard(props: BoardProps) {

  const [game, setGame] = useState<ChessInstance>(new Chess(props.fen));
  const [playerSide, setPlayerSide] = useState<'white'|'black'>('white');

  const _onStartGame = useCallback(() => props.onStartGame(), []);
  const _engineDelay = props.engineDelay;
  const _makeEngineMove = useCallback(() => {
    makeEngineMove(_engineDelay || 1000)
  }, [_engineDelay]);
  useEffect(() => {
    _onStartGame()
      .then((choice) => {
        setPlayerSide(choice);
        if (choice === 'black') {
          _makeEngineMove()
        }
      })

    return () => {
      let id = window.setTimeout(() => {}, 0);
      while (id--) {
        window.clearTimeout(id);
      }
    }
  }, [_onStartGame, _makeEngineMove, _engineDelay]);

  function safeGameMutate(modify: (g:ChessInstance) => void) {
    setGame((game) => {
      const update = { ...game };
      modify(update);
      return update;
    });
  }

  function makeMove(move: ShortMove): (ShortMove|null) {
    let confirm_move = null
    safeGameMutate((game) => {
      confirm_move = game.move(move);
    })
    return confirm_move;
  }

  async function makeEngineMove(delay: number): Promise<void> {
    props.engineMove(game.fen())
      .then(m => new Promise<ShortMove>(resolve => setTimeout(() => resolve(m), delay)))
      .then(m => makeMove(m));
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
      window.setTimeout(makeEngineMove, props.engineDelay || 200)
    }

    if (game.game_over()) {
      window.setTimeout(() => {
        let result: GameResult;
        if (game.in_draw()) {
          result = 'drawn';
        }
        else if (game.turn() === "w") {
          result = 'black';
        }
        else {
          result = 'white'
        }
        props.onGameOver(result);
      }, props.engineDelay || 200);
    }
     
    return true;
  }

  return (
    <>
        <ReactChessboard
            position={game.fen()}
            boardOrientation={playerSide}
            onPieceDrop={onDrop}
            animationDuration={props.animationDuration}
        />

    </>
  );
}

export default Chessboard;