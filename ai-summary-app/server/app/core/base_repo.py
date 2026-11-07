from fastapi import HTTPException, status
from sqlalchemy.orm import Session


class BaseRepository:
    model = None

    def __init__(self, session: Session):
        self.session = session

    def create(self, instance):
        try:
            self.session.add(instance)
            self.session.commit()
            self.session.refresh(instance)
            return instance
        except Exception:
            self.session.rollback()
            raise

    def get_all(self):
        return self.session.query(self.model).all()

    def get_by_id(self, obj_id):
        obj = self.session.query(self.model).filter(self.model.id == obj_id).first()
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} not found",
            )
        return obj

    def get_by_field(self, field: str, value):
        return (
            self.session.query(self.model)
            .filter(getattr(self.model, field) == value)
            .first()
        )

    def get_by_email(self, email: str):
        return self.get_by_field("email", email)

    def update(self, obj_id, data: dict):
        obj = self.get_by_id(obj_id)
        for key, value in data.items():
            setattr(obj, key, value)
        try:
            self.session.commit()
            self.session.refresh(obj)
            return obj
        except Exception:
            self.session.rollback()
            raise

    def delete(self, obj_id):
        obj = self.get_by_id(obj_id)
        try:
            self.session.delete(obj)
            self.session.commit()
            return {"message": f"{self.model.__name__} deleted successfully"}
        except Exception:
            self.session.rollback()
            raise
