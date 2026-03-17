'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faUsers,
  faShieldAlt,
  faCloud,
  faRocket,
  faMobileAlt,
  faArrowRight,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      router.push(`/auth/join?code=${joinCode.toUpperCase()}`);
    } catch (err) {
      setError('Failed to join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-animation absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="float-animation absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animationDelay: '-1.5s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Navigation removed - moved to global layout */}

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-4 py-20 sm:py-32">
            <div className="text-center space-y-10">
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="hero-title text-6xl sm:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Capture Every
                  <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Beautiful Moment
                  </span>
                </h1>
                <p className="hero-title text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">
                  Instagram-story style photo gallery for weddings. Guests snap, you see instantly. No app required.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                {[
                  { icon: faMobileAlt, text: 'Mobile First' },
                  { icon: faRocket, text: 'Real-Time' },
                  { icon: faShieldAlt, text: 'Private Gallery' },
                  { icon: faCloud, text: 'Cloud Storage' },
                  { icon: faCamera, text: 'PWA Ready' }
                ].map((feature, idx) => (
                  <span
                    key={idx}
                    className="feature-pill px-6 py-3 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-orange-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-semibold shadow-md hover:shadow-warm-lg transition-all duration-300 flex items-center gap-2.5 hover:border-orange-300 dark:hover:border-orange-500/50"
                  >
                    <FontAwesomeIcon icon={feature.icon} className="w-4 h-4 text-orange-500" />
                    {feature.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="join" className="relative z-10 max-w-4xl mx-auto px-4 pb-32">
        <div className="cta-card bg-white dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-orange-100 dark:border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="p-10 sm:p-12">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Join a Wedding</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                Got a wedding code? Enter it below to start uploading photos instantly.
              </p>
            </div>
            <form onSubmit={handleJoin} className="space-y-5 mt-8">
              <Input
                type="text"
                placeholder="Enter wedding code (e.g., ABC12345)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                disabled={loading}
                className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {error && (
                <p className="text-base text-red-600 dark:text-red-400 font-medium">{error}</p>
              )}
              <Button 
                type="submit"
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white transition-all duration-300"
                disabled={!joinCode || loading}
              >
                <FontAwesomeIcon icon={faArrowRight} className="mr-3 w-4 h-4" />
                {loading ? 'Joining...' : 'Enter Gallery'}
              </Button>
            </form>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium mt-6">
              No registration needed • Works offline • Save to home screen
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Why Wedding Wall?</h2>
          <p className="text-lg text-gray-900 dark:text-gray-200 font-medium max-w-2xl mx-auto">Everything you need to capture and celebrate your special day</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: faRocket,
              title: 'Real-Time Updates',
              description: 'See guest photos instantly as they upload. No refresh needed.'
            },
            {
              icon: faMobileAlt,
              title: 'Mobile Optimized',
              description: 'Perfect for smartphones. Install as an app on home screen.'
            },
            {
              icon: faShieldAlt,
              title: 'Private & Secure',
              description: 'Only guests with the code can access your gallery.'
            },
            {
              icon: faCloud,
              title: 'Cloud Backup',
              description: 'Photos stored safely in the cloud. Never lose a moment.'
            },
            {
              icon: faCamera,
              title: 'No App Required',
              description: 'Works in any browser. No app download needed.'
            },
            {
              icon: faHeart,
              title: 'Beautiful Design',
              description: 'Instagram-story style interface. Simple and elegant.'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="feature-card p-8 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-warm-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-6 text-orange-500">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{feature.title}</h3>
              <p className="text-gray-900 dark:text-gray-300 text-base font-medium leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p className="flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-500" />
          Made with love for weddings • PWA ready for offline use
        </p>
      </div>
    </div>
  );
}
