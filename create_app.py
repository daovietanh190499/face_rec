from flask import Flask
from flask_login import UserMixin, LoginManager
from flask_sqlalchemy import SQLAlchemy

import os
import hashlib
import binascii

import uuid

db = SQLAlchemy()
login_manager = LoginManager()

def hash_pass(password):
    """Hash a password for storing."""

    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'),
                                  salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash)  # return bytes


def verify_pass(provided_password, stored_password):
    """Verify a stored password against one provided by user"""

    stored_password = stored_password.decode('ascii')
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512',
                                  provided_password.encode('utf-8'),
                                  salt.encode('ascii'),
                                  100000)
    pwdhash = binascii.hexlify(pwdhash).decode('ascii')
    return pwdhash == stored_password


class Users(db.Model, UserMixin):

    __tablename__ = 'Users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.LargeBinary)
    role = db.Column(db.String(64))
    secret_key = db.Column(db.String(64), unique=True)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            if property == 'password':
                value = hash_pass(value)  # we need bytes here (not plain str)
            if property == 'secret_key':
                value = str(uuid.uuid4())

            setattr(self, property, value)

    def __repr__(self):
        return str(self.username)


@login_manager.user_loader
def user_loader(id):
    return Users.query.filter_by(id=id).first()


@login_manager.request_loader
def request_loader(request):
    username = request.form.get('username')
    user = Users.query.filter_by(username=username).first()
    return user if user else None

class People(db.Model):

    __tablename__ = 'People'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    name = db.Column(db.String(200))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(64))
    type_role = db.Column(db.String(64))
    phone = db.Column(db.String(64))
    access_key = db.Column(db.String(64), unique=True)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)
    
class ChildrenPicker(db.Model):

    __tablename__ = 'ChildrenParent'

    id = db.Column(db.Integer, primary_key=True)
    child_access_key = db.Column(db.Integer)
    picker_access_key = db.Column(db.Integer)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)
    
class PeopleClasses(db.Model):
    
    __tablename__ = 'PeopleClasses'
    id = db.Column(db.Integer, primary_key=True)
    person_access_key = db.Column(db.String(64), unique=True)
    class_access_key = db.Column(db.Integer)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)
    
class Classes(db.Model):
    
    __tablename__ = 'Classes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    user_id = db.Column(db.Integer)
    access_key = db.Column(db.String(64), unique=True)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)

class DefineImages(db.Model):

    __tablename__ = 'DefineImages'

    id = db.Column(db.Integer, primary_key=True)
    person_access_key = db.Column(db.String(64))
    image_id = db.Column(db.String(64), unique=True)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)


class Timeline(db.Model):

    __tablename__ = 'Timeline'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    person_access_key = db.Column(db.String(64))
    image_id = db.Column(db.String(64), unique=True)
    embedding = db.Column(db.Text)
    timestamp = db.Column(db.Float)

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)
    
class PickUp(db.Model):
    
    __tablename__ = 'PickUp'

    id = db.Column(db.Integer, primary_key=True)
    child_access_key = db.Column(db.String(64))
    picker_access_key = db.Column(db.String(64))
    child_timeline = db.Column(db.Integer)
    picker_timeline = db.Column(db.Integer)
    

    def __init__(self, **kwargs):
        for property, value in kwargs.items():
            # depending on whether value is an iterable or not, we must
            # unpack it's value (when **kwargs is request.form, some values
            # will be a 1-element list)
            if hasattr(value, '__iter__') and not isinstance(value, str):
                # the ,= unpack of a singleton fails PEP8 (travis flake8 test)
                value = value[0]

            setattr(self, property, value)

    def __repr__(self):
        return str(self.id)

def register_extensions(app):
    db.init_app(app)
    login_manager.init_app(app)

def configure_database(app):

    @app.before_first_request
    def initialize_database():
        db.create_all()

    @app.teardown_request
    def shutdown_session(exception=None):
        db.session.remove()

def create_app():
    class ProductionConfig(object):
        DEBUG = False
        
        basedir = '.'

        # Security
        SESSION_COOKIE_HTTPONLY = True
        REMEMBER_COOKIE_HTTPONLY = True
        REMEMBER_COOKIE_DURATION = 3600

        # PostgreSQL database
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db.sqlite3')
        SQLALCHEMY_TRACK_MODIFICATIONS = False

    
    app = Flask(__name__)
    app.config.from_object(ProductionConfig)
    register_extensions(app)
    configure_database(app)
    index_dir_path = 'indexes/'
    image_dir_path = 'images/'
    instance_dir_path = 'instance/'
    if not os.path.exists(index_dir_path):
        os.makedirs(index_dir_path)
    if not os.path.exists(image_dir_path):
        os.makedirs(image_dir_path)
    if not os.path.exists(instance_dir_path):
        os.makedirs(instance_dir_path)
    return app