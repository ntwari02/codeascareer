import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/buyer/Header';
import { Footer } from '../components/buyer/Footer';
import { AnnouncementBar } from '../components/buyer/AnnouncementBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { buyerInboxAPI, MessageThread, Message } from '../services/buyerInboxApi';
import { websocketService } from '../services/websocketService';
import { AudioWave } from '../components/AudioWave';
import { ImageLightbox } from '../components/ImageLightbox';
import { UploadProgress } from '../components/UploadProgress';

// Get server base URL for file attachments
const getFileUrl = (path: string): string => {
  if (!path) return '';
  // If path already includes http, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise, prepend server base URL
  const serverBase = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${serverBase}${path.startsWith('/') ? path : '/' + path}`;
};

// Helper to resolve avatar URL (handles both full URLs and relative paths)
const resolveAvatarUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it's a relative path, prepend the API host
  const API_HOST = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${API_HOST}${url.startsWith('/') ? url : '/' + url}`;
};

import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  Store,
  Package,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  Loader2,
  Plus,
  Mic,
  Play,
  X,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

type FilterType = 'all' | 'unread' | 'order' | 'seller' | 'support';

// Request browser notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Show browser notification
const showNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'message-notification',
      requireInteraction: false,
    });
  }
};

export function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [newMessage, setNewMessage] = useState('');
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map());
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, File>>(new Map());
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [availableSellers, setAvailableSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [newThreadSubject, setNewThreadSubject] = useState('');
  const [newThreadSellerId, setNewThreadSellerId] = useState('');
  const [newThreadType, setNewThreadType] = useState<'rfq' | 'message' | 'order'>('message');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  
  // Real-time indicators state
  const [isRecordingIndicator, setIsRecordingIndicator] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState<string | null>(null);
  const [recordingDurationIndicator, setRecordingDurationIndicator] = useState(0);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [selectingFileUserId, setSelectingFileUserId] = useState<string | null>(null);
  const [selectingFileName, setSelectingFileName] = useState<string | null>(null);
  
  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Audio playing state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingCompleteRef = useRef<((file: File) => void) | null>(null);

  const activeThread = useMemo(() => {
    return threads.find(t => t._id === selectedThread);
  }, [threads, selectedThread]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Load threads
  const loadThreads = useCallback(async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const typeFilter = filter === 'order' ? 'order' : filter === 'seller' ? 'message' : undefined;
      const response = await buyerInboxAPI.getThreads({
        search: searchQuery || undefined,
        status: filter === 'unread' ? undefined : 'active',
        type: typeFilter,
        page: 1,
        limit: 50,
      });
      setThreads(response.threads);
    } catch (error: any) {
      showToast(error.message || 'Failed to load conversations', 'error');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [searchQuery, filter, showToast]);

  // Load thread messages
  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await buyerInboxAPI.getThread(threadId);
      setMessages(response.messages || []);
      await buyerInboxAPI.markThreadAsRead(threadId);
      websocketService.joinThread(threadId);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      showToast(error.message || 'Failed to load messages', 'error');
      setMessages([]);
    }
  }, [showToast]);

  // Send message
  const handleSendMessage = async () => {
    if (!selectedThread) return;
    if (sending) return;

    // Auto-send if recording or has files
    if (isRecording) {
      stopRecording();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Check if we have content to send
    if (!newMessage.trim() && uploadedAttachments.length === 0 && selectedFiles.length === 0) {
      return;
    }

    try {
      setSending(true);
      
      // Upload remaining files if any (voice notes or files that weren't auto-uploaded)
      let attachments = [...uploadedAttachments];
      const remainingFiles = selectedFiles.filter(f => 
        !uploadedAttachments.some(a => a.originalName === f.name) &&
        !Array.from(uploadingFiles.values()).includes(f)
      );
      
      if (remainingFiles.length > 0) {
        try {
          const uploaded = await buyerInboxAPI.uploadFiles(
            remainingFiles,
            recordingDuration > 0 ? recordingDuration : undefined,
            (progress) => {
              setUploadProgress(prev => new Map(prev).set('sending', progress));
            }
          );
          attachments = [...attachments, ...uploaded];
        } catch (error: any) {
          showToast('Failed to upload some files', 'error');
          throw error;
        }
      }

      // Send message - WhatsApp style: allow empty content if attachments exist
      const messageText = newMessage.trim();
      await buyerInboxAPI.sendMessage(selectedThread, {
        content: messageText || '', // Empty string is allowed if attachments exist
        attachments,
      });

      setNewMessage('');
      setSelectedFiles([]);
      setUploadedAttachments([]);
      setRecordingDuration(0);
      setIsRecording(false);
      setUploadProgress(new Map());
      setUploadErrors(new Map());
      setUploadingFiles(new Map());
      
      await loadThreadMessages(selectedThread);
      await loadThreads();
      
      showToast('Message sent', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Handle file selection with auto-upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = files.length + selectedFiles.length + uploadedAttachments.length;
    if (totalFiles > 5) {
      showToast('Maximum 5 files allowed', 'error');
      return;
    }
    
    // Add files to selected list
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    
    // Auto-upload files (except voice notes which are handled separately)
    for (const file of files) {
      if (!file.name.startsWith('voice-')) {
        await uploadFileWithProgress(file);
      }
    }
    
    // Clear input
    if (e.target) {
      e.target.value = '';
    }
  };
  
  // Upload file with progress tracking
  const uploadFileWithProgress = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadingFiles(prev => new Map(prev).set(fileId, file));
    setUploadProgress(prev => new Map(prev).set(fileId, 0));
    setUploadErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    
    try {
      const uploaded = await buyerInboxAPI.uploadFiles(
        [file],
        undefined,
        (progress) => {
          setUploadProgress(prev => new Map(prev).set(fileId, progress));
        }
      );
      
      if (uploaded.length > 0) {
        setUploadedAttachments(prev => [...prev, ...uploaded]);
        setSelectedFiles(prev => prev.filter(f => f !== file));
      }
      
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
      setUploadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadErrors(prev => new Map(prev).set(fileId, error.message || 'Upload failed'));
      showToast(`Failed to upload ${file.name}`, 'error');
    }
  };
  
  // Retry failed upload
  const retryUpload = async (fileId: string) => {
    const file = uploadingFiles.get(fileId);
    if (file) {
      setUploadErrors(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
      await uploadFileWithProgress(file);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles((prev) => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
        
        // Call the completion callback if set
        if (recordingCompleteRef.current) {
          recordingCompleteRef.current(file);
          recordingCompleteRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      showToast('Failed to start recording', 'error');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      const currentDuration = recordingDuration;
      const hasText = newMessage.trim().length > 0;
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      // Auto-send voice note if no text content (WhatsApp style)
      if (currentDuration > 0 && !hasText) {
        // Wait for recording to finish and get the file
        const recordedFile = await new Promise<File>((resolve) => {
          recordingCompleteRef.current = resolve;
        });
        
        if (recordedFile && selectedThread) {
          // Auto-upload and send the voice note
          try {
            const uploaded = await buyerInboxAPI.uploadFiles(
              [recordedFile],
              currentDuration,
              (progress) => {
                setUploadProgress(prev => new Map(prev).set('voice-sending', progress));
              }
            );
            
            // Send message with voice note only
            if (uploaded.length > 0) {
              await buyerInboxAPI.sendMessage(selectedThread, {
                content: '',
                attachments: uploaded,
              });
              
              // Clear voice note files
              setSelectedFiles(prev => prev.filter(f => f !== recordedFile));
              setUploadedAttachments([]);
              setRecordingDuration(0);
              setUploadProgress(new Map());
              
              // Reload messages
              await loadThreadMessages(selectedThread);
              await loadThreads();
              
              showToast('Voice note sent', 'success');
            }
          } catch (error: any) {
            showToast(error.message || 'Failed to send voice note', 'error');
          }
        }
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setSelectedFiles(prev => prev.filter(file => !file.name.startsWith('voice-')));
      
      // Stop recording indicator
      if (selectedThread) {
        websocketService.sendRecording(selectedThread, false);
      }
    }
  };

  const formatRecordingDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load available sellers
  const loadAvailableSellers = async () => {
    try {
      setLoadingSellers(true);
      const response = await buyerInboxAPI.getSellers();
      setAvailableSellers(response.sellers || []);
    } catch (error: any) {
      console.error('Load sellers error:', error);
    } finally {
      setLoadingSellers(false);
    }
  };

  // Create new thread
  const handleCreateThread = async () => {
    if (!newThreadSubject.trim() || !newThreadSellerId) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await buyerInboxAPI.createThread({
        sellerId: newThreadSellerId,
        subject: newThreadSubject,
        type: newThreadType,
      });

      setShowNewThreadDialog(false);
      setNewThreadSubject('');
      setNewThreadSellerId('');
      setNewThreadType('message');

      await loadThreadMessages(response.thread._id);
      setSelectedThread(response.thread._id);
      await loadThreads();
      
      showToast('Conversation started', 'success');
    } catch (error: any) {
      console.error('Create thread error:', error);
      const errorMessage = error.message || 'Failed to create conversation';
      if (!errorMessage.includes('Network error') && !errorMessage.includes('Failed to fetch')) {
        showToast(errorMessage, 'error');
      }
    }
  };

  // Format time
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

  // Filter threads
  const filteredThreads = useMemo(() => {
    let filtered = threads.filter(t => t.status === 'active');
    
    if (filter === 'unread') {
      filtered = filtered.filter(t => t.buyerUnreadCount > 0);
    } else if (filter === 'order') {
      filtered = filtered.filter(t => t.type === 'order');
    } else if (filter === 'seller') {
      filtered = filtered.filter(t => t.type === 'message');
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof t.sellerId === 'object' && t.sellerId.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [threads, filter, searchQuery]);

  const totalUnread = useMemo(() => {
    return threads.reduce((sum, t) => sum + t.buyerUnreadCount, 0);
  }, [threads]);

  // WebSocket setup - FIXED to handle real-time messages properly
  useEffect(() => {
    websocketService.connect();

    // Handle new messages - FIXED: Always update messages if thread is active
    websocketService.onNewMessage = (threadId: string, message: any) => {
      // Update messages if this is the active thread
      if (selectedThread === threadId) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
        // Scroll within messages container, not the whole page
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
      
      // Reload threads to update unread counts (without showing loading state)
      loadThreads(false);
      
      // Show notification if message is from seller and not in active thread
      if (message.senderType === 'seller' && selectedThread !== threadId) {
        const thread = threads.find(t => t._id === threadId);
        const sellerName = typeof thread?.sellerId === 'object' 
          ? (thread.sellerId.storeName || thread.sellerId.fullName || 'Seller')
          : 'Seller';
        showNotification(
          sellerName,
          message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          typeof thread?.sellerId === 'object' ? resolveAvatarUrl(thread.sellerId.avatarUrl) : undefined
        );
        showToast(`New message from ${sellerName}`, 'info');
      }
    };

    // Handle thread updates
    websocketService.onThreadUpdate = (threadId: string, _update?: any, lastMessage?: any) => {
      if (selectedThread === threadId && lastMessage) {
        // If we have a lastMessage, add it to messages
        setMessages((prev) => {
          if (prev.some(m => m._id === lastMessage._id)) {
            return prev;
          }
          const newMessages = [...prev, lastMessage];
          // Auto-scroll for voice notes and new messages (within container, not whole page)
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            } else {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 100);
          return newMessages;
        });
      }
      loadThreads();
    };

    // Handle typing indicators
    websocketService.onUserTyping = (threadId: string, userId: string, _userName: string, isTyping: boolean) => {
      if (selectedThread === threadId && userId !== user?.id) {
        setIsTyping(isTyping);
        setTypingUserId(userId);
        if (!isTyping) {
          setTimeout(() => {
            setIsTyping(false);
            setTypingUserId(null);
          }, 2000);
        }
      }
    };

    return () => {
      if (selectedThread) {
        websocketService.leaveThread(selectedThread);
      }
    };
  }, [selectedThread, loadThreads, threads, user?.id, showToast]);

  // Join thread when selected
  useEffect(() => {
    if (selectedThread) {
      websocketService.joinThread(selectedThread);
      loadThreadMessages(selectedThread);
    }
  }, [selectedThread, loadThreadMessages]);

  // Initial load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Auto-select first thread
  useEffect(() => {
    if (!selectedThread && filteredThreads.length > 0) {
      setSelectedThread(filteredThreads[0]._id);
    }
  }, [selectedThread, filteredThreads]);

  // Scroll to bottom (only when thread changes or messages are loaded initially)
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [selectedThread]); // Only scroll when thread changes, not on every message update

  // Typing indicator
  const handleTyping = () => {
    if (!selectedThread) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    websocketService.sendTyping(selectedThread, true);
    
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(selectedThread, false);
    }, 1000);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <AnnouncementBar />
      <Header />

      <main className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
        {/* Header - Responsive */}
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Messages</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  loadAvailableSellers();
                  setShowNewThreadDialog(true);
                }}
                className="gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">New Conversation</span>
                <span className="sm:hidden">New</span>
              </Button>
              <Link to="/products" className="hidden sm:block">
                <Button variant="outline" className="gap-2 text-xs sm:text-sm" size="sm">
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden md:inline">Continue Shopping</span>
                  <span className="md:hidden">Shop</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters - Responsive */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All', icon: MessageSquare },
                  { id: 'unread', label: 'Unread', icon: AlertCircle },
                  { id: 'order', label: 'Orders', icon: Package },
                  { id: 'seller', label: 'Sellers', icon: Store },
                ].map((filterOption) => {
                  const Icon = filterOption.icon;
                  return (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id as FilterType)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap active:scale-95 ${
                        filter === filterOption.id
                          ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      {filterOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Layout - WhatsApp Style - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[350px_1fr] gap-3 sm:gap-4 lg:gap-6" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
          {/* Conversations List - WhatsApp Style - Hidden on mobile when thread selected */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 ${selectedThread ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                  Chats
                </h2>
                <button
                  onClick={() => {
                    loadAvailableSellers();
                    setShowNewThreadDialog(true);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-95"
                  title="New conversation"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">No conversations found</p>
                  <Button
                    onClick={() => {
                      loadAvailableSellers();
                      setShowNewThreadDialog(true);
                    }}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Start Conversation
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredThreads.map((thread) => {
                    const seller = typeof thread.sellerId === 'object' ? thread.sellerId : null;
                    const isActive = selectedThread === thread._id;
                    return (
                      <button
                        key={thread._id}
                        type="button"
                        onClick={() => {
                          setSelectedThread(thread._id);
                        }}
                        className={`w-full p-2.5 sm:p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 transition-colors ${
                          isActive ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden">
                              {seller?.avatarUrl ? (
                                <img
                                  src={resolveAvatarUrl(seller.avatarUrl) || ''}
                                  alt={seller.fullName || 'Seller'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                  {(seller?.fullName || seller?.storeName || 'S')[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                            {thread.type === 'order' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <Package className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {seller?.storeName || seller?.fullName || thread.subject}
                              </h3>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                {formatMessageTime(thread.lastMessageAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                                {thread.lastMessagePreview || 'No messages yet'}
                              </p>
                              {thread.buyerUnreadCount > 0 && (
                                <span className="bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 min-w-[20px]">
                                  {thread.buyerUnreadCount > 9 ? '9+' : thread.buyerUnreadCount}
                                </span>
                              )}
                            </div>
                            {thread.type === 'order' && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                <Package className="h-3 w-3" />
                                <span>Order</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - WhatsApp Style - Responsive */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 ${selectedThread ? 'flex' : 'hidden lg:flex'}`}>
            {activeThread ? (
              <>
                {/* Chat Header - WhatsApp Style - Responsive */}
                <div className="p-2.5 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedThread(null)}
                      className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95 flex-shrink-0"
                      aria-label="Back to conversations"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden">
                        {typeof activeThread.sellerId === 'object' && activeThread.sellerId.avatarUrl ? (
                          <img
                            src={resolveAvatarUrl(activeThread.sellerId.avatarUrl) || ''}
                            alt={activeThread.sellerId.fullName || 'Seller'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {(typeof activeThread.sellerId === 'object' ? (activeThread.sellerId.storeName || activeThread.sellerId.fullName || 'S') : 'S')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      {activeThread.type === 'order' && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <Package className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {typeof activeThread.sellerId === 'object' 
                            ? (activeThread.sellerId.storeName || activeThread.sellerId.fullName || 'Seller')
                            : 'Seller'}
                        </h3>
                        <span className="text-[10px] text-green-500">●</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeThread.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages - WhatsApp Style - Responsive */}
                <div 
                  ref={messagesContainerRef} 
                  className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 bg-[#efeae2] dark:bg-gray-900/50" 
                  style={{ 
                    maxHeight: '100%',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4d4d4\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                  }}
                >
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderType === 'buyer';
                    const showDate = index === 0 || 
                      formatMessageDate(message.createdAt) !== formatMessageDate(messages[index - 1].createdAt);
                    const sender = typeof message.senderId === 'object' ? message.senderId : null;
                    const isDeleted = message.isDeleted;
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full inline-block">
                              {formatMessageDate(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {!isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden flex-shrink-0">
                              {sender?.avatarUrl ? (
                                <img
                                  src={resolveAvatarUrl(sender.avatarUrl) || ''}
                                  alt={sender.fullName || 'Seller'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                  {(sender?.fullName || 'S')[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-2xl px-3 py-2 shadow-sm ${
                                isOwnMessage
                                  ? 'bg-[#dcf8c6] dark:bg-green-700 text-gray-900 dark:text-white rounded-br-sm'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-md'
                              }`}
                              style={{
                                boxShadow: isOwnMessage 
                                  ? '0 1px 2px rgba(0,0,0,0.1)' 
                                  : '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              {isDeleted ? (
                                <span className="italic text-gray-500 dark:text-gray-400 text-sm">This message was deleted</span>
                              ) : (
                                <>
                                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                  {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                      {message.attachments.map((attachment, idx) => (
                                        <div key={idx}>
                                          {attachment.type === 'voice' ? (
                                            <div className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg">
                                              <button
                                                onClick={async () => {
                                                  const audioId = `audio-${message._id}-${idx}`;
                                                  const audio = document.getElementById(audioId) as HTMLAudioElement;
                                                  if (audio) {
                                                    if (playingAudioId === audioId) {
                                                      audio.pause();
                                                      setPlayingAudioId(null);
                                                    } else {
                                                      try {
                                                        // Pause all other audios
                                                        document.querySelectorAll('audio').forEach(a => {
                                                          a.pause();
                                                          a.currentTime = 0;
                                                        });
                                                        
                                                        // Ensure audio is ready and has volume
                                                        audio.volume = 1.0;
                                                        audio.muted = false;
                                                        
                                                        // Load the audio if not loaded
                                                        if (audio.readyState < 2) {
                                                          audio.load();
                                                          await new Promise((resolve, reject) => {
                                                            audio.oncanplay = resolve;
                                                            audio.onerror = reject;
                                                            setTimeout(reject, 5000); // Timeout after 5 seconds
                                                          });
                                                        }
                                                        
                                                        // Play the audio
                                                        await audio.play();
                                                        setPlayingAudioId(audioId);
                                                        
                                                        // Set up event handlers
                                                        audio.onended = () => {
                                                          setPlayingAudioId(null);
                                                          audio.currentTime = 0;
                                                        };
                                                        audio.onpause = () => {
                                                          if (audio.ended) {
                                                            setPlayingAudioId(null);
                                                          }
                                                        };
                                                        audio.onerror = (e) => {
                                                          console.error('Audio playback error:', e, audio.error);
                                                          showToast('Failed to play audio. Please check your speakers.', 'error');
                                                          setPlayingAudioId(null);
                                                        };
                                                      } catch (error: any) {
                                                        console.error('Audio play error:', error);
                                                        if (error.name === 'NotAllowedError') {
                                                          showToast('Please allow audio playback in your browser', 'error');
                                                        } else {
                                                          showToast('Failed to play audio. Please check your speakers.', 'error');
                                                        }
                                                        setPlayingAudioId(null);
                                                      }
                                                    }
                                                  }
                                                }}
                                                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
                                              >
                                                {playingAudioId === `audio-${message._id}-${idx}` ? (
                                                  <X className="w-4 h-4" />
                                                ) : (
                                                  <Play className="w-4 h-4 ml-0.5" />
                                                )}
                                              </button>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <AudioWave 
                                                    isPlaying={playingAudioId === `audio-${message._id}-${idx}`}
                                                    className="text-orange-500"
                                                  />
                                                  <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                                    {attachment.duration}s
                                                  </span>
                                                </div>
                                                <audio 
                                                  id={`audio-${message._id}-${idx}`}
                                                  src={getFileUrl(attachment.path)} 
                                                  className="hidden"
                                                  preload="auto"
                                                  crossOrigin="anonymous"
                                                  ref={(el) => {
                                                    if (el) {
                                                      el.volume = 1.0;
                                                      el.muted = false;
                                                    }
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          ) : attachment.type === 'image' ? (
                                            <div className="mt-2 -mx-1 -my-1 first:mt-0">
                                              <img
                                                src={getFileUrl(attachment.path)}
                                                alt={attachment.originalName}
                                                className="max-w-[200px] sm:max-w-[300px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                                onClick={() => setLightboxImage(getFileUrl(attachment.path))}
                                                loading="lazy"
                                                onError={(e) => {
                                                  console.error('Image load error:', attachment.path);
                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                              />
                                            </div>
                                          ) : (
                                            <a
                                              href={getFileUrl(attachment.path)}
                                              download={attachment.originalName}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors mt-2"
                                              onClick={(e) => {
                                                // Force download
                                                const link = document.createElement('a');
                                                link.href = getFileUrl(attachment.path);
                                                link.download = attachment.originalName;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                                e.preventDefault();
                                              }}
                                            >
                                              <FileText className="h-4 w-4 flex-shrink-0" />
                                              <div className="flex-1 min-w-0">
                                                <span className="text-xs font-medium block truncate">{attachment.originalName}</span>
                                                {attachment.size && (
                                                  <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                                    {(attachment.size / 1024).toFixed(1)} KB
                                                  </span>
                                                )}
                                              </div>
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false
                                })}
                              </span>
                              {isOwnMessage && (
                                <span className="text-[10px]">
                                  {message.status === 'read' ? (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  ) : message.status === 'delivered' ? (
                                    <CheckCheck className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <Check className="h-3 w-3 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          {isOwnMessage && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-teal-500 overflow-hidden flex-shrink-0">
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && typingUserId && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - WhatsApp Style - Responsive */}
                <div className="p-2 sm:p-2.5 md:p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg text-[10px] sm:text-xs border border-gray-200 dark:border-gray-700">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-3 h-3 text-blue-500" />
                          ) : file.type.startsWith('audio/') ? (
                            <Play className="w-3 h-3 text-green-500" />
                          ) : (
                            <FileText className="w-3 h-3 text-gray-500" />
                          )}
                          <span className="truncate max-w-[100px]">{file.name}</span>
                          <button
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.zip,.rar"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Recording Mode UI */}
                    {isRecording ? (
                      <>
                        <button
                          onClick={cancelRecording}
                          className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-red-500 flex-shrink-0 transition-colors"
                          title="Cancel recording"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1 flex items-center justify-between bg-white dark:bg-gray-800 border-2 border-red-500 rounded-full px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-red-500">
                              Recording: {formatRecordingDuration(recordingDuration)}
                            </span>
                          </div>
                          <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex-shrink-0 transition-colors"
                            title="Send voice note"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Normal Mode UI - WhatsApp Style */}
                        <div className="flex-1 relative bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600">
                          <textarea
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type a message"
                            rows={1}
                            className="w-full px-4 py-2.5 pr-20 rounded-full bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none resize-none max-h-32 overflow-y-auto"
                            style={{ minHeight: '44px' }}
                          />
                          {/* Icons inside input - WhatsApp Style - Responsive */}
                          {!newMessage.trim() && (
                            <div className="absolute right-2 bottom-2 flex items-center gap-0.5 sm:gap-1">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"
                                title="Attach file"
                              >
                                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => imageInputRef.current?.click()}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"
                                title="Attach image"
                              >
                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors active:scale-95"
                                title="Hold to record voice note"
                              >
                                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Send button - WhatsApp Style - Responsive */}
                        {(newMessage.trim() || uploadedAttachments.length > 0 || selectedFiles.length > 0) && (
                          <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex-shrink-0 transition-colors shadow-md active:scale-95"
                            title="Send message"
                          >
                            {sending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#efeae2] dark:bg-gray-900/50">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose a conversation from the list to start messaging</p>
                  <Button
                    onClick={() => {
                      loadAvailableSellers();
                      setShowNewThreadDialog(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Thread Dialog */}
      <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCreateThread();
            }}
            className="space-y-4 mt-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seller
              </label>
              {loadingSellers ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                </div>
              ) : (
                <select
                  value={newThreadSellerId}
                  onChange={(e) => setNewThreadSellerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select a seller...</option>
                  {availableSellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.storeName || seller.fullName} ({seller.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={newThreadSubject}
                onChange={(e) => setNewThreadSubject(e.target.value)}
                placeholder="e.g., Question about product availability"
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newThreadType}
                onChange={(e) => setNewThreadType(e.target.value as 'rfq' | 'message' | 'order')}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="message">General Message</option>
                <option value="rfq">RFQ (Request for Quote)</option>
                <option value="order">Order Related</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowNewThreadDialog(false);
                  setNewThreadSubject('');
                  setNewThreadSellerId('');
                  setNewThreadType('message');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newThreadSubject.trim() || !newThreadSellerId || loadingSellers}
              >
                {loadingSellers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Create Conversation'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxImage !== null}
        imageUrl={lightboxImage || ''}
        onClose={() => setLightboxImage(null)}
      />

      <Footer />
    </div>
  );
}
