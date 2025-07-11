import { Metadata } from 'next';
import Link from 'next/link';
import MediaCard from './components/MediaCard';

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

// Define interface for API response
interface MediaResponse {
  results: MediaItem[];
  total: number;
}

// Metadata
export const metadata: Metadata = {
  title: 'Teleflix - Home',
  description: 'Watch and download your favorite movies, TV series, and anime from Telegram channels.',
};

// Fetch recent media with fallback
async function getRecentMedia(): Promise<MediaResponse> {
  try {
    // Use optional chaining to handle undefined API_URL
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      return { results: [], total: 0 };
    }
    
    const res = await fetch(`${apiUrl}/api/recent?limit=12`, { 
      next: { revalidate: 3600 },
      cache: 'no-cache'
    });
    
    if (!res.ok) {
      return { results: [], total: 0 };
    }
    
    return res.json();
  } catch (error) {
    // Return empty results on any error
    return { results: [], total: 0 };
  }
}

export default async function Home() {
  // Get recent media with built-in error handling
  const recentMedia = await getRecentMedia();
  
  return (
    <div className="space-y-12 pb-8">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Teleflix</h1>
          <p className="text-lg md:text-xl mb-6">
            Stream and download your favorite movies, TV series, and anime directly from Telegram.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link href="/movies" className="bg-white text-primary-600 hover:bg-gray-100 px-5 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base">
              Browse Movies
            </Link>
            <Link href="/series" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-5 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base">
              Explore Series
            </Link>
            <Link href="/anime" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-5 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base">
              Discover Anime
            </Link>
          </div>
        </div>
      </section>
      
      {/* Quick access navigation */}
      <section className="px-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/movies" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold">Movies</h3>
          </Link>
          
          <Link href="/series" className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold">TV Series</h3>
          </Link>
          
          <Link href="/anime" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold">Anime</h3>
          </Link>
          
          <Link href="/recent" className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-4 text-center shadow-md transition-all hover:shadow-lg">
            <h3 className="text-lg font-bold">Recent</h3>
          </Link>
        </div>
      </section>
      
      {/* Recent uploads */}
      <section>
        <div className="flex justify-between items-center mb-4 md:mb-6 px-1">
          <h2 className="text-xl md:text-2xl font-bold">Recent Uploads</h2>
          <Link href="/recent" className="text-primary-600 dark:text-primary-400 hover:underline text-sm md:text-base">
            View All
          </Link>
        </div>
        
        {recentMedia.results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {recentMedia.results.map((media: MediaItem) => (
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
          <div className="text-center py-10 md:py-12 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No recent uploads available yet.</p>
            <p className="mt-2 text-gray-500 dark:text-gray-500">Check back soon for new content!</p>
          </div>
        )}
      </section>
      
      {/* Categories */}
      <section>
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 px-1">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Link href="/movies" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-5 md:p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg md:text-xl font-bold mb-2">Movies</h3>
            <p className="text-sm md:text-base">Explore our collection of movies from various genres.</p>
          </Link>
          
          <Link href="/series" className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-5 md:p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg md:text-xl font-bold mb-2">TV Series</h3>
            <p className="text-sm md:text-base">Binge-watch your favorite TV series with multiple seasons.</p>
          </Link>
          
          <Link href="/anime" className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-5 md:p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg md:text-xl font-bold mb-2">Anime</h3>
            <p className="text-sm md:text-base">Discover popular anime series and movies.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}