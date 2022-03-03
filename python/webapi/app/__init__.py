import os

from flask import Flask
from flask_cors import cross_origin

def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_pyfile('config/default.py')

    if test_config is None:
        app.config.from_envvar('ENGINE_CONFIG_FILE')
    else:
        app.config.from_mapping(test_config)

    @app.route("/")
    @cross_origin(origins = ['http://' + app.config['REACT_HOST']], methods = ["GET"])
    def hello_world():
        return "Hello, World!"

    return app