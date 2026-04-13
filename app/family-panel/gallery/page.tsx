'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faCamera, faHome, faCheck, faCopy, faQrcode, faTimes, faGift, faEllipsis, faTrash, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import QRCode from 'qrcode';

interface Photo {
  id: string;
  guest: { name: string };
  description?: string | null;
  width?: number;
  height?: number;
  uploadedAt: string;
  guestId: string;
}

function GalleryItem({ 
  photo, 
  idx,
  onDelete,
  familyPassword
}: { 
  photo: Photo; 
  idx: number;
  onDelete: (photoId: string) => void;
  familyPassword: string;
}) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    photo.width && photo.height ? { width: photo.width, height: photo.height } : null
  );

  let colSpan = 'col-span-1';
  let rowSpan = 'row-span-1';

  if (dimensions) {
    const ratio = dimensions.width / dimensions.height;

    if (ratio > 1.2) {
      colSpan = 'md:col-span-2';
      rowSpan = 'row-span-1';
    } else if (ratio < 0.8) {
      colSpan = 'col-span-1';
      rowSpan = 'row-span-2';
    }
  }

  const handleDelete = async () => {
    const familyCode = localStorage.getItem('familyCode');
    const confirmed = window.confirm(`Delete photo by ${photo.guest.name}?`);
    
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/photos/${photo.id}?role=family&familyPassword=${encodeURIComponent(familyPassword)}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        onDelete(photo.id);
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting photo');
    }
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:z-10 bg-gray-100 dark:bg-gray-800 ${colSpan} ${rowSpan}`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${idx * 0.05}s backwards`,
      }}
    >
      {/* Photo Image */}
      <img
        src={`/api/image?id=${photo.id}`}
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

      {/* Delete Button - X Circle */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        title="Delete photo"
      >
        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
      </button>

      {/* Overlay with Guest Name and Wishes */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:from-black/80 md:via-transparent md:to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        {/* Guest Name */}
        <p className="text-white font-bold text-base transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300" style={{ fontFamily: 'var(--font-playfair)' }}>
          {photo.guest.name}
        </p>

        {/* Wishes/Message */}
        {photo.description && (
          <p className="text-white/90 text-sm mt-2 leading-relaxed line-clamp-3 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 delay-75">
            &ldquo;{photo.description}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function FamilyGalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [copiedButton, setCopiedButton] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');

  useEffect(() => {
    const familySessionId = localStorage.getItem('familySessionId');
    const storedPassword = localStorage.getItem('familyPassword');
    const storedEventName = localStorage.getItem('familyEventName');

    if (!familySessionId || familySessionId !== sessionId) {
      router.push('/family-panel/login');
      return;
    }

    if (storedPassword) {
      setFamilyPassword(storedPassword);
    }
    if (storedEventName) {
      setEventName(storedEventName);
    }

    fetchPhotos();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, [sessionId, router]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
        setError('');
      } else {
        throw new Error('Failed to load photos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading photos');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDeleted = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const copyToClipboard = (text: string, button: string) => {
    navigator.clipboard.writeText(text);
    setCopiedButton(button);
    setTimeout(() => setCopiedButton(''), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('familySessionId');
    localStorage.removeItem('familyRole');
    localStorage.removeItem('familyPassword');
    localStorage.removeItem('familyEventName');
    localStorage.removeItem('familyCode');
    router.push('/family-panel/login');
  };

  if (!sessionId) {
    return <div className="min-h-screen flex items-center justify-center">Invalid session</div>;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-transparent bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text">
              Wedding Wall
            </Link>
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              Family Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FontAwesomeIcon
                icon={darkMode ? faSun : faMoon}
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
              />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
              title="Logout"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Selamat Datang ke {eventName || 'Wedding'} 💜
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} shared
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/family-panel/upload?sessionId=${sessionId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all"
            >
              <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
              Upload Photo
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold transition-all"
            >
              <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading photos...</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faCamera} className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">No photos yet</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max"
            style={{
              perspective: '1000px',
            }}
          >
            {photos.map((photo, idx) => (
              <GalleryItem
                key={photo.id}
                photo={photo}
                idx={idx}
                onDelete={handlePhotoDeleted}
                familyPassword={familyPassword}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FamilyGalleryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <FamilyGalleryContent />
    </Suspense>
  );
}
