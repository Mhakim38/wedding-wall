'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faCheck } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface WelcomeNameModalProps {
  onNameSubmit: (name: string) => void;
}

export default function WelcomeNameModal({ onNameSubmit }: WelcomeNameModalProps) {
  const [name, setName] = useState('');
  const [agreedToTnC, setAgreedToTnC] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if name already exists in localStorage
    const savedName = localStorage.getItem('guestName');
    if (!savedName) {
      // Small delay for smooth entrance
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && agreedToTnC) {
      localStorage.setItem('guestName', name.trim());
      localStorage.setItem('agreedToTnC', 'true');
      setIsVisible(false);
      setTimeout(() => onNameSubmit(name.trim()), 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-white dark:border-gray-800 animate-scaleIn"
        style={{
          animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards'
        }}
      >
        {/* Decorative Heart Icon */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-full p-4 shadow-lg animate-bounce">
            <FontAwesomeIcon icon={faHeart} className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-6 mt-4">
          <div className="space-y-2">
            <h2 
              className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Welcome! 💕
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base">
              Please tell us your name so we can personalize your experience
            </p>
          </div>

          {/* Name Input Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Your beautiful name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-14 text-base px-5 rounded-full border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-black/50 focus:border-orange-500 focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-center font-medium"
              />
            </div>

            {/* TnC Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="tnc"
                checked={agreedToTnC}
                onChange={(e) => setAgreedToTnC(e.target.checked)}
                className="mt-1 w-5 h-5 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="tnc" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                I agree to the{' '}
                <Link href="/tnc" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-semibold">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link href="/privacy-policy" target="_blank" className="text-orange-600 dark:text-orange-400 hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || !agreedToTnC}
              className="w-full h-14 text-base font-semibold rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Continue to Gallery ✨
            </Button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            We&apos;ll remember your name for this visit
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
