import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import App from './App';
import { fireDragDrop, tick } from 'react-dnd-test-utils';
import { BoardProps } from './chessboard/Chessboard';
import { Square } from 'chess.js';

const renderApp = async (props: {boardProps?: Partial<BoardProps>}) => {
    await act(async() => {
        render(<App {...props} />);
        await tick();
    });
}
const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const getSquare = (square:Square) => {
    return document.querySelector(`[data-square=${square}]`);
}
const getPieceAtSquare = (square:Square) => {
    return document.querySelector(`[data-square=${square}] [draggable]`);
}

test('renders without crashing', async () => {
    await renderApp({})
})

test('1.e4 c5 as black', async () => {
    const user = userEvent.setup();
    await renderApp({
        boardProps: {
            fen: startingPosition,
            engineMove: (_) => Promise.resolve({
                from: 'e2', to: 'e4', promotion: 'q'
            }),
            engineDelay: 0,
            animationDuration: 0
        }
    });

    let e2pawn = getPieceAtSquare('e2');
    let e4pawn = getPieceAtSquare('e4');
    expect(e2pawn).toBeInTheDocument();
    expect(e4pawn).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /Black/i}));
    waitFor(() => {
        expect(e2pawn).not.toBeInTheDocument();
        
        e4pawn = getPieceAtSquare('e4');
        expect(e4pawn).toBeInTheDocument()
    });

    let c7pawn = getPieceAtSquare('c7');
    let c5pawn = getPieceAtSquare('c5');
    expect(c7pawn).toBeInTheDocument();
    expect(c5pawn).not.toBeInTheDocument();
    
    let c5square = getSquare('c5');
    await fireDragDrop(c7pawn!, c5square!);
    waitFor(() => {
        c7pawn = getPieceAtSquare('c7');
        c5pawn = getPieceAtSquare('c5');
        expect(c7pawn).not.toBeInTheDocument();
        expect(c5pawn).toBeInTheDocument();
    });
})