import app

from unittest import TestCase

class DoesNotCrash(TestCase):

    def test_init(self):
        app.create_app()