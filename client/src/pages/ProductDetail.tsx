import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import type { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowLeft,
  Share2,
  Minus,
  Plus,
  Loader2,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react';

// Mock Products Data (same as Products.tsx)
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life',
    price: 299.99,
    compare_at_price: 399.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 50,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 1234,
    sku: 'WH-001',
    images: [
      { id: 'img-1-1', product_id: '1', url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() },
      { id: 'img-1-2', product_id: '1', url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800', position: 1, created_at: new Date().toISOString() }
    ],
    tags: ['new', 'trending']
  },
  {
    id: '2',
    title: 'Smart Fitness Watch',
    description: 'Track your health and fitness with GPS, heart rate monitor, and sleep tracking',
    price: 249.99,
    compare_at_price: 299.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 75,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 987,
    sku: 'SW-002',
    images: [
      { id: 'img-2-1', product_id: '2', url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['trending']
  },
  {
    id: '3',
    title: 'Premium Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment and multiple pockets',
    price: 189.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 30,
    is_shippable: true,
    low_stock_threshold: 5,
    views_count: 654,
    sku: 'LB-003',
    images: [
      { id: 'img-3-1', product_id: '3', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '4',
    title: 'Minimalist Sneakers',
    description: 'Comfortable all-day wear sneakers with eco-friendly materials and cushioned sole',
    price: 129.99,
    compare_at_price: 179.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 100,
    is_shippable: true,
    low_stock_threshold: 20,
    views_count: 1456,
    sku: 'MS-004',
    images: [
      { id: 'img-4-1', product_id: '4', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['new']
  },
  {
    id: '5',
    title: 'Portable Phone Charger 10000mAh',
    description: 'Fast charging power bank with USB-C and wireless charging support',
    price: 39.99,
    compare_at_price: 59.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 4,
    is_shippable: true,
    low_stock_threshold: 5,
    views_count: 2341,
    sku: 'PC-005',
    images: [
      { id: 'img-5-1', product_id: '5', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['trending']
  },
  {
    id: '6',
    title: 'Wireless Bluetooth Earbuds',
    description: 'True wireless earbuds with noise cancellation and 24-hour battery',
    price: 79.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 0,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 567,
    sku: 'EB-006',
    images: [
      { id: 'img-6-1', product_id: '6', url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '7',
    title: 'Designer Sunglasses',
    description: 'UV protection sunglasses with polarized lenses and premium frame',
    price: 149.99,
    compare_at_price: 199.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 25,
    is_shippable: true,
    low_stock_threshold: 5,
    views_count: 789,
    sku: 'SG-007',
    images: [
      { id: 'img-7-1', product_id: '7', url: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '8',
    title: 'Mechanical Keyboard RGB',
    description: 'Gaming mechanical keyboard with RGB backlighting and cherry switches',
    price: 129.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 60,
    is_shippable: true,
    low_stock_threshold: 15,
    views_count: 1890,
    sku: 'KB-008',
    images: [
      { id: 'img-8-1', product_id: '8', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['new', 'trending']
  },
  {
    id: '9',
    title: 'Cotton T-Shirt Pack',
    description: 'Pack of 3 premium cotton t-shirts in various colors',
    price: 49.99,
    compare_at_price: 69.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 120,
    is_shippable: true,
    low_stock_threshold: 30,
    views_count: 432,
    sku: 'TS-009',
    images: [
      { id: 'img-9-1', product_id: '9', url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '10',
    title: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and long battery life',
    price: 29.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 200,
    is_shippable: true,
    low_stock_threshold: 50,
    views_count: 2103,
    sku: 'WM-010',
    images: [
      { id: 'img-10-1', product_id: '10', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '11',
    title: 'Leather Wallet',
    description: 'Genuine leather wallet with RFID blocking and multiple card slots',
    price: 59.99,
    compare_at_price: 89.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 45,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 678,
    sku: 'LW-011',
    images: [
      { id: 'img-11-1', product_id: '11', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '12',
    title: 'Laptop Stand Adjustable',
    description: 'Ergonomic aluminum laptop stand with adjustable height and ventilation',
    price: 49.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 35,
    is_shippable: true,
    low_stock_threshold: 8,
    views_count: 1123,
    sku: 'LS-012',
    images: [
      { id: 'img-12-1', product_id: '12', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '13',
    title: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole and breathable mesh',
    price: 99.99,
    compare_at_price: 129.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 80,
    is_shippable: true,
    low_stock_threshold: 20,
    views_count: 1567,
    sku: 'RS-013',
    images: [
      { id: 'img-13-1', product_id: '13', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '14',
    title: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader',
    price: 34.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 90,
    is_shippable: true,
    low_stock_threshold: 25,
    views_count: 2345,
    sku: 'UH-014',
    images: [
      { id: 'img-14-1', product_id: '14', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '15',
    title: 'Denim Jacket',
    description: 'Classic denim jacket with vintage wash and comfortable fit',
    price: 79.99,
    compare_at_price: 99.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 55,
    is_shippable: true,
    low_stock_threshold: 15,
    views_count: 890,
    sku: 'DJ-015',
    images: [
      { id: 'img-15-1', product_id: '15', url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '16',
    title: 'Smartphone Case',
    description: 'Protective smartphone case with shock absorption and clear design',
    price: 19.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 300,
    is_shippable: true,
    low_stock_threshold: 100,
    views_count: 3456,
    sku: 'SC-016',
    images: [
      { id: 'img-16-1', product_id: '16', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '17',
    title: 'Canvas Tote Bag',
    description: 'Eco-friendly canvas tote bag with reinforced handles and spacious design',
    price: 24.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 150,
    is_shippable: true,
    low_stock_threshold: 40,
    views_count: 890,
    sku: 'TB-017',
    images: [
      { id: 'img-17-1', product_id: '17', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '18',
    title: 'Wireless Charger',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
    price: 24.99,
    compare_at_price: 39.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 110,
    is_shippable: true,
    low_stock_threshold: 30,
    views_count: 1789,
    sku: 'WC-018',
    images: [
      { id: 'img-18-1', product_id: '18', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '19',
    title: 'Baseball Cap',
    description: 'Classic baseball cap with adjustable strap and breathable fabric',
    price: 29.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 200,
    is_shippable: true,
    low_stock_threshold: 50,
    views_count: 1234,
    sku: 'BC-019',
    images: [
      { id: 'img-19-1', product_id: '19', url: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '20',
    title: 'HD Webcam',
    description: '1080p HD webcam with auto-focus and built-in microphone',
    price: 69.99,
    compare_at_price: 99.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 40,
    is_shippable: true,
    low_stock_threshold: 10,
    views_count: 2678,
    sku: 'WB-020',
    images: [
      { id: 'img-20-1', product_id: '20', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['trending']
  },
  {
    id: '21',
    title: 'Yoga Mat',
    description: 'Non-slip yoga mat with carrying strap and eco-friendly materials',
    price: 39.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-4',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 70,
    is_shippable: true,
    low_stock_threshold: 20,
    views_count: 1456,
    sku: 'YM-021',
    images: [
      { id: 'img-21-1', product_id: '21', url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '22',
    title: 'Tablet Stand',
    description: 'Adjustable tablet stand with 360-degree rotation and foldable design',
    price: 34.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-2',
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 85,
    is_shippable: true,
    low_stock_threshold: 25,
    views_count: 987,
    sku: 'TS-022',
    images: [
      { id: 'img-22-1', product_id: '22', url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '23',
    title: 'Leather Belt',
    description: 'Genuine leather belt with classic buckle and multiple size options',
    price: 44.99,
    compare_at_price: 64.99,
    category_id: 'fashion',
    status: 'active',
    seller_id: 'seller-3',
    created_at: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 95,
    is_shippable: true,
    low_stock_threshold: 30,
    views_count: 654,
    sku: 'LB-023',
    images: [
      { id: 'img-23-1', product_id: '23', url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ]
  },
  {
    id: '24',
    title: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound and waterproof design',
    price: 79.99,
    compare_at_price: 119.99,
    category_id: 'electronics',
    status: 'active',
    seller_id: 'seller-1',
    created_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    stock_quantity: 65,
    is_shippable: true,
    low_stock_threshold: 15,
    views_count: 2234,
    sku: 'BS-024',
    images: [
      { id: 'img-24-1', product_id: '24', url: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800', position: 0, is_primary: true, created_at: new Date().toISOString() }
    ],
    tags: ['new']
  }
];

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency: themeCurrency } = useTheme();
  const currency = (themeCurrency as 'USD' | 'EUR' | 'RWF' | 'KES') || 'USD';
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find product in mock data
      const foundProduct = MOCK_PRODUCTS.find(p => p.id === id && p.status === 'active');
      
      if (foundProduct) {
        // Sort images by position
        if (foundProduct.images) {
          foundProduct.images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        }
        setProduct(foundProduct);

        // Load related products (same category)
        if (foundProduct.category_id) {
          const related = MOCK_PRODUCTS
            .filter(p => p.category_id === foundProduct.category_id && p.id !== id && p.status === 'active')
            .slice(0, 8);
          
          related.forEach((p: any) => {
            if (p.images) {
              p.images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
            }
          });
          setRelatedProducts(related);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(user?.id || null, product, undefined, quantity);
      // Show success message (you can add a toast here)
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist(product.id)) {
        const wishlistItems = useWishlistStore.getState().items;
        const item = wishlistItems.find(w => w.product_id === product.id);
        if (item) {
          await removeFromWishlist(item.id);
        }
      } else {
        await addToWishlist(user?.id || null, product);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const images = product?.images || [];
  const primaryImage = images[selectedImageIndex]?.url || images[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  const stock = product?.stock_quantity || 0;
  const isOutOfStock = stock === 0;
  const stockWarning = stock > 0 && stock < 5;
  const price = product?.price || 0;
  const comparePrice = product?.compare_at_price;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = 4.5; // Mock - in production, fetch from reviews
  const reviewCount = 128; // Mock

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <div className="w-full px-4 py-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <img
                src={primaryImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-orange-600 ring-2 ring-orange-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Actions */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.title}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(price, currency)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(comparePrice, currency)}
                    </span>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg text-sm font-semibold">
                      Save {formatCurrency(comparePrice - price, currency)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4 mb-6">
                {isOutOfStock ? (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Out of Stock</span>
                  </span>
                ) : stockWarning ? (
                  <span className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Only {stock} left!</span>
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">In Stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
              <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity === 1}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  disabled={quantity >= stock}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                className={`${
                  isInWishlist(product.id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400'
                    : ''
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">2-3 Day Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              Related Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={relatedProduct.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(relatedProduct.price || 0, currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

