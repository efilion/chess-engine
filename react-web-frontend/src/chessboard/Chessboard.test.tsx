import React from 'react';
import { act } from 'react-dom/test-utils';
import { cleanup, render } from '@testing-library/react';
import { fireDragDrop, tick } from 'react-dnd-test-utils';
import { until, flushPromises, getSquare, getPieceAtSquare } from '../test/utils';
import Chessboard, { BoardProps } from './Chessboard';

const renderBoard = async (playerSide: ('white'|'black'), fen?: string)  => {
  await act(async () => {
    const props: BoardProps = {
      fen: fen,
      onStartGame: () => Promise.resolve(playerSide),
      onGameOver: () => {},
      engineMove: () => Promise.resolve({
        from: 'e2',
        to: 'e4',
        promotion: 'q'
      })
    }
    await render(<Chessboard {...props} />);
    let t = tick();
    jest.runOnlyPendingTimers();
    await t;
  });
  await act(async () => {
    jest.runOnlyPendingTimers();
  })
  await flushPromises()
}

const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ["setInterval"] });
})

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  cleanup();
})

test('renders chessboard', async () => {
  await renderBoard('white', startingPosition);

  const whites_king_square = getSquare('e1');
  expect(whites_king_square).toBeInTheDocument();
});

test('e2 to e4', async () => {
  await renderBoard('white', startingPosition);

  let e2pawn = getPieceAtSquare('e2')!;
  let e4square = getSquare('e4')!;
  
  expect(e2pawn).toBeInTheDocument();
  expect(e4square.querySelector('[draggable]')).not.toBeInTheDocument();
  await until(() => fireDragDrop(e2pawn, e4square));
  expect(e2pawn).not.toBeInTheDocument();
  expect(e4square.querySelector('[draggable]')).toBeInTheDocument();
})

test('e7 to e5', async () => {
  await renderBoard('black', startingPosition);

  let e4pawn = getPieceAtSquare('e4');
  expect(e4pawn).toBeInTheDocument();

  let e7pawn = getPieceAtSquare('e7')!;
  let e5square = getSquare('e5')!;
  
  expect(e7pawn).toBeInTheDocument();
  expect(e5square.querySelector('[draggable]')).not.toBeInTheDocument();
  await until(() => fireDragDrop(e7pawn, e5square));
  expect(e7pawn).not.toBeInTheDocument();
  expect(e5square.querySelector('[draggable]')).toBeInTheDocument();
})
