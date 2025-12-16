import { Truck, Shield, RotateCcw, Headphones, CreditCard, Award } from 'lucide-react';

const TRUST_FEATURES = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure transactions',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated support team',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    icon: CreditCard,
    title: 'Multiple Payment',
    description: 'Various payment methods',
    color: 'text-teal-600 dark:text-teal-400',
  },
  {
    icon: Award,
    title: 'Verified Sellers',
    description: 'Trusted marketplace',
    color: 'text-amber-600 dark:text-amber-400',
  },
];

export function TrustSection() {
  return (
    <section className="py-16 bg-white dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Shop With Us
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {TRUST_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

