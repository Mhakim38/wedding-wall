'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faCamera, faHome, faCheck, faCopy, faQrcode, faTimes, faGift, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import QRCode from 'qrcode';

interface Photo {
  id: string;
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

      {/* Overlay with Guest Name */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent md:from-black/60 md:via-transparent md:to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white font-semibold text-sm transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
          {photo.guest.name}
        </p>
        <p className="text-white/80 text-xs mt-0.5 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300 delay-75">
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [sessionCode, setSessionCode] = useState<string>('');
  const [eventName, setEventName] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [giftQrUrl, setGiftQrUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionData = async () => {
      try {
        // Fetch session details (code, name)
        const sessionRes = await fetch(`/api/session?sessionId=${sessionId}`);
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionCode(sessionData.code);
          setEventName(sessionData.eventName);
          if (sessionData.giftQrCodeUrl) {
            setGiftQrUrl(sessionData.giftQrCodeUrl);
          }

          // Generate QR Code for the session URL
          try {
            const currentUrl = `${window.location.origin}/?code=${sessionData.code}`;
            const qrDataUrl = await QRCode.toDataURL(currentUrl, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#ffffff00', // Transparent background
              },
            });
            setQrCodeUrl(qrDataUrl);
          } catch (qrErr) {
            console.error('QR Generation failed', qrErr);
          }
        }

        // Fetch photos (Initial load - Page 1)
        const response = await fetch(`/api/photos?sessionId=${sessionId}&page=1&limit=12`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.photos);
          setHasMore(data.pagination.hasMore);
          setPage(1); // Reset page to 1
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load photos');
          setPhotos([]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Network error: Check your connection and try again');
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially
    fetchSessionData();

    // Poll every 5 seconds for new photos (Refreshes first page only to check for updates)
    const interval = setInterval(async () => {
        // Only poll if we are at the top and not fetching more
        if (window.scrollY < 100 && !isFetchingMore) {
          const response = await fetch(`/api/photos?sessionId=${sessionId}&page=1&limit=12`);
          if (response.ok) {
            const data = await response.json();
            // Merge new photos at the top if they are different
            setPhotos(prevPhotos => {
              const newPhotoIds = new Set(data.photos.map((p: Photo) => p.id));
              const existingPhotos = prevPhotos.filter(p => !newPhotoIds.has(p.id));
              return [...data.photos, ...existingPhotos];
            });
          }
        }
    }, 5000); // Increased polling interval to 5s to reduce load
    
    return () => clearInterval(interval);
  }, [sessionId]);

  // Infinite Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500 &&
        hasMore &&
        !isFetchingMore &&
        !loading
      ) {
        loadMorePhotos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore, loading, page, sessionId]);

  const loadMorePhotos = async () => {
    if (!sessionId || isFetchingMore || !hasMore) return;

    setIsFetchingMore(true);
    const nextPage = page + 1;

    try {
      const response = await fetch(`/api/photos?sessionId=${sessionId}&page=${nextPage}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(prev => {
          // Filter out duplicates (photos that might have shifted pages or already exist)
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPhotos = data.photos.filter((p: Photo) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPhotos];
        });
        setHasMore(data.pagination.hasMore);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Failed to load more photos:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

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
        {/* FAB Upload Button - Replaces Top Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Link href={`/gallery/upload?sessionId=${sessionId}`}>
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
            {/* Header Info: Code & Count */}
            <div className="mb-8 flex flex-col items-center gap-4 text-center">

              {/* Dynamic Wedding Header */}
              {eventName && (
                <h1 className="text-2xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 font-serif px-4">
                  Welcome to <span className="text-pink-600 dark:text-pink-400 font-cursive block mt-2">{eventName}&apos;s Wedding</span>
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
                        // Robust clipboard copy with fallback for mobile/PWA/non-secure contexts
                        if (navigator.clipboard && window.isSecureContext) {
                          navigator.clipboard.writeText(text).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }).catch(err => {
                            console.error('Async: Could not copy text: ', err);
                          });
                        } else {
                          // Fallback: TextArea hack
                          const textArea = document.createElement("textarea");
                          textArea.value = text;
                          textArea.style.position = "fixed";  // Avoid scrolling to bottom
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
                            } else {
                              console.error('Fallback: Copying text command was unsuccessful');
                            }
                          } catch (err) {
                            console.error('Fallback: Oops, unable to copy', err);
                          }
                          document.body.removeChild(textArea);
                        }
                      }}
                      className="rounded-full text-gray-400 active:text-green-500 transition-colors"
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
              </div>
              )}

              {/* Photo Count Pill (Smaller) */}
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
                <GalleryItem key={photo.id} photo={photo} idx={idx} />
              ))}
            </div>

            {/* Loading More Indicator */}
            {isFetchingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            )}
            
            {!hasMore && photos.length > 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600 font-medium text-sm">
                You've reached the end of the gallery
              </div>
            )}
          </>
        )}
      </main>

      {/* QR Modal - Placed at root level to avoid clipping */}
      {showQrModal && qrCodeUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowQrModal(false)}>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative transform scale-100 transition-transform border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-6 pt-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Scan to Join</h3>
              <div className="bg-white p-6 rounded-2xl shadow-inner border border-gray-100 inline-block w-full flex justify-center">
                <img src={qrCodeUrl} alt="Scan to Join" className="w-64 h-64 object-contain mix-blend-multiply" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium px-4">
                Ask guests to scan this code to join the gallery instantly
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gift QR Modal */}
      {showGiftModal && giftQrUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowGiftModal(false)}>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative transform scale-100 transition-transform border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowGiftModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-6 pt-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
                <FontAwesomeIcon icon={faGift} className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Wedding Gift</h3>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 inline-block w-full flex justify-center aspect-square items-center overflow-hidden">
                <img src={giftQrUrl} alt="Scan to Send Gift" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium px-4">
                Scan via e-wallet to send a gift directly to the couple
              </p>
            </div>
          </div>
        </div>
      )}
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
