from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import balance, funds, transactions, chart

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(balance.router)
app.include_router(funds.router)
app.include_router(transactions.router)
app.include_router(chart.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)



    