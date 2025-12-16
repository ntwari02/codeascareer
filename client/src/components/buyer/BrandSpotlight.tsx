import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  productCount?: number;
  link: string;
}

const MOCK_BRANDS: Brand[] = [
  {
    id: '1',
    name: 'TechWorld',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Premium Electronics',
    productCount: 245,
    link: '/brands/techworld',
  },
  {
    id: '2',
    name: 'FashionHub',
    logo: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Trendy Fashion',
    productCount: 189,
    link: '/brands/fashionhub',
  },
  {
    id: '3',
    name: 'HomeEssentials',
    logo: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Home & Living',
    productCount: 156,
    link: '/brands/homeessentials',
  },
  {
    id: '4',
    name: 'SportsPro',
    logo: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Sports & Outdoors',
    productCount: 98,
    link: '/brands/sportspro',
  },
];

export function BrandSpotlight() {
  return (
    <section className="py-16 bg-white dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Brand Spotlight
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Shop from trusted brands
            </p>
          </div>
          <Link
            to="/brands"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold"
          >
            View All <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_BRANDS.map((brand) => (
            <Link
              key={brand.id}
              to={brand.link}
              className="group bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {brand.description}
                  </p>
                )}
                {brand.productCount && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {brand.productCount} products
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Visit Store <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

