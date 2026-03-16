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

function GalleryItem({ photo, idx }: { photo: Photo; idx: number }) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    photo.width && photo.height ? { width: photo.width, height: photo.height } : null
  );

  let colSpan = 'col-span-1';
  let rowSpan = 'row-span-1';

  if (dimensions) {
    const ratio = dimensions.width / dimensions.height;

    // Landscape: Span 2 cols, 1 row (on larger screens)
    if (ratio > 1.2) {
      colSpan = 'md:col-span-2';
      rowSpan = 'row-span-1';
    }
    // Portrait: Span 1 col, 2 rows
    else if (ratio < 0.8) {
      colSpan = 'col-span-1';
      rowSpan = 'row-span-2';
    }
    // Square: Span 1 col, 1 row (default)
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:z-10 bg-gray-100 dark:bg-gray-800 ${colSpan} ${rowSpan}`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${idx * 0.05}s backwards`,
      }}
    >
      {/* Photo Image */}
      <img
        src={`/api/image?key=${encodeURIComponent(photo.s3Key)}`}
        alt={`Photo by ${photo.guest.name}`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        onLoad={(e) => {
          if (!dimensions) {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
                setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            }
          }
        }}
      />

      {/* Overlay with Guest Name */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {photo.guest.name}
        </p>
        <p className="text-white/80 text-xs mt-0.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
          {new Date(photo.uploadedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Header removed - using global Navbar */}
      <div className="pt-20"> {/* Add padding for fixed navbar */}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12">
        {/* Upload Button */}
        <div className="mb-12">
          <Link href={`/gallery/upload?sessionId=${sessionId}`}>
            <Button className="h-14 text-base font-semibold rounded-full px-8 bg-white/70 text-orange-600 border border-white/80 backdrop-blur-md hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl">
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
              <div className="flex items-center gap-3 rounded-full bg-white/65 dark:bg-gray-900/60 backdrop-blur-md border border-white/70 dark:border-gray-700/50 px-4 py-2.5 shadow-md">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                  <FontAwesomeIcon icon={faCamera} className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Beautiful Moments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</p>
                </div>
              </div>
            </div>

            {/* Tailwind Bento Grid Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px] grid-flow-dense">
              {photos.map((photo, idx) => (
                <GalleryItem key={photo.id} photo={photo} idx={idx} />
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
