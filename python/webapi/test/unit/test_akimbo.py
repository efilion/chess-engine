from tracemalloc import start
from app.engine.akimbo import generate_move
from unittest import TestCase

class CapturesHighestValuePiece(TestCase):

    def test_trade_rooks(self):
        starting_position = "r1br2k1/ppq2pp1/2p5/4p2Q/4n3/1B6/PP3PPP/3R2K1 w - - 0 19"
        self.assertEqual("Rxd8+", generate_move("san", starting_position))

    def test_capture_queen(self):
        position = "4r1k1/5pp1/7p/8/8/4R2P/4qPP1/6K1 w - - 0 1"
        self.assertEqual("Rxe2", generate_move("san", position))

    def test_scholars_mate(self):
        position = "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
        self.assertEqual("Qxf7#", generate_move("san", position))