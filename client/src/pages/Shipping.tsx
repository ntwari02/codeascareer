import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  Truck,
  Package,
  Clock,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calculator,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  X,
  Store,
  DollarSign,
  Box,
  Lock,
  Zap,
  Award,
  Users,
  ExternalLink,
} from 'lucide-react';

const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    deliveryTime: '3–7 days',
    coverage: 'Local',
    description: 'Affordable delivery for most items with reliable tracking',
    cost: 'From $2.99',
    icon: Truck,
    color: 'blue',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    deliveryTime: '1–3 days',
    coverage: 'Local',
    description: 'Faster delivery with priority handling and real-time tracking',
    cost: 'From $5.99',
    icon: Zap,
    color: 'orange',
  },
  {
    id: 'economy-international',
    name: 'Economy International',
    deliveryTime: '7–20 days',
    coverage: 'Global',
    description: 'Cheapest option for global orders with standard tracking',
    cost: 'From $8.99',
    icon: Globe,
    color: 'green',
  },
  {
    id: 'priority-international',
    name: 'Priority International',
    deliveryTime: '5–12 days',
    coverage: 'Global',
    description: 'Faster processing with full tracking and insurance',
    cost: 'From $15.99',
    icon: Award,
    color: 'purple',
  },
  {
    id: 'seller-direct',
    name: 'Seller Direct Delivery',
    deliveryTime: 'Varies',
    coverage: 'Same city',
    description: 'Direct delivery by seller for same-city orders',
    cost: 'Free or negotiable',
    icon: Store,
    color: 'teal',
  },
];

const courierPartners = [
  {
    name: 'DHL',
    logo: 'DHL',
    description: 'Global express shipping with reliable tracking',
    coverage: 'Worldwide',
  },
  {
    name: 'FedEx',
    logo: 'FedEx',
    description: 'Fast international delivery services',
    coverage: 'Worldwide',
  },
  {
    name: 'UPS',
    logo: 'UPS',
    description: 'Comprehensive logistics solutions',
    coverage: 'Worldwide',
  },
  {
    name: 'Local Couriers',
    logo: 'Local',
    description: 'Regional delivery partners for fast local shipping',
    coverage: 'East Africa',
  },
  {
    name: 'Regional Transport',
    logo: 'Regional',
    description: 'Cost-effective shipping across Africa',
    coverage: 'Africa',
  },
];

const shippingRestrictions = [
  'Hazardous materials (flammable, explosive, toxic substances)',
  'Illegal goods and prohibited items',
  'Expired food items or medications',
  'Fragile items without proper packaging',
  'Items restricted by specific countries (check customs regulations)',
  'Live animals or plants without proper permits',
  'Weapons, ammunition, or military equipment',
  'Counterfeit or pirated goods',
  'Items exceeding size/weight limits (check with seller)',
  'Perishable items without temperature control',
];

const trackingStatuses = [
  { status: 'Pending', description: 'Order received, awaiting processing' },
  { status: 'Packed', description: 'Item packaged and ready for shipment' },
  { status: 'Shipped', description: 'Package in transit with courier' },
  { status: 'In Transit', description: 'Package on the way to destination' },
  { status: 'Out for Delivery', description: 'Package out for final delivery' },
  { status: 'Delivered', description: 'Package successfully delivered' },
];

const shippingFAQs = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by shipping method and location. Standard shipping takes 3-7 days locally, while international orders can take 7-20 days depending on the service selected.',
  },
  {
    question: 'Why is my order taking long?',
    answer: 'Delays can occur due to customs processing, weather conditions, courier backlogs, or remote delivery locations. Check your tracking information for updates, or contact support if your order is significantly delayed.',
  },
  {
    question: 'How do I track my order?',
    answer: 'You can track your order in the "My Orders" section of your account. You\'ll receive email and SMS notifications at each stage. Enter your tracking number on the courier\'s website for detailed updates.',
  },
  {
    question: 'Why are there customs fees?',
    answer: 'International orders may be subject to customs duties and taxes imposed by the destination country. These fees are the buyer\'s responsibility and are not included in the product or shipping price. You\'ll be notified if any fees apply.',
  },
  {
    question: 'Can I change my delivery address?',
    answer: 'You can change your delivery address before the order is shipped. Go to "My Orders" and click "Change Address". If already shipped, contact support immediately.',
  },
  {
    question: 'What if my package is damaged?',
    answer: 'If your package arrives damaged, take photos immediately and contact support within 48 hours. We\'ll arrange a replacement or full refund. Keep the original packaging for inspection.',
  },
];

export default function Shipping() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [weight, setWeight] = useState('1');
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(true);

  const countries = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'Other'];
  const cities: Record<string, string[]> = {
    Rwanda: ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri'],
    Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
    Uganda: ['Kampala', 'Entebbe', 'Jinja', 'Gulu'],
    Tanzania: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Zanzibar'],
    Burundi: ['Bujumbura', 'Gitega', 'Ngozi'],
    Other: ['Other'],
  };

  const getCitiesForCountry = (country: string): string[] => {
    return cities[country] || [];
  };

  const calculateShipping = () => {
    if (!selectedCountry || !selectedCity || !weight) {
      setCalculatedCost(null);
      return;
    }

    try {
      const baseCost = selectedCountry === 'Rwanda' ? 2.99 : 8.99;
      const weightMultiplier = parseFloat(weight) || 1;
      const cityMultiplier = selectedCity === 'Kigali' || selectedCity === 'Nairobi' ? 1 : 1.2;

      const cost = baseCost * weightMultiplier * cityMultiplier;
      setCalculatedCost(Math.round(cost * 100) / 100);
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setCalculatedCost(null);
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Emergency Alert Banner */}
      <AnimatePresence>
        {showAlert && (
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
                  <p className="text-sm sm:text-base text-amber-800 dark:text-amber-200">
                    Deliveries to Kenya may be delayed due to customs backlog. Expected delay: 2-3 additional days.
                  </p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
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
            <Truck className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              Shipping & Delivery
            </h1>
            <p className="text-xl sm:text-2xl text-orange-100 max-w-3xl mx-auto">
              REAGLEX partners with trusted couriers to offer safe and reliable delivery for both local and international purchases. Your payment is protected by our escrow system until you receive your order.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Methods Table */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping Methods & Delivery Times
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Choose the shipping option that works best for you
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shippingMethods.map((method) => {
                const Icon = method.icon;
                const getColorClasses = (color: string) => {
                  switch (color) {
                    case 'blue':
                      return {
                        bg: 'bg-blue-100 dark:bg-blue-900/30',
                        text: 'text-blue-600 dark:text-blue-400',
                      };
                    case 'orange':
                      return {
                        bg: 'bg-orange-100 dark:bg-orange-900/30',
                        text: 'text-orange-600 dark:text-orange-400',
                      };
                    case 'green':
                      return {
                        bg: 'bg-green-100 dark:bg-green-900/30',
                        text: 'text-green-600 dark:text-green-400',
                      };
                    case 'purple':
                      return {
                        bg: 'bg-purple-100 dark:bg-purple-900/30',
                        text: 'text-purple-600 dark:text-purple-400',
                      };
                    case 'teal':
                      return {
                        bg: 'bg-teal-100 dark:bg-teal-900/30',
                        text: 'text-teal-600 dark:text-teal-400',
                      };
                    default:
                      return {
                        bg: 'bg-blue-100 dark:bg-blue-900/30',
                        text: 'text-blue-600 dark:text-blue-400',
                      };
                  }
                };
                const colors = getColorClasses(method.color);
                return (
                  <motion.div
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${colors.bg}`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {method.name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{method.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{method.coverage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">{method.cost}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Cost Calculator */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Calculator className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping Cost Calculator
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Estimate shipping costs for your order
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity('');
                      setCalculatedCost(null);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCalculatedCost(null);
                    }}
                    disabled={!selectedCountry}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {selectedCountry && getCitiesForCountry(selectedCountry).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value);
                      setCalculatedCost(null);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="1.0"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={calculateShipping}
                    disabled={!selectedCountry || !selectedCity || !weight}
                    className="w-full px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Calculate Cost
                  </button>
                </div>
              </div>

              {calculatedCost !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Estimated Shipping Cost:
                    </span>
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${calculatedCost.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    * This is an estimate. Final cost may vary based on actual package dimensions and courier rates.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Tracking Explanation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Package className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Real-Time Delivery Tracking
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Stay informed about your order every step of the way
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  How Tracking Works
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Tracking available in your "My Orders" page
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      SMS and email notifications at each stage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Real-time updates from courier partners
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Delivery alerts and estimated arrival times
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Tracking Statuses
                </h3>
                <div className="space-y-3">
                  {trackingStatuses.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-600 dark:bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.status}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courier Partners */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Courier Partners
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Trusted logistics partners ensuring reliable delivery worldwide
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {courierPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{partner.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{partner.coverage}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Restrictions */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping Restrictions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Items that cannot be shipped through REAGLEX
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 sm:p-8">
              <ul className="space-y-3">
                {shippingRestrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 dark:text-gray-200">{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Packaging Standards */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Box className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Packaging Standards for Sellers
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Guidelines to ensure safe delivery and reduce damage complaints
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Required Quality
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Use sturdy cardboard boxes</li>
                  <li>• Proper cushioning materials</li>
                  <li>• Bubble wrap for fragile items</li>
                  <li>• Waterproof packaging for electronics</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Handling Instructions
                </h3>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Label fragile items clearly</li>
                  <li>• Include handling instructions</li>
                  <li>• Use appropriate box sizes</li>
                  <li>• Secure all openings with tape</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Shipping */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Globe className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                International Shipping Information
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Important information for global buyers
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Customs Fees & Import Duties
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    International orders may be subject to customs duties, import taxes, and VAT imposed by the destination country. These fees are the buyer's responsibility and are not included in the product or shipping price. You'll be notified if any fees apply before delivery.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Country Limitations
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Some countries have restrictions on certain products. Check with your local customs office before ordering. REAGLEX is not responsible for items seized by customs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Average Clearance Time
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Customs clearance typically takes 2-5 business days but can vary by country and customs workload. Delays may occur during peak seasons or due to additional documentation requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lost/Damaged Package Policy */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Lost or Damaged Package Policy
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Your protection and our commitment
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    How to Report a Lost Shipment
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    If your package hasn't arrived within the expected delivery window:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Check your tracking information for updates</li>
                    <li>Contact the courier directly using your tracking number</li>
                    <li>If still unresolved, contact REAGLEX support within 7 days of expected delivery</li>
                    <li>Provide your order number and tracking information</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Maximum Claim Time
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    You must report lost or damaged packages within 7 days of the expected delivery date. Claims filed after this period may not be eligible for refund or replacement.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Required Proof for Damaged Items
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Photos of the damaged package and item</li>
                    <li>• Video evidence (if available)</li>
                    <li>• Original packaging (keep until claim is resolved)</li>
                    <li>• Order number and tracking information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Refund Process
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Once your claim is verified, you'll receive a full refund including shipping costs within 5-7 business days. Alternatively, we can arrange a replacement if the item is still available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escrow System Explanation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Lock className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Escrow Protection System
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                How REAGLEX protects your payment until delivery
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
                      Buyer Pays
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      When you place an order, your payment is securely held in our escrow system. The seller does not receive the funds yet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Seller Ships Product
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      The seller ships your order and provides tracking information. You can monitor the shipment in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Buyer Confirms Delivery
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Once you receive and confirm the order, or after 7 days of delivery (whichever comes first), the payment is released to the seller.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      REAGLEX Releases Funds
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      The seller receives payment securely. If there are any issues, you can file a dispute before funds are released.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Shipping Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Store className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping for Sellers
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Everything sellers need to know about shipping on REAGLEX
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Setting Shipping Fees
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Sellers can set shipping fees per product or use flat rates. REAGLEX calculates shipping zones automatically based on buyer location.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Set fees per product or category</li>
                  <li>• Offer free shipping for orders above a threshold</li>
                  <li>• Adjust fees based on weight and dimensions</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Shipping Labels & Pickups
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Generate shipping labels directly from your seller dashboard. Schedule pickups with our courier partners or drop off at designated locations.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Print labels from seller dashboard</li>
                  <li>• Schedule courier pickups</li>
                  <li>• Track all shipments in one place</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Late Shipping Penalties
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Sellers must ship orders within the specified timeframe. Late shipments may result in penalties or account restrictions.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Ship within 2-3 business days</li>
                  <li>• Update tracking information promptly</li>
                  <li>• Communicate delays to buyers</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Packaging Guidelines
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Follow our packaging standards to ensure safe delivery and reduce damage complaints. Proper packaging protects both you and your customers.
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Use appropriate box sizes</li>
                  <li>• Include proper cushioning</li>
                  <li>• Label fragile items clearly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping FAQ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping FAQ
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Quick answers to common shipping questions
              </p>
            </div>

            <div className="space-y-4">
              {shippingFAQs.map((faq, index) => (
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
              Need More Help?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Our support team is here to assist with any shipping questions
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

