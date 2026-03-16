'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faImages, 
  faUsers, 
  faCamera,
  faBars,
  faTimes,
  faHeart,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect and initial theme check
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Check system preference or localStorage
    // Default to light mode as requested
    /* 
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    */

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { name: 'Home', icon: faHome, href: '/' },
    { name: 'Features', icon: faCamera, href: '#features' }, // We'll add ID to features section
    { name: 'Join', icon: faUsers, href: '#join' },         // We'll add ID to join section
    { name: 'Create', icon: faHeart, href: '#create' },     // We'll add ID to create section
  ];

  if (!mounted) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Glassy pill navigation */}
        <div className={`backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl px-6 py-3 shadow-warm-lg transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-black/80 shadow-xl' : 'bg-white/60 dark:bg-black/40'}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faHeart} className="text-sm" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-xl hidden sm:inline" style={{ fontFamily: 'var(--font-playfair)' }}>
                Wedding Wall
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all duration-300 flex items-center space-x-2 group"
                >
                  <FontAwesomeIcon icon={item.icon} className="group-hover:text-orange-500 dark:group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all"
                aria-label="Toggle Dark Mode"
              >
                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Dark Mode Toggle (Mobile) */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
              >
                <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="text-lg" />
              </button>
              
              {/* Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-white p-2 rounded-full hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
              >
                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation (dropdown) */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 border-t border-gray-100 dark:border-white/10 pt-2" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all duration-300"
                    style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-white/10 flex items-center justify-center text-orange-500 dark:text-white">
                        <FontAwesomeIcon icon={item.icon} className="text-sm" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
