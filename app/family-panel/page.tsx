'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyPanelPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const familySessionId = localStorage.getItem('familySessionId');
    if (familySessionId) {
      router.push(`/family-panel/gallery?sessionId=${familySessionId}`);
    } else {
      // Redirect to login
      router.push('/family-panel/login');
    }
  }, [router]);

  return null;
}
