import React, { useEffect, useMemo } from 'react';
import useState from 'react-usestateref';
import { Subject, from } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import './Chessboard.css';
import ChessJS, { ChessInstance, ShortMove, Square } from 'chess.js';
import { Chessboard as ReactChessboard } from 'react-chessboard';

const Chess = (typeof ChessJS === "object")? ChessJS.Chess : ChessJS;

export type BoardProps = {
  onStartGame: () => Promise<'white'|'black'>,
  onGameOver: (r:GameResult) => void,
  engineMove: (fen: string) => Promise<ShortMove>,
  fen?: string, // starting board position
  engineDelay?: number // ms wait before engine response
}
export type GameResult = 'drawn' | 'white' | 'black'

function Chessboard(props: BoardProps) {

  const [game, setGame, gameRef] = useState<ChessInstance>(new Chess(props.fen));
  const [playerSide, setPlayerSide] = useState<'white'|'black'>('white');

  type EngineMoveEvent = { kind: 'EngineMove', move: ShortMove };
  type CheckGameOverEvent = { kind: 'CheckGameOver' }
  type NotifyEvent = { kind: 'EngineMove', fen: string } | CheckGameOverEvent
  const [timeline,] = useState<Subject<NotifyEvent>>(new Subject());

  const _onStartGame = props.onStartGame
  useEffect(() => {
    _onStartGame()
      .then((choice) => {
        setPlayerSide(choice);
        if (choice === 'black') {
          let game = gameRef.current;
          timeline.next({ kind: 'EngineMove', fen: game.fen() });
        }
      })
  }, [_onStartGame, timeline, gameRef]);
  
  const _engineMove = props.engineMove;
  const _engineDelay = props.engineDelay;
  const boardEvents = useMemo(() =>
    from(timeline).pipe(
      map(e => {
        switch (e.kind) {
          case 'EngineMove': {
            return Promise.all([
              _engineMove(e.fen),
              delay(_engineDelay ?? 0)
            ])
            .then(([m, _]) => ({ kind: 'EngineMove', move: m} as EngineMoveEvent)) 
          }
          case 'CheckGameOver': {
            return Promise.resolve(e)
          }
        }
      }),
      concatMap(e => from(e))
    ), [timeline, _engineMove, _engineDelay])

  const _onGameOver = props.onGameOver;
  useEffect(() => {
    let subscription = boardEvents.subscribe({
      next: (e) => {
        switch(e.kind) {
          case 'EngineMove': {
            setGame((game) => {
              const update = {...game};
              update.move(e.move);
              return update;
            })
            break;
          }
          case 'CheckGameOver': {
            let game = gameRef.current;
            if (game.game_over()) {
              let result: GameResult = game.in_draw() ? 'drawn' :
                (game.turn() === 'w' ? 'black' : 'white');
              _onGameOver(result)
            }
            break;
          }
        }
      }
    })

    return () => subscription.unsubscribe();
  }, [boardEvents, gameRef, setGame, _onGameOver])

  async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
  }

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
      timeline.next({ kind: 'EngineMove', fen: game.fen() })
    }

    timeline.next({ kind: 'CheckGameOver' });

    return true;
  }

  return (
    <>
        <ReactChessboard
            position={game.fen()}
            boardOrientation={playerSide}
            onPieceDrop={onDrop}
        />

    </>
  );
}

export default Chessboard;