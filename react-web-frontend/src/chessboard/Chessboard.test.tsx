import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup, render, screen } from '@testing-library/react';
import { fireDragDrop, tick } from 'react-dnd-test-utils';
import Chessboard, { BoardProps } from './Chessboard';

const renderBoard = async (playerSide: ('white'|'black'), fen?: string)  => {
  await act(async () => {
    const props: BoardProps = {
      fen: fen,
      animationDuration: 0,
      onStartGame: () => Promise.resolve(playerSide),
      onGameOver: () => {},
      engineMove: () => Promise.resolve({
        from: 'h1',
        to: 'h2',
        promotion: 'q'
      })
    }
    render(<Chessboard {...props} />);
    await tick();
  });
}

const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

afterEach(() => {
  cleanup()
})

test('renders chessboard', async () => {
  await renderBoard('white', startingPosition);

  const whites_king_square = document.querySelector('[data-square=e1]');
  expect(whites_king_square).toBeInTheDocument();
});

test('e2 to e4', async () => {
  await renderBoard('white', startingPosition);

  let e2pawn = document.querySelector('[data-square=e2] [draggable]')!;
  let e4square = document.querySelector('[data-square=e4]')!;
  
  expect(e2pawn).toBeInTheDocument();
  expect(e4square.querySelector('[draggable]')).not.toBeInTheDocument();
  await fireDragDrop(e2pawn, e4square);
  expect(e2pawn).not.toBeInTheDocument();
  expect(e4square.querySelector('[draggable]')).toBeInTheDocument();
})

test('e7 to e5', async () => {
  const positionAfterE4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
  await renderBoard('black', positionAfterE4);

  let e7pawn = document.querySelector('[data-square=e7] [draggable]')!;
  let e5square = document.querySelector('[data-square=e5]')!;
  
  expect(e7pawn).toBeInTheDocument();
  expect(e5square.querySelector('[draggable]')).not.toBeInTheDocument();
  await fireDragDrop(e7pawn, e5square);
  expect(e7pawn).not.toBeInTheDocument();
  expect(e5square.querySelector('[draggable]')).toBeInTheDocument();
})