from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from app.api.v1.users import api as users_ns
from app.api.v1.auth import api as auth_ns
from app.extensions import db
from flask_cors import CORS
from flask_bcrypt import Bcrypt
# app/__init__.py

def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    bcrypt = Bcrypt()
    app.config.from_object(config_class)
    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API')
    jwt = JWTManager()
    jwt.init_app(app)
    bcrypt.init_app(app)
    db.init_app(app)
    # Register the users namespace
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(auth_ns, path='/api/v1/auth')
    return app
