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
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-pink-50'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-orange-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Home Button */}
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </Button>
            </Link>

            {/* Center: Wedding Gallery Title with Subtitle */}
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                Wedding Gallery
              </h1>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mt-1">Celebrate every beautiful moment</p>
            </div>

            {/* Right: Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon
                icon={darkMode ? faSun : faMoon}
                className="w-5 h-5 text-orange-500 dark:text-orange-400"
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12">
        {/* Upload Button */}
        <div className="mb-12">
          <Link href={`/gallery/upload?sessionId=${sessionId}`}>
            <Button className="h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg">
              <FontAwesomeIcon icon={faCamera} className="mr-3 w-5 h-5" />
              Upload Your Photo
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-700 dark:text-red-400 text-base font-medium">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mt-4">Loading memories...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20">
            <FontAwesomeIcon icon={faCamera} className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
              No photos yet. Be the first to upload!
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-base mt-2">
              Click "Upload Your Photo" above to share your moment
            </p>
          </div>
        ) : (
          <>
            {/* Photo Count Badge */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCamera} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Beautiful Moments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</p>
                </div>
              </div>
            </div>

            {/* Masonry Gallery */}
            <div
              className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
              style={{ columnFill: 'auto' }}
            >
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl shadow-md hover:shadow-warm-lg transition-all duration-300 dark:shadow-gray-800 hover:scale-105 cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards`
                  }}
                >
                  {/* Photo Image */}
                  <img
                    src={`/api/image?key=${encodeURIComponent(photo.s3Key)}`}
                    alt={`Photo by ${photo.guest.name}`}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay with Guest Name */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-base leading-tight">
                      {photo.guest.name}
                    </p>
                    <p className="text-orange-200 text-sm font-medium mt-1">
                      {new Date(photo.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-pink-500/5 transition-colors duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </>
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
