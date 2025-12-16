import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Users,
  Award,
  Heart,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  ShoppingBag,
  Star,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Store,
  Search,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Store as StoreIcon,
  Upload,
  DollarSign,
  HelpCircle,
  MessageCircle,
  FileText,
  Lock,
  BarChart3,
  Globe2,
  ShieldCheck,
  Headphones,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function About() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const stats = [
    { value: '50K+', label: 'Active Users', icon: Users },
    { value: '500+', label: 'Verified Sellers', icon: ShieldCheck },
    { value: '10K+', label: 'Products Listed', icon: ShoppingBag },
    { value: '1K+', label: 'Daily Orders', icon: Package },
    { value: '98%', label: 'Delivery Success Rate', icon: Truck },
    { value: '15+', label: 'Countries Available', icon: Globe2 },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.',
      color: 'text-gray-900 dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your security is our priority. We use advanced encryption and secure payment systems.',
      color: 'text-gray-900 dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We continuously innovate to bring you the latest features and best shopping experience.',
      color: 'text-gray-900 dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting buyers and sellers across Rwanda and beyond with seamless transactions.',
      color: 'text-gray-900 dark:text-white',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Founded',
      description: 'REAGLE-X was born with a vision to revolutionize e-commerce in Rwanda.',
    },
    {
      year: '2021',
      title: 'First 1000 Customers',
      description: 'Reached our first milestone with 1000 happy customers and 100 sellers.',
    },
    {
      year: '2022',
      title: 'Expansion',
      description: 'Expanded to serve customers across East Africa with faster shipping.',
    },
    {
      year: '2023',
      title: 'Mobile App Launch',
      description: 'Launched our mobile app for iOS and Android, making shopping even easier.',
    },
    {
      year: '2024',
      title: '50K+ Customers',
      description: 'Celebrated reaching 50,000 customers and becoming Rwanda\'s leading e-commerce platform.',
    },
  ];

  const team = [
    {
      name: 'Mwubahamana Pierre',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 10+ years in e-commerce and fintech. Passionate about empowering African businesses.',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Thierry NTWARI',
      role: 'Lead Developer',
      bio: 'Full-stack engineer specializing in scalable marketplace platforms and AI integration.',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Bushanda Sarah',
      role: 'Operations & Marketing',
      bio: 'Strategic marketer with expertise in growth hacking and customer acquisition.',
      image: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Irankunda Samuel',
      role: 'UI/UX Designer',
      bio: 'Creative designer focused on creating intuitive and beautiful user experiences.',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const coreFeatures = [
    {
      icon: StoreIcon,
      title: 'Multi-Vendor Marketplace',
      description: 'Connect with thousands of verified sellers from across Africa and beyond.',
    },
    {
      icon: Shield,
      title: 'Secure Escrow Checkout',
      description: 'Your payment is protected until you receive and confirm your order.',
    },
    {
      icon: Zap,
      title: 'Smart Product Recommendations',
      description: 'AI-powered suggestions help you discover products you\'ll love.',
    },
    {
      icon: CheckCircle,
      title: 'Verified Sellers',
      description: 'Every seller undergoes strict verification to ensure quality and trust.',
    },
    {
      icon: Search,
      title: 'AI-Powered Search',
      description: 'Find exactly what you\'re looking for with intelligent search technology.',
    },
    {
      icon: BarChart3,
      title: 'Seller Analytics Tools',
      description: 'Comprehensive dashboards help sellers grow their business.',
    },
    {
      icon: Truck,
      title: 'Fast Logistics Integration',
      description: 'Seamless shipping with real-time tracking and multiple delivery options.',
    },
  ];

  const buyerSteps = [
    { step: 1, icon: Search, title: 'Browse Products', description: 'Explore thousands of products across multiple categories.' },
    { step: 2, icon: ShoppingBag, title: 'Add to Cart', description: 'Select your desired items and add them to your cart.' },
    { step: 3, icon: CreditCard, title: 'Secure Payment', description: 'Complete checkout with our protected escrow system.' },
    { step: 4, icon: Truck, title: 'Track Delivery', description: 'Monitor your order in real-time from warehouse to doorstep.' },
    { step: 5, icon: Star, title: 'Confirm & Review', description: 'Receive your order and share your experience with others.' },
  ];

  const sellerSteps = [
    { step: 1, icon: StoreIcon, title: 'Create Store', description: 'Set up your professional storefront in minutes.' },
    { step: 2, icon: Upload, title: 'Upload Products', description: 'Add your products with images, descriptions, and pricing.' },
    { step: 3, icon: Package, title: 'Receive Orders', description: 'Get notified instantly when customers place orders.' },
    { step: 4, icon: Truck, title: 'Ship Items', description: 'Use our integrated logistics to ship orders efficiently.' },
    { step: 5, icon: DollarSign, title: 'Get Paid via Escrow', description: 'Receive secure payments after order confirmation.' },
  ];

  const faqs = [
    {
      question: 'How does escrow work?',
      answer: 'When you make a purchase, your payment is held securely in our escrow system. The seller ships your order, and once you receive and confirm it, the payment is released to the seller. This protects both buyers and sellers.',
    },
    {
      question: 'How does REAGLEX protect buyers?',
      answer: 'We use multiple layers of protection: verified sellers, secure escrow payments, buyer protection policies, 24/7 customer support, and strict anti-scam measures. If something goes wrong, we\'re here to help.',
    },
    {
      question: 'How does delivery work?',
      answer: 'We partner with trusted logistics providers across Africa. You can choose from multiple delivery options including standard, express, and same-day delivery (where available). Track your order in real-time from our platform.',
    },
    {
      question: 'How do sellers get paid?',
      answer: 'Sellers receive payment through our escrow system after the buyer confirms receipt of their order. Payments are processed securely and sellers can withdraw funds to their bank account or mobile money.',
    },
    {
      question: 'What fees does REAGLEX charge?',
      answer: 'For buyers, there are no hidden fees - you only pay the product price and shipping. Sellers pay a small commission fee on successful sales, which helps us maintain platform security and support services.',
    },
    {
      question: 'Is REAGLEX available in my country?',
      answer: 'REAGLEX currently operates in 15+ countries across Africa, with plans to expand globally. Check our shipping page to see if we deliver to your location.',
    },
  ];

  const testimonials = [
    {
      name: 'John K.',
      role: 'Buyer',
      location: 'Kigali, Rwanda',
      text: 'REAGLEX has transformed how I shop online. The escrow system gives me peace of mind, and delivery is always fast.',
      rating: 5,
    },
    {
      name: 'Marie U.',
      role: 'Seller',
      location: 'Nairobi, Kenya',
      text: 'As a small business owner, REAGLEX has helped me reach customers I never could before. The platform is easy to use and payments are secure.',
      rating: 5,
    },
    {
      name: 'David M.',
      role: 'Buyer',
      location: 'Kampala, Uganda',
      text: 'I\'ve been using REAGLEX for over a year. The product quality is excellent and customer support is always helpful.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-gray-200 dark:border-gray-700">
          <div className="relative w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
                  About REAGLE-X
                </h1>
                <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
                  Rwanda's Most Trusted E-Commerce Platform
                </p>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  Empowering Global Buyers & Sellers with Intelligent Commerce.
                </p>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500 mb-10 leading-relaxed">
                  We're revolutionizing e-commerce in Africa and beyond, connecting buyers and sellers with trust, innovation, and cutting-edge technology.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all gap-2">
                    Explore Products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/support">
                  <Button size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 gap-2">
                    Get in Touch
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Trusted by Thousands
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Numbers that speak for themselves
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="text-center p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:-translate-y-1"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-3">
                        <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 text-orange-600 dark:text-orange-400">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                  Our Mission & Vision
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  We're on a mission to transform how Africa shops online, making e-commerce accessible, secure, and delightful for everyone.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <Heart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                    To empower businesses of all sizes and delight customers by creating Africa's most trusted, innovative, and user-friendly e-commerce platform. We believe everyone deserves access to quality products and the opportunity to grow their business online.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Secure escrow payment system protecting both buyers and sellers',
                      'Lightning-fast shipping with real-time tracking',
                      '24/7 multilingual customer support',
                      'Mobile-first design for seamless shopping anywhere',
                      'AI-powered recommendations for personalized experience',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                    To become Africa's #1 e-commerce platform by 2026, connecting millions of buyers and sellers across the continent. We envision a future where online shopping is seamless, secure, and accessible to everyone, regardless of location or background.
                  </p>
                  <div className="space-y-3">
                    {[
                      'Expand to 50+ African countries by 2026',
                      'Support over 1 million active sellers',
                      'Serve 10+ million happy customers',
                      'Become the most trusted e-commerce brand in Africa',
                      'Drive economic growth through digital commerce',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Our Core Values
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  These fundamental principles guide every decision we make and every interaction we have. They're not just words—they're our commitment to you.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={index}
                      className={`${value.bgColor} p-6 lg:p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-2`}
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-5 shadow-sm">
                        <Icon className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Our Journey
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300">
                  From a bold vision to Rwanda's most trusted e-commerce platform
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {timeline.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 shadow-lg flex items-center justify-center bg-orange-600 dark:bg-orange-500">
                          <div className="w-2.5 h-2.5 bg-white dark:bg-gray-900 rounded-full" />
                        </div>
                      </div>
                      {/* Year Badge */}
                      <div className="inline-block px-4 py-1.5 rounded-full bg-orange-600 dark:bg-orange-500">
                        <span className="text-white dark:text-white font-bold text-sm sm:text-base">
                          {item.year}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  Meet the Visionaries
                </h2>
                <p className="text-xl text-gray-700 dark:text-gray-300">
                  A diverse team of experts passionate about revolutionizing e-commerce in Africa
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-gray-400 dark:hover:border-gray-600 transition-all hover:-translate-y-2"
                  >
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-5">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {member.role}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What REAGLEX Does Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  What REAGLEX Does
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Our platform provides everything you need for a seamless e-commerce experience
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-4 shadow-sm">
                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* How REAGLEX Works Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  How REAGLEX Works
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Simple, secure, and efficient - for both buyers and sellers
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                {/* Buyer Flow */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
                    For Buyers
                  </h3>
                  <div className="space-y-4">
                    {buyerSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-blue-600 dark:bg-blue-500' : index === 1 ? 'bg-green-600 dark:bg-green-500' : index === 2 ? 'bg-purple-600 dark:bg-purple-500' : index === 3 ? 'bg-orange-600 dark:bg-orange-500' : 'bg-red-600 dark:bg-red-500'}`}>
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className={`h-5 w-5 ${index === 0 ? 'text-blue-600 dark:text-blue-400' : index === 1 ? 'text-green-600 dark:text-green-400' : index === 2 ? 'text-purple-600 dark:text-purple-400' : index === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`} />
                              <h4 className="font-bold text-gray-900 dark:text-white">{step.title}</h4>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Seller Flow */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
                    For Sellers
                  </h3>
                  <div className="space-y-4">
                    {sellerSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-blue-600 dark:bg-blue-500' : index === 1 ? 'bg-green-600 dark:bg-green-500' : index === 2 ? 'bg-purple-600 dark:bg-purple-500' : index === 3 ? 'bg-orange-600 dark:bg-orange-500' : 'bg-red-600 dark:bg-red-500'}`}>
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className={`h-5 w-5 ${index === 0 ? 'text-blue-600 dark:text-blue-400' : index === 1 ? 'text-green-600 dark:text-green-400' : index === 2 ? 'text-purple-600 dark:text-purple-400' : index === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`} />
                              <h4 className="font-bold text-gray-900 dark:text-white">{step.title}</h4>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Story
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  The journey behind REAGLEX
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-8 lg:p-10 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  REAGLEX was founded in 2020 by a team of passionate entrepreneurs who saw a critical gap in Africa's e-commerce landscape. While online shopping was growing globally, African buyers and sellers faced significant challenges: lack of trust, payment insecurity, limited logistics, and fragmented marketplaces.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our founders, led by CEO Mwubahamana Pierre, envisioned a platform that would solve these problems through innovative technology. We built REAGLEX with three core principles: security through escrow protection, trust through verified sellers, and innovation through AI-powered features.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Today, REAGLEX has grown from a small startup to Rwanda's leading e-commerce platform, serving thousands of customers and hundreds of sellers across 15+ countries. We're not just a marketplace - we're building the infrastructure for Africa's digital economy, empowering businesses and delighting customers every day.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Choose REAGLE-X?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  We're not just another marketplace. We're your trusted partner in e-commerce success.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Shield,
                    title: '100% Secure Transactions',
                    description: 'Bank-level encryption and escrow protection ensure your money and data are always safe.',
                  },
                  {
                    icon: Zap,
                    title: 'Lightning Fast Delivery',
                    description: 'Same-day and next-day delivery options available in major cities across Rwanda.',
                  },
                  {
                    icon: Star,
                    title: 'Verified Sellers Only',
                    description: 'Every seller is verified and rated, ensuring quality products and reliable service.',
                  },
                  {
                    icon: Heart,
                    title: 'Customer-First Support',
                    description: 'Our dedicated support team is available 24/7 to help you with any questions or issues.',
                  },
                  {
                    icon: Award,
                    title: 'Best Price Guarantee',
                    description: 'We match competitor prices and offer exclusive deals you won\'t find anywhere else.',
                  },
                  {
                    icon: Globe,
                    title: 'Local & International',
                    description: 'Shop from local Rwandan businesses or discover products from around the world.',
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-4 shadow-sm">
                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  What Our Users Say
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Trusted by buyers and sellers across Africa
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role} • {testimonial.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Everything you need to know about REAGLEX
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-900 dark:text-white flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-900 dark:text-white flex-shrink-0" />
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

        {/* Awards & Certifications Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Trust & Compliance
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  We're committed to security and transparency
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <ShieldCheck className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Payment Security</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PCI DSS Compliant</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <Lock className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Data Protection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">GDPR Compliant</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                  <FileText className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Business Registration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rwanda RDB Registered</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Join thousands of happy customers and sellers who trust REAGLE-X for their e-commerce needs. Start shopping or selling today!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/products">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all gap-2">
                      Start Shopping
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/seller">
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 gap-2">
                      Become a Seller
                      <Store className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  We'd love to hear from you
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                    <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Address</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kigali, Rwanda
                  </p>
                </div>

                <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                    <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +14313062173<br />+250 788 325 115
                  </p>
                </div>

                <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                    <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    reaglerobust2020@gmail.com
                  </p>
                </div>

                <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                    <MessageCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 Available
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-center">Support Resources</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/help" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">Help Center</span>
                  </Link>
                  <Link to="/contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Headphones className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">Contact Support</span>
                  </Link>
                  <Link to="/terms" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">Terms of Service</span>
                  </Link>
                  <Link to="/privacy" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-gray-700 dark:text-gray-300">Privacy Policy</span>
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="flex justify-center gap-4">
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
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

