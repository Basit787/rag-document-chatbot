from pydantic import BaseModel, EmailStr


class SignIn(BaseModel):
    email: EmailStr
    password: str


class SignUp(BaseModel):
    name: str
    age: int
    email: EmailStr
    password: str
    confirm_password: str


class AuthResponse(BaseModel):
    access_token: str
