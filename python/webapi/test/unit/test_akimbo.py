from app.engine.akimbo import Akimbo
from unittest import TestCase
import chess
import math

class AkimboPlaysGoodMoves(TestCase):

    def test_trade_rooks(self):
        starting_position = "r1br2k1/ppq2pp1/2p5/4p2Q/4n3/1B6/PP3PPP/3R2K1 w - - 0 19"
        self.assertEqual(["Rxd8+"], Akimbo(starting_position).recommend_moves("san"))

    def test_capture_queen(self):
        position = "4r1k1/5pp1/7p/8/8/4R2P/4qPP1/6K1 w - - 0 1"
        self.assertEqual(["Rxe2"], Akimbo(position).recommend_moves("san"))

    def test_doesnt_hang_queen(self):
        position = "r2qkb1r/1b3ppp/1pn1p3/pBp1Q3/8/2N5/PPPPNPPP/R1B2RK1 b kq - 0 1"
        recommended_moves = Akimbo(position).recommend_moves("san")
        self.assertNotIn('Qc7', recommended_moves)
        self.assertNotIn('Qd5', recommended_moves)
        self.assertNotIn('Qg5', recommended_moves)

    def test_doesnt_blunder_rook_or_bishop(self):
        position = "2rk1b1r/5ppp/Np2p3/p1pbQ3/8/2N5/PPPP1PPP/R1B2RK1 b - - 0 1"
        recommended_moves = Akimbo(position).recommend_moves("san")
        self.assertNotIn('g5', recommended_moves)
        self.assertNotIn('Bf3', recommended_moves)

    def test_alekjnies_defence(self):
        position = "rnbqkb1r/ppp1pppp/5n2/3p4/4P3/2NP4/PPP2PPP/R1BQKBNR b KQkq - 0 3"
        recommended_moves = Akimbo(position).recommend_moves("san")

    def test_capture_queen_g4(self):
        position = "4r1k1/5pp1/7p/8/6P1/4R2P/4qP2/6K1 b - - 0 1"
        recommended_moves = Akimbo(position, 1).recommend_moves("san")
        pass

    def test_scholars_mate_attack(self):
        position = "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
        self.assertEqual(["Qxf7#"], Akimbo(position).recommend_moves("san"))

    def test_scholars_mate_defend_one_move(self):
        position = "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3"
        recommended_moves = Akimbo(position).recommend_moves("san")
        board = chess.Board(position)
        for move in recommended_moves:
            board.push_san(move)
            legal_moves = [board.san(m) for m in board.legal_moves]
            self.assertNotIn("Qxf7#", legal_moves, msg = f'Recommended move {move} led to Qxf7#')
            board.pop()

    def test_knight_doesnt_capture_guarded_pawn(self):
        position = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
        self.assertNotEqual(["Nxe5"], Akimbo(position).recommend_moves("san"))

    def test_midgame_complexity(self):
        position = "1r1q1rk1/p1p2pp1/b1p1p3/2P1Pn1p/3P1Q1P/2N2N2/P4PP1/R3R1K1 b - - 0 1"
        all(self.assertIn(m, ['Rb2', 'Bc4', 'Bd3', 'Qe7', 'Rb4']) for m in Akimbo(position).recommend_moves("san"))


class AkimboEvaluates(TestCase):

    def test_scandinavian_defence(self):
        position = "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
        self.assertEqual(0, Akimbo(position).evaluate())

    def test_nimzowitsch_defence(self):
        position = "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2"
        self.assertEqual(-10, Akimbo(position).evaluate())

    def test_captures_unguarded_pawn(self):
        position = "1k6/2p1p3/1q6/8/8/4Q3/5P2/6K1 w - - 0 1"
        engine = Akimbo(position)
        best_move, best_score = None, -math.inf
        for move in engine.board.legal_moves:
            engine.board.push(move)
            score = -engine.quiescence(False, -math.inf, math.inf)
            engine.board.pop()
            if score > best_score:
                best_score = score
                best_move = move
        best_move = engine.board.san(best_move)
        self.assertEqual('Qxe7', best_move)