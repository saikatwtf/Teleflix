import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiPlay } from 'react-icons/fi';

// Define interfaces for season data
interface FileInfo {
  file_id: string;
  file_size: number;
  quality: string;
  source?: string;
  format?: string;
}

interface Episode {
  episode_number: number;
  title?: string;
  files: FileInfo[];
}

interface Season {
  season_number: number;
  title?: string;
  episodes: Record<string, Episode>;
}

interface MediaBasic {
  id: string;
  title: string;
  slug: string;
  media_type: string;
  poster?: string;
}

interface SeasonData {
  media: MediaBasic;
  season: Season;
}

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string; season: string } 
}): Promise<Metadata> {
  const { slug, season } = params;
  
  try {
    const seasonData = await getSeasonData(slug, parseInt(season));
    const mediaTitle = seasonData.media.title;
    
    return {
      title: `${mediaTitle} - Season ${season} - Teleflix`,
      description: `Watch ${mediaTitle} Season ${season} on Teleflix`,
      openGraph: {
        title: `${mediaTitle} - Season ${season} - Teleflix`,
        description: `Watch ${mediaTitle} Season ${season} on Teleflix`,
        images: seasonData.media.poster ? [seasonData.media.poster] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Season Not Found - Teleflix',
    };
  }
}

// Fetch season data
async function getSeasonData(slug: string, season: number): Promise<SeasonData> {
  const res = await fetch(
    `${process.env.API_URL}/api/media/${slug}/season/${season}`,
    { next: { revalidate: 3600 } }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch season data');
  }
  
  return res.json();
}

export default async function SeasonPage({ 
  params 
}: { 
  params: { slug: string; season: string } 
}) {
  const { slug, season } = params;
  const seasonNumber = parseInt(season);
  
  let seasonData: SeasonData;
  try {
    seasonData = await getSeasonData(slug, seasonNumber);
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Season Not Found</h1>
        <p className="mb-6">The requested season could not be found.</p>
        <Link href={`/${slug}`} className="btn-primary">
          Return to Series Page
        </Link>
      </div>
    );
  }
  
  const { media, season: seasonDetails } = seasonData;
  const episodes = seasonDetails.episodes || {};
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href={`/${slug}`} className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline mb-4">
          <FiArrowLeft className="mr-2" />
          Back to {media.title}
        </Link>
        
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Season {seasonNumber}</h1>
          {seasonDetails.title && (
            <span className="text-gray-600 dark:text-gray-400">
              {seasonDetails.title}
            </span>
          )}
        </div>
      </div>
      
      {/* Episodes list */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
        
        {Object.keys(episodes).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(episodes).map(([episodeNum, episode]: [string, Episode]) => (
              <Link
                key={episodeNum}
                href={`/${slug}/season-${seasonNumber}/episode-${episodeNum}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Episode thumbnail (placeholder) */}
                  <div className="relative w-full md:w-48 h-32 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <FiPlay className="text-4xl text-gray-500 dark:text-gray-400" />
                  </div>
                  
                  {/* Episode details */}
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          Episode {episodeNum}
                          {episode.title && `: ${episode.title}`}
                        </h3>
                        
                        {/* File quality badges */}
                        {episode.files && episode.files.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {episode.files.map((file: FileInfo, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs"
                              >
                                {file.quality}
                                {file.source && ` • ${file.source}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-primary-600 dark:text-primary-400">
                        Watch
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No episodes available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}