from fastapi import Depends, HTTPException, status, Request
import logging
from security.auth_handler import AuthHandler
from routers.users.service import UserService
from sqlalchemy.orm import Session
from core.database import get_db
from routers.users.schema import UserResponse

logger = logging.getLogger(__name__)


def authorize_user(
    request: Request,
    db: Session = Depends(get_db),
):
    authorization = request.headers.get("Authorization")

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing.",
        )

    try:
        scheme, token = authorization.split()

        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme.",
            )

        payload = AuthHandler.decode_jwt(token)

        user = UserService(db).get_user_by_id(int(payload["user_id"]))

        logger.info("User authenticated successfully.")

        return UserResponse(
            age=user.age, email=user.email, id=user.id, name=user.name, role=user.role
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header.",
        )


AuthRequired = Depends(authorize_user)
