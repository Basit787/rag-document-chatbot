import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from security.hash_helper import HashHelper
from security.auth_handler import AuthHandler
from routers.users.model import User
from .schema import SignIn, SignUp, AuthResponse
from .repository import AuthRepository

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.auth_repository = AuthRepository(db)

    def signup(self, data: SignUp):
        try:
            if data.password != data.confirm_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Passwords do not match.",
                )

            existing_user = self.auth_repository.get_user_by_email(data.email)

            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists.",
                )

            user = User(
                name=data.name,
                age=data.age,
                email=data.email,
                password=HashHelper.get_hash_password(data.password),
            )

            user = self.auth_repository.create_user(user)
            token = AuthHandler.sign_in_jwt(str(user.id))

            return AuthResponse(
                access_token=token,
            )

        except HTTPException:
            raise
        except Exception:
            logger.exception("Error while signing up user")
            raise HTTPException(
                status_code=500,
                detail="Failed to sign up user.",
            )

    def signin(self, data: SignIn):
        try:
            user = self.auth_repository.get_user_by_email(data.email)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                )

            if not HashHelper.verify_password(
                data.password,
                user.password,
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password.",
                )

            token = AuthHandler.sign_in_jwt(str(user.id))

            return AuthResponse(
                access_token=token,
            )

        except HTTPException:
            raise
        except Exception:
            logger.exception("Error while signing in user")
            raise HTTPException(
                status_code=500,
                detail="Failed to sign in user.",
            )
