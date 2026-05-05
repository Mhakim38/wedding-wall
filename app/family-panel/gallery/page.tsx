'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faHome, faCheck, faCopy, faQrcode, faTimes, faGift, faEllipsis, faTrash, faRightFromBracket, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import FamilyMemberNameModal from '@/components/FamilyMemberNameModal';
import { useTheme } from '@/hooks/useTheme';
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
  const { isDark, toggleTheme, mounted } = useTheme();
  const sessionId = searchParams.get('sessionId');

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedButton, setCopiedButton] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [currentFamilyMember, setCurrentFamilyMember] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);

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

    // Check if family member is already logged in for this session
    const currentMember = sessionStorage.getItem(`current_family_member_${sessionId}`);
    if (currentMember) {
      setCurrentFamilyMember(currentMember);
    } else {
      setShowNameModal(true);
    }

    fetchPhotos();
  }, [sessionId, router]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
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

  const handleNameSubmit = (name: string) => {
    setCurrentFamilyMember(name);
    setShowNameModal(false);
  };

  const handlePhotoDeleted = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleGenerateQR = async () => {
    if (!sessionId) return;
    const uploadLink = `${window.location.origin}/family-panel/upload?sessionId=${sessionId}`;
    try {
      const url = await QRCode.toDataURL(uploadLink);
      setQrCodeUrl(url);
      setShowQrModal(true);
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  const copyToClipboard = (text: string, button: string) => {
    navigator.clipboard.writeText(text);
    setCopiedButton(button);
    setTimeout(() => setCopiedButton(''), 2000);
  };

  const handleSwitchUser = () => {
    sessionStorage.removeItem(`current_family_member_${sessionId}`);
    setCurrentFamilyMember(null);
    setShowNameModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('familySessionId');
    localStorage.removeItem('familyRole');
    localStorage.removeItem('familyPassword');
    localStorage.removeItem('familyEventName');
    localStorage.removeItem('familyCode');
    sessionStorage.removeItem(`current_family_member_${sessionId}`);
    sessionStorage.removeItem(`family_members_${sessionId}`);
    router.push('/family-panel/login');
  };

  if (!sessionId || !mounted) {
    return <div className="min-h-screen flex items-center justify-center">Invalid session</div>;
  }

  return (
    <>
      {/* Theme Modal */}
      {showNameModal && (
        <FamilyMemberNameModal onNameSubmit={handleNameSubmit} sessionId={sessionId} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
        {/* Navbar */}
        <nav className="px-4 py-4 md:px-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl px-6 py-3 shadow-warm-lg transition-all duration-300 bg-white/60 dark:bg-black/40">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
                    <img 
                      src="/logo.png" 
                      alt="Wedding Wall Logo" 
                      className="w-full h-full object-contain rounded-full shadow-md"
                    />
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold text-xl hidden sm:inline" style={{ fontFamily: 'var(--font-playfair)' }}>
                    Family Panel
                  </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all"
                    aria-label="Toggle Dark Mode"
                  >
                    <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-lg" />
                  </button>

                  <button
                    onClick={handleSwitchUser}
                    className="px-3 py-2 rounded-full text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                    title="Switch Family Member"
                  >
                    Switch User
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    title="Logout"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
              {eventName || 'Wedding'} Gallery 💜
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Welcome back, <span className="font-semibold text-purple-600 dark:text-purple-400">{currentFamilyMember}</span>! 
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} shared by family & guests
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Link href={`/family-panel/upload?sessionId=${sessionId}`}>
              <Button className="rounded-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                Upload Photo
              </Button>
            </Link>

            <Button 
              onClick={handleGenerateQR}
              variant="outline"
              className="rounded-full gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            >
              <FontAwesomeIcon icon={faQrcode} className="w-4 h-4" />
              QR Code
            </Button>

            <Button 
              onClick={() => copyToClipboard(`${window.location.origin}/family-panel/gallery?sessionId=${sessionId}`, 'link')}
              variant="outline"
              className="rounded-full gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
            >
              <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
              {copiedButton === 'link' ? 'Copied!' : 'Share Link'}
            </Button>
          </div>

          {/* QR Code Modal */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share Gallery</h3>
                  <button onClick={() => setShowQrModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </button>
                </div>
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-full rounded-lg" />
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                  Scan to view this gallery
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-center mb-8">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin">
                <FontAwesomeIcon icon={faCamera} className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
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

          {/* Empty State */}
          {!loading && photos.length === 0 && (
            <div className="text-center py-20">
              <FontAwesomeIcon icon={faCamera} className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No photos yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Be the first to upload a photo!</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default function FamilyGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FamilyGalleryContent />
    </Suspense>
  );
}
