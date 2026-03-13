from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import sessionLocal
import crud, schemas

router = APIRouter(prefix="/chart", tags=["chart"])

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.ChartDataResponse])
def read_chart(db: Session = Depends(get_db)):
    return crud.get_chart_data(db)