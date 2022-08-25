import chess
import math
from enum import Enum
from functools import total_ordering
from collections import defaultdict
from app.engine import piece_position_tables

class Akimbo:

    def __init__(self, fen, default_lookahead=1):
        self.board = chess.Board(fen)
        self.default_lookahead = default_lookahead
        self.negamax_memo = defaultdict(lambda: [-1, None])

    def recommend_moves(self, format: str):
        mates = [move for move in self.board.legal_moves
            if self.heuristic_score(move) == Score.Checkmate
        ]
        if mates:
            return self.format(mates, format == "san")

        whites_turn = self.board.turn == chess.WHITE
        possible_moves = list(sorted(self.board.legal_moves,
            key=lambda m: self.heuristic_score(m)
        ))

        self.board.push(possible_moves[0])
        best_eval, best_moves = -self.negamax(not whites_turn), []
        self.board.pop()

        for move in possible_moves:
            self.board.push(move)
            eval = -self.negamax(not whites_turn, beta=-best_eval)
            self.board.pop()
            if eval > best_eval:
                best_eval, best_moves = eval, [move]
            elif eval == best_eval:
                best_moves.append(move)

        return self.format(best_moves, format == "san")

    def heuristic_score(self, move):
        self.board.push(move)
        if self.board.is_checkmate():
            self.board.pop()
            return Score.Checkmate
        self.board.pop()
        if self.board.gives_check(move):
            return Score.Check
        elif self.board.is_capture(move):
            return Score.Capture
        else:
            return Score.Else

    def negamax(self, maximizing_player, lookahead_depth=2, alpha=(-math.inf), beta=(math.inf)):
        
        fen = self.board.fen()[:-4]
        update_memo = False
        [prev_lookahead, prev_score] = self.negamax_memo[fen]
        if prev_lookahead >= lookahead_depth:
            return prev_score
        else:
            update_memo = True

        if lookahead_depth == 0 or self.board.is_game_over():
            return self.quiescence(maximizing_player, alpha, beta)

        max_eval = -math.inf
        possible_moves = sorted(self.board.legal_moves,
            key=lambda m: self.heuristic_score(m)
        )
        for m in possible_moves:
            self.board.push(m)
            score = -self.negamax(not maximizing_player, lookahead_depth - 1, -beta, -alpha)
            self.board.pop()
            max_eval = max(max_eval, score)
            alpha = max(alpha, max_eval)
            if alpha > beta:
                break

        if update_memo:
            self.negamax_memo[fen] = [lookahead_depth, max_eval]
        return max_eval

    def quiescence(self, maximizing_player, alpha, beta):
        stand_pat = self.evaluate() if maximizing_player else -self.evaluate()
        if stand_pat >= beta:
            return stand_pat
        if stand_pat > alpha:
            alpha = stand_pat
        
        best_move = stand_pat
        threatening_moves = [move for move in self.board.legal_moves
            if self.board.is_capture(move) or self.board.gives_check(move)
        ]
        for m in threatening_moves:
            self.board.push(m)
            score = -self.quiescence(not maximizing_player, -beta, -alpha)
            self.board.pop()

            best_move = max(best_move, score)
            alpha = max(alpha, best_move)

            if best_move >= beta:
                return best_move

        return best_move

    def evaluate(self):
        whites_turn = self.board.turn == chess.WHITE
        if self.board.is_checkmate():
            eval = -math.inf if whites_turn else math.inf
        elif self.drawn():
            eval = 0
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
            eval = whites_score - blacks_score

        return eval
    
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

    def drawn(self):
        is_drawn = self.board.is_stalemate() \
            or self.board.is_insufficient_material() \
            #or self.board.is_repetition() \
            #or self.board.is_fifty_moves()
        return is_drawn

    def format(self, moves, to_san):
        return [self.board.san(m) if to_san else m.uci() for m in moves]

@total_ordering
class Score(Enum):
    Checkmate = 0
    Check = 1
    Capture = 2
    Threat = 3
    Else = 10

    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self.value < other.value
        else:
            return NotImplemented