import os
from dotenv import load_dotenv

# 🔥 קריטי: טעינת משתני הסביבה בשורה הראשונה, לפני כל ייבוא אחר!
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from exceptions import register_exception_handlers
from routers.review import router as review_router

app = FastAPI(
    title="Git Scout AI API",
    description="Backend API for reviewing GitHub developer profiles.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(review_router)