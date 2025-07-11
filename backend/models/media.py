from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class MediaType(str, Enum):
    MOVIE = "movie"
    SERIES = "series"
    ANIME = "anime"

class FileInfo(BaseModel):
    file_id: str
    file_size: int
    quality: str
    source: Optional[str] = None
    format: Optional[str] = None
    bot_index: int = 0
    
class Episode(BaseModel):
    episode_number: int
    title: Optional[str] = None
    files: List[FileInfo] = []
    
class Season(BaseModel):
    season_number: int
    title: Optional[str] = None
    episodes: Dict[int, Episode] = {}
    
class Media(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    slug: str
    media_type: MediaType
    imdb_id: Optional[str] = None
    tmdb_id: Optional[str] = None
    poster: Optional[str] = None
    backdrop: Optional[str] = None
    plot: Optional[str] = None
    rating: Optional[float] = None
    genres: List[str] = []
    release_year: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # For movies
    files: List[FileInfo] = []
    
    # For series/anime
    seasons: Dict[int, Season] = {}
    
    class Config:
        allow_population_by_field_name = True

class MediaResponse(BaseModel):
    id: str
    title: str
    slug: str
    media_type: MediaType
    poster: Optional[str] = None
    rating: Optional[float] = None
    genres: List[str] = []
    release_year: Optional[int] = None
    
class SearchResponse(BaseModel):
    results: List[MediaResponse]
    total: int