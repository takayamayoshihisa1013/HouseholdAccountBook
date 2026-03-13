from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import sessionLocal
import crud, schemas

router = APIRouter(prefix="/transactions", tags=["transactions"])

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.TransactionResponse)
def create(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db, transaction)

@router.get("/", response_model=list[schemas.TransactionResponse])
def read(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_transactions(year, month, db)

@router.patch("/{transaction_id}", response_model=schemas.TransactionResponse)
def update(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    return crud.update_transaction(db, transaction_id, transaction)

@router.delete("/{transaction_id}")
def delete(transaction_id: int, db: Session = Depends(get_db)):
    return crud.delete_transaction(db, transaction_id)

@router.get("/summary/{year}/{month}", response_model=schemas.SummaryResponse)
def read_summary(year: int, month: int, db: Session = Depends(get_db)):
    return crud.get_month_summary(year, month, db)

@router.get("/storeNameList", response_model=list[schemas.ResponseStoreNameList])
def read_store_name(db: Session = Depends(get_db)):
    return crud.get_store_name(db)
