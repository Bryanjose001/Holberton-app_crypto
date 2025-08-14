from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.persistence.repository import SQLAlchemyRepository
from app.persistence.user_repository import UserRepository

class HBnBFacade:
    def __init__(self):
        # Repositoios para otros modelos
        self.user_repo = UserRepository()  # Using UserRepository for user management

    # Placeholder method for creating a user
    def create_user(self, user_data: dict):
        """
        Create a new user, hash their password, and save them to the repository.
        """
        # Instantiate User model with plaintext password (constructor handles hashing)
        user = User(
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            email=user_data['email'],
            is_admin=user_data.get('is_admin', False),
        )
        user.hash_password(user_data['password'])  # Ensure password is hashed
        # Save to repository
        self.user_repo.add(user)
        return user


    def get_user(self, user_id):
            return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_attribute('email', email)
    
    def update_user(self, user_id, user_data):
        user = self.user_repo.get(user_id)
        if not user:
            return None
        for key, value in user_data.items():
            setattr(user, key, value)
        self.place_repo.update(user_id, user)
        return user


    def delete_user(self, user_id):
        user = self.user_repo.get(user_id) 
        if not user:
            return None
        self.user_repo.delete(user_id)
        return user
        #print(f"User {self.email} deleted successfully.")
        #return user