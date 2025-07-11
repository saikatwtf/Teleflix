import { Metadata } from 'next';
import Link from 'next/link';
import { FiFilter } from 'react-icons/fi';
import MediaCard from '../components/MediaCard';

// Define interface for media items
interface MediaItem {
  id: string;
  title: string;
  slug: string;
  media_type: string;
  poster?: string;
  rating?: number;
  release_year?: number;
}

// Define interface for search results
interface SearchResponse {
  results: MediaItem[];
  total: number;
}

// Define interface for genres response
interface GenresResponse {
  genres: string[];
}

// Metadata
export const metadata: Metadata = {
  title: 'Search Results - Teleflix',
  description: 'Search results for movies, TV series, and anime on Teleflix.',
};

// Fetch search results
async function searchMedia(query: string, mediaType?: string, genre?: string, sort?: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.append('q', query);
  
  if (mediaType) params.append('media_type', mediaType);
  if (genre) params.append('genre', genre);
  if (sort) params.append('sort', sort);
  
  const res = await fetch(`${process.env.API_URL}/api/search?${params.toString()}`, { next: { revalidate: 60 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  
  return res.json();
}

// Fetch genres
async function getGenres(): Promise<GenresResponse> {
  const res = await fetch(`${process.env.API_URL}/api/genres`, { next: { revalidate: 3600 } });
  
  if (!res.ok) {
    return { genres: [] };
  }
  
  return res.json();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string; media_type?: string; genre?: string; sort?: string };
}) {
  const query = searchParams.q || '';
  const mediaType = searchParams.media_type;
  const genre = searchParams.genre;
  const sort = searchParams.sort || 'recent';
  
  let searchResults: SearchResponse = { results: [], total: 0 };
  let genresList: GenresResponse = { genres: [] };
  
  try {
    // Fetch search results and genres in parallel
    const [resultsData, genresData] = await Promise.all([
      searchMedia(query, mediaType, genre, sort),
      getGenres()
    ]);
    
    searchResults = resultsData;
    genresList = genresData;
  } catch (error) {
    // Error handled by showing empty state
  }
  
  // Generate filter URLs
  const getFilterUrl = (type?: string, g?: string, s?: string) => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (type) params.append('media_type', type);
    if (g) params.append('genre', g);
    if (s) params.append('sort', s);
    
    return `/search?${params.toString()}`;
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Results for "{query}"</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {searchResults.total} results
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="flex items-center mb-4">
          <FiFilter className="mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Media Type Filter */}
          <div>
            <h3 className="font-medium mb-2">Media Type</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={getFilterUrl(undefined, genre, sort)}
                className={`px-3 py-1 rounded-full text-sm ${
                  !mediaType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                All
              </Link>
              <Link
                href={getFilterUrl('movie', genre, sort)}
                className={`px-3 py-1 rounded-full text-sm ${
                  mediaType === 'movie'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Movies
              </Link>
              <Link
                href={getFilterUrl('series', genre, sort)}
                className={`px-3 py-1 rounded-full text-sm ${
                  mediaType === 'series'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Series
              </Link>
              <Link
                href={getFilterUrl('anime', genre, sort)}
                className={`px-3 py-1 rounded-full text-sm ${
                  mediaType === 'anime'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Anime
              </Link>
            </div>
          </div>
          
          {/* Genre Filter */}
          <div>
            <h3 className="font-medium mb-2">Genre</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={getFilterUrl(mediaType, undefined, sort)}
                className={`px-3 py-1 rounded-full text-sm ${
                  !genre
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                All
              </Link>
              {genresList.genres.slice(0, 5).map((g: string) => (
                <Link
                  key={g}
                  href={getFilterUrl(mediaType, g, sort)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    genre === g
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Sort Filter */}
          <div>
            <h3 className="font-medium mb-2">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={getFilterUrl(mediaType, genre, 'recent')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sort === 'recent'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Recent
              </Link>
              <Link
                href={getFilterUrl(mediaType, genre, 'popular')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sort === 'popular'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Popular
              </Link>
              <Link
                href={getFilterUrl(mediaType, genre, 'az')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sort === 'az'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                A-Z
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results */}
      {searchResults.results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {searchResults.results.map((media: MediaItem) => (
            <MediaCard
              key={media.id}
              id={media.id}
              title={media.title}
              slug={media.slug}
              mediaType={media.media_type}
              poster={media.poster}
              rating={media.rating}
              releaseYear={media.release_year}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No results found for "{query}".</p>
          <p className="mt-2">Try different keywords or filters.</p>
        </div>
      )}
    </div>
  );
}