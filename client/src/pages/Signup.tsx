import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Lock, RotateCw, Chrome, Apple, Sun, Moon, Home, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';

// Basic guard against obvious SQL injection-style patterns.
// Real protection is still handled on the backend with validation and ORM.
function hasSQLInjectionRisk(value: string): boolean {
  const pattern = /(;|--|\/\*|\*\/|\b(OR|AND)\b\s+\d+=\d+|\bxp_)/i;
  return pattern.test(value);
}

export function Signup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToastStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic front-end validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      setLoading(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      setLoading(false);
      return;
    }

    // Very simple SQL-injection-style guard
    if (
      hasSQLInjectionRisk(formData.fullName) ||
      hasSQLInjectionRisk(formData.email) ||
      hasSQLInjectionRisk(formData.password)
    ) {
      setError('Input contains invalid characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Successful registration: show success message and redirect to login page
      showToast(
        formData.role === 'seller'
          ? 'Account created! Your seller profile is pending verification. Please log in to continue.'
          : 'Account created successfully! Please log in to continue.',
        'success'
      );

      // Give the toast ~2 seconds to be visible before navigating to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Network error. Please try again.');
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
          src="https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Shopping Experience"
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
                to="/"
                className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all group shadow-sm hover:shadow-md"
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
            <div className="mb-3 sm:mb-4 text-center">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">
                Join the Future of Shopping
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Create your Reaglex account to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg text-xs shadow-md shadow-red-200/50 dark:shadow-red-900/30">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <RotateCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 focus:shadow-md focus:shadow-orange-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs shadow-sm hover:shadow-md ${
                      formData.role === 'buyer'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e]/80 hover:border-orange-300 dark:hover:border-orange-700'
                    }`}
                  >
                    <User className={`h-4 w-4 ${
                      formData.role === 'buyer'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.role === 'buyer'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Buy Products
                    </span>
                    {formData.role === 'buyer' && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm"></div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'seller' })}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs shadow-sm hover:shadow-md ${
                      formData.role === 'seller'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e]/80 hover:border-orange-300 dark:hover:border-orange-700'
                    }`}
                  >
                    <Briefcase className={`h-4 w-4 ${
                      formData.role === 'seller'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      formData.role === 'seller'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Sell Products
                    </span>
                    {formData.role === 'seller' && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm"></div>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-orange-600 focus:ring-2 focus:ring-orange-500/50 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition">
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 rounded-lg text-sm font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white/95 dark:bg-[#1a1a2e]/95 text-gray-500 dark:text-gray-400">OR SIGN UP WITH</span>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition-all shadow-sm hover:shadow-md text-xs"
                >
                  <Chrome className="h-3.5 w-3.5" />
                  <span className="font-medium">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a2e] transition-all shadow-sm hover:shadow-md text-xs"
                >
                  <Apple className="h-3.5 w-3.5" />
                  <span className="font-medium">Apple</span>
                </button>
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-3 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
