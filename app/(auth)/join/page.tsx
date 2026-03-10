'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faHome } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/session?code=${code.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error('Wedding code not found or expired');
      }

      const session = await response.json();
      router.push(`/gallery?sessionId=${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join wedding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Home Button */}
      <Link href="/" className="absolute top-6 left-6">
        <Button variant="ghost" size="icon">
          <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
        </Button>
      </Link>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Join the Wedding
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the wedding code to access the photo gallery
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Wedding Code
            </label>
            <Input
              type="text"
              placeholder="e.g., ABC12345"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              className="text-center text-lg tracking-widest"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={!code || loading}
          >
            <FontAwesomeIcon icon={faArrowRight} className="mr-2 w-4 h-4" />
            {loading ? 'Joining...' : 'Enter Gallery'}
          </Button>
        </form>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
          Ask the couple for the wedding code. It's usually shared via text or email.
        </div>
      </div>
    </div>
  );
}
