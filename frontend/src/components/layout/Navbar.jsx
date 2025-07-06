import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';

function Navbar({ darkMode, toggleDarkMode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FaHeartbeat className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-primary-500">PulseChain</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400">
                  Dashboard
                </Link>
                <Link to="/documents" className="px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400">
                  Documents
                </Link>
              </>
            ) : (
              <>
                <Link to="/scan" className="px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400">
                  Scan QR
                </Link>
              </>
            )}
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400">
                  <FiUser className="h-5 w-5" />
                  <span>{currentUser?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-left text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <FiLogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-800 shadow-inner">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/documents" 
                  className="block px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Documents
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/scan" 
                  className="block px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Scan QR
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-neutral-600 hover:text-primary-500 dark:text-neutral-200 dark:hover:text-primary-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;