from app.engine.strategy.random import generate_move
from unittest import TestCase
from unittest.mock import patch
import random

class MoveIsValid(TestCase):

    def setUp(self):
        random.seed(999)

    def test_generate_san_move(self):
        starting_position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        legal_san_moves = ['a3', 'a4', 'b3', 'b4', 'c3', 'c4', 'd3', 'd4', 'e3', 'e4', 'f3', 'f4', 'g3', 'g4', 'h3', 'h4', 'Na3', 'Nc3', 'Nf3', 'Nh3']

        one_thousand_random_moves = [generate_move("san", starting_position) for i in range(0, 1000)]

        for move in legal_san_moves:
            self.assertIn(move, one_thousand_random_moves)

        for move in one_thousand_random_moves:
            self.assertIn(move, legal_san_moves)

    def test_generate_uci_move(self):
        starting_position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        legal_uci_moves = ['a2a3', 'a2a4', 'b2b3', 'b2b4', 'c2c3', 'c2c4', 'd2d3', 'd2d4', 'e2e3', 'e2e4', 'f2f3', 'f2f4', 'g2g3', 'g2g4', 'h2h3', 'h2h4', 'b1a3', 'b1c3', 'g1f3', 'g1h3']

        one_thousand_random_moves = [generate_move("uci", starting_position) for i in range(0, 1000)]

        for move in legal_uci_moves:
            self.assertIn(move, one_thousand_random_moves)

        for move in one_thousand_random_moves:
            self.assertIn(move, legal_uci_moves)