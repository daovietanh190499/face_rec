import os
import hashlib
import binascii

import uuid

from sqlalchemy import create_engine, Column, Integer, String, Float, Text, LargeBinary
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URI = 'sqlite:///./face_reg.db'

engine = create_engine(DATABASE_URI)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

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


class Users(Base):

    __tablename__ = 'Users'

    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True)
    password = Column(LargeBinary)
    role = Column(String(64))
    secret_key = Column(String(64), unique=True)
    access_key = Column(String(64), unique=True)

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

class People(Base):

    __tablename__ = 'People'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    name = Column(String(200))
    age = Column(Integer)
    gender = Column(String(64))
    type_role = Column(String(64))
    phone = Column(String(64))
    access_key = Column(String(64), unique=True)

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
    
class ChildrenPicker(Base):

    __tablename__ = 'ChildrenParent'

    id = Column(Integer, primary_key=True)
    child_access_key = Column(Integer)
    picker_access_key = Column(Integer)

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
    
class PeopleClasses(Base):
    
    __tablename__ = 'PeopleClasses'
    id = Column(Integer, primary_key=True)
    person_access_key = Column(String(64), unique=True)
    class_access_key = Column(Integer)

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
    
class Classes(Base):
    
    __tablename__ = 'Classes'

    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    user_id = Column(Integer)
    access_key = Column(String(64), unique=True)

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

class DefineImages(Base):

    __tablename__ = 'DefineImages'

    id = Column(Integer, primary_key=True)
    person_access_key = Column(String(64))
    image_id = Column(String(64), unique=True)

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


class Timeline(Base):

    __tablename__ = 'Timeline'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    person_access_key = Column(String(64))
    image_id = Column(String(64), unique=True)
    embedding = Column(Text)
    timestamp = Column(Float)

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
    
class PickUp(Base):
    
    __tablename__ = 'PickUp'

    id = Column(Integer, primary_key=True)
    child_access_key = Column(String(64))
    picker_access_key = Column(String(64))
    child_timeline = Column(Integer)
    picker_timeline = Column(Integer)
    

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


index_dir_path = 'indexes/'
image_dir_path = 'images/'
instance_dir_path = 'instance/'
if not os.path.exists(index_dir_path):
    os.makedirs(index_dir_path)
if not os.path.exists(image_dir_path):
    os.makedirs(image_dir_path)
if not os.path.exists(instance_dir_path):
    os.makedirs(instance_dir_path)