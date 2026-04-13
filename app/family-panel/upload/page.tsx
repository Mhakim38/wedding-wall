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
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

function FamilyUploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [familyName, setFamilyName] = useState('');
  const [wishes, setWishes] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [photoLimit] = useState(10);

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
    // Check if authenticated
    const familySessionId = localStorage.getItem('familySessionId');
    if (familySessionId !== sessionId) {
      router.push('/family-panel/login');
      return;
    }

    // Load family name from localStorage if available
    const savedName = localStorage.getItem('familyName');
    if (savedName) {
      setFamilyName(savedName);
    }

    // Fetch current upload count
    fetchPhotoCount();
  }, [sessionId, router]);

  const fetchPhotoCount = async () => {
    try {
      const response = await fetch(`/api/photos?sessionId=${sessionId}&guestId=${localStorage.getItem('familySessionId')}`);
      if (response.ok) {
        const photos = await response.json();
        const familyPhotos = photos.filter((p: any) => p.guest.name === localStorage.getItem('familyName'));
        setPhotoCount(familyPhotos.length);
      }
    } catch (error) {
      console.error('Error fetching photo count:', error);
    }
  };

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
    if (!familyName || !file) {
      setError('Please enter a name and select a photo');
      return;
    }

    if (photoCount >= photoLimit) {
      setError(`You have reached the upload limit of ${photoLimit} photos`);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Compressing image...');

    try {
      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      setMessage('Uploading...');

      // Upload file to backend (which uploads to S3)
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('guestName', familyName);
      formData.append('file', compressedFile);
      formData.append('role', 'family');
      if (wishes.trim()) {
        formData.append('description', wishes.trim());
      }

      // Save family name to localStorage
      localStorage.setItem('familyName', familyName);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        if (uploadResponse.status === 429) {
          throw new Error(`Upload limit reached: ${errorData.error}`);
        }
        throw new Error(errorData.error || 'Upload failed');
      }

      setSuccess(true);
      setMessage('');
      setFile(null);
      setPreview(null);
      setWishes('');
      setPhotoCount(photoCount + 1);

      // Redirect after success
      setTimeout(() => {
        router.push(`/family-panel/gallery?sessionId=${sessionId}`);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setWishes('');
    setError('');
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const isAtLimit = photoCount >= photoLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <div className="border-b border-gray-200 dark:border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/family-panel/gallery?sessionId=${sessionId}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 w-4 h-4" />
            Back to Gallery
          </Link>
          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
            Family Admin
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {success ? (
            // Success Message
            <div className="bg-white dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-green-200 dark:border-green-900/30 overflow-hidden backdrop-blur-sm p-10 text-center">
              <FontAwesomeIcon icon={faCheckCircle} className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Photo Uploaded! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your photo has been added to the gallery
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {photoCount + 1}/{photoLimit} photos uploaded
              </p>
            </div>
          ) : (
            // Upload Form
            <div className="bg-white dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-purple-100 dark:border-white/10 overflow-hidden backdrop-blur-sm p-10 sm:p-12">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Upload Photos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Share your beautiful moments ({photoCount}/{photoLimit})
                </p>
              </div>

              {/* Upload Limit Warning */}
              {isAtLimit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6 flex items-start gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 w-4 h-4 flex-shrink-0" />
                  <span>You've reached the upload limit of {photoLimit} photos</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Family Member Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    disabled={loading || isAtLimit}
                    className="h-12 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                    Select Photo
                  </label>

                  {/* Preview */}
                  {preview && (
                    <div className="relative rounded-xl overflow-hidden h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      {!isAtLimit && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                        >
                          <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {!preview && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Camera Input */}
                      <div>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          className="hidden"
                          id="camera-input"
                          disabled={loading || isAtLimit}
                        />
                        <label
                          htmlFor="camera-input"
                          className={`flex items-center justify-center h-32 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                            isAtLimit
                              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400'
                              : 'border-purple-300 dark:border-purple-600 hover:border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <FontAwesomeIcon icon={faCamera} className="w-6 h-6 mb-2 mx-auto" />
                            <p className="font-medium text-sm">Take Photo</p>
                          </div>
                        </label>
                      </div>

                      {/* File Input */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          className="hidden"
                          id="file-input"
                          disabled={loading || isAtLimit}
                        />
                        <label
                          htmlFor="file-input"
                          className={`flex items-center justify-center h-32 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                            isAtLimit
                              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400'
                              : 'border-purple-300 dark:border-purple-600 hover:border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <FontAwesomeIcon icon={faImage} className="w-6 h-6 mb-2 mx-auto" />
                            <p className="font-medium text-sm">Choose Photo</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wishes Input */}
                {preview && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Message (Optional)
                    </label>
                    <textarea
                      placeholder="Add a special message or caption..."
                      value={wishes}
                      onChange={(e) => setWishes(e.target.value)}
                      disabled={loading || isAtLimit}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                    />
                  </div>
                )}

                {/* Message/Loading */}
                {message && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl text-sm">
                    {message}
                  </div>
                )}

                {/* Buttons */}
                {preview && (
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={loading || isAtLimit}
                      className="flex-1 h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 w-4 h-4" />
                      {loading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      disabled={loading || isAtLimit}
                      className="flex-1 h-12 text-base font-semibold rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                Images are compressed automatically (max 1920px, 0.8 quality)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FamilyUploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <FamilyUploadContent />
    </Suspense>
  );
}
