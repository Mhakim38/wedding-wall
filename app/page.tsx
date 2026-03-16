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
      router.push(`/auth/join?code=${joinCode.toUpperCase()}`);
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
      // Convert date string to ISO timestamp (date input gives YYYY-MM-DD, need full ISO)
      const eventDateTime = new Date(eventDate).toISOString();

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: coupleName,
          eventDate: eventDateTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create gallery');
      }

      const session = await response.json();
      router.push(`/gallery?sessionId=${session.id}`);
    } catch (err) {
      console.error('Error creating gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-animation absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="float-animation absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animationDelay: '-1.5s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="flex items-center justify-between px-6 py-6 backdrop-blur-sm max-w-7xl mx-auto">
            <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-playfair)' }}>
              Wedding Wall
            </div>
            <div className="text-base text-gray-700 font-medium">Instant Photo Sharing for Weddings</div>
          </nav>

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto px-4 py-20 sm:py-32">
            <div className="text-center space-y-10">
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="hero-title text-6xl sm:text-7xl font-bold text-gray-900 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Capture Every
                  <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Beautiful Moment
                  </span>
                </h1>
                <p className="hero-title text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto font-medium leading-relaxed">
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
                    className="feature-pill px-6 py-3 rounded-full bg-white/70 backdrop-blur border border-orange-200 text-gray-800 text-sm font-semibold shadow-md hover:shadow-warm-lg transition-all duration-300 flex items-center gap-2.5 hover:border-orange-300"
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
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-32">
        <div className="cta-card bg-white rounded-3xl shadow-warm-lg border border-orange-100 overflow-hidden">
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="w-full justify-start rounded-none bg-transparent border-b border-gray-200 h-auto p-0">
              <TabsTrigger value="join" className="flex-1 py-5 px-6 rounded-none font-semibold text-base data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent hover:bg-orange-50/50 transition-colors">
                <FontAwesomeIcon icon={faUsers} className="mr-3 w-4 h-4" />
                Join Wedding
              </TabsTrigger>
              <TabsTrigger value="create" className="flex-1 py-5 px-6 rounded-none font-semibold text-base data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent hover:bg-orange-50/50 transition-colors">
                <FontAwesomeIcon icon={faCamera} className="mr-3 w-4 h-4" />
                Create Gallery
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="p-10 sm:p-12">
              <TabsContent value="join" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Join a Wedding</h3>
                  <p className="text-lg text-gray-700 font-medium">
                    Got a wedding code? Enter it below to start uploading photos instantly.
                  </p>
                </div>
                <form onSubmit={handleJoin} className="space-y-5">
                  <Input
                    type="text"
                    placeholder="Enter wedding code (e.g., ABC12345)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    disabled={loading}
                    className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                  />
                  {error && (
                    <p className="text-base text-red-600 font-medium">{error}</p>
                  )}
                  <Button 
                    type="submit"
                    className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
                    disabled={!joinCode || loading}
                  >
                    <FontAwesomeIcon icon={faArrowRight} className="mr-3 w-4 h-4" />
                    {loading ? 'Joining...' : 'Enter Gallery'}
                  </Button>
                </form>
                <p className="text-sm text-gray-600 text-center font-medium">
                  No registration needed • Works offline • Save to home screen
                </p>
              </TabsContent>

              <TabsContent value="create" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Create New Gallery</h3>
                  <p className="text-lg text-gray-700 font-medium">
                    Set up a wedding gallery and get a unique code to share with guests.
                  </p>
                </div>
                <form onSubmit={handleCreateGallery} className="space-y-5">
                  <Input
                    type="text"
                    placeholder="Couple's names (e.g., John & Sarah)"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    disabled={loading}
                    className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                  />
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    disabled={loading}
                    className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                  />
                  {error && (
                    <p className="text-base text-red-600 font-medium">{error}</p>
                  )}
                  <Button 
                    type="submit"
                    className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300"
                    disabled={!coupleName || !eventDate || loading}
                  >
                    <FontAwesomeIcon icon={faCamera} className="mr-3 w-4 h-4" />
                    {loading ? 'Creating...' : 'Create Gallery'}
                  </Button>
                </form>
                <p className="text-sm text-gray-600 text-center font-medium">
                  Your gallery code will be generated instantly
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Why Wedding Wall?</h2>
          <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">Everything you need to capture and celebrate your special day</p>
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
              className="feature-card p-8 rounded-2xl bg-white border border-gray-200 hover:border-orange-300 hover:shadow-warm-lg transition-all duration-300 hover:scale-105"
            >
              <div className="text-5xl mb-6 text-orange-500">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>{feature.title}</h3>
              <p className="text-gray-700 text-base font-medium leading-relaxed">{feature.description}</p>
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
