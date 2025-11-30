import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, Globe, DollarSign, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClickOutside } from '../hooks/useClickOutside';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme, language, setLanguage, currency, setCurrency } = useTheme();
  const { user, signOut } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  useClickOutside(langDropdownRef, () => setShowLangDropdown(false));
  useClickOutside(currencyDropdownRef, () => setShowCurrencyDropdown(false));
  useClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const cartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white dark:bg-dark-secondary shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-dark animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.jpg"
                alt="REAGLE-X Logo"
                className="h-14 w-14 rounded-full object-cover transition-transform hover:scale-105 shadow-md"
              />
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/"
                className={`transition ${
                  location.pathname === '/'
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`transition ${
                  location.pathname === '/products'
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Categories
              </Link>
              <Link
                to="/collections"
                className={`transition ${
                  location.pathname.startsWith('/collections') || location.pathname.startsWith('/collection/')
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Collections
              </Link>
              <Link
                to="/deals"
                className={`transition ${
                  location.pathname === '/deals'
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Deals
              </Link>
              <Link
                to="/new-arrivals"
                className={`transition ${
                  location.pathname === '/new-arrivals'
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                New Arrivals
              </Link>
              <Link
                to="/trending"
                className={`transition ${
                  location.pathname === '/trending'
                    ? 'text-orange-600 dark:text-orange-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Trending
              </Link>
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-primary border border-gray-200 dark:border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-primary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card transition hover:scale-105 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-primary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm">{currentLang.flag}</span>
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-2 border border-gray-200 dark:border-dark animate-fadeIn">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-primary flex items-center gap-3 transition"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={currencyDropdownRef}>
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-dark-primary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-semibold">{currentCurrency.code}</span>
              </button>

              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-2 border border-gray-200 dark:border-dark animate-fadeIn">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code as any);
                        setShowCurrencyDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-primary flex items-center gap-3 transition"
                    >
                      <span className="font-semibold">{curr.symbol}</span>
                      <span>{curr.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/wishlist" className="relative text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
              <Heart className="h-6 w-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scaleIn">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
              <ShoppingCart className="h-6 w-6" />
              {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-scaleIn">
                  {cartQuantity}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group" ref={userDropdownRef}>
                <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-200 dark:border-dark">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-primary transition">
                    Dashboard
                  </Link>
                  <Link to="/dashboard/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-primary transition">
                    My Orders
                  </Link>
                  <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-primary transition">
                    Profile
                  </Link>
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-dark-primary transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-orange-700 transition shadow-md hover:shadow-lg">
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 dark:text-gray-300"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-primary border border-gray-200 dark:border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>
      </div>

      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-dark animate-slideDown">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/products"
              className={`block transition ${
                location.pathname === '/products'
                  ? 'text-orange-600 dark:text-orange-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/collections"
              className={`block transition ${
                location.pathname.startsWith('/collections') || location.pathname.startsWith('/collection/')
                  ? 'text-orange-600 dark:text-orange-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Collections
            </Link>
            <Link
              to="/deals"
              className={`block transition ${
                location.pathname === '/deals'
                  ? 'text-orange-600 dark:text-orange-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Deals
            </Link>
            <Link to="/wishlist" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
              <Heart className="h-5 w-5" />
              <span>Wishlist ({wishlistItems.length})</span>
            </Link>
            <Link to="/cart" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart ({cartQuantity})</span>
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition">
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-3 text-red-600 w-full text-left transition"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="block bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg text-center transition shadow-md hover:shadow-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
