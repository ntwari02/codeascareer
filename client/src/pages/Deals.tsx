import { useState, useEffect } from 'react';
import { Clock, Percent, Tag, TrendingUp, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

const MOCK_DEALS: (Product & {
  original_price: number;
  discount_percent: number;
  deal_ends: string;
  deal_type: 'flash' | 'daily' | 'weekly';
})[] = [
  {
    id: 'd1',
    title: 'Premium Wireless Earbuds Pro',
    description: 'Active noise cancellation, 40-hour battery, premium sound quality',
    price: 79.99,
    original_price: 159.99,
    discount_percent: 50,
    deal_ends: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    deal_type: 'flash',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 5432,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd2',
    title: 'Smart Fitness Watch Ultra',
    description: 'Advanced health tracking, GPS, waterproof design',
    price: 199.99,
    original_price: 349.99,
    discount_percent: 43,
    deal_ends: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    deal_type: 'daily',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 3245,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd3',
    title: 'Designer Leather Wallet',
    description: 'Genuine leather, RFID protection, slim design',
    price: 34.99,
    original_price: 69.99,
    discount_percent: 50,
    deal_ends: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    deal_type: 'weekly',
    category_id: 2,
    status: 'active',
    is_shippable: true,
    views_count: 1876,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd4',
    title: '4K Webcam for Streaming',
    description: 'Professional quality video, auto-focus, built-in mic',
    price: 89.99,
    original_price: 149.99,
    discount_percent: 40,
    deal_ends: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    deal_type: 'daily',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 2341,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd5',
    title: 'Minimalist Running Shoes',
    description: 'Lightweight, breathable, cushioned sole for comfort',
    price: 59.99,
    original_price: 119.99,
    discount_percent: 50,
    deal_ends: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    deal_type: 'weekly',
    category_id: 4,
    status: 'active',
    is_shippable: true,
    views_count: 3987,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd6',
    title: 'Portable Bluetooth Speaker',
    description: '360° sound, 24-hour battery, waterproof IPX7',
    price: 44.99,
    original_price: 89.99,
    discount_percent: 50,
    deal_ends: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    deal_type: 'flash',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 4123,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1279406/pexels-photo-1279406.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd7',
    title: 'Ergonomic Office Chair',
    description: 'Lumbar support, adjustable height, breathable mesh',
    price: 149.99,
    original_price: 299.99,
    discount_percent: 50,
    deal_ends: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    deal_type: 'weekly',
    category_id: 3,
    status: 'active',
    is_shippable: true,
    views_count: 2765,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
  {
    id: 'd8',
    title: 'Mechanical Gaming Keyboard',
    description: 'RGB backlight, tactile switches, programmable keys',
    price: 69.99,
    original_price: 129.99,
    discount_percent: 46,
    deal_ends: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    deal_type: 'daily',
    category_id: 1,
    status: 'active',
    is_shippable: true,
    views_count: 5234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [{ url: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0 }],
  },
];

export function Deals() {
  const [deals, setDeals] = useState(MOCK_DEALS);
  const [filter, setFilter] = useState<'all' | 'flash' | 'daily' | 'weekly'>('all');
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: typeof timeLeft = {};
      deals.forEach(deal => {
        const now = new Date().getTime();
        const end = new Date(deal.deal_ends).getTime();
        const distance = end - now;

        if (distance > 0) {
          newTimeLeft[deal.id] = {
            hours: Math.floor(distance / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          };
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [deals]);

  const filteredDeals = filter === 'all' ? deals : deals.filter(d => d.deal_type === filter);

  const DealCard = ({ deal }: { deal: typeof MOCK_DEALS[0] }) => {
    const time = timeLeft[deal.id];

    return (
      <div className="group relative bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Percent className="h-4 w-4" />
            {deal.discount_percent}% OFF
          </span>
          <span className={`text-white px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            deal.deal_type === 'flash' ? 'bg-orange-500' :
            deal.deal_type === 'daily' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {deal.deal_type} Deal
          </span>
        </div>

        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={deal.images[0]?.url}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {deal.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {deal.description}
          </p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${deal.price}
            </span>
            <span className="text-sm text-gray-500 line-through">
              ${deal.original_price}
            </span>
          </div>

          {time && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="h-3 w-3" />
                <span>Deal ends in:</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white dark:bg-dark-card rounded px-2 py-1 text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{time.hours}</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="flex-1 bg-white dark:bg-dark-card rounded px-2 py-1 text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{time.minutes}</div>
                  <div className="text-xs text-gray-500">Mins</div>
                </div>
                <div className="flex-1 bg-white dark:bg-dark-card rounded px-2 py-1 text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{time.seconds}</div>
                  <div className="text-xs text-gray-500">Secs</div>
                </div>
              </div>
            </div>
          )}

          <button className="w-full mt-3 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2.5 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all duration-300 hover:shadow-lg">
            Grab Deal Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-3 rounded-xl">
              <Tag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Hot Deals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Limited time offers - Save up to 50% on selected items
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by type:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setFilter('flash')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'flash'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Flash Sales
              </button>
              <button
                onClick={() => setFilter('daily')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'daily'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Daily Deals
              </button>
              <button
                onClick={() => setFilter('weekly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'weekly'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Weekly Deals
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {filteredDeals.length} deals available
            </span>
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Save up to ${Math.max(...filteredDeals.map(d => d.original_price - d.price)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  );
}
