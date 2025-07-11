import Image from 'next/image';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

interface MediaCardProps {
  id: string;
  title: string;
  slug: string;
  mediaType: string;
  poster?: string;
  rating?: number;
  releaseYear?: number;
}

export default function MediaCard({ id, title, slug, mediaType, poster, rating, releaseYear }: MediaCardProps) {
  // Generate link based on media type
  const href = `/${slug}`;
  
  // Default poster if none provided
  const posterUrl = poster || 'https://placehold.co/300x450?text=No+Image';
  
  return (
    <div className="card">
      <Link href={href}>
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-bold truncate">{title}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-300">
                {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} {releaseYear && `• ${releaseYear}`}
              </span>
              {rating && (
                <div className="flex items-center text-yellow-400">
                  <FiStar className="mr-1" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}