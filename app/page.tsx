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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      router.push(`/join?code=${joinCode.toUpperCase()}`);
    } catch (err) {
      setError('Failed to join');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleName || !eventDate) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: coupleName,
          eventDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create gallery');
      }

      const session = await response.json();
      router.push(`/gallery?sessionId=${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-animation absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="float-animation absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animationDelay: '-1.5s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between px-6 py-4 backdrop-blur-sm max-w-7xl mx-auto">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Wedding Wall
            </div>
            <div className="text-sm text-gray-600">Instant Photo Sharing for Weddings</div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
            <div className="text-center space-y-8">
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="hero-title text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Capture Every
                  <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Beautiful Moment
                  </span>
                </h1>
                <p className="hero-title text-xl text-gray-600 max-w-2xl mx-auto">
                  Instagram-story style photo gallery for weddings. Guests snap, you see instantly. No app required.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { icon: faMobileAlt, text: 'Mobile First' },
                  { icon: faRocket, text: 'Real-Time' },
                  { icon: faShieldAlt, text: 'Private Gallery' },
                  { icon: faCloud, text: 'Cloud Storage' },
                  { icon: faCamera, text: 'PWA Ready' }
                ].map((feature, idx) => (
                  <span
                    key={idx}
                    className="feature-pill px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-orange-200 text-gray-700 text-sm font-medium shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={feature.icon} className="w-4 h-4" />
                    {feature.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="cta-card bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-gray-200 h-auto p-0">
              <TabsTrigger value="join" className="flex-1 py-4 rounded-none font-semibold data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent">
                <FontAwesomeIcon icon={faUsers} className="mr-2 w-4 h-4" />
                Join Wedding
              </TabsTrigger>
              <TabsTrigger value="create" className="flex-1 py-4 rounded-none font-semibold data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent">
                <FontAwesomeIcon icon={faCamera} className="mr-2 w-4 h-4" />
                Create Gallery
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="p-8">
              <TabsContent value="join" className="space-y-4 mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Join a Wedding</h3>
                <p className="text-gray-600">
                  Got a wedding code? Enter it below to start uploading photos instantly.
                </p>
                <form onSubmit={handleJoin} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Enter wedding code (e.g., ABC12345)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    disabled={loading}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <Button 
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={!joinCode || loading}
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="mr-2 w-4 h-4" />
                    {loading ? 'Joining...' : 'Enter Gallery'}
                  </Button>
                </form>
                <p className="text-xs text-gray-500 text-center">
                  No registration needed • Works offline • Save to home screen
                </p>
              </TabsContent>

              <TabsContent value="create" className="space-y-4 mt-0">
                <h3 className="text-2xl font-bold text-gray-900">Create New Gallery</h3>
                <p className="text-gray-600">
                  Set up a wedding gallery and get a unique code to share with guests.
                </p>
                <form onSubmit={handleCreateGallery} className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Couple's names (e.g., John & Sarah)"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={loading}
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <Button 
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={!coupleName || !eventDate || loading}
                  >
                    <FontAwesomeIcon icon={faCamera} className="mr-2 w-4 h-4" />
                    {loading ? 'Creating...' : 'Create Gallery'}
                  </Button>
                </form>
                <p className="text-xs text-gray-500 text-center">
                  Your gallery code will be generated instantly
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Wedding Wall?</h2>
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
              className="feature-card p-6 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="text-4xl mb-4 text-orange-500">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-8 text-center text-gray-600 text-sm">
        <p className="flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-500" />
          Made with love for weddings • PWA ready for offline use
        </p>
      </div>
    </div>
  );
}
