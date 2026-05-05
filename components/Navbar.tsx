'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}

function NavbarContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const isHomePage = pathname === '/';
  const isGalleryPage = pathname?.startsWith('/gallery');

  // Determine Home link destination
  // If in gallery (wall) or upload page, Home should go to Wall (Gallery view)
  const homeHref = (isGalleryPage && sessionId) ? `/gallery?sessionId=${sessionId}` : '/';

  // Handle scroll effect and initial theme check
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  const navItems = isHomePage ? [
    { name: 'Home', icon: faHome, href: '/' },
    { name: 'Features', icon: faCamera, href: '#features' },
    { name: 'Join', icon: faUsers, href: '#join' },
  ] : [
    { name: 'Home', icon: faHome, href: homeHref },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <nav className={`sticky top-0 z-50 px-4 py-4 md:px-8 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`} style={{ paddingTop: `max(1rem, env(safe-area-inset-top))` }}>
      <div className="max-w-7xl mx-auto">
        {/* Glassy pill navigation */}
        <div className={`backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl px-6 py-3 shadow-warm-lg transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-black/80 shadow-xl' : 'bg-white/60 dark:bg-black/40'}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={homeHref} className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
                <img 
                  src="/logo.png" 
                  alt="Wedding Wall Logo" 
                  className="w-full h-full object-contain rounded-full shadow-md"
                />
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
                onClick={handleToggleDarkMode}
                className="ml-2 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all"
                aria-label="Toggle Dark Mode"
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-lg" />
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 md:hidden">
              {/* Dark Mode Toggle (Mobile) */}
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 transition-all"
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-lg" />
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

          {/* Mobile Navigation (dropdown) with smooth height transition */}
          <div 
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen 
                ? 'max-h-96 opacity-100 mt-2 border-t border-gray-100 dark:border-white/10 pt-1' 
                : 'max-h-0 opacity-0 mt-0 pt-0 border-transparent'
            }`}
          >
            <div className="space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-white transition-all duration-300"
                  // Remove inline animation to let CSS transition handle it, or keep it for items only
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
        </div>
      </div>
    </nav>
  );
}
