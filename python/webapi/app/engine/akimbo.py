import chess
import math
import random

def generate_move(format, fen):
    board = chess.Board(fen)
    whitesTurn = board.turn == chess.WHITE
    def evaluation(move):
        board.push(move)
        if board.is_checkmate():
            eval = [math.inf, -math.inf] if whitesTurn else [-math.inf, math.inf]
        elif drawn(board):
            eval = [0, 0]
        else:
            whites_material_score = 0
            blacks_material_score = 0
            for (square, piece) in board.piece_map().items():
                if piece.color == chess.WHITE:
                    whites_material_score += piece_value(piece)
                else:
                    blacks_material_score += piece_value(piece)
            eval = [
                whites_material_score - blacks_material_score,
                blacks_material_score - whites_material_score
            ]
        board.pop()
        return eval
    possibleMoves = list(board.legal_moves)
    (_, bestMoves) = maxes(possibleMoves, lambda m: evaluation(m)[0 if whitesTurn else 1])
    chosenMove = bestMoves[random.randrange(len(bestMoves))]
    return board.san(chosenMove) if format == "san" else chosenMove.uci()

def piece_value(piece):
    piece_values = {
        chess.PAWN: 100,
        chess.KNIGHT: 320,
        chess.BISHOP: 330,
        chess.ROOK: 500,
        chess.QUEEN: 900,
        chess.KING: 20000
    }
    return piece_values[piece.piece_type]

def drawn(board):
    return board.is_stalemate() \
        or board.is_insufficient_material() \
        or board.is_repetition() \
        or board.is_fifty_moves()

def maxes(a, key=None):
    if key is None:
        key = lambda x: x
    m, max_list = key(a[0]), []
    for s in a:
        k = key(s)
        if k > m:
            m, max_list = k, [s]
        elif k == m:
            max_list.append(s)
    return m, max_list