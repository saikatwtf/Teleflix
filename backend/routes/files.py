from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import files_collection
from config import BOT_TOKENS

router = APIRouter()

@router.get("/file/{file_id}")
async def get_file_link(file_id: str):
    """
    Get download link for a file
    """
    file = await files_collection.find_one({"file_id": file_id})
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get bot token for this file
    bot_index = file.get("bot_index", 0)
    if bot_index >= len(BOT_TOKENS):
        bot_index = 0
    
    bot_token = BOT_TOKENS[bot_index]
    
    # Generate download link
    download_link = f"https://api.telegram.org/file/bot{bot_token}/{file_id}"
    
    return {
        "file_id": file_id,
        "download_link": download_link,
        "file_size": file.get("file_size"),
        "quality": file.get("quality"),
        "source": file.get("source"),
        "format": file.get("format")
    }

@router.get("/stream/{file_id}")
async def get_stream_link(file_id: str):
    """
    Get streaming link for a file
    """
    file = await files_collection.find_one({"file_id": file_id})
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get bot token for this file
    bot_index = file.get("bot_index", 0)
    if bot_index >= len(BOT_TOKENS):
        bot_index = 0
    
    bot_token = BOT_TOKENS[bot_index]
    
    # Generate streaming link
    stream_link = f"https://api.telegram.org/file/bot{bot_token}/{file_id}"
    
    return {
        "file_id": file_id,
        "stream_link": stream_link,
        "file_size": file.get("file_size"),
        "quality": file.get("quality"),
        "source": file.get("source"),
        "format": file.get("format")
    }