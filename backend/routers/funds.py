from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import sessionLocal
import crud, schemas

router = APIRouter(prefix="/funds", tags=["funds"])

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.FundResponse)
def create(fund: schemas.FundCreate, db: Session = Depends(get_db)):
    return crud.create_fund(db, fund)

@router.get("/", response_model=schemas.FundResponse)
def read(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_funds(db, year, month)

@router.patch("/{year}/{month}", response_model=schemas.FundResponse)
def patch(year:int, month: int, body: schemas.FundUpdate, db: Session = Depends(get_db)):
    return crud.update_fund(year, month, body.added_amount, db)

@router.delete("/{year}/{month}")
def delete(year: int, month: int, db: Session = Depends(get_db)):
    return crud.delete_fund(year, month, db)

@router.get("/totalAmount", response_model=schemas.TotalAmountResponse)
def totalAmount(db: Session = Depends(get_db)):
    return crud.get_total_amount(db)
    
@router.get("/months")
def read_months(db: Session = Depends(get_db)):
    return crud.get_available_months(db)

@router.get("/exists/{year}/{month}", response_model=schemas.ResponseExistCheck)
def read_exists(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_existCheck(db, year, month)