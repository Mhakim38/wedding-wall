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
      <div className="relative overflow-hidden pt-16">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-animation absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="float-animation absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animationDelay: '-1.5s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Navigation removed - moved to global layout */}

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-4 py-14 sm:py-24">
            <div className="text-center space-y-12 sm:space-y-16">
              {/* Main Headline */}
              <div className="space-y-6 sm:space-y-8">
                <h1 className="hero-title text-5xl sm:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight drop-shadow-sm" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Capture Every
                  <span className="block mt-2 sm:mt-4 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-500 cursor-default">
                    Beautiful Moment
                  </span>
                </h1>
                <p className="hero-subtitle text-sm sm:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide px-4">
                  Instagram-story style photo gallery for weddings. Guests snap, you see instantly. No app required.
                </p>
              </div>

              {/* CTA Section - Moved up for better flow */}
              <div className="max-w-md mx-auto relative z-20">
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-orange-100 dark:border-white/10 overflow-hidden backdrop-blur-md p-8 sm:p-12 transform transition-all hover:shadow-warm-xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Join the Celebration</h3>
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      Enter the wedding code to start sharing
                    </p>
                  </div>
                  
                  <form onSubmit={handleJoin} className="space-y-6">
                    <div className="relative group">
                      <Input
                        type="text"
                        placeholder="WEDDING CODE"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={8}
                        disabled={loading}
                        className="h-16 text-center text-xl tracking-widest font-semibold px-4 rounded-xl border-2 border-gray-100 dark:border-white/5 text-gray-900 dark:text-white bg-gray-50/50 dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-600 transition-all"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-center text-red-500 font-medium animate-pulse">{error}</p>
                    )}
                    <Button 
                      type="submit"
                      className="w-full h-16 text-lg font-medium rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                      disabled={!joinCode || loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faRocket} className="animate-bounce" /> Joining...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Enter Gallery <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Feature Pills - Simplified and moved down */}
              <div className="flex flex-wrap gap-4 justify-center opacity-80 pt-12">
                {[
                  { icon: faMobileAlt, text: 'Mobile First' },
                  { icon: faRocket, text: 'Real-Time' },
                  { icon: faShieldAlt, text: 'Private' },
                  { icon: faCloud, text: 'Cloud' },
                ].map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-full bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 text-gray-600 dark:text-gray-400 text-xs font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={feature.icon} className="w-3 h-3 text-orange-400" />
                    {feature.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid Section */}
      <div id="features" className="relative z-10 max-w-6xl mx-auto px-4 py-14 sm:py-24">
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
