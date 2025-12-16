import { Star, Quote, Shield, MapPin } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  photo?: string;
  verified: boolean;
  product?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'Kigali, Rwanda',
    rating: 5,
    comment: 'Amazing shopping experience! Fast delivery and great customer service. Highly recommend!',
    verified: true,
    product: 'Wireless Headphones',
    photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'James Mukamana',
    location: 'Kigali, Rwanda',
    rating: 5,
    comment: 'Best marketplace in Rwanda. Found everything I needed at great prices. Will shop again!',
    verified: true,
    product: 'Smart Watch',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Marie Uwimana',
    location: 'Kigali, Rwanda',
    rating: 4,
    comment: 'Love the variety of products and easy checkout process. Very satisfied with my purchases.',
    verified: true,
    product: 'Fashion Items',
    photo: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-dark-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Real reviews from verified customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative bg-gray-900 dark:bg-[#1a1a24] rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-800 dark:border-gray-700"
            >
              {/* Large Quotation Mark Icon */}
              <Quote className="absolute top-4 right-4 h-12 w-12 sm:h-16 sm:w-16 text-amber-700 dark:text-amber-600 opacity-20" />
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < testimonial.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-gray-200 dark:text-gray-300 mb-6 italic text-sm sm:text-base leading-relaxed relative z-10">
                "{testimonial.comment}"
              </p>

              {/* User Information */}
              <div className="flex items-center gap-3 relative z-10">
                {testimonial.photo ? (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-orange-500/50">
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-teal-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm sm:text-base">
                      {testimonial.name}
                    </p>
                    {testimonial.verified && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                    <MapPin className="h-3 w-3" />
                    {testimonial.location}
                  </div>
                  {testimonial.product && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Purchased: {testimonial.product}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

