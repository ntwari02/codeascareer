import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  type: 'banner' | 'product' | 'video';
  title: string;
  image: string;
  video?: string;
  link: string;
  sponsored: boolean;
  impressions?: number;
  clicks?: number;
}

const MOCK_ADS: Ad[] = [
  {
    id: '1',
    type: 'banner',
    title: 'Sponsored: Premium Electronics Sale',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: '/products?sponsored=true',
    sponsored: true,
    impressions: 12500,
    clicks: 342,
  },
  {
    id: '2',
    type: 'product',
    title: 'Featured Store: Tech World',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
    // Send users to the public brand/storefront page, not the seller dashboard
    link: '/brands/techworld',
    sponsored: true,
    impressions: 8900,
    clicks: 198,
  },
];

export function SponsoredAds() {
  const handleAdClick = (adId: string) => {
    // Track ad click (would integrate with analytics)
    console.log('Ad clicked:', adId);
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-dark-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sponsored Content
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Advertisement</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_ADS.map((ad) => (
            <Link
              key={ad.id}
              to={ad.link}
              onClick={() => handleAdClick(ad.id)}
              className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-48 hover:shadow-lg transition-all"
            >
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded font-semibold">
                    Sponsored
                  </span>
                  <ExternalLink className="h-3 w-3 text-white/70" />
                </div>
                <p className="text-white font-semibold">{ad.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

