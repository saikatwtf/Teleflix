import asyncio
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import API_PREFIX, SITE_PASSWORD
from database import create_indexes
from routes import search, media, files
from utils.sync import initialize_sync, sync_channel

app = FastAPI(title="Teleflix API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password middleware for protected sites
@app.middleware("http")
async def password_middleware(request: Request, call_next):
    if SITE_PASSWORD:
        # Skip password check for API endpoints
        if not request.url.path.startswith(API_PREFIX):
            auth_header = request.headers.get("Authorization")
            if not auth_header or auth_header != f"Bearer {SITE_PASSWORD}":
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Password required"}
                )
    
    response = await call_next(request)
    return response

# Include routers
app.include_router(search.router, prefix=API_PREFIX)
app.include_router(media.router, prefix=API_PREFIX)
app.include_router(files.router, prefix=API_PREFIX)

@app.on_event("startup")
async def startup_event():
    # Create database indexes
    await create_indexes()
    
    # Initialize Telegram sync
    await initialize_sync()
    
    # Sync channel in background
    asyncio.create_task(sync_channel())

@app.get("/")
async def root():
    return {"message": "Welcome to Teleflix API"}

@app.get(f"{API_PREFIX}/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)