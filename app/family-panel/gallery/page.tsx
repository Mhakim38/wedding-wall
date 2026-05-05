'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCopy, faQrcode, faTimes, faTrash, faRightFromBracket, faCheck, faEllipsis, faGift } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import FamilyMemberNameModal from '@/components/FamilyMemberNameModal';
import Navbar from '@/components/Navbar';
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
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [giftQrUrl, setGiftQrUrl] = useState<string>('');

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

  if (!sessionId) {
    return <div className="min-h-screen flex items-center justify-center">Invalid session</div>;
  }

  return (
    <>
      {/* Theme Modal */}
      {showNameModal && (
        <FamilyMemberNameModal onNameSubmit={handleNameSubmit} sessionId={sessionId} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
        {/* Navbar - Inside Page */}
        <Navbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12">
          {/* FAB Upload Button */}
          <div className="fixed bottom-6 right-6 z-50">
            <Link href={`/family-panel/upload?sessionId=${sessionId}`}>
              <Button className="h-14 w-14 rounded-full p-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 md:w-auto md:px-6">
                <FontAwesomeIcon icon={faCamera} className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline font-semibold">Upload Photo</span>
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
              {/* Header Info */}
              <div className="mb-8 flex flex-col items-center gap-4 text-center">

                {/* Dynamic Wedding Header */}
                {eventName && (
                  <h1 className="text-2xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-serif px-4">
                    Welcome to <span className="text-pink-600 dark:text-pink-400 font-cursive block mt-2">{eventName}&apos;s Family Gallery</span>
                  </h1>
                )}

                {/* Wedding Code Badge (Spotlight) */}
                {sessionCode && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                    {/* Code Box */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-orange-200 dark:border-orange-500/30 rounded-2xl px-6 py-4 shadow-warm-md w-full flex flex-col items-center justify-center">
                      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1 text-center">Wedding Code</p>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-bold font-mono text-orange-600 dark:text-orange-400 tracking-widest">{sessionCode}</span>
                        
                        {/* Copy Button */}
                        <button 
                          onClick={() => {
                          const text = sessionCode;
                          if (navigator.clipboard && window.isSecureContext) {
                            navigator.clipboard.writeText(text).then(() => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }).catch(err => {
                              console.error('Async: Could not copy text: ', err);
                            });
                          } else {
                            const textArea = document.createElement("textarea");
                            textArea.value = text;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-9999px";
                            textArea.style.top = "0";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            try {
                              const successful = document.execCommand('copy');
                              if (successful) {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }
                            } catch (err) {
                              console.error('Fallback: Oops, unable to copy', err);
                            }
                            document.body.removeChild(textArea);
                          }
                        }}
                          className="rounded-full text-gray-400 active:text-green-500 transition-colors relative"
                          title="Copy Code"
                        >
                          <FontAwesomeIcon 
                            icon={copied ? faCheck : faCopy} 
                            className={`w-5 h-5 transition-colors duration-200 ${copied ? 'text-green-500' : 'text-gray-400'}`} 
                          />
                          
                          {/* Copied Tooltip */}
                          <span className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap transition-all duration-200 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                            Copied!
                            <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></span>
                          </span>
                        </button>

                        {/* Options Toggle Button */}
                        <button 
                          onClick={() => setShowOptions(!showOptions)}
                          className={`rounded-full transition-all duration-200 ${showOptions ? 'text-orange-600 dark:text-orange-400 rotate-90' : 'text-gray-400 active:text-orange-500'}`}
                          title="More Options"
                        >
                          <FontAwesomeIcon icon={faEllipsis} className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  
                    {/* Expandable Options Row */}
                    <div className={`grid transition-all duration-300 ease-in-out w-full ${showOptions ? 'grid-rows-[1fr] opacity-100 pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-2' : 'grid-rows-[0fr] opacity-0 pt-0 border-none mt-0'}`}>
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-center gap-6">
                          {/* QR Code Icon Button */}
                          {qrCodeUrl && (
                            <button
                              onClick={() => setShowQrModal(true)}
                              className="flex flex-col items-center gap-2 group"
                              title="Show Join QR"
                            >
                              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700/50 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors">
                                <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Join</span>
                            </button>
                          )}

                          {/* Gift QR Icon Button */}
                          {giftQrUrl && (
                            <button
                              onClick={() => setShowGiftModal(true)}
                              className="flex flex-col items-center gap-2 group"
                              title="Send Gift (Angpao)"
                            >
                              <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700/50 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 text-gray-600 dark:text-gray-300 group-hover:text-red-500 transition-colors">
                                <FontAwesomeIcon icon={faGift} className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Gift</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Member Badge - Glass Container */}
                {currentFamilyMember && (
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-orange-200 dark:border-orange-500/30 rounded-2xl px-6 py-4 shadow-warm-md w-full max-w-sm flex flex-col items-center justify-center">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1">Current User</p>
                    <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-3">{currentFamilyMember}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleSwitchUser}
                        className="px-3 py-1 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        Switch User
                      </button>

                      <button
                        onClick={handleLogout}
                        className="p-2 rounded-full text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Logout"
                      >
                        <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* QR & Share Buttons - Glass Container */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-orange-200 dark:border-orange-500/30 rounded-2xl px-6 py-4 shadow-warm-md w-full max-w-sm flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-6">
                    {/* QR Code Icon Button */}
                    <button
                      onClick={handleGenerateQR}
                      className="flex flex-col items-center gap-2 group"
                      title="Generate QR Code"
                    >
                      <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700/50 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 text-gray-600 dark:text-gray-300 group-hover:text-orange-500 transition-colors">
                        <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">QR Code</span>
                    </button>

                    {/* Copy Link Icon Button */}
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/family-panel/gallery?sessionId=${sessionId}`, 'link')}
                      className="flex flex-col items-center gap-2 group"
                      title="Copy Gallery Link"
                    >
                      <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors">
                        <FontAwesomeIcon icon={faCopy} className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{copiedButton === 'link' ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* Photo Count Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 px-3 py-1.5 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-sm shrink-0">
                    <FontAwesomeIcon icon={faCamera} className="w-2.5 h-2.5 text-white pt-0" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{photos.length}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Moments captured</span>
                  </div>
                </div>
              </div>

              {/* Tailwind Bento Grid Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px] grid-flow-dense pb-8">
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

              {/* End of Gallery Message */}
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 font-medium text-sm">
                You've reached the end of the gallery
              </div>
            </>
          )}
        </main>

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

        {/* Gift QR Modal */}
        {showGiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Gift 🎁</h3>
                <button onClick={() => setShowGiftModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
              <img src={giftQrUrl || ''} alt="Gift QR Code" className="w-full rounded-lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                Scan to send an Angpao 💝
              </p>
            </div>
          </div>
        )}
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
