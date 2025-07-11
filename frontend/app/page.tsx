import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="p-6 space-y-12">
      <h1 className="text-3xl font-bold">Welcome to Teleflix</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/movies" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center">Movies</Link>
        <Link href="/series" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center">Series</Link>
        <Link href="/anime" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center">Anime</Link>
        <Link href="/recent" className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg text-center">Recent</Link>
      </div>
    </main>
  );
}