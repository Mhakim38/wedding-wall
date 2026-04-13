'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function FamilyLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/family-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          familyPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const { sessionId, eventName } = await response.json();

      // Store in localStorage
      localStorage.setItem('familySessionId', sessionId);
      localStorage.setItem('familyRole', 'family');
      localStorage.setItem('familyEventName', eventName);
      localStorage.setItem('familyCode', code.toUpperCase());

      // Redirect to family gallery
      router.push(`/family-panel/gallery?sessionId=${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-white/10 px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2 w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="relative overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>

          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-purple-100 dark:border-white/10 overflow-hidden backdrop-blur-sm p-10 sm:p-12">
              {/* Title */}
              <div className="mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4">
                  <FontAwesomeIcon icon={faLock} className="text-white w-5 h-5" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Family Panel
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  Sign in to manage wedding photos
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6 animate-in fade-in slide-in-from-top-2">
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Wedding Code */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    Wedding Code
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., WED2024"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={loading}
                    maxLength={8}
                    className="h-12 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 uppercase"
                  />
                </div>

                {/* Family Password */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                    Family Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter family password"
                    value={familyPassword}
                    onChange={(e) => setFamilyPassword(e.target.value)}
                    disabled={loading}
                    className="h-12 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !code || !familyPassword}
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2 w-4 h-4" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                Family members can upload up to 10 photos and manage the gallery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
