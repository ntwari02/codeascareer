import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  AlertTriangle,
  X,
  ShoppingBag,
  CreditCard,
  Shield,
  Package,
  Truck,
  RotateCcw,
  Store,
  Settings,
  Gift,
  FileText,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Expand,
  Minimize,
} from 'lucide-react';
// import { useAuthStore } from '../stores/authStore';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  relatedIds?: string[];
  helpful?: number;
  notHelpful?: number;
  views?: number;
  tags?: string[];
}

const faqCategories = [
  { id: 'orders', label: 'Orders & Delivery', icon: ShoppingBag, color: 'blue' },
  { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, color: 'green' },
  { id: 'account', label: 'Account & Security', icon: Shield, color: 'purple' },
  { id: 'products', label: 'Products & Sellers', icon: Package, color: 'orange' },
  { id: 'shipping', label: 'Shipping & Logistics', icon: Truck, color: 'indigo' },
  { id: 'returns', label: 'Returns & Disputes', icon: RotateCcw, color: 'red' },
  { id: 'selling', label: 'Selling on REAGLEX', icon: Store, color: 'teal' },
  { id: 'technical', label: 'Technical Issues', icon: Settings, color: 'gray' },
  { id: 'affiliate', label: 'Affiliate Program', icon: Gift, color: 'pink' },
  { id: 'policies', label: 'REAGLEX Policies', icon: FileText, color: 'amber' },
];

const mockFAQs: FAQItem[] = [
  // Orders & Delivery
  {
    id: 'order-1',
    category: 'orders',
    question: 'How do I track my order?',
    answer: 'You can track your order by going to "My Orders" in your account dashboard. Click on the order you want to track, and you\'ll see real-time updates including order confirmation, processing, shipping, and delivery status. You\'ll also receive email notifications at each stage.',
    relatedIds: ['order-2', 'order-3', 'shipping-1'],
    helpful: 245,
    notHelpful: 12,
    views: 1250,
    tags: ['track', 'order', 'delivery', 'status'],
  },
  {
    id: 'order-2',
    category: 'orders',
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by location and seller. Standard delivery within Rwanda typically takes 2-5 business days. For East Africa, expect 5-10 business days. International orders may take 10-20 business days. You can see estimated delivery times on each product page before purchase.',
    relatedIds: ['order-1', 'shipping-1', 'shipping-2'],
    helpful: 189,
    notHelpful: 8,
    views: 980,
    tags: ['delivery', 'time', 'shipping', 'duration'],
  },
  {
    id: 'order-3',
    category: 'orders',
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order if it hasn\'t been shipped yet. Go to "My Orders", select the order, and click "Cancel Order". If the order has already been shipped, you\'ll need to wait for delivery and then initiate a return. Refunds are processed within 5-7 business days after cancellation approval.',
    relatedIds: ['order-1', 'returns-1', 'payments-2'],
    helpful: 156,
    notHelpful: 15,
    views: 720,
    tags: ['cancel', 'order', 'refund'],
  },
  {
    id: 'order-4',
    category: 'orders',
    question: 'What if I receive the wrong item?',
    answer: 'If you receive the wrong item, please contact our support team immediately with photos of the item received and your order number. We\'ll arrange for a return and send you the correct item, or provide a full refund. This is covered under our buyer protection policy.',
    relatedIds: ['returns-1', 'returns-2', 'order-1'],
    helpful: 98,
    notHelpful: 5,
    views: 450,
    tags: ['wrong', 'item', 'return', 'refund'],
  },
  {
    id: 'order-5',
    category: 'orders',
    question: 'How do I change my delivery address?',
    answer: 'You can change your delivery address before the order is shipped. Go to "My Orders", select the order, and click "Change Address". If the order has already been shipped, contact our support team immediately. Note that address changes may affect delivery time.',
    relatedIds: ['order-1', 'account-2'],
    helpful: 134,
    notHelpful: 7,
    views: 620,
    tags: ['address', 'delivery', 'change'],
  },

  // Payments & Refunds
  {
    id: 'payments-1',
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including Mobile Money (MTN, Airtel), Bank Transfer, Credit/Debit Cards (Visa, Mastercard), PayPal, and Flutterwave. All payments are processed securely through our encrypted payment gateway. Your payment information is never stored on our servers.',
    relatedIds: ['payments-2', 'account-3'],
    helpful: 312,
    notHelpful: 10,
    views: 1890,
    tags: ['payment', 'methods', 'cards', 'mobile money'],
  },
  {
    id: 'payments-2',
    category: 'payments',
    question: 'How do I get a refund?',
    answer: 'To request a refund, go to "My Orders" in your account, select the order you want to refund, and click "Request Refund". You can also contact our support team. Refunds are processed within 5-7 business days after approval, depending on your payment method. The refund will be credited to your original payment method.',
    relatedIds: ['returns-1', 'payments-1', 'order-3'],
    helpful: 278,
    notHelpful: 18,
    views: 1450,
    tags: ['refund', 'money', 'return'],
  },
  {
    id: 'payments-3',
    category: 'payments',
    question: 'Is my payment information secure?',
    answer: 'Yes, absolutely. We use industry-standard SSL encryption and partner with trusted payment processors like Flutterwave and PayPal. We never store your full card details on our servers. All transactions are processed through secure, PCI-DSS compliant payment gateways.',
    relatedIds: ['account-3', 'payments-1'],
    helpful: 201,
    notHelpful: 6,
    views: 1100,
    tags: ['security', 'payment', 'safe', 'encryption'],
  },
  {
    id: 'payments-4',
    category: 'payments',
    question: 'What is escrow and how does it work?',
    answer: 'Escrow is a secure payment system where your money is held by REAGLEX until you confirm receipt of your order. Once you receive and confirm the order, the payment is released to the seller. This protects both buyers and sellers, ensuring you get what you paid for and sellers get paid for delivered items.',
    relatedIds: ['payments-1', 'order-1'],
    helpful: 167,
    notHelpful: 9,
    views: 890,
    tags: ['escrow', 'payment', 'security'],
  },

  // Account & Security
  {
    id: 'account-1',
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Click the link in the email to create a new password. If you don\'t receive the email, check your spam folder or contact support.',
    relatedIds: ['account-2', 'account-3'],
    helpful: 189,
    notHelpful: 11,
    views: 950,
    tags: ['password', 'reset', 'account'],
  },
  {
    id: 'account-2',
    category: 'account',
    question: 'How do I update my profile information?',
    answer: 'Go to your profile page by clicking on your avatar in the header, then select "Profile Settings". You can update your name, email, phone number, address, and other information. Changes are saved immediately.',
    relatedIds: ['account-1', 'order-5'],
    helpful: 145,
    notHelpful: 8,
    views: 680,
    tags: ['profile', 'update', 'information'],
  },
  {
    id: 'account-3',
    category: 'account',
    question: 'How do I enable two-factor authentication?',
    answer: 'Go to your profile settings, select "Security", and click "Enable Two-Factor Authentication". You\'ll need to download an authenticator app (like Google Authenticator) and scan the QR code. This adds an extra layer of security to your account.',
    relatedIds: ['account-1', 'payments-3'],
    helpful: 123,
    notHelpful: 12,
    views: 540,
    tags: ['2fa', 'security', 'authentication'],
  },

  // Products & Sellers
  {
    id: 'products-1',
    category: 'products',
    question: 'How do I know if a seller is verified?',
    answer: 'Verified sellers have a blue checkmark badge next to their store name. You can also see their verification status on their store page. Verified sellers have completed identity verification and meet our quality standards.',
    relatedIds: ['selling-1', 'products-2'],
    helpful: 198,
    notHelpful: 7,
    views: 1120,
    tags: ['seller', 'verified', 'trust'],
  },
  {
    id: 'products-2',
    category: 'products',
    question: 'Can I contact sellers directly?',
    answer: 'Yes, you can message sellers through our messaging system. Go to the product or store page and click "Message Seller". You can ask questions about products, negotiate prices (if enabled), or discuss custom orders.',
    relatedIds: ['products-1', 'selling-1'],
    helpful: 167,
    notHelpful: 9,
    views: 780,
    tags: ['seller', 'contact', 'message'],
  },

  // Shipping & Logistics
  {
    id: 'shipping-1',
    category: 'shipping',
    question: 'What are the shipping costs?',
    answer: 'Shipping costs vary by seller, product weight, and delivery location. You\'ll see the exact shipping cost before completing your purchase. Some sellers offer free shipping for orders above a certain amount. Shipping costs are clearly displayed on the checkout page.',
    relatedIds: ['order-2', 'shipping-2'],
    helpful: 234,
    notHelpful: 14,
    views: 1350,
    tags: ['shipping', 'cost', 'delivery'],
  },
  {
    id: 'shipping-2',
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, many sellers on REAGLEX offer international shipping. Check the product page for shipping options to your country. International shipping times and costs vary by destination. Some products may have shipping restrictions.',
    relatedIds: ['order-2', 'shipping-1'],
    helpful: 156,
    notHelpful: 8,
    views: 920,
    tags: ['international', 'shipping', 'global'],
  },

  // Returns & Disputes
  {
    id: 'returns-1',
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'You can return items within 14 days of delivery if they are defective, damaged, or not as described. Items must be in original condition with tags attached. Go to "My Orders" and click "Return Item" to initiate a return. We\'ll provide a return label and process your refund once we receive the item.',
    relatedIds: ['returns-2', 'payments-2'],
    helpful: 289,
    notHelpful: 22,
    views: 1680,
    tags: ['return', 'policy', 'refund'],
  },
  {
    id: 'returns-2',
    category: 'returns',
    question: 'How do I file a dispute?',
    answer: 'If you have an issue with an order that can\'t be resolved with the seller, you can file a dispute. Go to "My Orders", select the order, and click "File Dispute". Provide details and evidence (photos, messages). Our support team will review and resolve the dispute within 5-7 business days.',
    relatedIds: ['returns-1', 'order-4'],
    helpful: 178,
    notHelpful: 13,
    views: 890,
    tags: ['dispute', 'problem', 'issue'],
  },

  // Selling on REAGLEX
  {
    id: 'selling-1',
    category: 'selling',
    question: 'How do I become a seller?',
    answer: 'Click "Become a Seller" in the header or go to /seller/signup. You\'ll need to provide business information, complete identity verification, and set up your payment method. Once approved, you can start listing products and selling on REAGLEX.',
    relatedIds: ['selling-2', 'products-1'],
    helpful: 245,
    notHelpful: 15,
    views: 1420,
    tags: ['seller', 'signup', 'register'],
  },
  {
    id: 'selling-2',
    category: 'selling',
    question: 'What are the seller fees?',
    answer: 'REAGLEX charges a commission fee on successful sales, typically 5-12% depending on the product category. There are no monthly fees or listing fees. You only pay when you make a sale. Payment processing fees may apply depending on your payment method.',
    relatedIds: ['selling-1', 'payments-4'],
    helpful: 201,
    notHelpful: 11,
    views: 1180,
    tags: ['fees', 'commission', 'seller'],
  },

  // Technical Issues
  {
    id: 'technical-1',
    category: 'technical',
    question: 'The website is not loading properly',
    answer: 'Try clearing your browser cache and cookies, or use a different browser. Make sure you have a stable internet connection. If the problem persists, it may be a temporary server issue. Check our status page or contact support.',
    relatedIds: ['technical-2'],
    helpful: 134,
    notHelpful: 19,
    views: 650,
    tags: ['website', 'loading', 'technical'],
  },
  {
    id: 'technical-2',
    category: 'technical',
    question: 'I can\'t log into my account',
    answer: 'First, make sure you\'re using the correct email and password. If you\'ve forgotten your password, use the "Forgot Password" link. If you\'re still having issues, clear your browser cache or try a different browser. Contact support if the problem continues.',
    relatedIds: ['account-1', 'technical-1'],
    helpful: 167,
    notHelpful: 12,
    views: 820,
    tags: ['login', 'account', 'password'],
  },

  // Affiliate Program
  {
    id: 'affiliate-1',
    category: 'affiliate',
    question: 'How does the affiliate program work?',
    answer: 'Join our affiliate program to earn commissions by promoting REAGLEX products. You\'ll get a unique affiliate link for each product. When someone makes a purchase through your link, you earn a commission (typically 5-12% depending on the category).',
    relatedIds: ['affiliate-2'],
    helpful: 189,
    notHelpful: 8,
    views: 1050,
    tags: ['affiliate', 'commission', 'earn'],
  },
  {
    id: 'affiliate-2',
    category: 'affiliate',
    question: 'How do I join the affiliate program?',
    answer: 'Go to /affiliate and click "Sign Up as Affiliate". You\'ll need a REAGLEX account. Once approved, you can access your affiliate dashboard, generate links, and track your earnings. Payouts are made weekly via your preferred payment method.',
    relatedIds: ['affiliate-1', 'selling-1'],
    helpful: 156,
    notHelpful: 7,
    views: 890,
    tags: ['affiliate', 'join', 'signup'],
  },

  // REAGLEX Policies
  {
    id: 'policies-1',
    category: 'policies',
    question: 'What is your privacy policy?',
    answer: 'We are committed to protecting your privacy. We only collect information necessary to provide our services. We never sell your personal data. You can read our full privacy policy at /privacy. You can also manage your privacy settings in your account preferences.',
    relatedIds: ['account-2', 'policies-2'],
    helpful: 145,
    notHelpful: 6,
    views: 720,
    tags: ['privacy', 'data', 'policy'],
  },
  {
    id: 'policies-2',
    category: 'policies',
    question: 'What are your terms of service?',
    answer: 'Our terms of service outline the rules and guidelines for using REAGLEX. This includes buyer and seller responsibilities, prohibited items, dispute resolution, and more. You can read the full terms at /terms. By using REAGLEX, you agree to these terms.',
    relatedIds: ['policies-1', 'returns-1'],
    helpful: 123,
    notHelpful: 5,
    views: 580,
    tags: ['terms', 'service', 'rules'],
  },
];

const popularFAQs = [
  'order-1',
  'payments-1',
  'payments-2',
  'returns-1',
  'order-2',
  'shipping-1',
  'selling-1',
  'account-1',
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [helpfulFeedback, setHelpfulFeedback] = useState<Map<string, 'helpful' | 'not-helpful' | null>>(new Map());
  const [showSystemStatus, setShowSystemStatus] = useState(true);
  const [systemStatusMessage] = useState<string | null>(
    'Some users are experiencing delays with payments. Our team is working on it.'
  );

  // Filter FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let filtered = mockFAQs;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Get popular FAQs
  const popularFAQsList = useMemo(() => {
    return popularFAQs
      .map((id) => mockFAQs.find((faq) => faq.id === id))
      .filter((faq): faq is FAQItem => faq !== undefined);
  }, []);

  // Get related FAQs
  const getRelatedFAQs = (faq: FAQItem) => {
    if (!faq.relatedIds) return [];
    return faq.relatedIds
      .map((id) => mockFAQs.find((item) => item.id === id))
      .filter((item): item is FAQItem => item !== undefined)
      .slice(0, 3);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFAQs.map((faq) => faq.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const handleHelpful = (id: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => {
      const newMap = new Map(prev);
      newMap.set(id, isHelpful ? 'helpful' : 'not-helpful');
      return newMap;
    });
  };

  const selectedCategoryData = faqCategories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* System Status Banner */}
      <AnimatePresence>
        {showSystemStatus && systemStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm sm:text-base text-amber-800 dark:text-amber-200">{systemStatusMessage}</p>
                </div>
                <button
                  onClick={() => setShowSystemStatus(false)}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Find answers to common questions about REAGLEX
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-gray-900 text-lg focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-600 shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Questions */}
      {!searchQuery && !selectedCategory && (
        <section className="py-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Popular Questions
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularFAQsList.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => {
                      setSelectedCategory(faq.category);
                      setExpandedItems(new Set([faq.id]));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-left p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                      {faq.question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Categories Sidebar */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                    {filteredFAQs.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={expandAll}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          title="Expand All"
                        >
                          <Expand className="h-4 w-4" />
                        </button>
                        <button
                          onClick={collapseAll}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          title="Collapse All"
                        >
                          <Minimize className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                        !selectedCategory
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      All Questions
                    </button>
                    {faqCategories.map((category) => {
                      const Icon = category.icon;
                      const count = mockFAQs.filter((faq) => faq.category === category.id).length;
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSearchQuery('');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedCategory === category.id
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{category.label}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* FAQ Content */}
              <div className="flex-1">
                {selectedCategory && (
                  <div className="mb-6">
                    {selectedCategoryData && (
                      <div className="flex items-center gap-3 mb-2">
                        {React.createElement(selectedCategoryData.icon, {
                          className: 'h-6 w-6 text-orange-600 dark:text-orange-400',
                        })}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedCategoryData.label}
                        </h2>
                      </div>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                )}

                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your search or browse categories
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => {
                      const isExpanded = expandedItems.has(faq.id);
                      const relatedFAQs = getRelatedFAQs(faq);
                      const feedback = helpfulFeedback.get(faq.id);

                      return (
                        <motion.div
                          key={faq.id}
                          id={`faq-${faq.id}`}
                          initial={false}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <button
                            onClick={() => toggleExpanded(faq.id)}
                            className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {faq.question}
                              </h3>
                              {faq.views && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {faq.views.toLocaleString()} views
                                </p>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                                  <div className="pt-6">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
                                      {faq.answer}
                                    </p>

                                    {/* Related Questions */}
                                    {relatedFAQs.length > 0 && (
                                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                          Related Questions:
                                        </h4>
                                        <div className="space-y-2">
                                          {relatedFAQs.map((related) => (
                                            <button
                                              key={related.id}
                                              onClick={() => {
                                                setExpandedItems(new Set([related.id]));
                                                document
                                                  .getElementById(`faq-${related.id}`)
                                                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                              }}
                                              className="block w-full text-left text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                            >
                                              • {related.question}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Was this helpful? */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Was this helpful?
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleHelpful(faq.id, true);
                                          }}
                                          className={`p-2 rounded-lg transition-colors ${
                                            feedback === 'helpful'
                                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                          }`}
                                          title="Yes, helpful"
                                        >
                                          <ThumbsUp className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleHelpful(faq.id, false);
                                          }}
                                          className={`p-2 rounded-lg transition-colors ${
                                            feedback === 'not-helpful'
                                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                          }`}
                                          title="No, not helpful"
                                        >
                                          <ThumbsDown className="h-4 w-4" />
                                        </button>
                                      </div>
                                      {feedback && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          Thank you for your feedback!
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </Link>
              <a
                href="https://wa.me/14313062173"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Phone className="h-5 w-5" />
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

