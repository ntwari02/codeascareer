import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import {
  Search,
  Calendar,
  Clock,
  User,
  TrendingUp,
  BookOpen,
  ShoppingBag,
  Store,
  Package,
  Truck,
  CreditCard,
  BarChart3,
  Bell,
  Zap,
  Tag,
  Eye,
  ThumbsUp,
  Filter,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  thumbnail: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  tags: string[];
  featured?: boolean;
}

const categories = [
  { id: 'all', label: 'All Posts', icon: BookOpen },
  { id: 'shopping-guides', label: 'Shopping Guides', icon: ShoppingBag },
  { id: 'seller-tips', label: 'Seller Tips & E-Commerce', icon: Store },
  { id: 'product-reviews', label: 'Product Reviews', icon: Package },
  { id: 'logistics', label: 'Logistics & Delivery', icon: Truck },
  { id: 'payments', label: 'Payments & Security', icon: CreditCard },
  { id: 'analytics', label: 'Marketplace Analytics', icon: BarChart3 },
  { id: 'updates', label: 'Updates & Announcements', icon: Bell },
  { id: 'tech', label: 'Tech & Automation', icon: Zap },
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-start-selling-online-in-2024',
    title: 'How to Start Selling Online in 2024: A Complete Guide',
    subtitle: 'Everything you need to know to launch your e-commerce business',
    category: 'seller-tips',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    excerpt: 'Starting an online business has never been easier. Learn the essential steps to launch your e-commerce store and start making sales.',
    content: 'Full article content here...',
    author: {
      name: 'Sarah Mwiza',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      bio: 'E-commerce expert with 10+ years of experience',
    },
    publishedAt: '2024-01-15',
    readingTime: 8,
    views: 1250,
    likes: 89,
    tags: ['e-commerce', 'selling', 'business', 'startup'],
    featured: true,
  },
  {
    id: '2',
    slug: 'ai-powered-shopping-experience',
    title: 'How AI is Transforming the Shopping Experience',
    subtitle: 'Discover how artificial intelligence is revolutionizing e-commerce',
    category: 'tech',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    excerpt: 'Artificial intelligence is changing how we shop online. From personalized recommendations to smart search, AI is making shopping more intuitive.',
    content: 'Full article content here...',
    author: {
      name: 'David Karekezi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      bio: 'Tech writer and AI enthusiast',
    },
    publishedAt: '2024-01-12',
    readingTime: 6,
    views: 2100,
    likes: 156,
    tags: ['AI', 'technology', 'innovation', 'shopping'],
    featured: true,
  },
  {
    id: '3',
    slug: 'secure-payment-methods-guide',
    title: 'Secure Payment Methods: A Buyer\'s Guide',
    subtitle: 'Understanding escrow and payment protection',
    category: 'payments',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    excerpt: 'Learn about secure payment options and how escrow protects both buyers and sellers in online transactions.',
    content: 'Full article content here...',
    author: {
      name: 'Marie Uwimana',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      bio: 'Financial security expert',
    },
    publishedAt: '2024-01-10',
    readingTime: 5,
    views: 980,
    likes: 67,
    tags: ['payments', 'security', 'escrow', 'buyer-guide'],
    featured: true,
  },
  {
    id: '4',
    slug: 'top-product-trends-2024',
    title: 'Top Product Trends to Watch in 2024',
    category: 'product-reviews',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    excerpt: 'Discover the hottest products and trends that are shaping the e-commerce landscape this year.',
    content: 'Full article content here...',
    author: {
      name: 'John Mutabazi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      bio: 'Product analyst and trend researcher',
    },
    publishedAt: '2024-01-08',
    readingTime: 7,
    views: 1450,
    likes: 112,
    tags: ['trends', 'products', '2024', 'market'],
  },
  {
    id: '5',
    slug: 'fast-delivery-logistics',
    title: 'Fast Delivery: How We Ship Across Africa',
    category: 'logistics',
    thumbnail: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800',
    excerpt: 'Learn about our logistics network and how we ensure fast, reliable delivery across 15+ African countries.',
    content: 'Full article content here...',
    author: {
      name: 'Amina Hassan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      bio: 'Logistics operations manager',
    },
    publishedAt: '2024-01-05',
    readingTime: 6,
    views: 890,
    likes: 54,
    tags: ['delivery', 'logistics', 'shipping', 'africa'],
  },
  {
    id: '6',
    slug: 'seller-analytics-dashboard',
    title: 'Master Your Seller Analytics Dashboard',
    category: 'analytics',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    excerpt: 'A comprehensive guide to understanding and using your seller analytics to grow your business.',
    content: 'Full article content here...',
    author: {
      name: 'Peter Nkurunziza',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      bio: 'Data analyst and business consultant',
    },
    publishedAt: '2024-01-03',
    readingTime: 10,
    views: 1100,
    likes: 78,
    tags: ['analytics', 'dashboard', 'seller-tips', 'data'],
  },
  {
    id: '7',
    slug: 'smart-shopping-tips',
    title: '10 Smart Shopping Tips for Savvy Buyers',
    category: 'shopping-guides',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    excerpt: 'Learn how to shop smarter, save money, and get the best deals on REAGLEX.',
    content: 'Full article content here...',
    author: {
      name: 'Grace Mukamana',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      bio: 'Shopping expert and deal finder',
    },
    publishedAt: '2024-01-01',
    readingTime: 5,
    views: 1650,
    likes: 134,
    tags: ['shopping', 'tips', 'savings', 'deals'],
  },
  {
    id: '8',
    slug: 'platform-updates-january',
    title: 'Platform Updates: January 2024',
    category: 'updates',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    excerpt: 'Check out the latest features, improvements, and updates we\'ve made to REAGLEX this month.',
    content: 'Full article content here...',
    author: {
      name: 'REAGLEX Team',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100',
      bio: 'The REAGLEX development team',
    },
    publishedAt: '2024-01-15',
    readingTime: 4,
    views: 2200,
    likes: 198,
    tags: ['updates', 'features', 'platform', 'announcement'],
  },
];

const popularTags = [
  'AI Commerce',
  'How to sell online',
  'Fashion tips',
  'Payment issues',
  'Delivery updates',
  'Startup stories',
  'E-commerce',
  'Business growth',
  'Digital marketing',
  'Customer service',
];

const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;


  const filteredPosts = useMemo(() => {
    let filtered = mockBlogPosts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort posts
    if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => b.views - a.views);
    } else if (sortBy === 'trending') {
      filtered = [...filtered].sort((a, b) => b.likes - a.likes);
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  const featuredPosts = mockBlogPosts.filter((post) => post.featured).slice(0, 3);
  const popularPosts = [...mockBlogPosts].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentPosts = [...mockBlogPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              REAGLEX Insights & Updates
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Marketplace updates, seller tips, shopping guides, and technology innovations to help you succeed in e-commerce.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredPosts.length > 0 && (
        <section className="w-full bg-white dark:bg-gray-900 py-12 sm:py-16">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Featured Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => {
                  const category = categories.find((c) => c.id === post.category);
                  const CategoryIcon = category?.icon || BookOpen;
                  return (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium">
                            <CategoryIcon className="h-3 w-3" />
                            {category?.label || post.category}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {post.title}
                        </h3>
                        {post.subtitle && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {post.subtitle}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readingTime} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="w-full bg-gray-50 dark:bg-gray-900 py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Filters and View Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'trending')}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <Grid3x3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-orange-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>

                {/* Blog Posts */}
                {paginatedPosts.length > 0 ? (
                  <>
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                          : 'space-y-6'
                      }
                    >
                      {paginatedPosts.map((post) => {
                        const category = categories.find((c) => c.id === post.category);
                        const CategoryIcon = category?.icon || BookOpen;
                        return (
                          <Link
                            key={post.id}
                            to={`/blog/${post.slug}`}
                            className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all ${
                              viewMode === 'grid' ? '' : 'flex'
                            }`}
                          >
                            <div
                              className={`relative overflow-hidden ${
                                viewMode === 'grid'
                                  ? 'h-48'
                                  : 'w-64 h-48 flex-shrink-0'
                              }`}
                            >
                              <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full text-sm font-medium">
                                  <CategoryIcon className="h-3 w-3" />
                                  {category?.label || post.category}
                                </div>
                              </div>
                            </div>
                            <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {post.author.name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {post.readingTime} min
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {post.views}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    {post.likes}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === index + 1
                                ? 'bg-orange-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      No articles found. Try adjusting your filters or search query.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Popular Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Popular Posts
                  </h3>
                  <div className="space-y-4">
                    {popularPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                              <Eye className="h-3 w-3" />
                              {post.views}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    Popular Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;

