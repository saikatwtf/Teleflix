import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Teleflix</h1>
        <p className="text-lg mb-6">
          Stream and download your favorite movies, TV series, and anime.
        </p>
      </section>
      
      {/* Navigation links */}
      <section>
        <h2 className="text-xl font-bold mb-4">Browse Content</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/movies" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center">
            Movies
          </Link>
          <Link href="/series" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center">
            Series
          </Link>
          <Link href="/anime" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center">
            Anime
          </Link>
          <Link href="/recent" className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg text-center">
            Recent
          </Link>
        </div>
      </section>
    </div>
  );
}