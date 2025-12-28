/**
 * Buyer Inbox API Service
 * Handles all buyer inbox-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication headers with token
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API response with better error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      if (response.status === 0 || response.statusText === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = `Error: ${response.status} ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export interface MessageAttachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  type?: 'file' | 'voice' | 'image';
  duration?: number;
  uploadedAt: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  threadId: string;
  senderId: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  senderType: 'seller' | 'buyer';
  content: string;
  attachments: MessageAttachment[];
  readBy: string[];
  readAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  editedAt?: string;
  replyTo?: string | {
    _id: string;
    content: string;
    senderId: any;
    senderType: string;
  };
  forwardedFrom?: {
    threadId: string;
    messageId: string;
    originalSender: string;
  };
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  _id: string;
  sellerId: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    storeName?: string;
  };
  buyerId: string;
  subject: string;
  type: 'rfq' | 'message' | 'order';
  relatedOrderId?: string;
  relatedRfqId?: string;
  status: 'active' | 'archived' | 'resolved' | 'closed';
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  sellerUnreadCount: number;
  buyerUnreadCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Buyer Inbox API Service
 */
export const buyerInboxAPI = {
  /**
   * Get all threads for the buyer
   */
  async getThreads(params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ threads: MessageThread[]; pagination: any }>(response);
  },

  /**
   * Get a single thread with messages
   */
  async getThread(threadId: string, page?: number, limit?: number) {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ thread: MessageThread; messages: Message[]; pagination: any }>(response);
  },

  /**
   * Create a new thread
   */
  async createThread(data: {
    sellerId: string;
    subject: string;
    type?: 'rfq' | 'message' | 'order';
    relatedOrderId?: string;
    relatedRfqId?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ thread: MessageThread }>(response);
  },

  /**
   * Send a message in a thread
   */
  async sendMessage(
    threadId: string,
    data: {
      content: string;
      attachments?: MessageAttachment[];
      replyTo?: string;
      forwardedFrom?: {
        threadId: string;
        messageId: string;
      };
    }
  ) {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.attachments && data.attachments.length > 0) {
      // If attachments are already uploaded, send as JSON
      formData.append('attachments', JSON.stringify(data.attachments));
    }
    
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }
    
    if (data.forwardedFrom) {
      formData.append('forwardedFrom', JSON.stringify(data.forwardedFrom));
    }

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: formData,
    });
    return handleResponse<{ message: Message }>(response);
  },

  /**
   * Upload files (attachments or voice notes) with progress tracking
   */
  async uploadFiles(
    files: File[], 
    duration?: number,
    onProgress?: (progress: number) => void
  ): Promise<MessageAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('attachments', file);
    });
    if (duration) {
      formData.append('duration', duration.toString());
    }

    const token = localStorage.getItem('auth_token');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.files || []);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      xhr.open('POST', `${API_BASE_URL}/buyer/inbox/upload`);
      xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      xhr.send(formData);
    });
  },

  /**
   * Mark thread as read
   */
  async markThreadAsRead(threadId: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  },

  /**
   * Update thread (status, subject, etc.)
   */
  async updateThread(threadId: string, data: { status?: string; subject?: string }) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<{ thread: MessageThread }>(response);
  },

  /**
   * Delete thread
   */
  async deleteThread(threadId: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  },

  /**
   * Edit a message
   */
  async editMessage(threadId: string, messageId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/messages/${messageId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    return handleResponse<{ message: Message }>(response);
  },

  /**
   * Delete a message
   */
  async deleteMessage(threadId: string, messageId: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ message: string }>(response);
  },

  /**
   * React to a message
   */
  async reactToMessage(threadId: string, messageId: string, emoji: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/messages/${messageId}/react`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ emoji }),
    });
    return handleResponse<{ message: Message; reactions: MessageReaction[] }>(response);
  },

  /**
   * Forward a message
   */
  async forwardMessage(threadId: string, messageId: string, targetThreadId: string) {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/threads/${threadId}/messages/${messageId}/forward`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ targetThreadId }),
    });
    return handleResponse<{ message: Message }>(response);
  },

  /**
   * Get inbox statistics
   */
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{
      totalThreads: number;
      unreadThreads: number;
      activeThreads: number;
      archivedThreads: number;
    }>(response);
  },

  /**
   * Get available sellers (for creating new threads)
   */
  async getSellers() {
    const response = await fetch(`${API_BASE_URL}/buyer/inbox/sellers`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<{ sellers: any[] }>(response);
  },
};

