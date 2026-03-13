from sqlalchemy.orm import Session
from models import Transaction, MonthlyFund
from sqlalchemy import extract, func, desc
from fastapi import HTTPException
from calendar import monthrange

# Transaction


def create_transaction(db: Session, transaction):
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_transactions(year, month, db: Session):
    fund = db.query(MonthlyFund).filter(
        MonthlyFund.year == year,
        MonthlyFund.month == month
    ).first()

    if not fund:
        return []

    db_transaction = db.query(Transaction).filter(
        Transaction.fund_id == fund.id
    ).order_by(Transaction.date, Transaction.id).all()

    total = 0
    result = []

    for t in db_transaction:
        total += t.amount

        result.append({
            "id": t.id,
            "store_name": t.store_name,
            "date": t.date,
            "amount": t.amount,
            "cumulative": total,
            "fund_id": t.fund_id,
        })
    return result


def update_transaction(db: Session, transaction_id: int, transaction):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = transaction.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(db_transaction)
    db.commit()

    return {"detail": "Transaction deleted"}

# def create_category(db: Session, category):
#     db_category = Category(**category.dict())
#     db.add(db_category)
#     db.commit()
#     db.refresh(db_category)
#     return db_category

# def get_category(db: Session):
#     return db.query(Category).all()


def create_fund(db: Session, fund):
    existing = db.query(MonthlyFund).filter(
        MonthlyFund.year == fund.year,
        MonthlyFund.month == fund.month
    ).first()

    if existing:
        
        print("エラー")
        
        raise HTTPException(
            status_code=400,
            detail="この年月の予算はすでに登録されています"
        )

    print("追加")
    db_fund = MonthlyFund(**fund.dict())
    db.add(db_fund)
    db.commit()
    db.refresh(db_fund)
    return db_fund


def get_funds(db: Session, year: int, month: int):
    db_fund = db.query(MonthlyFund).filter(
        MonthlyFund.year == year,
        MonthlyFund.month == month
    ).first()
    return db_fund


def update_fund(year: int, month: int, new_added_amount: int, db: Session):
    db_fund = db.query(MonthlyFund).filter(
        MonthlyFund.year == year,
        MonthlyFund.month == month
    ).first()
    if not db_fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    db_fund.added_amount = new_added_amount
    db.commit()
    db.refresh(db_fund)
    return db_fund


def delete_fund(year: int, month: int, db: Session):
    db_fund = db.query(MonthlyFund).filter(
        MonthlyFund.year == year,
        MonthlyFund.month == month
    ).first()

    if not db_fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    db.delete(db_fund)
    db.commit()
    return {"detail": "Fund deleted"}

# 自動繰越処理


def get_balance(db: Session, year: int, month: int):

    # それまでの追加金の合計
    total_added = db.query(
        func.sum(MonthlyFund.added_amount)
    ).filter(
        (MonthlyFund.year < year) |
        ((MonthlyFund.year == year) & (MonthlyFund.month <= month))
    ).scalar() or 0

    # それまでの支出の合計
    total_expense = db.query(
        func.sum(Transaction.amount)
    ).join(MonthlyFund).filter(
        (MonthlyFund.year < year) |
        ((MonthlyFund.year == year) & (MonthlyFund.month <= month))
    ).scalar() or 0

    # 残高
    return total_added - total_expense


def get_available_months(db: Session):
    results = db.query(
        MonthlyFund.year,
        MonthlyFund.month
    ).distinct().order_by(desc(MonthlyFund.year), desc(MonthlyFund.month)).all()
    print(results)
    return [{"year": int(r.year), "month": int(r.month)} for r in results]


def get_total_amount(db: Session):
    db_transaction = db.query(func.sum(Transaction.amount)).scalar()
    db_fund = db.query(func.sum(MonthlyFund.added_amount)).scalar()

    return {"fund": db_fund, "transaction": db_transaction}


def get_month_summary(year: int, month: int, db: Session):

    # 今月の予算
    fund = db.query(MonthlyFund).filter(
        MonthlyFund.year == year,
        MonthlyFund.month == month
    ).first()

    if not fund:
        return {
            "year": year,
            "month": month,
            "fund": 0,
            "total": 0,
            "carry_over_prev": 0,
            "carry_over_next": 0,
        }

    total = sum(t.amount for t in fund.transactions)

    # print(fund.transactions.all())

    # すべての月のお金を足したやつ
    fund_amount = fund.added_amount

    # 前月計算
    if month == 1:
        prev_year = year - 1
        prev_month = 12
    else:
        prev_year = year
        prev_month = month - 1

    # 再起処理　前の月にどんどん戻るってcarry_over_nextを足す
    prev_summary = get_month_summary(prev_year, prev_month, db)

    carry_over_prev = prev_summary["carry_over_next"]
    available_this_month = fund_amount + carry_over_prev
    carry_over_next = available_this_month - total

    return {
        "year": year,
        "month": month,
        "fund": fund_amount,
        "total": total,
        "carry_over_prev": carry_over_prev,
        "carry_over_next": carry_over_next,
    }


def get_chart_data(db: Session):
    results = (
        db.query(
            MonthlyFund.year,
            MonthlyFund.month,
            func.coalesce(func.sum(Transaction.amount), 0).label("total")
        )
        .outerjoin(Transaction, Transaction.fund_id == MonthlyFund.id)
        .group_by(MonthlyFund.year, MonthlyFund.month)
        .order_by(MonthlyFund.year, MonthlyFund.month)
        .all()
    )
    
    return [
        {
            "year": r.year,
            "month": r.month,
            "total": r.total
        } for r in results
    ]

def get_existCheck(db: Session, year: int, month: int):
    db_monthlyFund = db.query(
        db.query(MonthlyFund).filter(
            MonthlyFund.year == year,
            MonthlyFund.month == month
        ).exists()
    ).scalar()
    
    
    return {"exists": db_monthlyFund}

def get_store_name(db: Session):
    db_transaction = db.query(
        Transaction.store_name, func.count(Transaction.id).label("usage_count")
    ).group_by(
        Transaction.store_name
    ).order_by(
        desc("usage_count")
    ).all()
    return db_transaction