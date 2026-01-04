import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
<<<<<<< HEAD
import { Mail, Lock, Chrome, Apple, Sun, Moon, Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';

// Basic guard against obvious SQL injection-style patterns.
// Real protection is still handled on the backend with parameterized queries / ORMs.
function hasSQLInjectionRisk(value: string): boolean {
  const pattern = /(;|--|\/\*|\*\/|\b(OR|AND)\b\s+\d+=\d+|\bxp_)/i;
  return pattern.test(value);
}

export function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuthStore();
  const { showToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

     // Basic front-end validation
     if (!email || !password) {
       setError('Please enter both email and password');
       setLoading(false);
       return;
     }

     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailPattern.test(email)) {
       setError('Please enter a valid email address');
       setLoading(false);
       return;
     }

     if (password.length < 6) {
       setError('Password must be at least 6 characters long');
       setLoading(false);
       return;
     }

     // Very simple SQL-injection-style guard
     if (hasSQLInjectionRisk(email) || hasSQLInjectionRisk(password)) {
       setError('Input contains invalid characters');
       setLoading(false);
       return;
     }

    // Validate against database
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Login successful: show success message and redirect based on role
      showToast('Login successful. Welcome back to Reaglex!', 'success');

      const { user } = useAuthStore.getState();

      if (user?.role === 'seller') {
        navigate('/seller');
      } else if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-page background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 dark:from-cyan-900 dark:via-teal-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-cyan-600/20 dark:from-cyan-500/10 dark:via-teal-500/10 dark:to-cyan-600/10" />
        <img
          src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Online Shopping"
          className="w-full h-full object-cover mix-blend-overlay opacity-40 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent dark:from-[#0a0a0f] dark:via-transparent dark:to-transparent" />
        {/* Dark overlay for better form readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </div>

      {/* Centered form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          {/* Form container with semi-transparent background */}
          <div className="bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 p-4 sm:p-6 md:p-8 lg:p-10 border border-white/20 dark:border-gray-700/50 my-4 sm:my-6 md:my-8">
            {/* Header with logo and icons */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Link
                to="/"
                className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all group shadow-sm hover:shadow-md"
                aria-label="Go to home"
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              </Link>
              
              {/* Logo in center */}
              <div className="flex-1 flex justify-center">
                <img
                  src="/logo.jpg"
                  alt="REAGLE-X Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-lg shadow-black/20"
                />
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all group shadow-sm hover:shadow-md"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>
            </div>

            {/* Title section - more compact */}
            <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 md:mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                Sign in to your Reaglex account to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm shadow-md shadow-red-200/50 dark:shadow-red-900/30">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-orange-600 focus:ring-2 focus:ring-orange-500/50"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 sm:mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white/95 dark:bg-[#1a1a2e]/95 text-gray-500 dark:text-gray-400">OR SIGN IN WITH</span>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsGoogleLoading(true);
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    window.location.href = `${API_BASE_URL}/auth/google?role=buyer`;
                  }}
<<<<<<< HEAD
                  disabled={isGoogleLoading}
                  className="group flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 md:py-3 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 active:scale-95 text-xs sm:text-sm md:text-base relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full group-hover:translate-x-0 animate-shimmer"></div>
                  {isGoogleLoading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-spin relative z-10" />
                  ) : (
                    <Chrome className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
                  )}
                  <span className="font-medium relative z-10">{isGoogleLoading ? 'Signing in...' : 'Google'}</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-3 py-2 sm:py-2.5 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition-all shadow-sm hover:shadow-md text-xs sm:text-sm"
                >
                  <Apple className="h-4 w-4" />
                  <span className="font-medium">Apple</span>
                </button>
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-4 sm:mt-5 md:mt-6 pb-2 sm:pb-3 md:pb-4 text-xs sm:text-sm md:text-base">
              Don't have an account?{' '}
              <Link to="/signup" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition-colors duration-200 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
