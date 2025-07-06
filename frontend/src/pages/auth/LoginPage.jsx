import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo login helpers
  const loginAsPatient = async () => {
    setEmail('patient@example.com');
    setPassword('password');
    
    setError('');
    setLoading(true);
    
    try {
      await login('patient@example.com', 'password');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsMedical = async () => {
    setEmail('doctor@example.com');
    setPassword('password');
    
    setError('');
    setLoading(true);
    
    try {
      await login('doctor@example.com', 'password');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-neutral-900 dark:text-white mb-8">
              Log in to PulseChain
            </h2>
            
            {/* Demo login notice */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
              <h3 className="font-medium text-primary-700 dark:text-primary-300 mb-2">Demo Accounts</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Use these demo accounts to explore the platform:
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={loginAsPatient}
                  className="px-3 py-2 text-xs bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded hover:bg-primary-200 dark:hover:bg-primary-700"
                >
                  Patient Demo
                </button>
                <button
                  onClick={loginAsMedical}
                  className="px-3 py-2 text-xs bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-200 rounded hover:bg-primary-200 dark:hover:bg-primary-700"
                >
                  Medical Staff Demo
                </button>
              </div>
            </div>
            
            {error && (
              <div className="alert alert-danger flex items-center mb-6">
                <FiAlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="form-label">Password</label>
                  <a href="#" className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-600">
            <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;