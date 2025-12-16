import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Cookie,
  Lock,
  Settings,
  BarChart3,
  Target,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
  Globe,
  Monitor,
  ChevronRight,
  HelpCircle,
  FileText,
  Mail,
  X,
  ChevronUp,
} from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
}

export default function Cookies() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always on
    functional: true,
    analytics: true,
    marketing: false,
    thirdParty: true,
  });
  const [saved, setSaved] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cookiePreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...preferences, ...parsed, essential: true }); // Essential always on
      } catch (e) {
        console.error('Error loading cookie preferences:', e);
      }
    }
  }, []);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === 'essential') return; // Essential cookies cannot be turned off
    setPreferences((prev) => ({ ...prev, [category]: !prev[category] }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      thirdParty: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    const allRejected = {
      essential: true, // Essential always on
      functional: false,
      analytics: false,
      marketing: false,
      thirdParty: false,
    };
    setPreferences(allRejected);
    localStorage.setItem('cookiePreferences', JSON.stringify(allRejected));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cookieCategories = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      icon: Lock,
      description: 'Required for the platform to function properly',
      alwaysOn: true,
      uses: [
        'Login session management',
        'User authentication',
        'Shopping cart persistence',
        'Security and fraud prevention',
        'Payment processing flow',
      ],
      duration: 'Session',
      impact: 'Platform will not function without these cookies',
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: Settings,
      description: 'Remember your preferences and improve functionality',
      uses: [
        'Remember shipping addresses',
        'Language preferences',
        'Recently viewed products',
        'Theme preference (dark/light mode)',
        'Display settings',
      ],
      duration: '1 year',
      impact: 'Some features may not work as expected',
    },
    {
      id: 'analytics',
      name: 'Performance & Analytics Cookies',
      icon: BarChart3,
      description: 'Help us understand how visitors use our platform',
      recommended: true,
      uses: [
        'Google Analytics tracking',
        'Speed and performance analysis',
        'Crash and error reporting',
        'Improving platform performance',
        'Understanding user behavior',
      ],
      duration: '2 years',
      impact: 'We cannot improve the platform without analytics data',
    },
    {
      id: 'marketing',
      name: 'Marketing & Personalization Cookies',
      icon: Target,
      description: 'Personalize your experience with relevant content',
      uses: [
        'Personalized product recommendations',
        'Showing relevant deals and offers',
        'Retargeting advertisements (if used)',
        'Email marketing personalization',
        'Cross-site tracking for ads',
      ],
      duration: '1 year',
      impact: 'You may see less relevant content and offers',
    },
    {
      id: 'thirdParty',
      name: 'Third-Party Cookies',
      icon: ExternalLink,
      description: 'Used by integrated third-party services',
      uses: [
        'Stripe/Flutterwave (payment processing)',
        'SendGrid (email delivery)',
        'Social login (Google, Facebook)',
        'Live chat widgets',
        'Other integrated services',
      ],
      duration: 'Varies by service',
      impact: 'Some third-party features may not work',
    },
  ];

  const browserGuides = [
    {
      name: 'Google Chrome',
      icon: Globe,
      url: 'https://support.google.com/chrome/answer/95647',
    },
    {
      name: 'Safari',
      icon: Globe,
      url: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac',
    },
    {
      name: 'Firefox',
      icon: Globe,
      url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer',
    },
    {
      name: 'Microsoft Edge',
      icon: Monitor,
      url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full text-center">
            <Cookie className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Cookie Settings
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100">
              Control how REAGLEX uses cookies to improve your experience
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Cookie Consent Summary Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  About Cookies
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  REAGLEX uses cookies to personalize your shopping experience, secure your account, and analyze traffic. 
                  Cookies are small text files stored on your device that help us remember your preferences and improve our services. 
                  You can change your cookie preferences at any time using the controls below.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept All Cookies
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Reject All
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Your cookie preferences have been saved successfully!
              </p>
            </motion.div>
          )}

          {/* Cookie Categories */}
          <div className="space-y-4">
            {cookieCategories.map((category, index) => {
              const Icon = category.icon;
              const isEnabled = preferences[category.id as keyof CookiePreferences];
              const isExpanded = expandedCategory === category.id;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          category.id === 'essential'
                            ? 'bg-orange-100 dark:bg-orange-900/30'
                            : isEnabled
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            category.id === 'essential'
                              ? 'text-orange-600 dark:text-orange-400'
                              : isEnabled
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            {category.id === 'essential' && (
                              <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            )}
                            {category.recommended && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {category.description}
                          </p>
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                            className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                          >
                            {isExpanded ? 'Hide details' : 'Show details'}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggle(category.id as keyof CookiePreferences)}
                            disabled={category.alwaysOn}
                            className="sr-only peer"
                          />
                          <div className={`w-14 h-7 rounded-full peer ${
                            category.alwaysOn
                              ? 'bg-orange-300 dark:bg-orange-700 cursor-not-allowed'
                              : isEnabled
                              ? 'bg-green-500 dark:bg-green-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
                            category.alwaysOn ? 'opacity-60' : ''
                          }`} />
                        </label>
                        {category.alwaysOn && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            Required
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What these cookies do:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {category.uses.map((use, idx) => (
                                <li key={idx}>{use}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Duration:</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{category.duration}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Impact if disabled:</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{category.impact}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Impact of Turning Off Cookies */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
                  What Happens If You Turn Off Cookies?
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>You may be logged out frequently and need to sign in repeatedly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Your shopping cart won't be saved between sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Checkout and payment processes might fail or be interrupted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Personalized features like recommendations and saved preferences will stop working</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Some third-party integrations (payments, social login) may not function properly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Browser Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              How to Clear Cookies Manually
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You can also manage cookies directly in your browser settings. Click on your browser below for instructions:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {browserGuides.map((browser, index) => {
                const BrowserIcon = browser.icon;
                return (
                  <a
                    key={index}
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <BrowserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{browser.name}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Related Links */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Related Information
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/privacy">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/terms">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Terms & Conditions
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/support">
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

