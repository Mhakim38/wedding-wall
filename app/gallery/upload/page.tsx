'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faImage,
  faHome,
  faArrowLeft,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [guestName, setGuestName] = useState('');
  const [wishes, setWishes] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid session</p>
      </div>
    );
  }

  useEffect(() => {
    // Load guest name from localStorage if available
    const savedName = localStorage.getItem('guestName');
    if (savedName) {
      setGuestName(savedName);
    } else {
      // Redirect to gallery if no name found (will trigger modal there)
      router.push(`/gallery?sessionId=${sessionId}`);
    }
  }, [sessionId, router]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !file) {
      setError('Please select a photo');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Uploading...');

    try {
      // Upload file to backend (which uploads to S3)
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('guestName', guestName);
      formData.append('file', file);
      if (wishes.trim()) {
        formData.append('description', wishes.trim());
      }

      // Save guest name to localStorage
      localStorage.setItem('guestName', guestName);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        let errorMessage = 'Failed to upload photo';
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, it's likely a 413 Payload Too Large or other server error returning HTML/text
          if (uploadResponse.status === 413) {
            errorMessage = 'Photo is too large. Please choose a smaller photo.';
          } else {
            errorMessage = `Upload failed (${uploadResponse.status}: ${uploadResponse.statusText})`;
          }
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      // Don't clear guestName so it persists for next upload
      // setGuestName(''); 
      setWishes('');
      setFile(null);
      setPreview(null);

      // Redirect back to gallery after 2 seconds
      setTimeout(() => {
        router.push(`/gallery?sessionId=${sessionId}`);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Check your connection.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="w-20 h-20 text-green-500 mx-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
            Photo Uploaded!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
            Redirecting to gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      {/* Header removed - using global Navbar */}
      <div className="pt-20"> {/* Add padding for fixed navbar */}
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
            Upload Photo
        </h1>
        <form onSubmit={handleUpload} className="space-y-8">
          {/* Welcome Message with Guest Name */}
          {guestName && (
            <div className="p-5 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-white dark:border-gray-800 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                Uploading as
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                {guestName} 💕
              </p>
            </div>
          )}

          {/* Wishes/Message Input */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-900 dark:text-white">
              Your Wishes ✨
            </label>
            <textarea
              placeholder="Share your heartfelt wishes or message..."
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              disabled={loading}
              rows={4}
              className="w-full text-base px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-all duration-300 focus:shadow-lg"
              style={{ fontFamily: 'var(--font-poppins)' }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
              Your message will appear with your photo in the gallery 💝
            </p>
          </div>

          {/* Photo Selection */}
          <div className="space-y-4">
            <label className="block text-base font-semibold text-gray-900 dark:text-white">
              Photo
            </label>

            {/* Hidden Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {/* Preview or Upload Buttons */}
            {preview ? (
              <div className="space-y-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-cover rounded-2xl shadow-lg"
                />
                {file && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <span className="font-semibold text-gray-900 dark:text-white">{file.name}</span> • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                  }}
                  className="w-full h-12 text-base font-semibold"
                >
                  Choose Different Photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-orange-500 dark:hover:border-orange-500 transition-colors hover:bg-orange-50 dark:hover:bg-gray-800/50"
                >
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="w-10 h-10 text-orange-500 mx-auto mb-3"
                  />
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Take Photo
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-orange-500 dark:hover:border-orange-500 transition-colors hover:bg-orange-50 dark:hover:bg-gray-800/50"
                >
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-10 h-10 text-orange-500 mx-auto mb-3"
                  />
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Choose File
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* Processing Message - REMOVED DUPLICATE BLUE INDICATOR */}
          {/* {message && !error && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                <p className="text-blue-700 dark:text-blue-300 font-medium animate-pulse">{message}</p>
            </div>
          )} */}

          {/* Error Message */}
          {error && (
            <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-300 text-base font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!file || loading}
            className="w-full h-14 text-base font-semibold rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {loading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </form>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadContent />
    </Suspense>
  );
}
