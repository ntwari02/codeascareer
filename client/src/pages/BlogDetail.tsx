import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Eye,
  ThumbsUp,
  MessageCircle,
  Tag,
  BookOpen,
  ShoppingBag,
  Store,
  Package,
  Truck,
  CreditCard,
  BarChart3,
  Bell,
  Zap,
  CheckCircle2,
} from 'lucide-react';

// Mock blog posts data (same as Blog.tsx)
const mockBlogPosts = [
  {
    id: '1',
    slug: 'how-to-start-selling-online-in-2024',
    title: 'How to Start Selling Online in 2024: A Complete Guide',
    subtitle: 'Everything you need to know to launch your e-commerce business',
    category: 'seller-tips',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    excerpt: 'Starting an online business has never been easier. Learn the essential steps to launch your e-commerce store and start making sales.',
    content: `
      <h2>Introduction</h2>
      <p>Starting an online business has never been easier. With platforms like REAGLEX, you can launch your e-commerce store in minutes and start reaching customers across Africa and beyond.</p>
      
      <h2>Step 1: Choose Your Products</h2>
      <p>The first step to starting your online business is choosing what to sell. Consider products that:</p>
      <ul>
        <li>You're passionate about</li>
        <li>Have market demand</li>
        <li>You can source reliably</li>
        <li>Have good profit margins</li>
      </ul>
      
      <h2>Step 2: Set Up Your Store</h2>
      <p>Creating your store on REAGLEX is simple. Follow these steps:</p>
      <ol>
        <li>Sign up for a seller account</li>
        <li>Complete your store profile</li>
        <li>Add your products with high-quality images</li>
        <li>Set competitive prices</li>
        <li>Configure shipping options</li>
      </ol>
      
      <h2>Step 3: Optimize Your Listings</h2>
      <p>Great product listings are key to success. Make sure to:</p>
      <ul>
        <li>Write clear, detailed descriptions</li>
        <li>Use high-quality product images</li>
        <li>Include relevant keywords</li>
        <li>Set accurate pricing</li>
        <li>Offer competitive shipping rates</li>
      </ul>
      
      <h2>Step 4: Market Your Store</h2>
      <p>Once your store is live, it's time to start marketing:</p>
      <ul>
        <li>Share on social media</li>
        <li>Use REAGLEX's built-in marketing tools</li>
        <li>Offer promotions and discounts</li>
        <li>Engage with customers</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Starting an online business is an exciting journey. With the right products, a well-optimized store, and effective marketing, you can build a successful e-commerce business on REAGLEX.</p>
    `,
    author: {
      name: 'Sarah Mwiza',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      bio: 'E-commerce expert with 10+ years of experience helping businesses succeed online.',
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
    content: `
      <h2>The AI Revolution in E-Commerce</h2>
      <p>Artificial intelligence is transforming every aspect of online shopping, from product discovery to checkout.</p>
      
      <h2>Personalized Recommendations</h2>
      <p>AI algorithms analyze your browsing and purchase history to suggest products you'll love.</p>
      
      <h2>Smart Search</h2>
      <p>Natural language processing makes search more intuitive and accurate.</p>
      
      <h2>The Future</h2>
      <p>As AI continues to evolve, we can expect even more personalized and efficient shopping experiences.</p>
    `,
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
  // Add more mock posts as needed...
];

const categories = [
  { id: 'seller-tips', label: 'Seller Tips & E-Commerce', icon: Store },
  { id: 'tech', label: 'Tech & Automation', icon: Zap },
  { id: 'shopping-guides', label: 'Shopping Guides', icon: ShoppingBag },
  { id: 'product-reviews', label: 'Product Reviews', icon: Package },
  { id: 'logistics', label: 'Logistics & Delivery', icon: Truck },
  { id: 'payments', label: 'Payments & Security', icon: CreditCard },
  { id: 'analytics', label: 'Marketplace Analytics', icon: BarChart3 },
  { id: 'updates', label: 'Updates & Announcements', icon: Bell },
];

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState({
    name: '',
    email: '',
    content: '',
  });

  const post = mockBlogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post) {
      navigate('/blog');
    }
  }, [post, navigate]);

  if (!post) {
    return null;
  }

  const category = categories.find((c) => c.id === post.category);
  const CategoryIcon = category?.icon || BookOpen;
  const relatedPosts = mockBlogPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
    .slice(0, 3);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the comment to your backend
    console.log('Comment submitted:', comment);
    alert('Thank you for your comment! It will be reviewed before publishing.');
    setComment({ name: '', email: '', content: '' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AnnouncementBar />
      <Header />

      {/* Article Header */}
      <article className="w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <CategoryIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {category?.label || post.category}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {post.subtitle}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{post.author.bio}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min read
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes}
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-5 w-5 fill-current" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 bg-[#000000] dark:bg-[#1a1a1a] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-5 w-5 fill-current" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 bg-[#0077B5] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5 fill-current" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 bg-gray-600 dark:bg-gray-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
                aria-label="Copy link"
              >
                {copied ? (
                  <CheckCircle2 className="h-5 w-5 fill-current" />
                ) : (
                  <Copy className="h-5 w-5 fill-current" />
                )}
              </button>
            </div>

            {/* Featured Image */}
            <div className="relative w-full h-64 sm:h-96 mb-8 rounded-xl overflow-hidden">
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article Content */}
            <div
              className="mb-12 text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.75rem',
              }}
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-12 pb-8 border-b border-gray-200 dark:border-gray-700">
              <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?search=${tag}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => {
                    const relatedCategory = categories.find((c) => c.id === relatedPost.category);
                    const RelatedCategoryIcon = relatedCategory?.icon || BookOpen;
                    return (
                      <Link
                        key={relatedPost.id}
                        to={`/blog/${relatedPost.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={relatedPost.thumbnail}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <RelatedCategoryIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              {relatedCategory?.label || relatedPost.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                Comments
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={comment.name}
                      onChange={(e) => setComment({ ...comment, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={comment.email}
                      onChange={(e) => setComment({ ...comment, email: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment *
                  </label>
                  <textarea
                    required
                    value={comment.content}
                    onChange={(e) => setComment({ ...comment, content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Share your thoughts..."
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                >
                  Post Comment
                </Button>
              </form>

              {/* Sample Comments */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50"
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">John M.</p>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        Great article! Very helpful for someone starting their e-commerce journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;

