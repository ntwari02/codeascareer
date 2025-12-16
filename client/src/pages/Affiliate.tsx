import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  DollarSign,
  Package,
  Link as LinkIcon,
  BarChart3,
  Globe,
  CreditCard,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  TrendingUp,
  Share2,
  Image as ImageIcon,
  Bot,
  Eye,
  Smartphone,
  Gift,
  Clock,
  Award,
  Star,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

const benefits = [
  {
    icon: DollarSign,
    title: 'High Commission Rates',
    description: 'Earn 5%–12% commission on every sale you generate',
    highlight: '5%–12%',
  },
  {
    icon: Package,
    title: 'Thousands of Products',
    description: 'Promote from our vast catalog of products across all categories',
    highlight: '10K+ Products',
  },
  {
    icon: LinkIcon,
    title: 'Instant Affiliate Links',
    description: 'Generate unique affiliate links instantly for any product',
    highlight: 'Instant',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Tracking',
    description: 'Track clicks, conversions, and earnings in real-time',
    highlight: 'Real-Time',
  },
  {
    icon: Globe,
    title: 'Global Sharing',
    description: 'Share on social media, WhatsApp, TikTok, and more',
    highlight: 'Global',
  },
  {
    icon: CreditCard,
    title: 'Fast Payouts',
    description: 'Get paid via Mobile Money, Bank Transfer, or Card',
    highlight: 'Fast',
  },
  {
    icon: Zap,
    title: 'AI Recommendations',
    description: 'Get AI-powered product suggestions to maximize earnings',
    highlight: 'AI-Powered',
  },
];

const steps = [
  {
    step: 1,
    icon: User,
    title: 'Create Affiliate Account',
    description: 'Sign up and get your affiliate account approved in minutes',
  },
  {
    step: 2,
    icon: Package,
    title: 'Choose Products',
    description: 'Browse thousands of products and select ones to promote',
  },
  {
    step: 3,
    icon: Share2,
    title: 'Share Your Links',
    description: 'Share your unique affiliate links on social media or websites',
  },
  {
    step: 4,
    icon: DollarSign,
    title: 'Earn Commission',
    description: 'Get paid when someone makes a purchase through your link',
  },
];

const commissionStructure = [
  { category: 'Electronics', rate: '5%', description: 'Smartphones, laptops, gadgets' },
  { category: 'Fashion', rate: '10%', description: 'Clothing, accessories, shoes' },
  { category: 'Cosmetics', rate: '12%', description: 'Beauty products, skincare' },
  { category: 'Local Sellers', rate: '8%', description: 'Products from verified local sellers' },
  { category: 'Subscription Services', rate: 'Recurring', description: 'Ongoing monthly commissions' },
];

const tools = [
  {
    icon: LinkIcon,
    title: 'Auto-Generated Links',
    description: 'Instantly create unique affiliate links for any product',
  },
  {
    icon: ImageIcon,
    title: 'Share-Ready Creatives',
    description: 'Download banners, images, and promotional materials',
  },
  {
    icon: Bot,
    title: 'AI Product Recommender',
    description: 'Get personalized product suggestions based on your audience',
  },
  {
    icon: Eye,
    title: 'Real-Time Analytics',
    description: 'Track clicks, conversions, and earnings with detailed reports',
  },
  {
    icon: Share2,
    title: 'One-Click Sharing',
    description: 'Share products directly to social media platforms',
  },
  {
    icon: Gift,
    title: 'Promote Bundles',
    description: 'Create and promote special bundles and discounts',
  },
];

const payoutMethods = [
  {
    name: 'Mobile Money',
    providers: ['MTN', 'Airtel'],
    icon: Smartphone,
    description: 'Instant transfers to your mobile wallet',
  },
  {
    name: 'Bank Transfer',
    icon: CreditCard,
    description: 'Direct deposit to your bank account',
  },
  {
    name: 'PayPal',
    icon: ExternalLink,
    description: 'International payments via PayPal',
  },
  {
    name: 'Flutterwave',
    icon: Globe,
    description: 'Fast payouts across Africa',
  },
];

const faqs = [
  {
    question: 'How do I earn commission?',
    answer: 'You earn commission when someone clicks your affiliate link and makes a purchase. Commissions range from 5% to 12% depending on the product category. The commission is automatically tracked and credited to your account.',
  },
  {
    question: 'When are payouts made?',
    answer: 'Payouts are processed weekly for affiliates who have reached the minimum payout threshold of $20. You can request a payout anytime through your affiliate dashboard, and payments are typically processed within 2-3 business days.',
  },
  {
    question: 'How do I generate affiliate links?',
    answer: 'Simply browse products on REAGLEX, click the "Get Affiliate Link" button on any product page, and copy your unique link. You can also use our browser extension for one-click link generation.',
  },
  {
    question: 'Can I promote on TikTok / Instagram?',
    answer: 'Yes! You can promote REAGLEX products on any platform including TikTok, Instagram, Facebook, Twitter, YouTube, WhatsApp, and your own website or blog. Just make sure to follow our advertising guidelines.',
  },
  {
    question: 'What is the minimum payout amount?',
    answer: 'The minimum payout amount is $20. Once you reach this threshold, you can request a payout through your affiliate dashboard. Payouts are processed weekly.',
  },
  {
    question: 'Can I be both a seller & an affiliate?',
    answer: 'Absolutely! Many of our top affiliates are also sellers on the platform. You can promote your own products and earn commissions, or promote other sellers\' products. There\'s no conflict of interest.',
  },
  {
    question: 'How are commissions calculated?',
    answer: 'Commissions are calculated as a percentage of the final sale price (excluding shipping and taxes). For example, if you promote a $100 fashion item with a 10% commission rate, you earn $10 per sale.',
  },
  {
    question: 'Is there a limit on how much I can earn?',
    answer: 'No! There\'s no limit on your earnings. The more you promote and the more sales you generate, the more you earn. Some of our top affiliates earn thousands of dollars per month.',
  },
];

const requirements = [
  'Must have a verified REAGLEX account',
  'Must follow our advertising guidelines and terms of service',
  'Must use real traffic (no bots or fake clicks)',
  'Must not promote illegal or prohibited items',
  'Must disclose affiliate relationship when required by law',
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Content Creator',
    quote: 'I earn $300+ monthly promoting REAGLEX gadgets. The affiliate dashboard makes it so easy to track my commissions and see what\'s working.',
    earnings: '$300/month',
    avatar: '👩‍💻',
  },
  {
    name: 'David M.',
    role: 'Influencer',
    quote: 'The AI product recommendations help me find the best products to promote to my audience. My conversion rate has doubled since joining.',
    earnings: '$500/month',
    avatar: '👨‍💼',
  },
  {
    name: 'Amina H.',
    role: 'Blogger',
    quote: 'Fast payouts and excellent support. REAGLEX has become my primary source of affiliate income. Highly recommend!',
    earnings: '$450/month',
    avatar: '👩‍💼',
  },
];

const Affiliate: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedCommission, setExpandedCommission] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-16 sm:py-24 lg:py-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join the REAGLEX Affiliate Program
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-4 max-w-2xl mx-auto">
              Earn money by promoting products you love across Africa & Worldwide
            </p>
            <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-white font-semibold mb-8">
              Earn up to 12% commission per sale
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                Sign Up as Affiliate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Become an Affiliate */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Why Become an Affiliate?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                      {benefit.highlight}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center relative"
                  >
                    <div className="w-16 h-16 bg-orange-600 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/support"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 font-medium inline-flex items-center gap-2"
              >
                Learn More
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Commission Structure
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-600 dark:bg-orange-500">
                    <tr>
                      <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Commission Rate</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionStructure.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {item.category}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-semibold">
                            {item.rate}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setExpandedCommission(!expandedCommission)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Detailed Rules & Terms
                  </span>
                  {expandedCommission ? (
                    <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {expandedCommission && (
                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>• Commissions are calculated on the final sale price (excluding shipping and taxes)</p>
                    <p>• Commissions are credited after order confirmation by the buyer</p>
                    <p>• Refunded orders will result in commission reversal</p>
                    <p>• Special rates may apply for bulk promotions or exclusive partnerships</p>
                    <p>• All commissions are subject to our affiliate terms and conditions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Affiliate Dashboard Preview
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Total Earnings', value: '$2,450', icon: DollarSign },
                  { label: 'Total Clicks', value: '12,340', icon: Eye },
                  { label: 'Conversions', value: '156', icon: TrendingUp },
                  { label: 'Affiliate Links', value: '89', icon: LinkIcon },
                  { label: 'Pending Payout', value: '$320', icon: Clock },
                  { label: 'Top Product', value: 'Smartphone', icon: Award },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Provided */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Tools Provided to Affiliates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {tool.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Payout Methods */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Payout Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {payoutMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {method.name}
                    </h3>
                    {method.providers && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {method.providers.join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payouts are processed weekly. Minimum payout: $20
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Requirements to Join
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="space-y-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300">{requirement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              What Our Affiliates Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {testimonial.earnings}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full bg-white dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog & Resources */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Resources & Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'How to Grow as an Affiliate Marketer', link: '/blog' },
                { title: 'Best Products to Promote', link: '/blog' },
                { title: 'How to Create Viral Links', link: '/blog' },
                { title: 'Commission Calculations Guide', link: '/blog' },
              ].map((resource, index) => (
                <Link
                  key={index}
                  to={resource.link}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
                >
                  <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {resource.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sign-Up CTA */}
      <section className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-16 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Earning Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 10,000+ REAGLEX Affiliates making money online
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                Become an Affiliate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/support">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                >
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Affiliate;

