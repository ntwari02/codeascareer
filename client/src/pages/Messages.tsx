import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  User,
  Store,
  Package,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  ShoppingBag
} from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'buyer' | 'seller' | 'support';
  sender_avatar?: string;
  content: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  type: 'seller' | 'support' | 'order';
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_pinned: boolean;
  order_id?: string;
  order_number?: string;
  status: 'active' | 'archived';
  messages: Message[];
}

// Mock Conversations Data
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Order ORD-2024-001',
    type: 'order',
    participant_id: 'seller-1',
    participant_name: 'Tech Store Official',
    participant_avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    last_message: 'Your order has been shipped! Tracking number: TRK123456789',
    last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread_count: 2,
    is_pinned: true,
    order_id: 'order-1',
    order_number: 'ORD-2024-001',
    status: 'active',
    messages: [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'seller-1',
        sender_name: 'Tech Store Official',
        sender_type: 'seller',
        sender_avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'Thank you for your order! We\'re processing it now.',
        is_read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: 'user-1',
        sender_name: 'You',
        sender_type: 'buyer',
        content: 'When will it be shipped?',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: 'seller-1',
        sender_name: 'Tech Store Official',
        sender_type: 'seller',
        sender_avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'Your order has been shipped! Tracking number: TRK123456789',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Fashion Hub',
    type: 'seller',
    participant_id: 'seller-2',
    participant_name: 'Fashion Hub',
    participant_avatar: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    last_message: 'Yes, we have that item in stock!',
    last_message_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
    is_pinned: false,
    status: 'active',
    messages: [
      {
        id: 'msg-4',
        conversation_id: 'conv-2',
        sender_id: 'user-1',
        sender_name: 'You',
        sender_type: 'buyer',
        content: 'Do you have this item in stock?',
        is_read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-5',
        conversation_id: 'conv-2',
        sender_id: 'seller-2',
        sender_name: 'Fashion Hub',
        sender_type: 'seller',
        sender_avatar: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'Yes, we have that item in stock!',
        is_read: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'conv-3',
    title: 'Customer Support',
    type: 'support',
    participant_id: 'support-1',
    participant_name: 'Customer Support',
    participant_avatar: undefined,
    last_message: 'We\'ve received your request and will get back to you soon.',
    last_message_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unread_count: 1,
    is_pinned: false,
    status: 'active',
    messages: [
      {
        id: 'msg-6',
        conversation_id: 'conv-3',
        sender_id: 'user-1',
        sender_name: 'You',
        sender_type: 'buyer',
        content: 'I need help with a refund request.',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-7',
        conversation_id: 'conv-3',
        sender_id: 'support-1',
        sender_name: 'Customer Support',
        sender_type: 'support',
        content: 'We\'ve received your request and will get back to you soon.',
        is_read: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'conv-4',
    title: 'Order ORD-2024-002',
    type: 'order',
    participant_id: 'seller-2',
    participant_name: 'Fashion Hub',
    participant_avatar: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
    last_message: 'Your order is being prepared for shipment.',
    last_message_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    unread_count: 0,
    is_pinned: false,
    order_id: 'order-2',
    order_number: 'ORD-2024-002',
    status: 'active',
    messages: [
      {
        id: 'msg-8',
        conversation_id: 'conv-4',
        sender_id: 'seller-2',
        sender_name: 'Fashion Hub',
        sender_type: 'seller',
        sender_avatar: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=200',
        content: 'Your order is being prepared for shipment.',
        is_read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ]
  }
];

type FilterType = 'all' | 'unread' | 'order' | 'seller' | 'support';

export function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const selectedConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConversation);
  }, [conversations, selectedConversation]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter(c => c.status === 'active');

    // Filter by type
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(c => c.unread_count > 0);
      } else {
        filtered = filtered.filter(c => c.type === filter);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.last_message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: pinned first, then by last message time
    return filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
    });
  }, [conversations, filter, searchQuery]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
  }, [conversations]);

  useEffect(() => {
    // Auto-select first conversation if none selected
    if (!selectedConversation && filteredConversations.length > 0) {
      setSelectedConversation(filteredConversations[0].id);
    }
  }, [selectedConversation, filteredConversations]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive or conversation changes
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedConv?.messages, selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConv.id,
      sender_id: user?.id || 'user-1',
      sender_name: 'You',
      sender_type: 'buyer',
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    // Update conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConv.id) {
        return {
          ...conv,
          last_message: message.content,
          last_message_time: message.created_at,
          messages: [...conv.messages, message],
        };
      }
      return conv;
    }));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'all', label: 'All', icon: MessageSquare },
                  { id: 'unread', label: 'Unread', icon: AlertCircle },
                  { id: 'order', label: 'Orders', icon: Package },
                  { id: 'seller', label: 'Sellers', icon: Store },
                  { id: 'support', label: 'Support', icon: User },
                ].map((filterOption) => {
                  const Icon = filterOption.icon;
                  return (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id as FilterType)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        filter === filterOption.id
                          ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {filterOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" style={{ height: 'calc(100vh - 280px)', minHeight: '600px' }}>
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Conversations ({filteredConversations.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No conversations found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedConversation(conversation.id);
                        // Mark as read
                        setConversations(prev => prev.map(c => {
                          if (c.id === conversation.id) {
                            return {
                              ...c,
                              unread_count: 0,
                              messages: c.messages.map(m => ({ ...m, is_read: true })),
                            };
                          }
                          return c;
                        }));
                        // Scroll chat to top when selecting conversation
                        setTimeout(() => {
                          if (messagesContainerRef.current) {
                            messagesContainerRef.current.scrollTop = 0;
                          }
                        }, 100);
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden">
                            {conversation.participant_avatar ? (
                              <img
                                src={conversation.participant_avatar}
                                alt={conversation.participant_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {conversation.participant_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {conversation.type === 'order' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <Package className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {conversation.title}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                              {formatMessageTime(conversation.last_message_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                              {conversation.last_message}
                            </p>
                            {conversation.unread_count > 0 && (
                              <span className="bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                              </span>
                            )}
                          </div>
                          {conversation.order_number && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <Package className="h-3 w-3" />
                              <span>{conversation.order_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden">
                        {selectedConv.participant_avatar ? (
                          <img
                            src={selectedConv.participant_avatar}
                            alt={selectedConv.participant_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {selectedConv.participant_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {selectedConv.type === 'order' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <Package className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{selectedConv.participant_name}</h3>
                      {selectedConv.order_number && (
                        <Link
                          to={`/orders`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {selectedConv.order_number}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '100%' }}>
                  {selectedConv.messages.map((message, index) => {
                    const isOwnMessage = message.sender_type === 'buyer';
                    const showDate = index === 0 || 
                      formatMessageDate(message.created_at) !== formatMessageDate(selectedConv.messages[index - 1].created_at);
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center mb-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {formatMessageDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {!isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden flex-shrink-0">
                              {message.sender_avatar ? (
                                <img
                                  src={message.sender_avatar}
                                  alt={message.sender_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                  {message.sender_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`max-w-[70%] sm:max-w-[60%] ${isOwnMessage ? 'order-2' : ''}`}>
                            {!isOwnMessage && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">
                                {message.sender_name}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-orange-600 text-white rounded-br-sm'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                                      {attachment.type === 'image' ? (
                                        <ImageIcon className="h-4 w-4" />
                                      ) : (
                                        <FileText className="h-4 w-4" />
                                      )}
                                      <span className="text-xs truncate">{attachment.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(message.created_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {isOwnMessage && (
                                <span className="text-xs">
                                  {message.is_read ? (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  ) : (
                                    <Check className="h-3 w-3 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          {isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden flex-shrink-0 order-1">
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-end gap-2">
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none max-h-32"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex-shrink-0 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

