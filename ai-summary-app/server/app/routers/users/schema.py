from enum import Enum
from typing import Union
from pydantic import BaseModel, EmailStr


class Role(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserBase(BaseModel):
    name: str
    age: int
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    name: Union[str | None] = None
    age: Union[str | None] = None
    email: Union[EmailStr | None] = None
    password: Union[str | None] = None


class UserResponse(UserBase):
    id: int
    role: Role
