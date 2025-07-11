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
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg p-8 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Teleflix</h1>
          <p className="text-xl mb-6">
            Stream and download your favorite movies, TV series, and anime directly from Telegram.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/movies" className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 rounded-full font-bold">
              Browse Movies
            </Link>
            <Link href="/series" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-6 py-3 rounded-full font-bold">
              Explore Series
            </Link>
          </div>
        </div>
      </section>
      
      {/* Recent uploads */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Uploads</h2>
          <Link href="/recent" className="text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </div>
        
        {recentMedia.results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No media available yet.</p>
          </div>
        )}
      </section>
      
      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/movies" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">Movies</h3>
            <p>Explore our collection of movies from various genres.</p>
          </Link>
          
          <Link href="/series" className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">TV Series</h3>
            <p>Binge-watch your favorite TV series with multiple seasons.</p>
          </Link>
          
          <Link href="/anime" className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-2">Anime</h3>
            <p>Discover popular anime series and movies.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}