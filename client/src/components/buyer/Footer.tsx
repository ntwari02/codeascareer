import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';

// Scroll to top handler
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export function Footer() {
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);
  return (
    <footer className="bg-gray-900 dark:bg-[#1a1a2e] text-white border-t border-gray-800 dark:border-gray-700">
      <div className="py-8 sm:py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-white">Stay in the Loop</h3>
              <p className="text-gray-300 dark:text-gray-400 text-base sm:text-lg">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </p>
            </div>
            <div>
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-transparent border-2 border-gray-600 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-400 transition text-sm sm:text-base"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  Subscribe
                </button>
              </form>
              <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-3">
                Join 50,000+ subscribers. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <img
                src="/logo.jpg"
                alt="REAGLE-X Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-lg"
              />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed max-w-md">
              The future of online shopping delivered today. Discover trending products, top deals, and new arrivals all in one place with secure payments and fast shipping.
            </p>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 text-white transition group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-white">Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-white transition group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs sm:text-sm break-all text-white">+14313062173</span>
                  <span className="text-xs sm:text-sm break-all text-white">+250 788 325 115</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-white transition group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm break-all text-white">reaglerobust2020@gmail.com</span>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3 flex-wrap">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <Facebook className="h-5 w-5 fill-current" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#000000] dark:bg-[#1a1a1a] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <Twitter className="h-5 w-5 fill-current" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gradient-to-br from-[#F56040] via-[#E1306C] to-[#833AB4] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#0077B5] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <Linkedin className="h-5 w-5 fill-current" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Shop</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-xs sm:text-sm">
              <li><Link to="/products" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">All Products</Link></li>
              <li><Link to="/products?new=true" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">New Arrivals</Link></li>
              <li><Link to="/products?trending=true" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Trending</Link></li>
              <li><Link to="/products?deals=true" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Top Deals</Link></li>
              <li><Link to="/products?category=electronics" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Electronics</Link></li>
              <li><Link to="/products?category=fashion" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Fashion</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Company</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-xs sm:text-sm">
              <li><Link to="/about" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/careers" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Careers</Link></li>
              <li><Link to="/blog" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Blog</Link></li>
              <li><Link to="/affiliate" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Affiliate Program</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Support</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-400 text-xs sm:text-sm">
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link to="/help" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Help Center</Link></li>
              <li><Link to="/faq" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">FAQ</Link></li>
              <li><Link to="/shipping" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Shipping Info</Link></li>
              <li><Link to="/returns" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Returns</Link></li>
              <li><Link to="/track" onClick={scrollToTop} className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Track Order</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-gray-400 text-xs sm:text-sm text-center sm:text-left">
              <p className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span>© {new Date().getFullYear()}</span>
                <span className="text-base sm:text-lg font-script text-white">
                  REAGLE-X
                </span>
                <span>, Inc. All rights reserved.</span>
              </p>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                <Link to="/privacy" onClick={scrollToTop} className="hover:text-orange-400 transition">Privacy Policy</Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/terms" onClick={scrollToTop} className="hover:text-orange-400 transition">Terms of Service</Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/cookies" onClick={scrollToTop} className="hover:text-orange-400 transition">Cookie Policy</Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <span className="text-gray-400 text-xs sm:text-sm">We accept:</span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                {/* Visa Logo */}
                <div className="w-10 h-6 sm:w-12 sm:h-8 bg-white rounded flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden p-1">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
                    alt="Visa" 
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const svg = target.nextElementSibling as SVGSVGElement;
                      if (svg) svg.style.display = 'block';
                    }}
                  />
                  <svg viewBox="0 0 100 32" className="w-full h-full hidden" preserveAspectRatio="xMidYMid meet">
                    <text x="50" y="20" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1434CB" textAnchor="middle">VISA</text>
                  </svg>
                </div>
                
                {/* Mastercard Logo */}
                <div className="w-10 h-6 sm:w-12 sm:h-8 bg-white rounded flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden p-1">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1200px-MasterCard_Logo.svg.png" 
                    alt="Mastercard" 
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const svg = target.nextElementSibling as SVGSVGElement;
                      if (svg) svg.style.display = 'block';
                    }}
                  />
                  <svg viewBox="0 0 24 16" className="w-full h-full hidden" preserveAspectRatio="xMidYMid meet">
                    <circle cx="9" cy="8" r="6" fill="#EB001B"/>
                    <circle cx="15" cy="8" r="6" fill="#F79E1B"/>
                    <path d="M12 4.5c1.5 1.5 2.5 3.5 2.5 3.5s-1 2-2.5 3.5c-1.5-1.5-2.5-3.5-2.5-3.5s1-2 2.5-3.5z" fill="#FF5F00"/>
                  </svg>
                </div>
                
                {/* PayPal Logo */}
                <div className="w-10 h-6 sm:w-12 sm:h-8 bg-white rounded flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden p-1">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" 
                    alt="PayPal" 
                    className="h-full w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const svg = target.nextElementSibling as SVGSVGElement;
                      if (svg) svg.style.display = 'block';
                    }}
                  />
                  <svg viewBox="0 0 24 16" className="w-full h-full hidden" preserveAspectRatio="xMidYMid meet">
                    <path d="M7.5 13.5H2.5a.5.5 0 0 1-.5-.6L4.5.6C4.6.3 4.9 0 5.2 0h6.1c2 0 3.6.4 4.5 1.4.8.9 1 1.9.8 3.3-.02.1-.04.2-.06.3-.8 3.9-3.4 5.3-6.8 5.3h-1.7c-.3 0-.8.3-.8.7l-.9 5.6zm1.1-10.5l-.6 4.1h2c2.8 0 4.7-1.5 5.3-4.8.2-.9.1-1.6-.2-2.2-.5-.8-1.6-1.2-3.1-1.2H8.6z" fill="#003087"/>
                    <path d="M9.5 6.1l-.6 4.1h2c2.8 0 4.7-1.5 5.3-4.8.2-.9.1-1.6-.2-2.2-.5-.8-1.6-1.2-3.1-1.2H9.5z" fill="#009CDE"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

