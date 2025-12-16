import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  subcategories: string[];
}

const CATEGORY_TILES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: ['Smartphones', 'Laptops', 'Audio', 'Accessories'],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: '👕',
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: ["Men's", "Women's", 'Shoes', 'Accessories'],
  },
  {
    id: 'home',
    name: 'Home & Living',
    slug: 'home',
    icon: '🏠',
    image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding'],
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    slug: 'sports',
    icon: '⚽',
    image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
    subcategories: ['Fitness', 'Outdoor', 'Sports', 'Equipment'],
  },
];

export function ShopByCategory() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Browse our wide range of categories
            </p>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-2 text-sm sm:text-base text-orange-600 hover:text-orange-700 dark:text-orange-400 font-semibold whitespace-nowrap"
          >
            View All <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORY_TILES.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 h-48 sm:h-56 lg:h-64 hover:shadow-xl transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{category.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 3).map((sub, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop Now <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

