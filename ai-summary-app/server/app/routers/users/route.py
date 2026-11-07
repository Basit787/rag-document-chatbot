from fastapi import APIRouter, Depends
from .dependencies import get_user_service
from .schema import UserCreate, UserResponse, UserUpdate
from .service import UserService
from typing import List

user_router = APIRouter()


@user_router.get("/", response_model=List[UserResponse])
def get_users(
    service: UserService = Depends(get_user_service),
):
    return service.get_all_users()


@user_router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: str, service: UserService = Depends(get_user_service)):
    return service.get_user_by_id(user_id)


@user_router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    service: UserService = Depends(get_user_service),
):
    return service.create_user(user)


@user_router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    service: UserService = Depends(get_user_service),
):
    return service.update_user(user_id, user)


@user_router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    return service.delete_user(user_id)
