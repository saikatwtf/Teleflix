import { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import FileList from '../../../components/FileList';

// Generate metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string; season: string; episode: string } 
}): Promise<Metadata> {
  const { slug, season, episode } = params;
  
  try {
    const episodeData = await getEpisodeData(slug, parseInt(season), parseInt(episode));
    const mediaTitle = episodeData.media.title;
    
    return {
      title: `${mediaTitle} - S${season}E${episode} - Teleflix`,
      description: `Watch ${mediaTitle} Season ${season} Episode ${episode} on Teleflix`,
      openGraph: {
        title: `${mediaTitle} - S${season}E${episode} - Teleflix`,
        description: `Watch ${mediaTitle} Season ${season} Episode ${episode} on Teleflix`,
        images: episodeData.media.poster ? [episodeData.media.poster] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Episode Not Found - Teleflix',
    };
  }
}

// Fetch episode data
async function getEpisodeData(slug: string, season: number, episode: number) {
  const res = await fetch(
    `${process.env.API_URL}/api/media/${slug}/season/${season}/episode/${episode}`,
    { next: { revalidate: 3600 } }
  );
  
  if (!res.ok) {
    throw new Error('Failed to fetch episode data');
  }
  
  return res.json();
}

export default async function EpisodePage({ 
  params 
}: { 
  params: { slug: string; season: string; episode: string } 
}) {
  const { slug, season, episode } = params;
  const seasonNumber = parseInt(season);
  const episodeNumber = parseInt(episode);
  
  let episodeData;
  try {
    episodeData = await getEpisodeData(slug, seasonNumber, episodeNumber);
  } catch (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Episode Not Found</h1>
        <p className="mb-6">The requested episode could not be found.</p>
        <Link href={`/${slug}/season-${season}`} className="btn-primary">
          Return to Season Page
        </Link>
      </div>
    );
  }
  
  const { media, episode: episodeDetails } = episodeData;
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href={`/${slug}/season-${season}`} className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline mb-4">
          <FiArrowLeft className="mr-2" />
          Back to Season {season}
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">
          {media.title} - S{season}E{episode}
          {episodeDetails.title && `: ${episodeDetails.title}`}
        </h1>
      </div>
      
      {/* Video player placeholder */}
      <div className="mb-8">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">
            Select a file below to start watching
          </p>
        </div>
      </div>
      
      {/* Files */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Watch Episode</h2>
        <FileList files={episodeDetails.files || []} />
      </div>
      
      {/* Episode navigation */}
      <div className="flex justify-between mt-8">
        {episodeNumber > 1 && (
          <Link
            href={`/${slug}/season-${season}/episode-${episodeNumber - 1}`}
            className="btn-secondary"
          >
            Previous Episode
          </Link>
        )}
        
        <Link
          href={`/${slug}/season-${season}/episode-${episodeNumber + 1}`}
          className="btn-primary ml-auto"
        >
          Next Episode
        </Link>
      </div>
    </div>
  );
}