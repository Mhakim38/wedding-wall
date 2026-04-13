'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faHeart, faLock, faQrcode, faTimes, faUserTie, faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PushNotificationTest } from '@/components/PushNotificationTest';

export default function AdminPage() {
  const router = useRouter();
  
  // Gallery creation state
  const [coupleName, setCoupleName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [giftQrFile, setGiftQrFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Family password generation state
  const [weddingCode, setWeddingCode] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);
  const [familyError, setFamilyError] = useState('');
  const [familySuccess, setFamilySuccess] = useState('');

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleName || !eventDate || !adminPassword) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const eventDateTime = new Date(eventDate).toISOString();
      let giftQrCodeUrl = null;
      let giftQrCodeKey = null;

      // Upload Gift QR if present
      if (giftQrFile) {
        const formData = new FormData();
        formData.append('adminPassword', adminPassword);
        formData.append('file', giftQrFile);

        const uploadRes = await fetch('/api/admin/upload-gift-qr', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Failed to upload QR code');
        }

        const uploadData = await uploadRes.json();
        giftQrCodeUrl = uploadData.url;
        giftQrCodeKey = uploadData.key;
      }

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: coupleName,
          eventDate: eventDateTime,
          adminPassword: adminPassword,
          giftQrCodeUrl,
          giftQrCodeKey,
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

  const handleGenerateFamilyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weddingCode || !familyEmail || !superAdminPassword) {
      setFamilyError('Please fill in all fields');
      return;
    }

    setFamilyError('');
    setFamilySuccess('');
    setFamilyLoading(true);

    try {
      const response = await fetch('/api/admin/generate-family-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingCode,
          familyEmail,
          adminPassword: superAdminPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate family password');
      }

      const data = await response.json();
      setFamilySuccess(`✅ Family password generated and sent to ${familyEmail}`);
      
      // Reset form
      setWeddingCode('');
      setFamilyEmail('');
      setSuperAdminPassword('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setFamilySuccess(''), 5000);
    } catch (err) {
      console.error('Error generating family password:', err);
      setFamilyError(err instanceof Error ? err.message : 'Failed to generate family password');
    } finally {
      setFamilyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300 flex flex-col justify-between">
      <div className="relative overflow-hidden pt-16 flex-grow flex items-center justify-center">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="float-animation absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="float-animation absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" style={{ animationDelay: '-1.5s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl px-4">
          <div className="max-w-md mx-auto">
            <div className="cta-card bg-white dark:bg-gray-900/80 rounded-3xl shadow-warm-lg border border-orange-100 dark:border-white/10 overflow-hidden backdrop-blur-sm">
              <div className="p-10 sm:p-12">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>Create Gallery</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                    Admin Dashboard • Secret Coffee ☕
                  </p>
                </div>

                <form onSubmit={handleCreateGallery} className="space-y-6 mt-8">
                  {/* Error Message - On top of Couple Names */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                      <FontAwesomeIcon icon={faLock} className="mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Couple Names
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={coupleName}
                        onChange={(e) => setCoupleName(e.target.value)}
                        disabled={loading}
                        className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Event Date
                      </label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        disabled={loading}
                        className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Gift QR Code (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setGiftQrFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="qr-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="qr-upload"
                          className={`flex items-center justify-center w-full h-14 px-4 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                            giftQrFile 
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' 
                              : 'border-gray-300 dark:border-gray-600 hover:border-orange-500 bg-gray-50 dark:bg-black/30 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {giftQrFile ? (
                            <span className="font-medium truncate flex items-center">
                              <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                              {giftQrFile.name}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                              Upload QR Code Image
                            </span>
                          )}
                        </label>
                        {giftQrFile && !loading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setGiftQrFile(null);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        Guests can scan this to send money gifts (Angpao).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Admin Password
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          disabled={loading}
                          className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white transition-all duration-300"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faCamera} className="mr-3 w-4 h-4" />
                    {loading ? 'Creating...' : 'Create Gallery'}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-10 border-t border-gray-200 dark:border-white/10"></div>

                {/* Family Password Generation Section */}
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Generate Family Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Create and send family panel access credentials
                  </p>

                  <form onSubmit={handleGenerateFamilyPassword} className="space-y-6">
                    {familyError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        <FontAwesomeIcon icon={faLock} className="mr-2" />
                        {familyError}
                      </div>
                    )}

                    {familySuccess && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        {familySuccess}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                          Wedding Code
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., JOHN-JANE-2025"
                          value={weddingCode}
                          onChange={(e) => setWeddingCode(e.target.value.toUpperCase())}
                          disabled={familyLoading}
                          className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 font-mono tracking-wide"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                          Family Member Email
                        </label>
                        <Input
                          type="email"
                          placeholder="family@example.com"
                          value={familyEmail}
                          onChange={(e) => setFamilyEmail(e.target.value)}
                          disabled={familyLoading}
                          className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                          Super Admin Password
                        </label>
                        <Input
                          type="password"
                          placeholder="Enter your admin password"
                          value={superAdminPassword}
                          onChange={(e) => setSuperAdminPassword(e.target.value)}
                          disabled={familyLoading}
                          className="h-14 text-base px-4 rounded-xl border-2 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-purple-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300"
                      disabled={familyLoading}
                    >
                      <FontAwesomeIcon icon={faKey} className="mr-3 w-4 h-4" />
                      {familyLoading ? 'Generating...' : 'Generate & Send Password'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-white/10 py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p className="flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-red-500" />
          Admin Area • Keep it Secret
        </p>
      </div>

      {/* Push Notification Test Component */}
      <PushNotificationTest />
    </div>
  );
}
