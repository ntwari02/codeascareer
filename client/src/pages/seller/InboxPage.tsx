import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  Search,
  Filter,
  Mail,
  User,
  AlertCircle,
  Paperclip,
  Mic,
  Send,
  Smile,
  Edit2,
  Trash2,
  Reply,
  Image as ImageIcon,
  FileText,
  Play,
  X,
  Loader2,
  Plus,
} from 'lucide-react';
import { inboxAPI, Message, MessageThread, MessageAttachment } from '@/services/inboxApi';
import { websocketService } from '@/services/websocketService';
import { useToastStore } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AudioWave } from '@/components/AudioWave';
import { ImageLightbox } from '@/components/ImageLightbox';
import { UploadProgress } from '@/components/UploadProgress';

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

const InboxPage: React.FC = () => {
  const { showToast } = useToastStore();
  const { user } = useAuthStore();
  
  // State
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus] = useState<string>('');
  const [filterType] = useState<string>('');
  
  // Message composer state
  const [messageContent, setMessageContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<MessageAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<Map<string, number>>(new Map());
  const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map());
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, File>>(new Map());
  
  // New thread dialog state
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [newThreadSubject, setNewThreadSubject] = useState('');
  const [newThreadBuyerId, setNewThreadBuyerId] = useState('');
  const [newThreadType, setNewThreadType] = useState<'rfq' | 'message' | 'order'>('message');
  const [availableBuyers, setAvailableBuyers] = useState<any[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  
  // Image lightbox state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Audio playing state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  // Real-time indicators state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [isRecordingIndicator, setIsRecordingIndicator] = useState(false);
  const [recordingUserId, setRecordingUserId] = useState<string | null>(null);
  const [recordingDurationIndicator, setRecordingDurationIndicator] = useState(0);
  const [isSelectingFile, setIsSelectingFile] = useState(false);
  const [selectingFileUserId, setSelectingFileUserId] = useState<string | null>(null);
  const [selectingFileName, setSelectingFileName] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load threads
  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await inboxAPI.getThreads({
        search: searchQuery || undefined,
        status: filterStatus || undefined,
        type: filterType || undefined,
        page: 1,
        limit: 50,
      });
      setThreads(response.threads);
    } catch (error: any) {
      showToast(error.message || 'Failed to load threads', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus, filterType, showToast]);

  // Load thread messages
  const loadThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await inboxAPI.getThread(threadId);
      setActiveThread(response.thread);
      setMessages(response.messages || []);
      
      // Mark as read
      await inboxAPI.markThreadAsRead(threadId);
      
      // Join WebSocket room
      websocketService.joinThread(threadId);
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Load messages error:', error);
      showToast(error.message || 'Failed to load messages', 'error');
      setMessages([]);
    }
  }, [showToast]);

  // Send message
  const handleSendMessage = async () => {
    if (!activeThread) return;
    if (sending) return;
    
    // If recording, stop it first
    if (isRecording) {
      stopRecording();
      // Wait a bit for the recording to finish processing
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Check if we have content to send
    if (!messageContent.trim() && uploadedAttachments.length === 0 && selectedFiles.length === 0) {
      return;
    }

    try {
      setSending(true);
      
      // Upload remaining files if any (voice notes or files that weren't auto-uploaded)
      let attachments = [...uploadedAttachments];
      const remainingFiles = selectedFiles.filter(f => !uploadedAttachments.some(a => a.originalName === f.name));
      
      if (remainingFiles.length > 0) {
        try {
          const uploaded = await inboxAPI.uploadFiles(
            remainingFiles,
            recordingDuration > 0 ? recordingDuration : undefined,
            (progress) => {
              // Overall progress for remaining files
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
      const messageText = messageContent.trim();
      await inboxAPI.sendMessage(activeThread._id, {
        content: messageText || '', // Empty string is allowed if attachments exist
        attachments,
        replyTo: replyTo?._id,
      });

      // Clear composer
      setMessageContent('');
      setSelectedFiles([]);
      setUploadedAttachments([]);
      setReplyTo(null);
      setRecordingDuration(0);
      setIsRecording(false);
      setUploadProgress(new Map());
      setUploadErrors(new Map());
      setUploadingFiles(new Map());
      
      // Reload messages
      await loadThreadMessages(activeThread._id);
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
      const uploaded = await inboxAPI.uploadFiles(
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

  // Handle voice note recording
  const recordingCompleteRef = useRef<((file: File) => void) | null>(null);
  
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
        // Use functional update to ensure we get the latest selectedFiles
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
      const hasText = messageContent.trim().length > 0;
      
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
        
        if (recordedFile && activeThread) {
          // Auto-upload and send the voice note
          try {
            const uploaded = await inboxAPI.uploadFiles(
              [recordedFile],
              currentDuration,
              (progress) => {
                setUploadProgress(prev => new Map(prev).set('voice-sending', progress));
              }
            );
            
            // Send message with voice note only
            if (uploaded.length > 0) {
              await inboxAPI.sendMessage(activeThread._id, {
                content: '',
                attachments: uploaded,
              });
              
              // Clear voice note files
              setSelectedFiles(prev => prev.filter(f => f !== recordedFile));
              setUploadedAttachments([]);
              setRecordingDuration(0);
              setUploadProgress(new Map());
              
              // Reload messages
              await loadThreadMessages(activeThread._id);
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
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      // Remove any voice note files that were just recorded
      setSelectedFiles(prev => prev.filter(file => !file.name.startsWith('voice-')));
      
      // Stop recording indicator
      if (activeThread) {
        websocketService.sendRecording(activeThread._id, false);
      }
    }
  };

  // Format recording duration as MM:SS
  const formatRecordingDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Edit message
  const handleEditMessage = async (message: Message, newContent: string) => {
    if (!activeThread) return;
    try {
      await inboxAPI.editMessage(activeThread._id, message._id, newContent);
      await loadThreadMessages(activeThread._id);
      setEditingMessage(null);
      showToast('Message updated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to edit message', 'error');
    }
  };

  // Delete message
  const handleDeleteMessage = async (message: Message) => {
    if (!activeThread) return;
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await inboxAPI.deleteMessage(activeThread._id, message._id);
      await loadThreadMessages(activeThread._id);
      showToast('Message deleted', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete message', 'error');
    }
  };

  // React to message
  const handleReactToMessage = async (message: Message, emoji: string) => {
    if (!activeThread) return;
    try {
      await inboxAPI.reactToMessage(activeThread._id, message._id, emoji);
      await loadThreadMessages(activeThread._id);
    } catch (error: any) {
      showToast(error.message || 'Failed to react', 'error');
    }
  };

  // Forward message (can be used later with a dialog to select target thread)
  // const handleForwardMessage = async (message: Message, targetThreadId: string) => {
  //   if (!activeThread) return;
  //   try {
  //     await inboxAPI.forwardMessage(activeThread._id, message._id, targetThreadId);
  //     showToast('Message forwarded', 'success');
  //   } catch (error: any) {
  //     showToast(error.message || 'Failed to forward message', 'error');
  //   }
  // };

  // Load available buyers (for creating new thread)
  const loadAvailableBuyers = async () => {
    try {
      setLoadingBuyers(true);
      const response = await inboxAPI.getBuyers();
      const buyers = response.buyers || [];
      setAvailableBuyers(buyers);
      
      if (buyers.length === 0) {
        showToast('No buyers available. Please try again later.', 'info');
      }
    } catch (error: any) {
      console.error('Load buyers error:', error);
      const errorMessage = error.message || 'Failed to load buyers';
      
      // Only show fallback buyers in development, not in production
      if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
        showToast('Unable to load buyers. Please check your connection.', 'error');
        setAvailableBuyers([]);
      } else {
        // Fallback to test buyers if API fails with other errors (for development)
        setAvailableBuyers([
          { _id: 'buyer1', fullName: 'Acme Corp', email: 'buyer1@test.com' },
          { _id: 'buyer2', fullName: 'Global Retailers Ltd', email: 'buyer2@test.com' },
          { _id: 'buyer3', fullName: 'Startup Hub', email: 'buyer3@test.com' },
        ]);
      }
    } finally {
      setLoadingBuyers(false);
    }
  };

  // Create new thread
  const handleCreateThread = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Validate fields
    if (!newThreadSubject.trim()) {
      showToast('Please enter a subject', 'error');
      return;
    }

    if (!newThreadBuyerId) {
      showToast('Please select a buyer', 'error');
      return;
    }

    try {
      const response = await inboxAPI.createThread({
        buyerId: newThreadBuyerId,
        subject: newThreadSubject.trim(),
        type: newThreadType,
      });

      setShowNewThreadDialog(false);
      setNewThreadSubject('');
      setNewThreadBuyerId('');
      setNewThreadType('message');

      // Load the new thread
      await loadThreadMessages(response.thread._id);
      setActiveThread(response.thread);
      await loadThreads();
      
      showToast('Thread created successfully', 'success');
    } catch (error: any) {
      console.error('Create thread error:', error);
      const errorMessage = error.message || 'Failed to create thread';
      
      // Show specific error messages
      if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        showToast('Please fill in all required fields correctly', 'error');
      } else if (!errorMessage.includes('Network error') && !errorMessage.includes('Failed to fetch')) {
        showToast(errorMessage, 'error');
      }
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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

  // WebSocket setup
  useEffect(() => {
    // Connect WebSocket
    websocketService.connect();

    // Setup event handlers
    websocketService.onNewMessage = (threadId: string, message: Message) => {
      if (activeThread?._id === threadId) {
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          const newMessages = [...prev, message];
          // Auto-scroll to bottom for new messages (especially voice notes)
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return newMessages;
        });
      }
      loadThreads(); // Refresh thread list
      
      // Show notification if message is from buyer and not in active thread
      if (message.senderType === 'buyer' && activeThread?._id !== threadId) {
        const thread = threads.find(t => t._id === threadId);
        const buyerName = typeof thread?.buyerId === 'object' 
          ? (thread.buyerId.fullName || 'Buyer')
          : 'Buyer';
        showNotification(
          buyerName,
          message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          typeof thread?.buyerId === 'object' ? resolveAvatarUrl(thread.buyerId.avatarUrl) : undefined
        );
        showToast(`New message from ${buyerName}`, 'info');
      }
    };

    websocketService.onThreadUpdate = (threadId: string, _update?: any, lastMessage?: any) => {
      if (activeThread?._id === threadId) {
        if (lastMessage) {
          setMessages((prev) => {
            if (prev.some(m => m._id === lastMessage._id)) {
              return prev;
            }
            const newMessages = [...prev, lastMessage];
            // Auto-scroll for voice notes and new messages
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            return newMessages;
          });
        } else {
          loadThreadMessages(threadId);
        }
      }
      loadThreads();
    };

    // Cleanup
    return () => {
      if (activeThread) {
        websocketService.leaveThread(activeThread._id);
      }
    };
  }, [activeThread, loadThreads, loadThreadMessages, threads, showToast]);

  // Initial load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Typing indicator
  const handleTyping = () => {
    if (!activeThread) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    websocketService.sendTyping(activeThread._id, true);
    
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(activeThread._id, false);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 flex items-center gap-3 sm:gap-4">
          {/* User Profile Avatar */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-md">
            {user?.avatar_url ? (
              <img
                src={resolveAvatarUrl(user.avatar_url) || ''}
                alt={user.full_name || user.email || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-400 flex-shrink-0" />
              <span className="truncate">Inbox & RFQ Communications</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm transition-colors duration-300">
              Central place for buyer messages, RFQs, and negotiation threads.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            loadAvailableBuyers();
            setShowNewThreadDialog(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-xs sm:text-sm font-semibold text-white transition-colors active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Conversation</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Layout - Responsive */}
      <div className="flex-1 min-h-0 bg-white/60 dark:bg-gray-900/60 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] h-full">
          {/* Thread list - Responsive - Show/hide based on activeThread on mobile */}
          <div className={`border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700/60 flex flex-col min-h-0 ${activeThread ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-3 sm:p-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-3 h-3" />
                Filters
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                </div>
              ) : threads.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">No conversations yet</p>
                  <p className="text-xs opacity-75 mb-4">
                    {searchQuery ? 'Try adjusting your search' : 'Start a new conversation with a buyer to get started'}
                  </p>
                  {!searchQuery && (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            await inboxAPI.seedTestThreads();
                            await loadThreads();
                            showToast('Test threads created! You can now start chatting.', 'success');
                          } catch (error: any) {
                            showToast(error.message || 'Failed to create test threads', 'error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs font-semibold text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Create Test Threads
                      </button>
                      <span className="text-[10px] opacity-60">or</span>
                      <button
                        onClick={() => {
                          loadAvailableBuyers();
                          setShowNewThreadDialog(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-xs font-semibold text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Start New Conversation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                threads.map((thread) => {
                  const isActive = thread._id === activeThread?._id;
                  const buyer = typeof thread.buyerId === 'object' ? thread.buyerId : null;
                return (
                  <button
                      key={thread._id}
                      onClick={() => loadThreadMessages(thread._id)}
                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2 sm:gap-3 border-b border-gray-100 dark:border-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-800/60 active:bg-gray-100 dark:active:bg-gray-800/80 transition-colors ${
                        isActive ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    {/* Buyer Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                        {buyer?.avatarUrl ? (
                          <img
                            src={resolveAvatarUrl(buyer.avatarUrl) || ''}
                            alt={buyer.fullName || 'Buyer'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {(buyer?.fullName || 'B')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      {thread.type === 'rfq' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <Mail className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {buyer?.fullName || 'Buyer'}
                        </p>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTime(thread.lastMessageAt)}
                          </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{thread.subject}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {thread.lastMessagePreview}
                        </p>
                        <div className="flex items-center gap-1">
                          {thread.sellerUnreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
                })
              )}
            </div>
          </div>

          {/* Conversation detail - Responsive */}
          <div className={`flex flex-col min-h-0 w-full ${activeThread ? 'flex' : 'hidden lg:flex'}`}>
            {activeThread ? (
              <>
                {/* Thread header - Responsive with back button on mobile */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between gap-2 sm:gap-3 bg-white dark:bg-gray-900/50">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => {
                        setActiveThread(null);
                        setMessages([]);
                      }}
                      className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                      aria-label="Back to conversations"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                        {typeof activeThread.buyerId === 'object' && activeThread.buyerId.avatarUrl ? (
                          <img
                            src={resolveAvatarUrl(activeThread.buyerId.avatarUrl) || ''}
                            alt={activeThread.buyerId.fullName}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        )}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {typeof activeThread.buyerId === 'object' ? activeThread.buyerId.fullName : 'Buyer'}
                        </p>
                        <span className="text-[10px] text-green-500 hidden sm:inline">●</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{activeThread.subject}</p>
                </div>
              </div>
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {activeThread.type === 'rfq' && (
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60">
                  <AlertCircle className="w-3 h-3" />
                  View RFQ
                </button>
                    )}
                    <button
                      onClick={() => inboxAPI.updateThread(activeThread._id, { status: 'resolved' })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60"
                    >
                  <Mail className="w-3 h-3" />
                  Mark as resolved
                </button>
              </div>
            </div>

                {/* Messages area - Responsive */}
                <div 
                  className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-2 sm:px-3 md:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 bg-gray-50/60 dark:bg-gray-900/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:dark:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600" 
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4d4d4\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                  }}
                >
                  {messages.map((message) => {
                    const isSeller = message.senderType === 'seller';
                    const isDeleted = message.isDeleted;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex items-start gap-1 sm:gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-xl ${isSeller ? 'ml-auto justify-end' : ''}`}
                      >
                        {!isSeller && (
                          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100 flex-shrink-0">
                            {typeof message.senderId === 'object' && message.senderId.avatarUrl ? (
                              <img
                                src={resolveAvatarUrl(message.senderId.avatarUrl) || ''}
                                alt={message.senderId.fullName}
                                className="w-7 h-7 rounded-full"
                              />
                            ) : (
                              (typeof message.senderId === 'object' ? message.senderId.fullName : 'U')[0].toUpperCase()
                            )}
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          {message.replyTo && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-red-500">
                              Replying to message
                            </div>
                          )}
                          <div
                            className={`px-3 py-2 rounded-2xl text-xs shadow-sm ${
                              isSeller
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                            }`}
                          >
                            {isDeleted ? (
                              <span className="italic opacity-60">This message was deleted</span>
                            ) : editingMessage?._id === message._id ? (
                              <input
                                type="text"
                                defaultValue={message.content}
                                onBlur={(e) => {
                                  if (e.target.value !== message.content) {
                                    handleEditMessage(message, e.target.value);
                                  }
                                  setEditingMessage(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleEditMessage(message, e.currentTarget.value);
                                    setEditingMessage(null);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingMessage(null);
                                  }
                                }}
                                className="w-full bg-transparent border-none outline-none"
                                autoFocus
                              />
                            ) : (
                              <>
                                {/* Only show text content if it exists and is not just placeholder */}
                                {message.content && message.content.trim() && message.content !== '📎 Attachment' && (
                                  <p>{message.content}</p>
                                )}
                                {/* Show attachments */}
                                {message.attachments && message.attachments.length > 0 && message.attachments.map((att, idx) => (
                                  <div key={idx} className="mt-2">
                                    {att.type === 'voice' ? (
                                      <div className="flex items-center gap-2 p-2 bg-black/20 dark:bg-white/10 rounded-lg">
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
                                          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
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
                                              className="text-red-500"
                                            />
                                            <span className="text-[10px] text-gray-600 dark:text-gray-400">
                                              {att.duration}s
                                            </span>
                </div>
                                          <audio 
                                            id={`audio-${message._id}-${idx}`}
                                            src={getFileUrl(att.path)} 
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
                                    ) : att.type === 'image' ? (
                                      <div className="mt-2 -mx-1 -my-1 first:mt-0">
                                        <img
                                          src={getFileUrl(att.path)}
                                          alt={att.originalName}
                                          className="max-w-[200px] sm:max-w-xs rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                                          onClick={() => setLightboxImage(getFileUrl(att.path))}
                                          loading="lazy"
                                          onError={(e) => {
                                            console.error('Image load error:', att.path);
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <a
                                        href={getFileUrl(att.path)}
                                        download={att.originalName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors mt-2"
                                        onClick={(e) => {
                                          // Force download
                                          const link = document.createElement('a');
                                          link.href = getFileUrl(att.path);
                                          link.download = att.originalName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          e.preventDefault();
                                        }}
                                      >
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <span className="text-[10px] font-medium block truncate">{att.originalName}</span>
                                          {att.size && (
                                            <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                              {(att.size / 1024).toFixed(1)} KB
                                            </span>
                                          )}
                                        </div>
                                      </a>
                                    )}
                                  </div>
                                ))}
                                {message.reactions.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {message.reactions.map((reaction, idx) => (
                                      <span
                                        key={idx}
                                        className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded"
                                      >
                                        {reaction.emoji}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 ${isSeller ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                            {message.isEdited && <span className="italic opacity-75">(edited)</span>}
                            {isSeller && message.status && (
                              <span className="opacity-75">
                                {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                              </span>
                            )}
                            {isSeller && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleReactToMessage(message, '👍')}
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
                                >
                                  <Smile className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setReplyTo(message)}
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
                                >
                                  <Reply className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setEditingMessage(message)}
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message)}
                                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                </div>
              </div>
                </div>
                    );
                  })}
                  {/* Real-time Indicators */}
                  {isTyping && typingUserId && (
                    <div className="flex items-center gap-2 justify-start py-2">
                      <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2">typing...</span>
                      </div>
                    </div>
                  )}
                  {isRecordingIndicator && recordingUserId && (
                    <div className="flex items-center gap-2 justify-start py-2">
                      <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Recording voice note... {recordingDurationIndicator > 0 && `${formatRecordingDuration(recordingDurationIndicator)}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {isSelectingFile && selectingFileUserId && (
                    <div className="flex items-center gap-2 justify-start py-2">
                      <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[11px] text-gray-800 dark:text-gray-100 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500 animate-pulse" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          Selecting a file{selectingFileName ? `: ${selectingFileName}` : '...'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer - Responsive */}
                <div className="border-t border-gray-200 dark:border-gray-700/60 px-2 sm:px-3 md:px-4 py-2 sm:py-3 bg-white/90 dark:bg-gray-900/90">
                  {replyTo && (
                    <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-[11px] flex items-center justify-between">
                      <span>Replying to: {replyTo.content.substring(0, 50)}...</span>
                      <button onClick={() => setReplyTo(null)} className="text-gray-500">
                        <X className="w-3 h-3" />
                      </button>
              </div>
                  )}
                  {/* Upload Progress */}
                  {Array.from(uploadingFiles.entries()).map(([fileId, file]) => (
                    <div key={fileId} className="mb-2">
                      <UploadProgress
                        fileName={file.name}
                        progress={uploadProgress.get(fileId) || 0}
                        error={uploadErrors.get(fileId)}
                        onRetry={() => retryUpload(fileId)}
                        onCancel={() => {
                          setUploadingFiles(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(fileId);
                            return newMap;
                          });
                          setSelectedFiles(prev => prev.filter(f => f !== file));
                        }}
                      />
                </div>
                  ))}
                  {selectedFiles.filter(f => !Array.from(uploadingFiles.values()).includes(f)).length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {selectedFiles.filter(f => !Array.from(uploadingFiles.values()).includes(f)).map((file, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-[10px] border border-gray-200 dark:border-gray-700">
                          <span className="truncate max-w-[100px]">{file.name}</span>
                          <button
                            onClick={() => {
                              setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                              setUploadedAttachments(prev => prev.filter(a => a.originalName !== file.name));
                            }}
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
                    <input
                      ref={voiceInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {/* Recording Mode UI */}
                    {isRecording ? (
                      <>
                        <button
                          onClick={cancelRecording}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-500 flex-shrink-0"
                          title="Cancel recording"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1 flex items-center justify-between bg-gray-100 dark:bg-gray-800 border border-red-500 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-red-500">
                              Recording: {formatRecordingDuration(recordingDuration)}
                </span>
              </div>
                          <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex-shrink-0"
                            title="Send voice note"
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Normal Mode UI */}
                        <div className="flex-1 relative">
                <textarea
                  rows={2}
                            placeholder="Type your reply..."
                            value={messageContent}
                            onChange={(e) => {
                              setMessageContent(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-20 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          />
                          {/* Icons inside textarea (shown when no text) */}
                          {!messageContent.trim() && (
                            <div className="absolute right-2 bottom-2 flex items-center gap-1">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"
                                title="Attach file"
                              >
                                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => imageInputRef.current?.click()}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-95"
                                title="Attach image"
                              >
                                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors active:scale-95"
                                title="Hold to record voice note"
                              >
                                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Send button (shown when typing or has attachments) */}
                        {(messageContent.trim() || uploadedAttachments.length > 0 || selectedFiles.length > 0) && (
                          <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex-shrink-0"
                            title="Send message"
                          >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6 sm:p-8">
                <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Select a conversation</p>
                <p className="text-xs sm:text-sm opacity-75 mb-4 sm:mb-6 text-center max-w-xs px-4">
                  Choose a conversation from the list to view messages and start chatting
                </p>
                <button
                  onClick={() => {
                    loadAvailableBuyers();
                    setShowNewThreadDialog(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-xs sm:text-sm font-semibold text-white transition-colors active:scale-95"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Start New Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Thread Dialog */}
      <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleCreateThread}
            className="space-y-4 mt-4"
            noValidate
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buyer
              </label>
              {loadingBuyers ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                </div>
              ) : availableBuyers.length === 0 ? (
                <div className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  No buyers available. Please try again later.
                </div>
              ) : (
                <select
                  value={newThreadBuyerId}
                  onChange={(e) => setNewThreadBuyerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  aria-required="true"
                >
                  <option value="">Select a buyer...</option>
                  {availableBuyers.map((buyer) => (
                    <option key={buyer._id} value={buyer._id}>
                      {buyer.fullName} ({buyer.email})
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
                placeholder="e.g., RFQ: 500 units of Wireless Headphones"
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                aria-required="true"
                minLength={3}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={newThreadType}
                onChange={(e) => setNewThreadType(e.target.value as 'rfq' | 'message' | 'order')}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="message">General Message</option>
                <option value="rfq">RFQ (Request for Quote)</option>
                <option value="order">Order Related</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowNewThreadDialog(false);
                  setNewThreadSubject('');
                  setNewThreadBuyerId('');
                  setNewThreadType('message');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newThreadSubject.trim() || !newThreadBuyerId || loadingBuyers || availableBuyers.length === 0}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-all active:scale-95"
              >
                {loadingBuyers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : availableBuyers.length === 0 ? (
                  'No Buyers Available'
                ) : (
                  'Create Thread'
                )}
              </button>
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
    </div>
  );
};

export default InboxPage;
