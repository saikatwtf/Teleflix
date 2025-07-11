import asyncio
import logging
from typing import Dict, Any, Optional, List
from imdb import Cinemagoer
from slugify import slugify

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Cinemagoer
ia = Cinemagoer()

async def search_imdb(title: str, year: Optional[int] = None, media_type: str = "movie") -> Optional[Dict[str, Any]]:
    """
    Search IMDb for a title and return metadata
    """
    try:
        # Run IMDb search in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        search_results = await loop.run_in_executor(
            None, lambda: ia.search_movie(title)
        )
        
        if not search_results:
            return None
        
        # Filter by year if provided
        if year:
            filtered_results = [m for m in search_results if m.get('year') == year]
            if filtered_results:
                search_results = filtered_results
        
        # Filter by type if needed
        kind_filter = {
            "movie": "movie",
            "series": "tv series",
            "anime": "tv series"  # Anime is usually categorized as TV series
        }
        
        filtered_by_kind = [m for m in search_results if m.get('kind') == kind_filter.get(media_type)]
        if filtered_by_kind:
            search_results = filtered_by_kind
        
        # Get the first result
        movie_id = search_results[0].movieID
        
        # Get full movie data
        movie = await loop.run_in_executor(
            None, lambda: ia.get_movie(movie_id, info=['main', 'plot'])
        )
        
        # Extract relevant data
        result = {
            "imdb_id": movie.movieID,
            "title": movie.get('title'),
            "slug": slugify(movie.get('title')),
            "plot": movie.get('plot outline', ''),
            "rating": movie.get('rating'),
            "genres": movie.get('genres', []),
            "release_year": movie.get('year'),
            "poster": movie.get('full-size cover url', movie.get('cover url'))
        }
        
        return result
    except Exception as e:
        logger.error(f"Error fetching IMDb data: {e}")
        return None