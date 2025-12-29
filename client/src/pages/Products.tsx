import { useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { ProductFilters, type FilterState } from '../components/buyer/ProductFilters';
import { Button } from '../components/ui/button';
import type { Product, Collection } from '../types';
import { formatCurrency } from '../lib/utils';
import {
  Grid3x3,
  List,
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  GitCompare,
  TrendingUp,
  Flame
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

// Mock Products Data
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

// Mock Collections Data
const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    seller_id: 'seller-1',
    name: 'Electronics Essentials',
    description: 'All your tech needs in one place',
    image_url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/163117/keyboard-old-antique-vintage-163117.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'manual',
    sort_order: 'newest',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 12
  },
  {
    id: 'col-2',
    seller_id: 'seller-2',
    name: 'Fashion Forward',
    description: 'Trendy styles for every occasion',
    image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'manual',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 8
  },
  {
    id: 'col-3',
    seller_id: 'seller-3',
    name: 'New Arrivals',
    description: 'Latest products just added',
    image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'newest',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 15
  },
  {
    id: 'col-4',
    seller_id: 'seller-4',
    name: 'Best Sellers',
    description: 'Our most popular products',
    image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 10
  },
  {
    id: 'col-5',
    seller_id: 'seller-1',
    name: 'On Sale',
    description: 'Special deals and discounts',
    image_url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'price_asc',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 18
  },
  {
    id: 'col-6',
    seller_id: 'seller-2',
    name: 'Trending Now',
    description: 'What everyone is buying',
    image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    cover_image_url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'smart',
    sort_order: 'best_selling',
    visibility: { storefront: true, mobile_app: true },
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    product_count: 14
  }
];

export function Products() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currency: themeCurrency } = useTheme();
  const currency = (themeCurrency as 'USD' | 'EUR' | 'RWF' | 'KES') || 'USD';
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [compareItems, setCompareItems] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    sort: 'relevance',
    category: [],
    brand: [],
    priceRange: [0, 10000],
    color: [],
    size: [],
    rating: null,
    seller: [],
    delivery: [],
    stock: [],
    quickFilters: [],
  });

  // Load products
  useEffect(() => {
    loadProducts();
    loadRecentlyViewed();
    loadCollections();
  }, []);

  // Load recently viewed from localStorage
  const loadRecentlyViewed = () => {
    const viewed = localStorage.getItem('recently_viewed_products');
    if (viewed) {
      try {
        const parsed = JSON.parse(viewed);
        setRecentlyViewed(parsed.slice(0, 6));
      } catch (e) {
        console.error('Failed to load recently viewed', e);
      }
    }
  };

  const loadCollections = async () => {
    // Use mock collections data
    setCollections(MOCK_COLLECTIONS);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const API_BASE = 'http://localhost:5000/api';
      const params = new URLSearchParams();
      
      // Add filters to query params
      if (filters.category.length > 0) {
        params.append('category', filters.category[0]); // For now, use first category
      }
      
      if (filters.sort) {
        if (filters.sort === 'price_asc') {
          params.append('sort', 'price');
          params.append('order', 'asc');
        } else if (filters.sort === 'price_desc') {
          params.append('sort', 'price');
          params.append('order', 'desc');
        } else if (filters.sort === 'newest') {
          params.append('sort', 'createdAt');
          params.append('order', 'desc');
        } else if (filters.sort === 'popular') {
          params.append('sort', 'views');
          params.append('order', 'desc');
        }
      }
      
      params.append('status', 'in_stock');
      params.append('limit', '100'); // Get more products for client-side filtering
      
      const response = await fetch(`${API_BASE}/products?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load products');
      }

      const data = await response.json();
      const apiProducts = (data.products || []).map((p: any) => ({
        id: p._id || p.id,
        title: p.name,
        description: p.description || '',
        price: p.price,
        compare_at_price: p.discount ? p.price + p.discount : undefined,
        category_id: p.category || '',
        status: p.status === 'in_stock' || p.status === 'low_stock' ? 'active' : 'inactive',
        seller_id: p.sellerId?.toString() || '',
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString(),
        stock_quantity: p.stock || 0,
        is_shippable: true,
        low_stock_threshold: 10,
        views_count: p.views || 0,
        sku: p.sku || '',
        images: p.images?.map((img: string, index: number) => ({
          id: `img-${p._id || p.id}-${index}`,
          product_id: p._id || p.id,
          url: img.startsWith('http') ? img : `http://localhost:5000${img}`,
          position: index,
          is_primary: index === 0,
          created_at: new Date().toISOString(),
        })) || [],
        tags: p.tags || [],
      }));

      setProducts(apiProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data on error
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category.includes(p.category_id || ''));
    }

    // Apply price range
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply rating filter
    if (filters.rating !== null) {
      // Mock rating filter - in production, use actual ratings
      filtered = filtered.filter(() => Math.random() > 0.3);
    }

    // Apply stock filter
    if (filters.stock.includes('in_stock')) {
      filtered = filtered.filter(p => (p.stock_quantity || 0) > 0);
    }
    if (filters.stock.includes('out_of_stock')) {
      filtered = filtered.filter(p => (p.stock_quantity || 0) === 0);
    }

    // Apply quick filters
    if (filters.quickFilters.includes('discounted')) {
      filtered = filtered.filter(p => p.compare_at_price && p.compare_at_price > p.price);
    }
    if (filters.quickFilters.includes('new_arrivals')) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(p => new Date(p.created_at) > sevenDaysAgo);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'name_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'name_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'rating':
          // Mock - in production use actual ratings
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(user?.id || null, product, undefined, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleQuickView = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const handleSelectItem = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      if (newSelected.size < 5) { // Limit to 5 items for comparison
        newSelected.add(productId);
      }
    }
    setSelectedItems(newSelected);
  };

  const handleBulkAddToCart = async () => {
    for (const productId of selectedItems) {
      const product = products.find(p => p.id === productId);
      if (product) {
        await addToCart(user?.id || null, product, undefined, 1);
      }
    }
    setSelectedItems(new Set());
  };

  const handleBulkAddToWishlist = async () => {
    for (const productId of selectedItems) {
      const product = products.find(p => p.id === productId);
      if (product && !isInWishlist(product.id)) {
        await addToWishlist(user?.id || null, product);
      }
    }
    setSelectedItems(new Set());
  };

  const handleCompare = () => {
    if (selectedItems.size >= 2) {
      setCompareItems(selectedItems);
      setShowCompareDrawer(true);
    }
  };

  // Calculate stats
  const totalResults = filteredAndSortedProducts.length;

  // Skeleton Loading Component
  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <AnnouncementBar />
        <Header />
        <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />
      
      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                All Products
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalResults} {totalResults === 1 ? 'product' : 'products'} found
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-all font-medium text-xs sm:text-sm shadow-sm border ${
                  showFilters
                    ? 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                }`}
              >
                <Filter className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Filters'}</span>
                {(() => {
                  const activeCount = 
                    filters.category.length +
                    filters.brand.length +
                    ((filters.priceRange?.[0] !== 0 || filters.priceRange?.[1] !== 10000) ? 1 : 0) +
                    filters.color.length +
                    filters.size.length +
                    (filters.rating !== null ? 1 : 0) +
                    filters.seller.length +
                    filters.delivery.length +
                    filters.stock.length +
                    filters.quickFilters.length +
                    (filters.sort !== 'relevance' ? 1 : 0);
                  return activeCount > 0 ? (
                    <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                      {activeCount}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedItems.size > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                  {selectedItems.size >= 2 && (
                    <span className="ml-2 text-xs text-orange-700 dark:text-orange-300">
                      (Select up to 5 to compare)
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkAddToCart}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkAddToWishlist}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Add to Wishlist
                  </Button>
                  {selectedItems.size >= 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCompare}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <GitCompare className="w-4 h-4 mr-1" />
                      Compare ({selectedItems.size})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section - Only show when filter button is clicked */}
        {showFilters && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ProductFilters 
                products={products} 
                onFilterChange={handleFilterChange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
              />
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div>
          {paginatedProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={() => setFilters({
                  sort: 'relevance',
                  category: [],
                  brand: [],
                  priceRange: [0, 10000],
                  color: [],
                  size: [],
                  rating: null,
                  seller: [],
                  delivery: [],
                  stock: [],
                  quickFilters: [],
                })}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCardEnhanced
                        key={product.id}
                        product={product}
                        currency={currency}
                        isSelected={selectedItems.has(product.id)}
                        onSelect={() => handleSelectItem(product.id)}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={handleQuickView}
                        isInWishlist={isInWishlist(product.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductCardList
                        key={product.id}
                        product={product}
                        currency={currency}
                        isSelected={selectedItems.has(product.id)}
                        onSelect={() => handleSelectItem(product.id)}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickView={handleQuickView}
                        isInWishlist={isInWishlist(product.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} products
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        {/* Collections Section */}
        {collections.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-600" />
              Featured Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={collection.image_url || collection.cover_image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-sm text-white/90 line-clamp-2 mb-2">
                          {collection.description}
                        </p>
                      )}
                      {collection.product_count !== undefined && (
                        <p className="text-xs text-white/80">
                          {collection.product_count} {collection.product_count === 1 ? 'product' : 'products'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {product.title}
                    </p>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(product.price || 0, currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Comparison Drawer */}
      {showCompareDrawer && (
        <CompareDrawer
          productIds={Array.from(compareItems)}
          products={products}
          currency={currency}
          onClose={() => {
            setShowCompareDrawer(false);
            setCompareItems(new Set());
            setSelectedItems(new Set());
          }}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
      )}

      <Footer />
    </div>
  );
}

// Enhanced Product Card Component (Grid View)
interface ProductCardEnhancedProps {
  product: Product;
  currency: 'USD' | 'EUR' | 'RWF' | 'KES';
  isSelected: boolean;
  onSelect: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  onQuickView: (product: Product) => void;
  isInWishlist: boolean;
}

function ProductCardEnhanced({
  product,
  currency,
  isSelected,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isInWishlist
}: ProductCardEnhancedProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  const price = product.price || 0;
  const comparePrice = product.compare_at_price;
  const stock = product.stock_quantity || 0;
  const isOutOfStock = stock === 0;
  const stockWarning = stock > 0 && stock < 5;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = 4.5; // Mock
  const reviewCount = 128; // Mock
  
  // Mock flash sale end time (24 hours from now)
  const flashSaleEndTime = useMemo(() => {
    if (hasDiscount && discountPercent > 30) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    return null;
  }, [hasDiscount, discountPercent]);

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
      isSelected 
        ? 'border-orange-500 ring-2 ring-orange-500 shadow-xl' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700'
    }`}>
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link to={`/products/${product.id}`}>
          {/* Progressive Image Loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </Link>

        {/* Selection Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`absolute top-3 left-3 z-10 w-5 h-5 rounded border-2 transition-all ${
            isSelected
              ? 'bg-orange-600 border-orange-600'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-orange-500'
          }`}
        >
          {isSelected && (
            <CheckCircle2 className="w-full h-full text-white p-0.5" />
          )}
        </button>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => onToggleWishlist(product, e)}
            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900'
            }`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-colors"
            title="Quick view"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Badges */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {discountPercent}% OFF
            </div>
            {flashSaleEndTime && (
              <PriceDropTimer endTime={flashSaleEndTime} />
            )}
          </div>
        )}
        {product.tags?.includes('new') && (
          <div className="absolute top-3 right-12 bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-10">
            NEW
          </div>
        )}
        {product.tags?.includes('trending') && (
          <div className="absolute top-3 right-12 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-10 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            TRENDING
          </div>
        )}
        {stockWarning && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
            Only {stock} left!
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-lg">
            Out of Stock
          </div>
        )}

        {/* Quick Add to Cart */}
        <button
          onClick={(e) => onAddToCart(product, e)}
          disabled={isOutOfStock}
          className="absolute bottom-3 right-3 p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Add to cart"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(price, currency)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatCurrency(comparePrice, currency)}
              </span>
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                Save {formatCurrency(comparePrice - price, currency)}
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 text-xs">
          {isOutOfStock ? (
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Out of Stock
            </span>
          ) : stockWarning ? (
            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Only {stock} left
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              In Stock
            </span>
          )}
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Free shipping
          </span>
        </div>
      </div>
    </div>
  );
}

// Product Card List View
function ProductCardList({
  product,
  currency,
  isSelected,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isInWishlist
}: ProductCardEnhancedProps) {
  const imageUrl = product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg';
  const price = product.price || 0;
  const comparePrice = product.compare_at_price;
  const stock = product.stock_quantity || 0;
  const isOutOfStock = stock === 0;
  const stockWarning = stock > 0 && stock < 5;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const rating = 4.5;
  const reviewCount = 128;

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
      isSelected 
        ? 'border-orange-500 ring-2 ring-orange-500 shadow-xl' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
    }`}>
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          <Link to={`/products/${product.id}`}>
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </Link>
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-orange-600 border-orange-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="w-full h-full text-white p-0.5" />
                  )}
                </button>
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {rating} ({reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(price, currency)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(comparePrice, currency)}
                    </span>
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                      Save {formatCurrency(comparePrice - price, currency)}
                    </span>
                  </>
                )}
              </div>

              {/* Stock & Shipping */}
              <div className="flex items-center gap-3 text-xs mb-3">
                {isOutOfStock ? (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Out of Stock
                  </span>
                ) : stockWarning ? (
                  <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Only {stock} left
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    In Stock
                  </span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  Free shipping • 2-3 days
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => onToggleWishlist(product, e)}
                  className={`p-2 rounded-lg transition-colors ${
                    isInWishlist
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView(product);
                  }}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Quick view"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <Button
                size="sm"
                onClick={(e) => onAddToCart(product, e)}
                disabled={isOutOfStock}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Price Drop Timer Component
function PriceDropTimer({ endTime }: { endTime: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="mt-1 bg-red-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
      Ends in: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
    </div>
  );
}

// Comparison Drawer Component
interface CompareDrawerProps {
  productIds: string[];
  products: Product[];
  currency: 'USD' | 'EUR' | 'RWF' | 'KES';
  onClose: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
  isInWishlist: (productId: string) => boolean;
}

function CompareDrawer({
  productIds,
  products,
  currency: currencyProp,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isInWishlist
}: CompareDrawerProps) {
  const compareProducts = products.filter(p => productIds.includes(p.id));
  const currency = currencyProp as 'USD' | 'EUR' | 'RWF' | 'KES';

  if (compareProducts.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full h-[90vh] sm:h-[85vh] sm:max-w-6xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-orange-600" />
            Compare Products ({compareProducts.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold text-gray-900 dark:text-white">Features</th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="text-center p-3 w-64">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-32 h-32 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                          <img
                            src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(product.price || 0, currency)}
                          </span>
                          {product.compare_at_price && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              {formatCurrency(product.compare_at_price, currency)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <Button
                            size="sm"
                            onClick={(e) => onAddToCart(product, e)}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => onToggleWishlist(product, e)}
                            className={`w-full ${
                              isInWishlist(product.id)
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400'
                                : ''
                            }`}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Price</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(product.price || 0, currency)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatCurrency(product.compare_at_price, currency)}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Stock</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      <span className={`text-sm font-medium ${
                        (product.stock_quantity || 0) > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(product.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Shipping</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                        <Truck className="w-4 h-4" />
                        {product.is_shippable ? 'Free Shipping' : 'Not Shippable'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">SKU</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      {product.sku || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-medium text-gray-700 dark:text-gray-300">Description</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      <p className="line-clamp-3">{product.description || 'No description available'}</p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
