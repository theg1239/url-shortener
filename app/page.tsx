'use client';

import { useState } from 'react';

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const normalizeUrl = (url: string): string => {
    try {
      const trimmedUrl = url.trim();

      if (trimmedUrl.startsWith('//')) {
        return `https:${trimmedUrl}`;
      }

      if (!/^https?:\/\//i.test(trimmedUrl)) {
        return `https://${trimmedUrl}`;
      }

      const normalizedUrl = new URL(trimmedUrl);
      return normalizedUrl.href;
    } catch {
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setCopySuccess('');

    const normalizedUrl = normalizeUrl(originalUrl);
    if (!normalizedUrl) {
      setError('Please enter a valid URL.');
      return;
    }

    setShowPasswordPrompt(true);
  };

  const submitWithPassword = async (providedPassword: string) => {
    setShowPasswordPrompt(false);
    setIsLoading(true);
    setError('');
    setShortUrl('');
    setCopySuccess('');

    const normalizedUrl = normalizeUrl(originalUrl);
    if (!normalizedUrl) {
      setError('Please enter a valid URL.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: normalizedUrl, password: providedPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setShortUrl(data.shortUrl);
      } else if (res.status === 401) {
        setError('Unauthorized: incorrect password.');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to shorten URL.');
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard
        .writeText(shortUrl)
        .then(() => setCopySuccess('Copied!'))
        .catch(() => setCopySuccess('Failed to copy'));

      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center font-bold">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="flex flex-col">
            <input
              type="text"
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

        {/* Password prompt modal */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white text-black p-6 rounded shadow max-w-sm w-full">
              <h2 className="text-lg font-bold mb-2">Enter password to shorten</h2>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPassword('');
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitWithPassword(password)}
                  className="px-3 py-1 bg-black text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {shortUrl && (
          <div className="mt-6 p-4 border border-black">
            <p className="mb-2 font-bold">Shortened URL:</p>
            <div className="flex items-center space-x-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className="p-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition"
              >
              </button>
            </div>
            {copySuccess && <p className="text-green-500 mt-2">{copySuccess}</p>}
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
