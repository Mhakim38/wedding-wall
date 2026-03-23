'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faCamera, faHome, faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';
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
  const [sessionCode, setSessionCode] = useState<string>('');
  const [eventName, setEventName] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
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

        // Fetch photos
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
        console.error('Failed to fetch data:', err);
        setError('Network error: Check your connection and try again');
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially
    fetchSessionData();

    // Poll every 3 seconds for new photos
    const interval = setInterval(async () => {
        const response = await fetch(`/api/photos?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        }
    }, 3000);
    
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
              
              {/* Wedding Code Badge (Spotlight) */}
              {sessionCode && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-orange-200 dark:border-orange-500/30 rounded-2xl px-6 py-4 shadow-warm-md w-full max-w-sm flex flex-col items-center gap-4">
                  
                  {/* QR Code Display */}
                  {qrCodeUrl && (
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                      <img src={qrCodeUrl} alt="Scan to Join" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
                      <p className="text-[10px] text-center text-gray-500 mt-1 uppercase tracking-widest">Scan to Join</p>
                    </div>
                  )}

                  <div className="w-full">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-1 text-center">Wedding Code</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-bold font-mono text-orange-600 dark:text-orange-400 tracking-widest">{sessionCode}</span>
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
                      className="group relative p-2 rounded-full hover:bg-orange-50 dark:hover:bg-white/5 transition-colors"
                      title="Copy Code"
                    >
                      <FontAwesomeIcon 
                        icon={copied ? faCheck : faCopy} 
                        className={`w-5 h-5 transition-colors duration-200 ${copied ? 'text-green-500' : 'text-gray-400 group-hover:text-orange-500'}`} 
                      />
                      
                      {/* Copied Tooltip */}
                      <span className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap transition-all duration-200 ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        Copied!
                        <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></span>
                      </span>
                    </button>
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
