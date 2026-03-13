from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

db_path = os.getenv("DB_PATH")

DATABASE_URL = f"sqlite:///{db_path}"

print("DB_PATH:", db_path)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

sessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

Base = declarative_base()