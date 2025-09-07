import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-8 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo and copyright */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span className="text-2xl font-bold text-green-600">EmissionX 🌿</span>
          <span className="text-gray-400 hidden md:inline mx-2">|</span>
          <p className="text-gray-600 text-sm">
            © 2025 EmissionX. All rights reserved.
          </p>
        </div>
        
        {/* Center: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
          <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm">Home</Link>
          <Link href="/calculator" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm">Calculator</Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm">Dashboard</Link>
          <Link href="/community" className="text-gray-600 hover:text-green-600 transition-colors duration-200 text-sm">Community</Link>
        </nav>
        
        {/* Right: Social Links */}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.46 5.92c-.8.36-1.67.6-2.58.71a4.48 4.48 0 001.97-2.48 8.94 8.94 0 01-2.83 1.08 4.48 4.48 0 00-7.63 4.08A12.7 12.7 0 013 4.89a4.48 4.48 0 001.39 5.98c-.7-.02-1.36-.21-1.94-.53v.05a4.48 4.48 0 003.6 4.4c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.48 4.48 0 004.18 3.11A9 9 0 012 19.54a12.7 12.7 0 006.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.2 0-.39-.01-.59a9.1 9.1 0 002.24-2.32z"/>
            </svg>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.38-2.03 1.01-2.75-.1-.26-.44-1.3.1-2.7 0 0 .83-.27 2.75 1.03a9.2 9.2 0 012.5-.34c.85 0 1.7.11 2.5.34 1.92-1.3 2.75-1.03 2.75-1.03.54 1.4.2 2.44.1 2.7.63.72 1.01 1.63 1.01 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z"/>
            </svg>
          </a>
          <a href="mailto:contact@emissionx.com" aria-label="Email" className="text-gray-400 hover:text-green-600 transition-colors duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;