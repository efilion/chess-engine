from os import getenv, path
from dotenv import load_dotenv
from distutils.util import strtobool

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env.staging'))

REACT_HOST=str(getenv('REACT_HOST'))
TLS=bool(strtobool(getenv('TLS')))