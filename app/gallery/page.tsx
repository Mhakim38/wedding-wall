'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faCamera, faHome } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Photo {
  id: string;
  s3Key: string;
  s3Url: string;
  guest: { name: string };
  width?: number;
  height?: number;
  uploadedAt: string;
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchPhotos = async () => {
      try {
        const response = await fetch(`/api/photos?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load photos');
          setPhotos([]);
        }
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError('Network error: Check your connection and try again');
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially
    fetchPhotos();

    // Poll every 3 seconds for new photos
    const interval = setInterval(fetchPhotos, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid session</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
            </Button>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wedding Gallery
          </h1>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              <FontAwesomeIcon
                icon={darkMode ? faSun : faMoon}
                className="w-5 h-5"
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Button */}
        <div className="mb-8">
          <Link href={`/gallery/upload?sessionId=${sessionId}`}>
            <Button className="w-full sm:w-auto h-12 text-base font-semibold">
              <FontAwesomeIcon icon={faCamera} className="mr-2 w-5 h-5" />
              Upload Your Photo
            </Button>
          </Link>
        </div>

        {/* Gallery Grid - Masonry Layout */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No photos yet. Be the first to upload!
            </p>
          </div>
        ) : (
          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
            style={{ columnFill: 'auto' }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow dark:shadow-gray-800"
              >
                {/* Photo Image */}
                <img
                  src={`/api/image?key=${encodeURIComponent(photo.s3Key)}`}
                  alt={`Photo by ${photo.guest.name}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay with Guest Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white font-semibold text-sm">
                    {photo.guest.name}
                  </p>
                  <p className="text-gray-200 text-xs">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryContent />
    </Suspense>
  );
}
