from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import sessionLocal
import crud

router = APIRouter(prefix="/balance", tags=["balance"])

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_balance(year: int, month: int, db: Session = Depends(get_db)):
    balance = crud.get_balance(db, year, month)
    return {"balance": balance}