import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiCalendar, FiFilm, FiList } from 'react-icons/fi';
import FileList from '../components/FileList';

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    const media = await getMediaBySlug(slug);
    
    return {
      title: `${media.title} - Teleflix`,
      description: media.plot || `Watch ${media.title} on Teleflix`,
      openGraph: {
        title: `${media.title} - Teleflix`,
        description: media.plot || `Watch ${media.title} on Teleflix`,
        images: media.poster ? [media.poster] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Media Not Found - Teleflix',
    };
  }
}

// Fetch media by slug
async function getMediaBySlug(slug: string) {
  const res = await fetch(`${process.env.API_URL}/api/media/${slug}`, { next: { revalidate: 3600 } });
  
  if (!res.ok) {
    throw new Error('Failed to fetch media');
  }
  
  return res.json();
}

export default async function MediaPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  let media;
  try {
    media = await getMediaBySlug(slug);
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Media Not Found</h1>
        <p className="mb-6">The requested media could not be found.</p>
        <Link href="/" className="btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }
  
  // Determine if it's a movie or series/anime
  const isMovie = media.media_type === 'movie';
  
  return (
    <div>
      {/* Hero section with backdrop */}
      <div className="relative mb-8">
        {media.backdrop && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={media.backdrop}
              alt={media.title}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={media.poster || '/placeholder-poster.jpg'}
                  alt={media.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* Details */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{media.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                {media.release_year && (
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    <span>{media.release_year}</span>
                  </div>
                )}
                
                {media.rating && (
                  <div className="flex items-center text-yellow-400">
                    <FiStar className="mr-1" />
                    <span>{media.rating.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <FiFilm className="mr-1" />
                  <span>{media.media_type.charAt(0).toUpperCase() + media.media_type.slice(1)}</span>
                </div>
              </div>
              
              {media.genres && media.genres.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FiList className="mr-1" />
                    <span className="font-medium">Genres</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {media.genres.map((genre: string) => (
                      <Link
                        key={genre}
                        href={`/search?genre=${encodeURIComponent(genre)}`}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {media.plot && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Plot</h2>
                  <p className="text-gray-700 dark:text-gray-300">{media.plot}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content section */}
      <div className="max-w-7xl mx-auto px-4">
        {isMovie ? (
          /* Movie files */
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Watch {media.title}</h2>
            <FileList files={media.files || []} />
          </div>
        ) : (
          /* Series/Anime seasons */
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Seasons</h2>
            
            {Object.keys(media.seasons || {}).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(media.seasons).map(([seasonNum, season]: [string, any]) => (
                  <Link
                    key={seasonNum}
                    href={`/${slug}/season-${seasonNum}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      Season {seasonNum}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {Object.keys(season.episodes || {}).length} Episodes
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No seasons available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}