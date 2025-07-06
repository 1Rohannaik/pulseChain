import { Link } from 'react-router-dom';
import { FaHeartbeat } from 'react-icons/fa';
import { FiMail, FiPhone } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-neutral-800 shadow-inner py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and brief description */}
          <div>
            <Link to="/" className="flex items-center">
              <FaHeartbeat className="h-7 w-7 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-primary-500">PulseChain</span>
            </Link>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Instant medical access when every second counts. Your critical health information, always available when you need it most.
            </p>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="mt-4 space-y-2">
              <Link to="/" className="block text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                Home
              </Link>
              <Link to="/login" className="block text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                Login
              </Link>
              <Link to="/signup" className="block text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                Sign Up
              </Link>
              <Link to="/scan" className="block text-neutral-600 hover:text-primary-500 dark:text-neutral-400 dark:hover:text-primary-400 text-sm">
                Scan QR Code
              </Link>
            </div>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Contact
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-neutral-600 dark:text-neutral-400 text-sm">
                <FiMail className="h-4 w-4 mr-2" />
                <span>support@pulsechain.com</span>
              </div>
              <div className="flex items-center text-neutral-600 dark:text-neutral-400 text-sm">
                <FiPhone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © {currentYear} PulseChain. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;