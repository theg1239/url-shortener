'use client';

import { useState } from 'react';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center font-bold">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="flex flex-col">
            <input
              type="url"
              placeholder="Enter long URL"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full p-2 border border-black text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white p-2 hover:bg-gray-800 transition duration-300 ease-in-out disabled:bg-gray-400"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>
        {shortUrl && (
          <div className="mt-6 p-4 border border-black">
            <p className="mb-2 font-bold">Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {shortUrl}
            </a>
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 border border-black bg-gray-100">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
