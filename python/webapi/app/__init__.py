import os

from flask import Flask
from flask_cors import cross_origin

from app.engine.strategy import random

def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_pyfile('config/default.py')

    if test_config is None:
        app.config.from_envvar('ENGINE_CONFIG_FILE')
    else:
        app.config.from_mapping(test_config)

    @app.route("/random/san/<path:fen>")
    @cross_origin(origins = [('https' if app.config['TLS'] else 'http')+'://' + app.config['REACT_HOST']], methods = ["GET"])
    def random_san_move(fen):
        return random.generate_move("san", fen)
    
    @app.route("/random/uci/<path:fen>")
    @cross_origin(origins = [('https' if app.config['TLS'] else 'http')+'://' + app.config['REACT_HOST']], methods = ["GET"])
    def random_uci_move(fen):
        return random.generate_move("uci", fen)

    return app
