import chess
import random

def generate_move(format, fen):
    board = chess.Board(fen)
    possibleMoves = list(board.legal_moves)
    randomIndex = random.randrange(len(possibleMoves))
    move = possibleMoves[randomIndex]
    return board.san(move) if format == "san" else move.uci()