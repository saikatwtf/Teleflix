from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from database import media_collection
from models.media import MediaResponse, SearchResponse

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., description="Search query"),
    media_type: Optional[str] = Query(None, description="Filter by media type (movie, series, anime)"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    sort: str = Query("recent", description="Sort by (recent, popular, az)")
):
    """
    Search for media by title, genre, or filename
    """
    # Build query
    query = {"$text": {"$search": q}}
    
    # Add filters
    if media_type:
        query["media_type"] = media_type
    
    if genre:
        query["genres"] = genre
    
    # Determine sort order
    sort_options = {
        "recent": [("created_at", -1)],
        "popular": [("rating", -1)],
        "az": [("title", 1)]
    }
    
    sort_order = sort_options.get(sort, sort_options["recent"])
    
    # Execute query
    cursor = media_collection.find(
        query,
        {"score": {"$meta": "textScore"}}
    ).sort(sort_order)
    
    # Get total count
    total = await media_collection.count_documents(query)
    
    # Convert to response model
    results = []
    async for doc in cursor:
        results.append(MediaResponse(
            id=doc["_id"],
            title=doc["title"],
            slug=doc["slug"],
            media_type=doc["media_type"],
            poster=doc.get("poster"),
            rating=doc.get("rating"),
            genres=doc.get("genres", []),
            release_year=doc.get("release_year")
        ))
    
    return SearchResponse(results=results, total=total)

@router.get("/recent", response_model=SearchResponse)
async def get_recent(
    limit: int = Query(20, description="Number of results to return"),
    media_type: Optional[str] = Query(None, description="Filter by media type")
):
    """
    Get recent uploads
    """
    # Build query
    query = {}
    if media_type:
        query["media_type"] = media_type
    
    # Execute query
    cursor = media_collection.find(query).sort("created_at", -1).limit(limit)
    
    # Get total count
    total = await media_collection.count_documents(query)
    
    # Convert to response model
    results = []
    async for doc in cursor:
        results.append(MediaResponse(
            id=doc["_id"],
            title=doc["title"],
            slug=doc["slug"],
            media_type=doc["media_type"],
            poster=doc.get("poster"),
            rating=doc.get("rating"),
            genres=doc.get("genres", []),
            release_year=doc.get("release_year")
        ))
    
    return SearchResponse(results=results, total=total)