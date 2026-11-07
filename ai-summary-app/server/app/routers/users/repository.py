from fastapi import HTTPException, status
from core.base_repo import BaseRepository
from security.hash_helper import HashHelper
from .model import User
from .schema import UserCreate, UserUpdate


class UserRepository(BaseRepository):
    model = User

    def create_user(self, user: UserCreate):
        existing_user = (
            self.session.query(User).filter(User.email == user.email).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )

        hashed_password_user = User(
            name=user.name,
            age=user.age,
            email=user.email,
            password=HashHelper.get_hash_password(user.password),
        )
        return self.create(hashed_password_user)

    def get_all_users(self):
        return self.get_all()

    def get_user_by_id(self, user_id: int):
        return self.get_by_id(user_id)

    def update_user(self, user_id: int, user: UserUpdate):
        data = user.model_dump(exclude_unset=True)
        if "password" in data:
            data["password"] = HashHelper.get_hash_password(data["password"])
        return self.update(user_id, data)

    def delete_user(self, user_id: int):
        self.delete(user_id)
        return {"message": "User deleted successfully"}
