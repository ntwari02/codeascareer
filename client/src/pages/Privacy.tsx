import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Cookie,
  CreditCard,
  User,
  Download,
  Trash2,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  AlertCircle,
  Building2,
  Database,
  Key,
  Server,
  Users,
  Calendar,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Truck,
  MessageSquare,
  Sparkles,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export default function Privacy() {
  const { user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const handleDownloadData = () => {
    // In a real app, this would trigger a data export
    alert('Your data export request has been submitted. You will receive an email with your data within 7 business days.');
  };

  const handleDeleteAccount = () => {
    // In a real app, this would trigger account deletion
    alert('Account deletion request submitted. Your account will be permanently deleted after 30 days. You can cancel this request within that period.');
    setShowDeleteConfirm(false);
  };

  const sections = [
    {
      id: 1,
      title: 'Introduction',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This Privacy Policy explains how REAGLEX ("we," "our," or "us") collects, uses, discloses, and protects your personal information when you use our e-commerce platform, website, mobile application, and related services (collectively, the "Service").
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX is committed to protecting your privacy and ensuring the security of your personal data. This policy applies to all users of our platform, including buyers, sellers, and visitors.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'What Information We Collect',
      icon: Database,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            We collect information that you provide directly to us and information that is automatically collected when you use our Service.
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              A. Account Information
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Password (encrypted and hashed)</li>
              <li>Profile picture (optional)</li>
              <li>Date of birth (for age verification)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              B. Buyer Information
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Shipping and billing addresses</li>
              <li>Payment method information (processed securely by third-party providers)</li>
              <li>Order history and purchase records</li>
              <li>Product reviews and ratings</li>
              <li>Wishlist items</li>
              <li>Cart contents</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              C. Seller Information
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Business name and registration details</li>
              <li>KYC (Know Your Customer) verification documents</li>
              <li>Bank account or mobile money details for payouts</li>
              <li>Tax identification numbers</li>
              <li>Store information and product listings</li>
              <li>Sales and transaction history</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              D. Tracking & Usage Information
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Browsing behavior and page views</li>
              <li>Search queries and filters used</li>
              <li>Device information (IP address, operating system, browser type)</li>
              <li>Location data (if permitted)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Interaction with emails and notifications</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              E. Media Uploads
            </h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Product images and videos</li>
              <li>Verification documents (ID, business licenses)</li>
              <li>Profile pictures</li>
              <li>Review photos</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'How We Use Your Information',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We use the information we collect for the following purposes:
          </p>
          <ul className="space-y-3">
            {[
              { icon: User, text: 'To create, manage, and secure your account' },
              { icon: CreditCard, text: 'To process orders, payments, and refunds' },
              { icon: Truck, text: 'To facilitate product delivery and shipping' },
              { icon: Shield, text: 'For KYC verification and fraud prevention' },
              { icon: AlertCircle, text: 'To detect and prevent fraudulent activities' },
              { icon: MessageSquare, text: 'To provide customer support and respond to inquiries' },
              { icon: Sparkles, text: 'To personalize product recommendations and shopping experience' },
              { icon: Bell, text: 'To send order updates, notifications, and promotional emails (with your consent)' },
              { icon: BarChart3, text: 'For analytics and platform improvement' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mt-0.5">
                    <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  We Do Not Sell Your Personal Data
                </p>
                <p className="text-sm text-green-800 dark:text-green-300">
                  REAGLEX does not sell, rent, or trade your personal information to third parties for their marketing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'How We Protect Your Data',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We implement industry-standard security measures to protect your personal information:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Key,
                title: 'Encryption',
                description: 'All passwords and sensitive data are encrypted using advanced encryption standards (AES-256).',
              },
              {
                icon: Server,
                title: 'Secure Communication',
                description: 'All data transmission uses HTTPS/TLS encryption to protect information in transit.',
              },
              {
                icon: Shield,
                title: 'Access Controls',
                description: 'Role-based access controls ensure only authorized personnel can access your data.',
              },
              {
                icon: Database,
                title: 'Secure Storage',
                description: 'Data is stored on secure servers with regular backups and monitoring.',
              },
              {
                icon: Eye,
                title: 'Security Audits',
                description: 'Regular security audits and vulnerability assessments are conducted.',
              },
              {
                icon: CreditCard,
                title: 'Payment Security',
                description: 'Payment processing is handled by certified third-party providers (Stripe, Flutterwave).',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200 mb-1">No Plain-Text Storage</p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  We never store sensitive information like passwords or payment card numbers in plain text.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Sharing Your Information',
      icon: Users,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            We may share your information in the following circumstances:
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">A. With Third-Party Services</h4>
            <div className="space-y-3">
              {[
                { name: 'Stripe', purpose: 'Payment processing' },
                { name: 'Flutterwave', purpose: 'Payment processing' },
                { name: 'SendGrid', purpose: 'Email delivery' },
                { name: 'Courier Partners', purpose: 'Shipping and delivery' },
                { name: 'Supabase', purpose: 'Cloud storage and database' },
                { name: 'Google Analytics', purpose: 'Website analytics (anonymized)' },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{service.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">B. Legal Requirements</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>To comply with legal obligations and court orders</li>
              <li>To respond to government requests</li>
              <li>To investigate fraud or security issues</li>
              <li>To protect our rights and the safety of our users</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">C. With Sellers (Limited Data Only)</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              When you place an order, we share the following information with the seller:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Shipping address</li>
              <li>Phone number</li>
              <li>Order details (products, quantities)</li>
              <li>Delivery instructions (if provided)</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-3">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>We Never Share:</strong> Passwords, full payment card data, or email addresses with sellers.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Cookies & Tracking Technology',
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We use cookies and similar tracking technologies to enhance your experience on our platform.
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Types of Cookies We Use:</h4>
            <div className="space-y-3">
              {[
                { type: 'Essential Cookies', purpose: 'Required for login sessions and core functionality' },
                { type: 'Cart Cookies', purpose: 'Remember items in your shopping cart' },
                { type: 'Preference Cookies', purpose: 'Save your language and display preferences' },
                { type: 'Analytics Cookies', purpose: 'Help us understand how visitors use our site (anonymized)' },
                { type: 'Marketing Cookies', purpose: 'Personalize recommendations and ads (with your consent)' },
              ].map((cookie, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{cookie.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cookie.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Your Cookie Preferences</h5>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
              You can control cookies through your browser settings. However, disabling essential cookies may affect platform functionality.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                Accept All Cookies
              </Button>
              <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                Reject Non-Essential
              </Button>
              <Button size="sm" variant="outline" className="bg-white dark:bg-gray-800">
                Clear Cookies
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Payments & Financial Data Handling',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-200 mb-1">
                  REAGLEX Does Not Store Card Numbers
                </p>
                <p className="text-sm text-green-800 dark:text-green-300">
                  All payment card information is processed securely by our certified payment partners (Stripe and Flutterwave). We never see or store your full card numbers.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Payment Processing:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>All payments are encrypted and processed by Stripe or Flutterwave</li>
              <li>These providers are PCI DSS compliant and handle all sensitive financial data</li>
              <li>We only receive payment confirmation and transaction IDs</li>
              <li>Your wallet balance (if applicable) is securely managed and encrypted</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Security Standards:</strong> Our payment partners comply with international security standards including PCI DSS Level 1, ensuring the highest level of payment security.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Your Rights (GDPR/Global Standards)',
      icon: User,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            You have the following rights regarding your personal data:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Eye, title: 'Access Your Data', description: 'Request a copy of all personal data we hold about you' },
              { icon: Settings, title: 'Update Your Profile', description: 'Modify your account information at any time' },
              { icon: Trash2, title: 'Delete Your Account', description: 'Request permanent deletion of your account and data' },
              { icon: FileText, title: 'Request Correction', description: 'Correct any inaccurate or incomplete information' },
              { icon: Bell, title: 'Opt-Out of Marketing', description: 'Unsubscribe from promotional emails and notifications' },
              { icon: Download, title: 'Data Portability', description: 'Export your data in a machine-readable format' },
            ].map((right, index) => {
              const Icon = right.icon;
              return (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">{right.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{right.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-4">Exercise Your Rights</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDownloadData}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </Button>
              <Link to="/profile">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: 'Seller Rights & Responsibilities',
      icon: Building2,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Seller Rights:</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Access store analytics and sales data</li>
              <li>Update product information and listings</li>
              <li>Manage finance settings and payout methods</li>
              <li>View order details and customer shipping information (limited)</li>
              <li>Access seller dashboard and tools</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Seller Responsibilities:</h4>
            <div className="space-y-3">
              {[
                'Keep buyer information private and confidential',
                'Use buyer data only for order fulfillment and shipping purposes',
                'Do not share buyer information with third parties without consent',
                'Respect REAGLEX privacy policies and terms of service',
                'Implement appropriate security measures for stored buyer data',
                'Report any data breaches or security incidents immediately',
              ].map((responsibility, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{responsibility}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      title: "Children's Privacy",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                  Age Restriction
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  REAGLEX is not intended for individuals under the age of 18 (or the legal age of commerce in your jurisdiction). We do not knowingly collect personal information from minors.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information from our systems.
          </p>
        </div>
      ),
    },
    {
      id: 11,
      title: 'Data Retention Policy',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>
          <div className="space-y-3">
            {[
              { type: 'Order Records', duration: '7 years (for tax and legal compliance)' },
              { type: 'Account Information', duration: 'Until account deletion or 3 years of inactivity' },
              { type: 'Logs & Analytics', duration: 'Automatically deleted after 12 months' },
              { type: 'Uploaded Files', duration: 'Stored until manually removed or account deletion' },
              { type: 'Marketing Data', duration: 'Until you opt-out or 2 years of inactivity' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="font-medium text-gray-900 dark:text-white">{item.type}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.duration}</span>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> Some information may be retained longer if required by law, for legal proceedings, or to resolve disputes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      title: 'Changes to This Policy',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How We Notify You:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300 ml-4">
              <li>We will post the updated policy on this page with a new "Last Updated" date</li>
              <li>For significant changes, we will notify you via email or platform notification</li>
              <li>Continued use of our Service after changes constitutes acceptance of the updated policy</li>
            </ul>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
          </p>
        </div>
      ),
    },
    {
      id: 13,
      title: 'Contact Information',
      icon: Mail,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">REAGLEX Privacy Team</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <a
                    href="mailto:privacy@reaglex.com"
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    privacy@reaglex.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kigali, Rwanda
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h5 className="font-semibold text-orange-900 dark:text-orange-200 mb-3">Additional Support</h5>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
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
      ),
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
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="w-full">
          {/* Quick Actions */}
          {user && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadData}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download My Data
                </Button>
                <Link to="/profile">
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Update Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="gap-2 text-red-600 hover:text-red-700 border-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          )}

          {/* Privacy Policy Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.has(index);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {section.id}. {section.title}
                        </h2>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="pt-6">{section.content}</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
            <p className="text-sm mt-2">
              For questions or concerns, please contact us at{' '}
              <a href="mailto:privacy@reaglex.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                privacy@reaglex.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data, orders, and account information will be permanently deleted after 30 days.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

