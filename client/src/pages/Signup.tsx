import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Lock, RotateCw, Chrome, Apple, Sun, Moon, Home, Briefcase } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
      });

      navigate('/');
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
          src="https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Shopping Experience"
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
            The Future of E-Commerce is Here.
          </h1>
          <p className="text-lg text-cyan-100 dark:text-cyan-100 leading-relaxed max-w-lg">
            Discover a revolutionary shopping experience with REAGLE-X.
            Sign up to unlock exclusive deals and seamless transactions.
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
              Join the Future of Shopping
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
              Create your Reaglex account to get started.
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <RotateCw className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                    formData.role === 'buyer'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e]/80 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <User className={`h-5 w-5 sm:h-6 sm:w-6 ${
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
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'seller' })}
                  className={`relative flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm ${
                    formData.role === 'seller'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e]/80 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <Briefcase className={`h-5 w-5 sm:h-6 sm:w-6 ${
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
                    <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a2e] text-orange-600 focus:ring-2 focus:ring-orange-500/50 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 sm:mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 sm:px-4 bg-gray-50 dark:bg-[#0a0a0f] text-gray-500 dark:text-gray-400">OR SIGN UP WITH</span>
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
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
