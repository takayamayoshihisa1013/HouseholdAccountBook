from pydantic import BaseModel
import datetime
from typing import Optional

# Transaction
class TransactionCreate(BaseModel):
    amount: int
    store_name: str
    date: datetime.date
    fund_id: int

class TransactionResponse(TransactionCreate):
    id: int
    cumulative: Optional[int] = None
    
    class Config:
        from_attributes = True

class TransactionUpdate(BaseModel):
    amount: Optional[int] = None
    store_name: Optional[str] = None
    date: Optional[datetime.date] = None

# Monthly Fund
class FundCreate(BaseModel):
    year: int
    month: int
    added_amount: int

class FundResponse(FundCreate):
    id: int
    
    class Config:
        from_attributes = True

class FundUpdate(BaseModel):
    added_amount: int

class FundDelete(BaseModel):
    year: int
    month: int

class TotalAmountResponse(BaseModel):
    fund: int
    transaction: int
    
    class Config:
        from_attributes = True

class SummaryResponse(BaseModel):
    year: int
    month: int
    fund: int
    total: int
    carry_over_prev: int
    carry_over_next: int
    
    class Config:
        from_attributes = True

class ChartDataResponse(BaseModel):
    year: int
    month: int
    total: int
    
    class Config:
        from_attributes = True

class ResponseExistCheck(BaseModel):
    exists: bool
    
    class Config:
        from_attributes = True

class ResponseStoreNameList(BaseModel):
    store_name: str
    
    class Config:
        from_attributes = True