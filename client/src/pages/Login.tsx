import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, Lock, Chrome, Apple, Sun, Moon, Home, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex flex-col lg:flex-row">
      <button
        onClick={toggleTheme}
        className="fixed top-3 right-3 sm:top-6 sm:right-6 z-50 p-2 sm:p-3 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform group"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
      <Link
        to="/"
        className="fixed top-3 left-1/2 -translate-x-1/2 sm:top-6 z-50 p-2 sm:p-3 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform group"
        aria-label="Go to home"
      >
        <Home className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
      </Link>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 dark:from-cyan-900 dark:via-teal-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-cyan-600/20 dark:from-cyan-500/10 dark:via-teal-500/10 dark:to-cyan-600/10" />
        <img
          src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Online Shopping"
          className="w-full h-full object-cover mix-blend-overlay opacity-40 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent dark:from-[#0a0a0f] dark:via-transparent dark:to-transparent" />

        <div className="absolute top-8 left-8">
          <img
            src="/logo.jpg"
            alt="REAGLE-X Logo"
            className="h-16 w-16 rounded-full object-cover shadow-lg"
          />
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Welcome Back to the Future.
          </h1>
          <p className="text-lg text-cyan-100 dark:text-cyan-100 leading-relaxed max-w-lg">
            Continue your revolutionary shopping journey with REAGLE-X.
            Access exclusive deals and seamless transactions in seconds.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-6 sm:mb-8 lg:hidden text-center">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.jpg"
                alt="REAGLE-X Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-lg"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Sign in to your Reaglex account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
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
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-gray-50 dark:bg-[#0a0a0f] text-gray-500 dark:text-gray-400">OR SIGN IN WITH</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition text-sm sm:text-base"
              >
                <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition text-sm sm:text-base"
              >
                <Apple className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">Apple</span>
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6 sm:mt-8 text-sm sm:text-base">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
