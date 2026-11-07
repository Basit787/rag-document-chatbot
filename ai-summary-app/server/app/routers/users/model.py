from sqlalchemy import Column, Integer, String, Enum
from core.database import Base
from routers.users.schema import Role


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    age = Column(Integer)
    email = Column(String(255), unique=True)
    password = Column(String(255))
    role = Column(
        Enum(Role),
        default=Role.USER,
        nullable=False,
    )
