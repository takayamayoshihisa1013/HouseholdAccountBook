from sqlalchemy import String, Integer, Date, ForeignKey, Column, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Integer, nullable=False)
    store_name = Column(String)
    date = Column(Date)
    
    fund_id = Column(
        Integer,
        ForeignKey("monthly_fund.id", ondelete="CASCADE"),
        nullable=False
    )
    
    fund = relationship("MonthlyFund", back_populates="transactions")
    
class MonthlyFund(Base):
    
    __tablename__ = "monthly_fund"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    added_amount = Column(Integer, nullable=False)
    
    transactions = relationship(
        "Transaction",
        back_populates="fund",
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        UniqueConstraint("year", "month", name="unique_year_month"),
    )