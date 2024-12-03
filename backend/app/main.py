from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import project
import logging

app = FastAPI()

# Configure CORS to allow requests from React running on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Updated to match React's port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Include routers
app.include_router(project.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Documentation Generator API"}