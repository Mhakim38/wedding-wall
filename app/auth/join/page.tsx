'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      // Auto-join and redirect
      const joinGuest = async () => {
        try {
          const response = await fetch(`/api/session?code=${urlCode.toUpperCase()}`);
          
          if (!response.ok) {
            throw new Error('Wedding code not found or expired');
          }

          const session = await response.json();
          router.push(`/gallery?sessionId=${session.id}`);
        } catch (err) {
          // If code is invalid, redirect back to home
          router.push('/');
        }
      };
      
      joinGuest();
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Loading Wedding...
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Just a moment...
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinContent />
    </Suspense>
  );
}
