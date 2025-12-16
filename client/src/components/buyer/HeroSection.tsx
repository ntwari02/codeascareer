import { Link } from 'react-router-dom';
import { Percent } from 'lucide-react';

interface HeroBanner {
  id: number;
  title: string;
  description: string;
  image: string;
  video?: string;
  discount?: number;
  link: string;
  badge?: string;
  ctaPrimary: string;
  ctaSecondary?: string;
}

// Flash Sale Banner - Static (no carousel)
const FLASH_SALE_BANNER: HeroBanner = {
  id: 3,
  title: 'Flash Sale - Limited Time',
  description: 'Hurry! These deals won\'t last long. Shop now before they\'re gone!',
  image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1920',
  discount: 40,
  link: '/deals',
  badge: 'Flash Sale',
  ctaPrimary: 'Shop Now',
  ctaSecondary: 'View All Deals',
};

export function HeroSection() {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {FLASH_SALE_BANNER.video ? (
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={FLASH_SALE_BANNER.video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={FLASH_SALE_BANNER.image}
              alt={FLASH_SALE_BANNER.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-teal-600/80 to-teal-800/80" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center text-white">
            <div className="animate-fadeIn">
              {FLASH_SALE_BANNER.discount && (
                <div className="inline-flex items-center gap-2 mb-4 px-6 py-2 bg-red-500 text-white text-xl font-bold rounded-full shadow-lg animate-bounce">
                  <Percent className="h-5 w-5" />
                  {FLASH_SALE_BANNER.discount}% OFF
                </div>
              )}
              {FLASH_SALE_BANNER.badge && (
                <div className="inline-block mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  {FLASH_SALE_BANNER.badge}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                {FLASH_SALE_BANNER.title}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
                {FLASH_SALE_BANNER.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to={FLASH_SALE_BANNER.link}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                {FLASH_SALE_BANNER.ctaPrimary}
              </Link>
              {FLASH_SALE_BANNER.ctaSecondary && (
                <Link
                  to={FLASH_SALE_BANNER.link}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 border-2 border-white/30"
                >
                  {FLASH_SALE_BANNER.ctaSecondary}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-dark-primary to-transparent z-10" />
    </section>
  );
}
