# Inbox Backend Implementation

## Overview
Professional inbox messaging system for sellers with WebSocket support for real-time communication.

## Features

### Core Functionality
- ✅ Thread management (create, read, update, delete)
- ✅ Message sending with attachments
- ✅ **Voice notes support** (audio file uploads)
- ✅ File upload support (images, PDFs, documents, archives, audio)
- ✅ Read receipts and unread counts
- ✅ Thread status management (active, archived, resolved, closed)
- ✅ Search and filtering
- ✅ Pagination support
- ✅ Real-time WebSocket updates
- ✅ **Message editing** (edit sent messages)
- ✅ **Message deletion** (soft delete)
- ✅ **Message reactions** (emoji reactions)
- ✅ **Reply to messages** (reply to specific messages)
- ✅ **Forward messages** (forward to other threads)
- ✅ **Message status tracking** (sending, sent, delivered, read)

### WebSocket Features
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Thread updates
- ✅ Unread count updates
- ✅ User presence tracking
- ✅ Secure authentication

## API Endpoints

### Threads
- `GET /api/seller/inbox/threads` - Get all threads (with pagination, search, filters)
- `GET /api/seller/inbox/threads/:threadId` - Get single thread with messages
- `POST /api/seller/inbox/threads` - Create new thread
- `PUT /api/seller/inbox/threads/:threadId` - Update thread
- `DELETE /api/seller/inbox/threads/:threadId` - Delete thread
- `POST /api/seller/inbox/threads/:threadId/read` - Mark thread as read

### Messages
- `POST /api/seller/inbox/threads/:threadId/messages` - Send message (with file attachments, voice notes, replies, forwards)
- `PUT /api/seller/inbox/threads/:threadId/messages/:messageId` - Edit message
- `DELETE /api/seller/inbox/threads/:threadId/messages/:messageId` - Delete message (soft delete)
- `POST /api/seller/inbox/threads/:threadId/messages/:messageId/react` - Add/remove emoji reaction
- `POST /api/seller/inbox/threads/:threadId/messages/:messageId/forward` - Forward message to another thread
- `PUT /api/seller/inbox/threads/:threadId/messages/:messageId/status` - Update message status (delivered, read)

### File Upload
- `POST /api/seller/inbox/upload` - Upload attachments (max 5 files, 10MB each)

### Statistics
- `GET /api/seller/inbox/stats` - Get inbox statistics

## WebSocket Events

### Client → Server
- `join_thread` - Join a thread room to receive updates
- `leave_thread` - Leave a thread room
- `typing` - Send typing indicator

### Server → Client
- `new_message` - New message received in thread
- `thread_updated` - Thread status/content updated
- `user_typing` - User is typing in thread
- `unread_count_update` - Unread count changed
- `joined_thread` - Successfully joined thread
- `left_thread` - Successfully left thread
- `error` - Error occurred

## File Structure

```
server/
├── src/
│   ├── models/
│   │   └── MessageThread.ts          # MessageThread and Message models
│   ├── controllers/
│   │   └── inboxController.ts        # All inbox business logic
│   ├── routes/
│   │   └── inboxRoutes.ts           # API routes with file upload
│   └── services/
│       └── websocketService.ts      # WebSocket server implementation
└── uploads/
    └── inbox/                        # Inbox file uploads directory
```

## Database Models

### MessageThread
- `sellerId` - Reference to seller User
- `buyerId` - Reference to buyer User
- `subject` - Thread subject
- `type` - 'rfq' | 'message' | 'order'
- `status` - 'active' | 'archived' | 'resolved' | 'closed'
- `lastMessageAt` - Timestamp of last message
- `lastMessagePreview` - Preview text of last message
- `sellerUnreadCount` - Unread count for seller
- `buyerUnreadCount` - Unread count for buyer
- `relatedOrderId` - Optional order reference
- `relatedRfqId` - Optional RFQ reference

### Message
- `threadId` - Reference to MessageThread
- `senderId` - Reference to User (seller or buyer)
- `senderType` - 'seller' | 'buyer'
- `content` - Message text content
- `attachments` - Array of file attachments (supports voice notes with duration)
- `readBy` - Array of user IDs who read the message
- `readAt` - Timestamp when read
- `status` - Message status: 'sending' | 'sent' | 'delivered' | 'read'
- `isEdited` - Boolean indicating if message was edited
- `isDeleted` - Boolean indicating if message was deleted (soft delete)
- `editedAt` - Timestamp when message was edited
- `deletedAt` - Timestamp when message was deleted
- `replyTo` - Reference to message being replied to
- `forwardedFrom` - Object containing forwarded message info (threadId, messageId, originalSender)
- `reactions` - Array of emoji reactions with user IDs

## File Upload

### Supported File Types
- Images: JPEG, JPG, PNG, GIF, WEBP
- Documents: PDF, DOC, DOCX, TXT
- Spreadsheets: CSV, XLS, XLSX
- Archives: ZIP, RAR
- **Audio (Voice Notes)**: MP3, WAV, M4A, OGG, WEBM, AAC, FLAC, OPUS

### Limits
- Max file size: 10MB per file
- Max files per message: 5 files
- Total upload directory: `uploads/inbox/`

## Security

### Authentication
- All routes require JWT authentication
- Only sellers and admins can access inbox
- Users can only access their own threads

### Authorization
- Thread ownership verified on all operations
- File uploads validated (type and size)
- WebSocket connections authenticated via JWT

## Advanced Messaging Features

### Voice Notes
Voice notes are supported as audio file attachments. When uploading, include the `duration` field (in seconds) for proper display:

```javascript
POST /api/seller/inbox/upload
Content-Type: multipart/form-data

attachments: [audio.mp3]
duration: 45.5  // Duration in seconds
```

### Message Reactions
Add or remove emoji reactions to messages:

```javascript
POST /api/seller/inbox/threads/:threadId/messages/:messageId/react
{
  "emoji": "👍"
}
```

### Reply to Messages
Reply to a specific message in a thread:

```javascript
POST /api/seller/inbox/threads/:threadId/messages
{
  "content": "Thanks for the quote!",
  "replyTo": "message-id-to-reply-to"
}
```

### Forward Messages
Forward a message to another thread:

```javascript
POST /api/seller/inbox/threads/:threadId/messages/:messageId/forward
{
  "targetThreadId": "target-thread-id"
}
```

### Edit Messages
Edit a sent message (only sender can edit):

```javascript
PUT /api/seller/inbox/threads/:threadId/messages/:messageId
{
  "content": "Updated message content"
}
```

### Delete Messages
Soft delete a message (only sender can delete):

```javascript
DELETE /api/seller/inbox/threads/:threadId/messages/:messageId
```

### Message Status
Update message delivery status:

```javascript
PUT /api/seller/inbox/threads/:threadId/messages/:messageId/status
{
  "status": "read"  // or "delivered"
}
```

## Usage Examples

### Create Thread
```javascript
POST /api/seller/inbox/threads
{
  "buyerId": "507f1f77bcf86cd799439011",
  "subject": "RFQ: 500 units of Wireless Headphones",
  "type": "rfq"
}
```

### Send Message with Files
```javascript
POST /api/seller/inbox/threads/:threadId/messages
Content-Type: multipart/form-data

content: "Here's the quote you requested"
attachments: [file1.pdf, file2.jpg]
```

### WebSocket Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  socket.emit('join_thread', { threadId: 'thread-id' });
});

socket.on('new_message', (data) => {
  console.log('New message:', data.message);
});
```

## Environment Variables

No additional environment variables required. Uses existing:
- `JWT_SECRET` - For WebSocket authentication
- `CLIENT_URL` - For CORS (defaults to http://localhost:5173)

## Dependencies

- `socket.io` - WebSocket server
- `multer` - File upload handling
- `zod` - Input validation
- `mongoose` - Database ODM

## Testing

To test the inbox system:

1. Start the server: `npm run dev`
2. Authenticate as a seller
3. Create a thread via API
4. Send messages with attachments
5. Connect via WebSocket to receive real-time updates

## Notes

- WebSocket server runs on the same port as HTTP server
- File uploads are stored in `uploads/inbox/` directory
- All timestamps are in UTC
- Messages are paginated (default 50 per page)
- Threads are paginated (default 20 per page)

