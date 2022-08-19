from app.engine.akimbo import Akimbo
from unittest import TestCase
import chess

class AkimboPlaysGoodMoves(TestCase):

    def test_trade_rooks(self):
        starting_position = "r1br2k1/ppq2pp1/2p5/4p2Q/4n3/1B6/PP3PPP/3R2K1 w - - 0 19"
        self.assertEqual(["Rxd8+"], Akimbo(starting_position).recommend_moves("san"))

    def test_capture_queen(self):
        position = "4r1k1/5pp1/7p/8/8/4R2P/4qPP1/6K1 w - - 0 1"
        self.assertEqual(["Rxe2"], Akimbo(position).recommend_moves("san"))

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
            self.assertNotIn("Qxf7#", legal_moves)
            board.pop()

    def test_knight_doesnt_capture_guarded_pawn(self):
        position = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
        self.assertNotEqual(["Nxe5"], Akimbo(position).recommend_moves("san"))


class AkimboEvaluates(TestCase):

    def test_scandinavian_defence(self):
        position = "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2"
        self.assertEqual([0, 0], Akimbo(position).evaluate())

    def test_nimzowitsch_defence(self):
        position = "r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2"
        self.assertEqual([-10, 10], Akimbo(position).evaluate())