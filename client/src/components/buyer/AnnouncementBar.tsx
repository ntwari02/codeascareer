import { useState, useEffect } from 'react';
import { X, Truck, Gift, AlertCircle } from 'lucide-react';

interface Announcement {
  id: string;
  type: 'shipping' | 'promotion' | 'flash' | 'alert';
  message: string;
  link?: string;
  icon?: typeof Truck;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    type: 'shipping',
    message: 'Free shipping on orders over $50!',
    link: '/products',
    icon: Truck,
  },
  {
    id: '2',
    type: 'flash',
    message: 'Flash Sale: Up to 50% off - Ends in 2 hours!',
    link: '/deals',
    icon: Gift,
  },
  {
    id: '3',
    type: 'promotion',
    message: 'New Arrivals: Shop the latest trends',
    link: '/new-arrivals',
  },
];

export function AnnouncementBar() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const announcement = ANNOUNCEMENTS[currentAnnouncement];
  const Icon = announcement.icon || AlertCircle;

  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3">
          <Icon className="h-4 w-4 flex-shrink-0 animate-pulse" />
          <p className="text-sm font-semibold text-center flex-1">
            {announcement.message}
          </p>
          {announcement.link && (
            <a
              href={announcement.link}
              className="text-sm font-bold underline hover:no-underline"
            >
              Shop Now →
            </a>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

