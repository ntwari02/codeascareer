import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, ArrowLeft, Sun, Moon, Home } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform group"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
      <Link
        to="/"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 p-3 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-transform group"
        aria-label="Go to home"
      >
        <Home className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
      </Link>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 dark:from-cyan-900 dark:via-teal-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-cyan-600/20 dark:from-cyan-500/10 dark:via-teal-500/10 dark:to-cyan-600/10" />
        <img
          src="https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Secure Shopping"
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
            Don't Worry, We've Got You.
          </h1>
          <p className="text-lg text-cyan-100 dark:text-cyan-100 leading-relaxed max-w-lg">
            Forgot your password? No problem. We'll help you reset it quickly and securely.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.jpg"
                alt="REAGLE-X Logo"
                className="h-16 w-16 rounded-full object-cover shadow-lg"
              />
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Reset Your Password
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Enter your email address and we'll send you a verification code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm">
                Verification code sent! Redirecting to OTP verification...
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Sending Code...' : success ? 'Code Sent!' : 'Send Verification Code'}
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            Remember your password?{' '}
            <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
