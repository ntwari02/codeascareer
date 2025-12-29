import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Mail, ArrowLeft, Sun, Moon, Home } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToastStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Call MongoDB API for password reset
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset code. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      showToast('Verification code sent! Please check your email.', 'success');
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    } catch (err: any) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-page background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 dark:from-cyan-900 dark:via-teal-900 dark:to-blue-950">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-cyan-600/20 dark:from-cyan-500/10 dark:via-teal-500/10 dark:to-cyan-600/10" />
        <img
          src="https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Secure Shopping"
          className="w-full h-full object-cover mix-blend-overlay opacity-40 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent dark:from-[#0a0a0f] dark:via-transparent dark:to-transparent" />
        {/* Dark overlay for better form readability */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      </div>

      {/* Centered form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-2 sm:py-4">
        <div className="w-full max-w-md max-h-[98vh] sm:max-h-[95vh]">
          {/* Form container with semi-transparent background */}
          <div className="bg-white/95 dark:bg-[#1a1a2e]/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 p-3 sm:p-5 border border-white/20 dark:border-gray-700/50 max-h-full overflow-y-auto">
            {/* Header with logo and icons */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Link
                to="/login"
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all group shadow-sm hover:shadow-md"
                aria-label="Back to login"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
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
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all group shadow-sm hover:shadow-md"
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
            <div className="mb-4 sm:mb-6 text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                Reset Your Password
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a verification code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs shadow-md shadow-red-200/50 dark:shadow-red-900/30">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 p-2 rounded-lg text-xs shadow-md shadow-green-200/50 dark:shadow-green-900/30">
                  Verification code sent! Redirecting to OTP verification...
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
              >
                {loading ? 'Sending Code...' : success ? 'Code Sent!' : 'Send Verification Code'}
              </button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-3 text-xs">
              Remember your password?{' '}
              <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
