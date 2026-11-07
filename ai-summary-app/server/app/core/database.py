from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import Config

SQLALCHEMY_DATABASE_URL = Config.DATABASE_URL

# create engine and pass db_url
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Base
Base = declarative_base()
