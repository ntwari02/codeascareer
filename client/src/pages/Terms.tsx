import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  FileText,
  BookOpen,
  UserCheck,
  Shield,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  Copyright,
  ExternalLink,
  XCircle,
  RefreshCw,
  Mail,
  MapPin,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Users,
  Store,
  ShoppingCart,
  Lock,
  Ban,
  Gavel,
} from 'lucide-react';

export default function Terms() {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0])); // First section expanded by default

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 1,
      title: 'Introduction & Agreement',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to REAGLEX, an e-commerce marketplace platform that connects buyers and sellers across Africa and worldwide. These Terms and Conditions ("Terms") govern your access to and use of our website, mobile application, and related services (collectively, the "Platform").
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            By accessing or using REAGLEX, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>Important:</strong> These Terms apply to all users of the Platform, including buyers, sellers, and visitors. By creating an account, placing an order, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX reserves the right to modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
          </p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Definitions',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            For the purposes of these Terms, the following definitions apply:
          </p>
          <div className="space-y-3">
            {[
              { term: 'Buyer', definition: 'A user who purchases products or services through the Platform.' },
              { term: 'Seller', definition: 'A user who lists and sells products or services through the Platform.' },
              { term: 'Platform', definition: 'The REAGLEX website, mobile application, and all related services and infrastructure.' },
              { term: 'Order', definition: 'A transaction where a Buyer purchases products or services from a Seller through the Platform.' },
              { term: 'Content', definition: 'Any text, images, videos, product descriptions, reviews, or other materials posted on the Platform.' },
              { term: 'Third-Party Services', definition: 'External services integrated with REAGLEX, including payment processors, couriers, and email providers.' },
              { term: 'Account', definition: 'A user account created on the Platform that allows access to Platform features and services.' },
              { term: 'Escrow', definition: 'A secure payment system where funds are held by REAGLEX until order delivery is confirmed.' },
            ].map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.term}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Eligibility to Use the Platform',
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            To use REAGLEX, you must meet the following eligibility requirements:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Age Requirement
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                You must be at least 18 years old (or the legal age of majority in your jurisdiction) to use the Platform. By using REAGLEX, you represent and warrant that you meet this age requirement.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Account Verification
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <strong>Buyers:</strong> Must provide accurate personal information and verify their email address and phone number.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Sellers:</strong> Must complete KYC (Know Your Customer) verification, including providing valid business registration documents, identification, and bank account or mobile money details.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Geographic Availability
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                REAGLEX is available in multiple regions. Some features may vary by location. You are responsible for ensuring that your use of the Platform complies with local laws and regulations in your jurisdiction.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Account Creation & Responsibilities',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Buyer Responsibilities
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              {[
                'Provide accurate, current, and complete information during account registration',
                'Maintain and promptly update your account information',
                'Keep your login credentials (password) secure and confidential',
                'Notify REAGLEX immediately of any unauthorized access to your account',
                'Report suspicious activity or fraudulent transactions',
                'Ensure you have the legal right to make purchases',
                'Provide accurate shipping and billing addresses',
              ].map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Seller Responsibilities
            </h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              {[
                'Provide real, accurate business information and documentation',
                'Upload accurate product details, including descriptions, images, and pricing',
                'Fulfill orders within the specified timeframes',
                'Maintain adequate inventory levels',
                'Follow REAGLEX policies, including product listing guidelines',
                'Respond to buyer inquiries and support requests promptly',
                'Handle returns and refunds according to REAGLEX policies',
                'Maintain a good seller rating and performance metrics',
                'Comply with all applicable laws and regulations',
              ].map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Account Security</p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  You are responsible for all activities that occur under your account. REAGLEX is not liable for any loss or damage arising from unauthorized use of your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Prohibited Activities',
      icon: Ban,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            The following activities are strictly prohibited on REAGLEX:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: AlertTriangle, title: 'Fraud', description: 'Any fraudulent activity, including fake orders, payment fraud, or identity theft' },
              { icon: Package, title: 'Fake Products', description: 'Selling counterfeit, fake, or imitation products' },
              { icon: FileText, title: 'Misleading Descriptions', description: 'Providing false or misleading product information or images' },
              { icon: X, title: 'Data Scraping', description: 'Using bots, scrapers, or automated tools to extract Platform data' },
              { icon: Lock, title: 'Hacking Attempts', description: 'Attempting to hack, damage, or disrupt the Platform or its security' },
              { icon: Users, title: 'Duplicate Accounts', description: 'Creating multiple accounts to circumvent Platform rules or restrictions' },
              { icon: RotateCcw, title: 'Refund Abuse', description: 'Abusing the refund or return system for fraudulent purposes' },
              { icon: Ban, title: 'Illegal Activities', description: 'Any activity that violates local, national, or international laws' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-red-900 dark:text-red-200 mb-1">{item.title}</h5>
                      <p className="text-sm text-red-800 dark:text-red-300">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Consequences:</strong> Violation of these prohibitions may result in immediate account suspension or termination, legal action, and reporting to relevant authorities.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Product Listings & Quality Requirements',
      icon: Package,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Sellers must comply with the following requirements when listing products:
          </p>
          <div className="space-y-3">
            {[
              {
                requirement: 'Real Product Photos',
                description: 'All product images must be actual photos of the product being sold. Stock photos are only allowed if clearly labeled and the product matches exactly.',
              },
              {
                requirement: 'Accurate Product Information',
                description: 'Product descriptions, specifications, pricing, and availability must be accurate and up-to-date.',
              },
              {
                requirement: 'Prohibited Goods',
                description: 'Fake, illegal, counterfeit, stolen, or harmful goods are strictly prohibited. This includes drugs, weapons, and items that violate intellectual property rights.',
              },
              {
                requirement: 'Quality Standards',
                description: 'Products must meet advertised quality standards. Sellers are responsible for ensuring product quality and safety.',
              },
              {
                requirement: 'Packaging Requirements',
                description: 'Sellers must package products securely to prevent damage during shipping.',
              },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{item.requirement}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>REAGLEX Rights:</strong> REAGLEX reserves the right to remove, edit, or reject any product listing that violates these requirements or Platform policies, without prior notice.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Orders, Payments & Escrow System',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX uses a secure escrow system to protect both buyers and sellers:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Payment Process</h5>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300 ml-2">
                <li>Buyer places an order and payment is processed through Stripe or Flutterwave</li>
                <li>Funds are held securely in escrow by REAGLEX</li>
                <li>Seller is notified and must fulfill the order</li>
                <li>Upon successful delivery confirmation, funds are released to the seller</li>
                <li>If issues arise, REAGLEX mediates and resolves disputes before releasing funds</li>
              </ol>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Methods</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                All payments must be processed through REAGLEX using approved payment gateways (Stripe, Flutterwave). Offline transactions or direct payments to sellers are strictly prohibited and may result in account suspension.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Fees</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                REAGLEX charges platform fees and commissions on transactions. All fees are clearly displayed before order confirmation. Sellers receive payment after fees are deducted.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-200 mb-1">Buyer Protection</p>
                  <p className="text-sm text-green-800 dark:text-green-300">
                    The escrow system ensures that buyers only pay for products they receive, and sellers are protected from fraudulent chargebacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Shipping, Delivery & Delays',
      icon: Truck,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              {
                title: 'Delivery Time Estimates',
                content: 'Sellers must provide accurate delivery time estimates. Actual delivery times may vary based on location, courier performance, and other factors beyond REAGLEX control.',
              },
              {
                title: 'Seller Responsibility',
                content: 'Sellers are responsible for packaging products securely and shipping them within the specified timeframe. Sellers must provide valid tracking numbers.',
              },
              {
                title: 'Force Majeure',
                content: 'REAGLEX and sellers are not liable for delays caused by circumstances beyond reasonable control, including natural disasters, pandemics, courier strikes, or government actions.',
              },
              {
                title: 'Failed Shipment',
                content: 'If a seller fails to ship an order within the specified timeframe without valid reason, the buyer may cancel the order and receive a full refund.',
              },
              {
                title: 'Buyer Cancellation',
                content: 'Buyers may cancel orders before shipment. Once an order is shipped, cancellation is subject to return policy terms.',
              },
            ].map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: 'Returns, Refunds & Dispute Resolution',
      icon: RotateCcw,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX provides a fair dispute resolution process for returns and refunds:
          </p>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Buyer Return Rights</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-2">
                <li>Buyers can request returns for damaged, defective, or misdescribed products</li>
                <li>Return requests must be submitted within the specified timeframe (typically 7-30 days)</li>
                <li>Buyers must provide evidence (photos, videos) when requesting returns</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Seller Responsibilities</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-2">
                <li>Sellers must respond to return requests within 48 hours</li>
                <li>Sellers must accept returns for valid reasons (damaged, wrong item, not as described)</li>
                <li>Sellers are responsible for return shipping costs in cases of seller error</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">REAGLEX Mediation Process</h5>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300 ml-2">
                <li>If buyer and seller cannot agree, either party can escalate to REAGLEX support</li>
                <li>Both parties must provide evidence (photos, messages, order details)</li>
                <li>REAGLEX support team reviews the case and makes a fair decision</li>
                <li>Refunds are processed based on the final decision</li>
                <li>REAGLEX decisions are final and binding</li>
              </ol>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Refund Timelines</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Refunds are typically processed within 3-7 business days after approval, depending on the payment method used.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      title: 'Intellectual Property Rights',
      icon: Copyright,
      content: (
        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">REAGLEX Ownership</h5>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              REAGLEX owns or has licensed all intellectual property rights in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>REAGLEX logo, branding, and trademarks</li>
              <li>Website design, layout, and user interface</li>
              <li>Platform code, software, and technology</li>
              <li>Content created by REAGLEX (help articles, marketing materials)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Seller Ownership</h5>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Sellers retain ownership of:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Their store content and branding</li>
              <li>Product photos and descriptions they create</li>
              <li>Original product designs (if applicable)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              By listing products on REAGLEX, sellers grant REAGLEX a license to display and use their content for Platform purposes.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Prohibited Use</p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Users must not copy, reproduce, or use REAGLEX content, design, or code without explicit written permission. Violation may result in legal action.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 11,
      title: 'Third-Party Services',
      icon: ExternalLink,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX integrates with various third-party services to provide Platform functionality:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Stripe & Flutterwave', purpose: 'Payment processing' },
              { name: 'SendGrid', purpose: 'Email delivery' },
              { name: 'DHL, Sendy, Local Couriers', purpose: 'Shipping and logistics' },
              { name: 'Supabase', purpose: 'Cloud infrastructure and database' },
              { name: 'Google Analytics', purpose: 'Website analytics' },
            ].map((service, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{service.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{service.purpose}</p>
              </div>
            ))}
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">Third-Party Liability</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  REAGLEX is not responsible for failures, errors, or issues with third-party services. Users agree that REAGLEX is not liable for any loss or damage caused by third-party service failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 12,
      title: 'Limitation of Liability',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX operates as a marketplace platform connecting buyers and sellers. Our liability is limited as follows:
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Marketplace Nature</h5>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              REAGLEX is a marketplace, not a product manufacturer or direct seller. We facilitate transactions but are not responsible for product quality, defects, or seller actions.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-900 dark:text-white">REAGLEX is Not Liable For:</h5>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Product defects or quality issues (these are seller responsibilities)</li>
              <li>Seller dishonesty, fraud, or failure to deliver</li>
              <li>Courier delays, lost packages, or shipping damage</li>
              <li>Loss caused by user mistakes, negligence, or unauthorized account access</li>
              <li>Disputes between buyers and sellers (must be resolved through Platform dispute system)</li>
              <li>Third-party service failures (payment processors, couriers, etc.)</li>
            </ul>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>Dispute Resolution:</strong> All disputes between buyers and sellers must be resolved through REAGLEX dispute resolution system before seeking external legal action.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 13,
      title: 'Account Suspension & Termination',
      icon: XCircle,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX reserves the right to suspend or terminate accounts for the following reasons:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Fraud or fraudulent activity',
              'Selling illegal or prohibited goods',
              'Submitting fake or forged documents',
              'Abusing the refund or return system',
              'Violating Platform rules or policies',
              'Chargeback abuse or payment fraud',
              'Creating duplicate accounts',
              'Poor seller performance (low ratings, high cancellation rate)',
            ].map((reason, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800 dark:text-red-300">{reason}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Seller Performance Requirements</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sellers must maintain good performance metrics, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 ml-4 mt-2">
              <li>Minimum seller rating (typically 4.0+ stars)</li>
              <li>Low order cancellation rate (typically &lt;5%)</li>
              <li>Prompt response to buyer inquiries</li>
              <li>On-time shipping and delivery</li>
            </ul>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Notice:</strong> REAGLEX will typically provide a warning before account suspension, except in cases of severe violations (fraud, illegal activity).
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 14,
      title: 'Governing Law',
      icon: Gavel,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            These Terms are governed by and construed in accordance with the laws of Rwanda.
          </p>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Jurisdiction</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Kigali, Rwanda.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>International Users:</strong> If you are using REAGLEX from outside Rwanda, you agree to comply with both Rwandan law and the laws of your jurisdiction where applicable.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 15,
      title: 'Modification of Terms',
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            REAGLEX reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting on the Platform.
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Notification of Changes</h5>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                For significant changes, REAGLEX will notify users via email or Platform notification. The "Last Updated" date at the top of this page indicates when Terms were last modified.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <h5 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">Continued Use</h5>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Your continued use of the Platform after Terms are modified constitutes acceptance of the updated Terms. If you do not agree with the changes, you must stop using the Platform and may delete your account.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 16,
      title: 'Contact Information',
      icon: Mail,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 dark:text-gray-300">
            If you have questions, concerns, or need to contact REAGLEX regarding these Terms, please reach out:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-1">REAGLEX Legal Team</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <a
                    href="mailto:legal@reaglex.com"
                    className="text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    legal@reaglex.com
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
            <FileText className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100">
              Please read these terms carefully before using REAGLEX platform
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="w-full">
          {/* Terms & Conditions Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded = expandedSections.has(index);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
              These Terms & Conditions are effective as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
            </p>
            <p className="text-sm mt-2">
              For questions or concerns, please contact us at{' '}
              <a href="mailto:legal@reaglex.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                legal@reaglex.com
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

