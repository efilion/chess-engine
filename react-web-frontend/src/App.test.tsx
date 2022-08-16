import React  from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { until, flushPromises, getSquare, getPieceAtSquare } from './test/utils';
import App from './App';
import { fireDragDrop, tick } from 'react-dnd-test-utils';
import { BoardProps } from './chessboard/Chessboard';
import { ShortMove } from 'chess.js';

const renderApp = async (props: {boardProps?: Partial<BoardProps>}) => {
    await act(async() => {
        await render(<App {...props} />);
        let t = tick();
        jest.runOnlyPendingTimers();
        await t;
    });
    await act(() => {
      jest.runOnlyPendingTimers();
    })
    await flushPromises();
}
const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const zip = (xs:any[], ys:any[]) => xs.map((x, i) => [x, ys[i]]);

beforeAll(() => {
    jest.useFakeTimers();
})

afterEach(() => {
    jest.clearAllTimers();
    cleanup();
})

afterAll(() => {
    jest.useRealTimers();
})

test('renders without crashing', async () => {
    await renderApp({})
})

test('1.e4 c5 as black', async () => {
    const user = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
    await renderApp({
        boardProps: {
            fen: startingPosition,
            engineMove: () => Promise.resolve({
                from: 'e2', to: 'e4', promotion: 'q'
            }),
        }
    });

    let e2pawn = getPieceAtSquare('e2');
    let e4pawn = getPieceAtSquare('e4');
    expect(e2pawn).toBeInTheDocument();
    expect(e4pawn).not.toBeInTheDocument();

    await until(() => user.click(screen.getByRole('button', {name: /Black/i})))
    await flushPromises()
    e2pawn = getPieceAtSquare('e2');
    expect(e2pawn).not.toBeInTheDocument();

    e4pawn = getPieceAtSquare('e4');
    expect(e4pawn).toBeInTheDocument()

    let c7pawn = getPieceAtSquare('c7');
    let c5pawn = getPieceAtSquare('c5');
    expect(c7pawn).toBeInTheDocument();
    expect(c5pawn).not.toBeInTheDocument();
    
    let c5square = getSquare('c5');
    await until(() => fireDragDrop(c7pawn!, c5square!));
    c7pawn = getPieceAtSquare('c7');
    c5pawn = getPieceAtSquare('c5');
    expect(c7pawn).not.toBeInTheDocument();
    expect(c5pawn).toBeInTheDocument();
})

test('drawn game when stalemate', async () => {
    await renderApp({
        boardProps: {
            fen: "4k3/4P3/8/4K3/8/8/8/8 w - - 0 1",
            onStartGame: () => Promise.resolve('white'),
        }
    });
    let e5King = getPieceAtSquare('e5')!;
    await until(() => fireDragDrop(e5King, getSquare('e6')!));

    expect(screen.getByText('Game is drawn.')).toBeInTheDocument();
})

test('drawn game when insufficent material', async () => {
    await renderApp({
        boardProps: {
            fen: "4k3/8/4p3/4K3/8/8/8/8 w - - 0 1",
            onStartGame: () => Promise.resolve('white'),
        }
    });
    let e5King = getPieceAtSquare('e5')!;
    await until(() => fireDragDrop(e5King, getSquare('e6')!));

    expect(screen.getByText('Game is drawn.')).toBeInTheDocument();
})

test('drawn game when threefold repetition', async () => {
    let white_moves = [
        ['e2', 'e4'], 
        ['e1', 'e2'], 
        ['e2', 'e1'], 
        ['e1', 'e2'], 
        ['e2', 'e1'], 
        ['e1', 'e2'], 
    ];
    let black_moves = [
        ['e7', 'e5'],       
        ['e8', 'e7'],
        ['e7', 'e8'],
        ['e8', 'e7'],
        ['e7', 'e8'],
        ['e8', 'e7'],
    ];
    let engine_moves = function*() {
        for (const move of white_moves) {
            yield Promise.resolve({
                from: move[0], to: move[1], promotion: 'q'
            } as ShortMove)
        }
    }()
    await renderApp({
        boardProps: {
            fen: startingPosition,
            onStartGame: () => Promise.resolve('black'),
            engineMove: (_) => {
                let move = engine_moves.next().value!
                return move;
            },
        }
    });

    for (const [w, b] of zip(white_moves, black_moves)) {
        await flushPromises();
        expect(getPieceAtSquare(w[0])).not.toBeInTheDocument();
        expect(getPieceAtSquare(w[1])).toBeInTheDocument();
        
        let pieceToMove = getPieceAtSquare(b[0])!;
        let targetSquare = getSquare(b[1])!;
        await until(() => fireDragDrop(pieceToMove, targetSquare));
        expect(getPieceAtSquare(b[0])).not.toBeInTheDocument();
        expect(getPieceAtSquare(b[1])).toBeInTheDocument();
    }

    expect(screen.getByText('Game is drawn.')).toBeInTheDocument();
})
