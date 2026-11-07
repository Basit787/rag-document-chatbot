from fastapi import APIRouter, Depends
from routers.users.schema import UserResponse
from core.deps import AuthRequired
from .schema import SignIn, SignUp
from .service import AuthService
from .dependencies import get_auth_service

auth_router = APIRouter()


@auth_router.post("/signup")
def signup(
    user: SignUp,
    service: AuthService = Depends(get_auth_service),
):
    return service.signup(user)


@auth_router.post("/signin")
def signin(
    user: SignIn,
    service: AuthService = Depends(get_auth_service),
):
    return service.signin(user)


@auth_router.get("/current-user")
def get_current_user_f(user: UserResponse = AuthRequired):
    return user
