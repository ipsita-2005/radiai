"""
Ashwini - Radiology Intelligence System
Main FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import connect_to_database, close_database_connection
from routers import analysis

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database
    await connect_to_database()
    yield
    # Shutdown: Close database connection
    await close_database_connection()

# Create FastAPI app with lifespan
app = FastAPI(
    title="Ashwini Radiology Intelligence System",
    description="Multi-modal medical image analysis platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for uploads and reports
os.makedirs("uploads", exist_ok=True)
os.makedirs("reports", exist_ok=True)
os.makedirs("heatmaps", exist_ok=True)

# Mount static files for serving reports and heatmaps
app.mount("/reports", StaticFiles(directory="reports"), name="reports")
app.mount("/heatmaps", StaticFiles(directory="heatmaps"), name="heatmaps")

# Include routers
app.include_router(analysis.router, prefix="/api", tags=["Analysis"])

@app.get("/")
async def root():
    return {
        "message": "Ashwini Radiology Intelligence System API",
        "version": "1.0.0",
        "endpoints": [
            "/api/analyse - POST - Upload and analyze medical images",
            "/api/history - GET - Get analysis history",
            "/api/report/{id} - GET - Download PDF report"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
