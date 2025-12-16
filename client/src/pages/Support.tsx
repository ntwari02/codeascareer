import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  HelpCircle,
  Mail,
  Phone,
  Headphones,
  Search,
  BookOpen,
  MessageSquare,
  Clock
} from 'lucide-react';

export function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, add items to your cart, and proceed to checkout. You can pay securely using our escrow system.',
      category: 'Orders'
    },
    {
      id: 2,
      question: 'How does the escrow payment system work?',
      answer: 'Our escrow system holds your payment securely until you receive and confirm your order. Once you confirm delivery, the payment is released to the seller.',
      category: 'Payment'
    },
    {
      id: 3,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on most items. Items must be unused and in original packaging. Contact support to initiate a return.',
      category: 'Returns'
    },
    {
      id: 4,
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by location and seller. Standard shipping typically takes 3-7 business days. Express shipping options are available.',
      category: 'Shipping'
    },
    {
      id: 5,
      question: 'How do I track my order?',
      answer: 'You can track your order from the Orders page in your profile. You\'ll receive tracking updates via email and notifications.',
      category: 'Orders'
    },
    {
      id: 6,
      question: 'Is my payment information secure?',
      answer: 'Yes, we use bank-level encryption and PCI DSS compliant payment processing. Your payment information is never stored on our servers.',
      category: 'Security'
    }
  ];

  const helpCategories = [
    {
      icon: BookOpen,
      title: 'Help Center',
      description: 'Browse articles and guides',
      link: '/help',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      link: '/messages',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'reaglerobust2020@gmail.com',
      link: 'mailto:reaglerobust2020@gmail.com',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+14313062173 / +250 788 325 115',
      link: 'tel:+14313062173',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />
      
      <main className="w-full">
        {/* Hero Section */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-12 sm:py-16">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
                <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                How can we help you?
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Find answers to common questions or contact our support team
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Help Categories */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Get Support
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {helpCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={index}
                      to={category.link}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 bg-white dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Frequently Asked Questions
              </h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No results found. Try a different search term.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {faq.question}
                            </h3>
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                              {faq.category}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
                <div className="text-center mb-8">
                  <Headphones className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Still need help?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our support team is available 24/7 to assist you
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Live Chat</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">reaglerobust2020@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Phone</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+14313062173</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">+250 788 325 115</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Response Time</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/messages">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Live Chat
                    </Button>
                  </Link>
                  <a href="mailto:reaglerobust2020@gmail.com">
                    <Button variant="outline" className="border-gray-300 dark:border-gray-700">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
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

