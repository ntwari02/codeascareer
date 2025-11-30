import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Shield,
  Truck,
  Clock,
  Send
} from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-[#1a1a2e] text-white border-t border-gray-800 dark:border-gray-700">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-3 text-white dark:text-white">Stay in the Loop</h3>
              <p className="text-gray-300 dark:text-gray-400 text-lg">
                Subscribe to get special offers, free giveaways, and exclusive deals.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 bg-transparent border-2 border-gray-600 dark:border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-400 transition"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {subscribed ? (
                    <>
                      <Shield className="h-5 w-5" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">
                Join 50,000+ subscribers. No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img
                src="/logo.jpg"
                alt="REAGLE-X Logo"
                className="h-16 w-16 rounded-full object-cover shadow-lg"
              />
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-md">
              The future of online shopping delivered today. Discover trending products, top deals, and new arrivals all in one place with secure payments and fast shipping.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition group">
                <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="text-sm">123 Market Street, San Francisco, CA 94103</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition group">
                <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition group">
                <div className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-sm">support@reagle-x.com</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110 group">
                <Facebook className="h-5 w-5 fill-current" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-sky-500 transition-all hover:scale-110 group">
                <Twitter className="h-5 w-5 fill-current" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 group">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 group">
                <Youtube className="h-5 w-5 fill-current" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 group">
                <Linkedin className="h-5 w-5 fill-current" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Shop</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/products" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">All Products</Link></li>
              <li><Link to="/products?new=true" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">New Arrivals</Link></li>
              <li><Link to="/products?trending=true" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Trending</Link></li>
              <li><Link to="/products?deals=true" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Top Deals</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Fashion</Link></li>
              <li><Link to="/products" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Gift Cards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Company</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/about" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Careers</Link></li>
              <li><Link to="/press" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Press</Link></li>
              <li><Link to="/blog" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Blog</Link></li>
              <li><Link to="/affiliate" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Affiliate Program</Link></li>
              <li><Link to="/partners" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Partners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Support</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><Link to="/contact" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link to="/help" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Returns</Link></li>
              <li><Link to="/track" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Track Order</Link></li>
              <li><Link to="/size-guide" className="hover:text-orange-400 transition hover:translate-x-1 inline-block">Size Guide</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 bg-gray-800/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Free Shipping</h5>
                <p className="text-gray-400 text-sm">On orders over $50</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-800/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">Secure Payment</h5>
                <p className="text-gray-400 text-sm">100% secure transactions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-gray-800/50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h5 className="font-semibold text-white mb-1">24/7 Support</h5>
                <p className="text-gray-400 text-sm">Dedicated support team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} REAGLE-X, Inc. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-orange-400 transition">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-orange-400 transition">Terms of Service</Link>
                <span>•</span>
                <Link to="/cookies" className="hover:text-orange-400 transition">Cookie Policy</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm mr-2">We accept:</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                </div>
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div className="w-12 h-8 bg-orange-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
                <div className="w-12 h-8 bg-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AMEX</span>
                </div>
                <div className="w-12 h-8 bg-orange-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
