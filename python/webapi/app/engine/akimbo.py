import chess
import math
from app.engine import piece_position_tables

class Akimbo:

    def __init__(self, fen):
        self.board = chess.Board(fen)

    def recommend_moves(self, format: str):
        possibleMoves = list(self.board.legal_moves)
        whites_turn = self.board.turn == chess.WHITE
        (_, bestMoves) = self.maxes(possibleMoves,
            key = lambda: self.minimax(1, whites_turn)[0 if whites_turn else 1]
        )
        return [self.board.san(m) if format == "san" else m.uci() for m in bestMoves]

    def evaluate(self):
        whitesTurn = self.board.turn == chess.WHITE
        if self.board.is_checkmate():
            eval = [-math.inf, math.inf] if whitesTurn else [math.inf, -math.inf]
        elif self.drawn():
            eval = [0, 0]
        else:
            whites_score = 0
            blacks_score = 0
            for (square, piece) in self.board.piece_map().items():
                if piece.color == chess.WHITE:
                    whites_score += self.material_value(piece)
                    whites_score += self.position_value(piece, square)
                else:
                    blacks_score += self.material_value(piece)
                    blacks_score += self.position_value(piece, square)
            eval = [
                whites_score - blacks_score,
                blacks_score - whites_score
            ]

        return eval

    def minimax(self, lookahead_depth, whites_turn):

        if lookahead_depth == 0 or self.board.is_game_over():
            return self.evaluate()

        maxEval = [-math.inf, -math.inf]
        for m in self.board.legal_moves:
            self.board.push(m)
            maxEval = max(maxEval, self.minimax(lookahead_depth - 1, not whites_turn),
                key=lambda e: e[1 if whites_turn else 0])
            self.board.pop()
        
        return maxEval

    def drawn(self):
        is_drawn = self.board.is_stalemate() \
            or self.board.is_insufficient_material() \
            or self.board.is_repetition() \
            or self.board.is_fifty_moves()
        return is_drawn

    def maxes(self, a, key):
        self.board.push(a[0])
        m, max_list = key(), []
        self.board.pop()
        for s in a:
            self.board.push(s)
            k = key()
            if k > m:
                m, max_list = k, [s]
            elif k == m:
                max_list.append(s)
            self.board.pop()
        return m, max_list
    
    def material_value(self, piece):
        piece_values = {
            chess.PAWN: 100,
            chess.KNIGHT: 320,
            chess.BISHOP: 330,
            chess.ROOK: 500,
            chess.QUEEN: 900,
            chess.KING: 20000
        }
        return piece_values[piece.piece_type]

    def position_value(self, piece, square):
        [rank, file] = [chess.square_rank(square), chess.square_file(square)]
        if piece.color == chess.WHITE:
            rank = 7 - rank

        position_values = {
            chess.PAWN: piece_position_tables.pawn,
            chess.KNIGHT: piece_position_tables.knight,
            chess.BISHOP: piece_position_tables.bishop,
            chess.ROOK: piece_position_tables.rook,
            chess.QUEEN: piece_position_tables.queen,
            chess.KING: piece_position_tables.king_middle
        }

        return position_values[piece.piece_type][rank][file]