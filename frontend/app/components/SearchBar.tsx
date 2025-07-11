"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  media_type: string;
  poster?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
      setResults(response.data.results);
      setShowResults(true);
    } catch (error) {
      // Silent fail in production
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  const handleResultClick = (slug: string) => {
    router.push(`/${slug}`);
    setShowResults(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, series, anime..."
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <FiSearch />
        </div>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX />
          </button>
        )}
      </form>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto">
          <ul>
            {results.map((result) => (
              <li key={result.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                <button
                  onClick={() => handleResultClick(result.slug)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  {result.poster && (
                    <div className="w-10 h-14 relative mr-3 flex-shrink-0">
                      <img
                        src={result.poster}
                        alt={result.title}
                        className="object-cover w-full h-full rounded"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {result.media_type.charAt(0).toUpperCase() + result.media_type.slice(1)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            <li className="px-4 py-2 text-center">
              <button
                onClick={handleSubmit}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                See all results
              </button>
            </li>
          </ul>
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-5 h-5 border-t-2 border-primary-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}