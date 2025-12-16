import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  RotateCcw,
  Shield,
  Package,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  FileText,
  Truck,
  CreditCard,
  Smartphone,
  Wallet,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Upload,
  UserCheck,
  Store,
  DollarSign,
  Award,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

const eligibleReasons = [
  {
    icon: Package,
    title: 'Damaged or Defective Items',
    description: 'Items that arrive broken, damaged, or not working properly',
    color: 'red',
  },
  {
    icon: AlertTriangle,
    title: 'Wrong Item Delivered',
    description: 'Received a different product than what was ordered',
    color: 'orange',
  },
  {
    icon: FileText,
    title: 'Item Not as Described',
    description: 'Product differs significantly from the seller\'s description',
    color: 'amber',
  },
  {
    icon: X,
    title: 'Missing Accessories',
    description: 'Essential parts or accessories are missing from the package',
    color: 'yellow',
  },
  {
    icon: Shield,
    title: 'Fake/Low-Quality/Counterfeit Items',
    description: 'Items that are counterfeit or significantly lower quality than advertised',
    color: 'red',
  },
  {
    icon: Clock,
    title: 'Expired Products',
    description: 'Food items or products that have passed their expiration date',
    color: 'orange',
  },
  {
    icon: UserCheck,
    title: 'Wrong Size (Fashion)',
    description: 'Clothing or shoes that don\'t fit as expected',
    color: 'blue',
  },
  {
    icon: AlertTriangle,
    title: 'Broken on Arrival',
    description: 'Items that were damaged during shipping and arrived broken',
    color: 'red',
  },
];

const nonReturnableItems = [
  'Perishable goods (food items)',
  'Hygiene items (cosmetics, underwear, personal care)',
  'Digital products (software, e-books, digital codes)',
  'Personalized or engraved products',
  'Opened sealed items (if hygiene-based)',
  'Items damaged by buyer misuse',
  'Items returned after the return window',
  'Items without original packaging',
  'Gift cards and vouchers',
  'Live plants or animals',
];

const returnWindows = [
  {
    type: 'Local Items',
    window: '7–14 days',
    description: 'Standard return window for items shipped within Rwanda',
  },
  {
    type: 'International Items',
    window: '10–30 days',
    description: 'Extended window for items shipped from outside Rwanda',
  },
  {
    type: 'Damaged/Defective',
    window: '7 days from delivery',
    description: 'Return anytime within 7 days of delivery for damaged or defective items',
  },
];

const returnSteps = [
  {
    step: 1,
    icon: UserCheck,
    title: 'Log into Your Account',
    description: 'Access your REAGLEX account and navigate to your orders',
  },
  {
    step: 2,
    icon: FileText,
    title: 'Go to Orders > Request Return',
    description: 'Find the order you want to return and click "Request Return"',
  },
  {
    step: 3,
    icon: Upload,
    title: 'Select Reason + Upload Images',
    description: 'Choose your return reason and upload photos as evidence',
  },
  {
    step: 4,
    icon: Store,
    title: 'Seller Reviews Request',
    description: 'Seller has 48 hours to review and approve your return request',
  },
  {
    step: 5,
    icon: Package,
    title: 'Shipping Label Generated',
    description: 'Once approved, you\'ll receive a return shipping label',
  },
  {
    step: 6,
    icon: Truck,
    title: 'Buyer Ships Back Item',
    description: 'Package the item securely and ship it back using the provided label',
  },
  {
    step: 7,
    icon: CheckCircle,
    title: 'Seller/Warehouse Confirms',
    description: 'Seller or warehouse confirms receipt and inspects the returned item',
  },
  {
    step: 8,
    icon: DollarSign,
    title: 'Refund Released (via Escrow)',
    description: 'Refund is processed and released to your original payment method',
  },
];

const returnMethods = [
  {
    icon: Truck,
    title: 'Drop-off at Courier Partner',
    description: 'Take your package to any of our courier partner locations',
    available: true,
  },
  {
    icon: Package,
    title: 'Pickup from Home',
    description: 'Schedule a pickup from your address (available in select areas)',
    available: true,
  },
  {
    icon: Store,
    title: 'Seller\'s Local Pickup Point',
    description: 'Drop off at the seller\'s designated pickup location',
    available: true,
  },
  {
    icon: RefreshCw,
    title: 'Self-Return with Reimbursement',
    description: 'Return the item yourself and get shipping costs reimbursed upon approval',
    available: true,
  },
];

const refundMethods = [
  {
    icon: Wallet,
    title: 'REAGLEX Wallet',
    description: 'Instant refund to your REAGLEX wallet balance',
    processingTime: 'Instant',
  },
  {
    icon: CreditCard,
    title: 'Original Payment Method',
    description: 'Refund to your original card or payment method (Stripe/Flutterwave)',
    processingTime: '3–5 business days',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'Refund to your MTN or Airtel mobile money account',
    processingTime: '1–2 business days',
  },
  {
    icon: DollarSign,
    title: 'Bank Transfer',
    description: 'Direct transfer to your bank account',
    processingTime: '5–7 business days',
  },
  {
    icon: Award,
    title: 'Voucher Refund',
    description: 'Receive store credit as a voucher for future purchases',
    processingTime: 'Instant',
  },
];

const shippingCostsTable = [
  {
    case: 'Wrong item delivered',
    whoPays: 'Seller',
    reason: 'Seller\'s error',
  },
  {
    case: 'Broken item',
    whoPays: 'Seller',
    reason: 'Seller\'s responsibility',
  },
  {
    case: 'Buyer changed mind',
    whoPays: 'Buyer',
    reason: 'Buyer\'s choice',
  },
  {
    case: 'Wrong size',
    whoPays: 'Buyer',
    reason: 'Buyer\'s choice',
  },
  {
    case: 'Fake product',
    whoPays: 'Seller',
    reason: 'Seller\'s violation',
  },
  {
    case: 'Item not as described',
    whoPays: 'Seller',
    reason: 'Seller\'s error',
  },
  {
    case: 'Damaged during shipping',
    whoPays: 'Seller',
    reason: 'Seller\'s responsibility',
  },
  {
    case: 'Missing accessories',
    whoPays: 'Seller',
    reason: 'Seller\'s error',
  },
];

const returnFAQs = [
  {
    question: 'How do I request a return?',
    answer: 'Log into your account, go to "My Orders", select the order you want to return, and click "Request Return". Choose your reason, upload photos if needed, and submit your request. The seller will review it within 48 hours.',
  },
  {
    question: 'When will I get my refund?',
    answer: 'Refunds are processed within 3–7 business days after the seller or warehouse confirms receipt of the returned item. The exact time depends on your payment method - REAGLEX Wallet is instant, while bank transfers may take 5–7 days.',
  },
  {
    question: 'Can I cancel a return?',
    answer: 'Yes, you can cancel a return request before the seller approves it. Once approved and the shipping label is generated, you\'ll need to contact support to cancel. If you\'ve already shipped the item, the return will proceed.',
  },
  {
    question: 'What if seller refuses my return?',
    answer: 'If a seller refuses your return request, you can escalate it to REAGLEX support. Our dispute resolution team will review the case, examine evidence from both parties, and make a fair decision. You\'re protected under our Buyer Protection Program.',
  },
  {
    question: 'Are shipping costs refundable?',
    answer: 'Original shipping costs are refunded if the return is due to seller error (wrong item, damaged, not as described, etc.). For change-of-mind returns, original shipping costs are not refunded, but return shipping may be covered depending on the case.',
  },
  {
    question: 'What if the item gets damaged during return shipping?',
    answer: 'If an item is damaged during return shipping, contact support immediately with photos. We\'ll investigate and determine responsibility. If the damage is due to inadequate packaging, the buyer may be responsible. If it\'s due to courier handling, REAGLEX will cover the loss.',
  },
  {
    question: 'How long do I have to return an item?',
    answer: 'Return windows vary: 7–14 days for local items, 10–30 days for international items, and 7 days from delivery for damaged or defective items. The exact window is shown on your order details page.',
  },
  {
    question: 'Do I need to return the original packaging?',
    answer: 'Yes, whenever possible, return items in their original packaging. This helps protect the item during return shipping and ensures faster processing. However, damaged packaging is acceptable for defective items.',
  },
];

export default function Returns() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100 max-w-3xl mx-auto mb-6">
              If your order isn't what you expected, REAGLEX offers easy returns and refunds through our Buyer Protection Program.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>Return Eligible Items</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5" />
                <span>7–30 Day Window</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Shield className="h-5 w-5" />
                <span>Buyer Protection Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligible Items Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What Items Are Eligible for Return
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Clear reasons that qualify for returns and refunds
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {eligibleReasons.map((reason, index) => {
                const Icon = reason.icon;
                const getColorClasses = (color: string) => {
                  switch (color) {
                    case 'red':
                      return {
                        bg: 'bg-red-100 dark:bg-red-900/30',
                        text: 'text-red-600 dark:text-red-400',
                      };
                    case 'orange':
                      return {
                        bg: 'bg-orange-100 dark:bg-orange-900/30',
                        text: 'text-orange-600 dark:text-orange-400',
                      };
                    case 'amber':
                      return {
                        bg: 'bg-amber-100 dark:bg-amber-900/30',
                        text: 'text-amber-600 dark:text-amber-400',
                      };
                    case 'yellow':
                      return {
                        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                        text: 'text-yellow-600 dark:text-yellow-400',
                      };
                    case 'blue':
                      return {
                        bg: 'bg-blue-100 dark:bg-blue-900/30',
                        text: 'text-blue-600 dark:text-blue-400',
                      };
                    default:
                      return {
                        bg: 'bg-gray-100 dark:bg-gray-800',
                        text: 'text-gray-600 dark:text-gray-400',
                      };
                  }
                };
                const colors = getColorClasses(reason.color);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reason.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Non-Returnable Items */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <X className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Non-Returnable Items
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Items that cannot be returned for safety and hygiene reasons
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 sm:p-8">
              <ul className="grid sm:grid-cols-2 gap-3">
                {nonReturnableItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 dark:text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Return Windows */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Clock className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Return Windows (Time Limits)
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Time limits for returning items based on shipping type
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Item Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Return Window
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {returnWindows.map((window, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {window.type}
                      </td>
                      <td className="px-6 py-4 text-orange-600 dark:text-orange-400 font-bold">
                        {window.window}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {window.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Return Process */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <RotateCcw className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Step-by-Step Return Process
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                A simple, clear process from request to refund
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30`}>
                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                    {index < returnSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                        <ChevronDown className="h-6 w-6 text-orange-600 dark:text-orange-400 rotate-90" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Return Methods */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Truck className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Return Methods
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Choose the most convenient way to return your item
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {returnMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-orange-100 dark:bg-orange-900/30">
                      <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {method.description}
                    </p>
                    {method.available && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle className="h-3 w-3" />
                        Available
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Refund Methods */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <DollarSign className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Refund Methods
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How refunds are processed and when you'll receive your money
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {refundMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-green-100 dark:bg-green-900/30">
                      <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {method.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {method.processingTime}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Refund Processing Timeline
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Refunds are processed within 3–7 business days after the seller or warehouse confirms receipt of the returned item. The exact time depends on your payment method. You'll receive an email notification when your refund is processed.
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Note:</strong> Refunds are issued after item inspection to ensure the returned item matches the original order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Shipping Costs */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Truck className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Who Pays Return Shipping Costs?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Clear guidelines on return shipping responsibility
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Case
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Who Pays Shipping?
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {shippingCostsTable.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {row.case}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          row.whoPays === 'Seller'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {row.whoPays}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {row.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Return Approval Rules */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <FileText className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Return Approval Rules
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How sellers and admins handle return requests
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Seller Response Time
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Seller must respond within 48 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-approval after 48 hours if no response</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Evidence required for item defects</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  REAGLEX Intervention
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Dispute team reviews escalated cases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Fair decision based on evidence</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Buyer protection guaranteed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dispute Resolution */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Dispute Resolution Process
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How REAGLEX mediates disagreements between buyers and sellers
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 sm:p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      REAGLEX Mediates
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      If buyer and seller disagree, REAGLEX support team steps in to mediate the dispute fairly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Evidence Collection
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Both parties upload proof: photos, videos, messages, order details, and any relevant documentation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Review & Decision
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Our support team reviews all evidence and makes a fair decision within 5–7 business days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Refund Issued
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Refund is issued accordingly based on the final decision. Both parties are notified of the outcome.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Return Policies */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Store className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Return Policy for Sellers
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Guidelines and requirements for sellers handling returns
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Response Time Requirement
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Sellers must respond to return requests within 48 hours. Failure to respond results in auto-approval.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• First violation: Warning</li>
                  <li>• Repeated violations: Account restrictions</li>
                  <li>• Severe cases: Account suspension</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Packaging Review
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Inspect returned items to ensure they match the original order and are in acceptable condition.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Verify item condition</li>
                  <li>• Check for missing accessories</li>
                  <li>• Confirm item matches order</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Issuing Refunds
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Process refunds promptly through your seller dashboard. Refunds are released from escrow automatically.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Access refund tools in dashboard</li>
                  <li>• Refunds processed within 24 hours</li>
                  <li>• Automatic escrow release</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Penalties for Fake Items
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Selling counterfeit or fake items results in severe penalties to protect buyers.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Immediate refund to buyer</li>
                  <li>• Account warning or suspension</li>
                  <li>• Possible legal action</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Slow Response Penalties
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Consistently slow responses to return requests affect your seller rating and account standing.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Lower seller rating</li>
                  <li>• Reduced visibility in search</li>
                  <li>• Account restrictions</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Return Shipping Labels
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Generate return shipping labels directly from your seller dashboard for approved returns.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Auto-generated labels</li>
                  <li>• Track return shipments</li>
                  <li>• Cost deducted from refund if applicable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Returns FAQ
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Common questions about returns and refunds
              </p>
            </div>

            <div className="space-y-4">
              {returnFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                      {faq.question}
                    </h3>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-700 dark:text-gray-300">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold"
              >
                View All FAQs
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <MessageCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Our support team is here to assist with any return or refund questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Mail className="h-5 w-5" />
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
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
              >
                <HelpCircle className="h-5 w-5" />
                Support Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

