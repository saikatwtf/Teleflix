from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from database import media_collection
from bson.objectid import ObjectId

router = APIRouter()

@router.get("/media/{slug}")
async def get_media_by_slug(slug: str):
    """
    Get media details by slug
    """
    media = await media_collection.find_one({"slug": slug})
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Convert ObjectId to string
    media["_id"] = str(media["_id"])
    
    return media

@router.get("/media/id/{media_id}")
async def get_media_by_id(media_id: str):
    """
    Get media details by ID
    """
    try:
        media = await media_collection.find_one({"_id": media_id})
    except:
        raise HTTPException(status_code=400, detail="Invalid media ID")
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Convert ObjectId to string
    media["_id"] = str(media["_id"])
    
    return media

@router.get("/genres")
async def get_genres():
    """
    Get all available genres
    """
    genres = await media_collection.distinct("genres")
    return {"genres": genres}

@router.get("/media/{slug}/season/{season}")
async def get_season(slug: str, season: int):
    """
    Get season details for a series
    """
    media = await media_collection.find_one({"slug": slug})
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if media.get("media_type") not in ["series", "anime"]:
        raise HTTPException(status_code=400, detail="Not a series or anime")
    
    season_str = str(season)
    if season_str not in media.get("seasons", {}):
        raise HTTPException(status_code=404, detail="Season not found")
    
    # Convert ObjectId to string
    media["_id"] = str(media["_id"])
    
    # Return only the requested season
    return {
        "media": {
            "_id": media["_id"],
            "title": media["title"],
            "slug": media["slug"],
            "media_type": media["media_type"],
            "poster": media.get("poster"),
            "backdrop": media.get("backdrop"),
            "plot": media.get("plot"),
            "rating": media.get("rating"),
            "genres": media.get("genres", []),
            "release_year": media.get("release_year")
        },
        "season": media["seasons"][season_str]
    }

@router.get("/media/{slug}/season/{season}/episode/{episode}")
async def get_episode(slug: str, season: int, episode: int):
    """
    Get episode details for a series
    """
    media = await media_collection.find_one({"slug": slug})
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if media.get("media_type") not in ["series", "anime"]:
        raise HTTPException(status_code=400, detail="Not a series or anime")
    
    season_str = str(season)
    episode_str = str(episode)
    
    if season_str not in media.get("seasons", {}):
        raise HTTPException(status_code=404, detail="Season not found")
    
    if episode_str not in media["seasons"][season_str].get("episodes", {}):
        raise HTTPException(status_code=404, detail="Episode not found")
    
    # Convert ObjectId to string
    media["_id"] = str(media["_id"])
    
    # Return only the requested episode
    return {
        "media": {
            "_id": media["_id"],
            "title": media["title"],
            "slug": media["slug"],
            "media_type": media["media_type"],
            "poster": media.get("poster"),
            "backdrop": media.get("backdrop"),
            "plot": media.get("plot"),
            "rating": media.get("rating"),
            "genres": media.get("genres", []),
            "release_year": media.get("release_year")
        },
        "season": season,
        "episode": media["seasons"][season_str]["episodes"][episode_str]
    }