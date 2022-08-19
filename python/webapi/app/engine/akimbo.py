import chess
import math

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
            whites_material_score = 0
            blacks_material_score = 0
            for (square, piece) in self.board.piece_map().items():
                if piece.color == chess.WHITE:
                    whites_material_score += self.piece_value(piece)
                else:
                    blacks_material_score += self.piece_value(piece)
            eval = [
                whites_material_score - blacks_material_score,
                blacks_material_score - whites_material_score
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
    
    def piece_value(self, piece):
        piece_values = {
            chess.PAWN: 100,
            chess.KNIGHT: 320,
            chess.BISHOP: 330,
            chess.ROOK: 500,
            chess.QUEEN: 900,
            chess.KING: 20000
        }
        return piece_values[piece.piece_type]