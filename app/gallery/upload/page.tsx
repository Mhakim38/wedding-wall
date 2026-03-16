'use client';

import { Suspense, useRef, useState } from 'react';
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

function UploadContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [guestName, setGuestName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid session</p>
      </div>
    );
  }

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !file) {
      setError('Please enter your name and select a photo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload file to backend (which uploads to S3)
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('guestName', guestName);
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload photo');
      }

      setSuccess(true);
      setGuestName('');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href={`/gallery?sessionId=${sessionId}`}>
            <Button variant="ghost" size="icon" className="hover:bg-orange-50 dark:hover:bg-gray-800">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-gray-700 dark:text-white" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Upload Photo
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleUpload} className="space-y-8">
          {/* Guest Name */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-900 dark:text-white">
              Your Name
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={loading}
              className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
            />
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

          {/* Error Message */}
          {error && (
            <div className="p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-300 text-base font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!guestName || !file || loading}
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
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
