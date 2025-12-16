import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Mail,
  MessageCircle,
  Building2,
  Phone,
  Clock,
  Send,
  Upload,
  CheckCircle2,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Copy,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

const contactOptions = [
  {
    title: 'General Support',
    description: 'For general inquiries, account issues, and customer service',
    email: 'reaglerobust2020@gmail.com',
    responseTime: 'within 24 hours',
    icon: Mail,
    color: 'bg-orange-600',
  },
  {
    title: 'Seller Support',
    description: 'For seller onboarding, verification, and store management issues',
    email: 'reaglerobust2020@gmail.com',
    responseTime: 'within 12 hours',
    icon: ShoppingBag,
    color: 'bg-blue-600',
  },
  {
    title: 'Business & Partnerships',
    description: 'For collaborations, B2B deals, and partnership inquiries',
    email: 'reaglerobust2020@gmail.com',
    responseTime: 'within 48 hours',
    icon: Building2,
    color: 'bg-purple-600',
  },
];

// (Optional) In future we can reintroduce supportCategories for a richer help center navigation.

const faqs = [
  {
    question: 'How to track my order?',
    answer: 'You can track your order by logging into your account and going to "My Orders". You\'ll receive tracking updates via email and SMS once your order ships. You can also use the order tracking number provided in your confirmation email.',
  },
  {
    question: 'How does escrow work?',
    answer: 'REAGLEX uses an escrow system to protect both buyers and sellers. When you make a purchase, your payment is held securely until you confirm receipt of the order. Once you confirm delivery, the payment is released to the seller. This ensures safe transactions for everyone.',
  },
  {
    question: 'How to become a seller?',
    answer: 'To become a seller, click on "Become a Seller" in the header, fill out the seller application form, and submit required documents for verification. Our team will review your application within 2-3 business days. Once approved, you can start listing products and selling on REAGLEX.',
  },
  {
    question: 'How can I get a refund?',
    answer: 'To request a refund, go to "My Orders" in your account, select the order you want to refund, and click "Request Refund". You can also contact our support team. Refunds are processed within 5-7 business days after approval, depending on your payment method.',
  },
  {
    question: 'How can I delete my account?',
    answer: 'To delete your account, go to Account Settings > Privacy & Security, and click "Delete Account". Please note that this action is permanent and cannot be undone. Make sure to cancel any pending orders and withdraw any funds before deleting your account.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including Mobile Money (MTN, Airtel), Bank Transfer, Credit/Debit Cards (Visa, Mastercard, Amex), PayPal, and Flutterwave. All payments are processed securely through our encrypted payment gateway.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping times vary depending on your location and the seller\'s location. Local orders typically arrive within 2-5 business days, while international orders may take 7-14 business days. You\'ll receive tracking information once your order ships.',
  },
  {
    question: 'Is my personal information secure?',
    answer: 'Yes, we take your privacy and security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent. For more details, please review our Privacy Policy.',
  },
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
    file: null as File | null,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate ticket ID
    const newTicketId = `TKT-${Date.now().toString().slice(-8)}`;
    setTicketId(newTicketId);
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: '',
      message: '',
      file: null,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Emergency Support Banner */}
      {showEmergencyBanner && (
        <div className="w-full bg-yellow-500 dark:bg-yellow-600 text-white py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                We are experiencing delays with Flutterwave payments. Our team is working on it.
              </span>
            </div>
            <button
              onClick={() => setShowEmergencyBanner(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Contact REAGLEX Support
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              We're here to help you 24/7. Choose the support method that fits your need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="w-full bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {option.description}
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 break-all">
                          {option.email}
                        </span>
                        <button
                          onClick={() => copyToClipboard(option.email)}
                          className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          aria-label="Copy email"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Response: {option.responseTime}
                      </p>
                    </div>
                    <a href={`mailto:${option.email}`}>
                      <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                        Send Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Live Support */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                        placeholder="+250 788 123 456"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                      >
                        <option value="">Select a category</option>
                        <option value="buyer">Buyer Issue</option>
                        <option value="seller">Seller Issue</option>
                        <option value="logistics">Logistics Issue</option>
                        <option value="payments">Payments Issue</option>
                        <option value="technical">Technical Issue</option>
                        <option value="partner">Partner Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                    <div>
                      <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attach File (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {formData.file ? formData.file.name : 'Choose file'}
                          </span>
                          <input
                            type="file"
                            id="file"
                            name="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </label>
                        {formData.file && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, file: null }))}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-6 text-lg font-semibold"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Live Support & Info */}
              <div className="space-y-6">
                {/* Live Support */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Live Support
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="https://wa.me/250788325115"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">WhatsApp Support</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chat with Support</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                    </a>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Our chat widget is available 24/7. Click the chat icon in the bottom right corner to start a conversation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Office Information */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Office Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">REAGLEX Technologies LTD</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Kigali, Rwanda</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Support Hours</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">24/7</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Support Hotline</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">+14313062173</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">+250 788 325 115</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-3">
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
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full bg-white dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Find Us
            </h2>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden h-64 sm:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.497311317283!2d30.0614!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4254ebdf275%3A0x1b5b5b5b5b5b5b5b!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="REAGLEX Office Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
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

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your message has been sent successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ticket ID:</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-white">{ticketId}</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expected response time: <span className="font-semibold text-gray-900 dark:text-white">within 24 hours</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll send a confirmation email to your inbox shortly.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSuccess(false)}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                Close
              </Button>
              <Link to="/support" className="flex-1">
                <Button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">
                  Support Center
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Contact;

