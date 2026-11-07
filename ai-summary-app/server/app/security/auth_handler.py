import time
import jwt
from fastapi import HTTPException, status
from core.config import Config

class AuthHandler:
    @staticmethod
    def sign_in_jwt(user_id: str) -> str:
        payload = {
            "user_id": user_id,
            "exp": int(time.time()) + 900,  # Token expires in 15 minutes
        }

        return jwt.encode(
            payload,
            Config.JWT_SECRET,
            algorithm=Config.JWT_ALGORITHM,
        )

    @staticmethod
    def decode_jwt(token: str) -> dict:
        try:
            return jwt.decode(
                token,
                Config.JWT_SECRET,
                algorithms=[Config.JWT_ALGORITHM],
            )

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please sign in again.",
            )

        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )
