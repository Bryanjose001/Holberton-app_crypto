from app.models.base_entity import BaseModel
from flask_bcrypt import Bcrypt
from app.extensions import db
from sqlalchemy.orm import relationship

bcrypt = Bcrypt()

class User(BaseModel):
    """User model for the HBnB application."""
    __tablename__ = 'users'
    
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    places = relationship('Place', backref='places_user', lazy=True)
    reviews = relationship('Review', backref='reviews_user', lazy=True)
    
    def __init__(self, first_name: str, last_name: str, email: str, is_admin: bool = False):
        super().__init__()
        if not first_name or not last_name:
            raise ValueError("must be a non-empty string")
        if len(first_name) > 50 or len(last_name) > 50:
            raise ValueError("must be 50 char or fewer")
        if not email or "@" not in email:
            raise ValueError("A valid email address is required")

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin

    def register(self):
        #print(f"Registering user: {self.email}")
        pass

    def update_profile(self):
        #print(f"Updating profile for user: {self.email}")
        pass

    def delete(self):
        #print(f"Deleting user: {self.email}")
        pass

    def hash_password(self, password: str):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password: str) ->bool:
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)
