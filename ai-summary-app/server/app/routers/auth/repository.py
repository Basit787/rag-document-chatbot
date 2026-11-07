from routers.users.model import User
from core.base_repo import BaseRepository


class AuthRepository(BaseRepository):
    model = User

    def get_user_by_email(self, email: str):
        return self.get_by_email(email)

    def create_user(self, user: User):
        return self.create(user)
