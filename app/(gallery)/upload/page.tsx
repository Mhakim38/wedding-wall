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
      // In Phase 7, we'll upload directly to S3
      // For now, we'll create a placeholder using a data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const response = await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            guestName,
            photoUrl: base64, // In Phase 7: S3 URL
            width: 800,
            height: 600,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload photo');
        }

        setSuccess(true);
        setGuestName('');
        setFile(null);
        setPreview(null);

        // Redirect back to gallery after 2 seconds
        setTimeout(() => {
          router.push(`/gallery?sessionId=${sessionId}`);
        }, 2000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="w-16 h-16 text-green-500 mx-auto"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Photo Uploaded!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/gallery?sessionId=${sessionId}`}>
            <Button variant="ghost" size="icon">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Upload Photo
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Guest Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Name
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Photo Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                  }}
                >
                  Choose Different Photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="w-8 h-8 text-orange-500 mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Take Photo
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faImage}
                    className="w-8 h-8 text-orange-500 mx-auto mb-2"
                  />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose File
                  </p>
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!guestName || !file || loading}
            className="w-full h-12 text-base font-semibold"
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
