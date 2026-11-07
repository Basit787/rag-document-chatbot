import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from .schema import UserCreate, UserUpdate
from .repository import UserRepository

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def get_all_users(self):
        try:
            return self.user_repository.get_all_users()
        except HTTPException:
            raise
        except Exception:
            logger.exception("Error while fetching all users")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch users",
            )

    def get_user_by_id(self, user_id: int):
        try:
            return self.user_repository.get_user_by_id(user_id)
        except HTTPException:
            raise
        except Exception:
            logger.exception(f"Error while fetching user with id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch user",
            )

    def create_user(self, user: UserCreate):
        try:
            return self.user_repository.create_user(user)
        except HTTPException:
            raise
        except Exception:
            logger.exception("Error while creating user")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user",
            )

    def update_user(self, user_id: int, user: UserUpdate):
        try:
            return self.user_repository.update_user(user_id, user)
        except HTTPException:
            raise
        except Exception:
            logger.exception(f"Error while updating user with id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user",
            )

    def delete_user(self, user_id: int):
        try:
            return self.user_repository.delete_user(user_id)
        except HTTPException:
            raise
        except Exception:
            logger.exception(f"Error while deleting user with id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user",
            )
