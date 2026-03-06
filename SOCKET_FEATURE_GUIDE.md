# Backendify Socket.io Chat Feature 💬

## Overview
Backendify now automatically detects chat/messaging patterns in your frontend and generates a complete **Socket.io real-time backend** infrastructure!

## What Gets Generated

### 1. Socket.io Server (`socket/index.js`)
- Full Socket.io server with authentication middleware
- Room/channel management
- Online presence tracking
- Typing indicators
- Message delivery & read receipts
- File sharing support
- Rate limiting

### 2. Chat Models
- **Message Model** (`models/Message.js`)
  - Text, image, video, audio, file messages
  - Read receipts
  - Reactions
  - Message editing/deletion
  - Reply/thread support

- **Conversation Model** (`models/Conversation.js`)
  - Direct chats
  - Group conversations
  - Channel support
  - Admin management
  - Muted/archived conversations
  - Pinned messages

### 3. REST API Routes (`routes/chat.routes.js`)
- GET /api/chat/conversations - List all conversations
- POST /api/chat/conversations - Create conversation
- GET /api/chat/conversations/:id/messages - Get message history
- POST /api/chat/conversations/:id/messages - Send message (REST fallback)
- PUT /api/chat/messages/:id - Edit message
- DELETE /api/chat/messages/:id - Delete message

### 4. Socket.io Events

#### Client → Server:
- `conversation:join` - Join a room
- `conversation:leave` - Leave a room
- `message:send` - Send message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:read` - Mark as read
- `messages:fetch` - Fetch history

#### Server → Client:
- `message:new` - New message received
- `message:sent` - Confirmation
- `typing:update` - Someone is typing
- `user:online` - User came online
- `user:offline` - User went offline
- `message:read:update` - Read receipt
- `conversation:new` - New conversation created

## Detection Patterns

Backendify automatically detects:

### Socket.io/WebSocket:
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

// or
const ws = new WebSocket('ws://localhost:8080');
```

### Chat UI Components:
```javascript
function sendMessage() { ... }
function MessageList() { ... }
const [messages, setMessages] = useState([]);
```

### Event Patterns:
```javascript
socket.emit('message', data);
socket.on('message', callback);
socket.send('chat:message', data);
```

### Presence/Typing:
```javascript
const [isTyping, setIsTyping] = useState(false);
const [onlineUsers, setOnlineUsers] = useState([]);
```

## Frontend Integration Example

```javascript
import io from 'socket.io-client';
import { useState, useEffect } from 'react';

const ChatApp = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Connect to Socket.io with JWT token
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io');
    });

    // Join conversation
    newSocket.emit('conversation:join', { conversationId: 'abc123' });

    // Listen for new messages
    newSocket.on('message:new', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Listen for typing indicators
    newSocket.on('typing:update', (data) => {
      console.log(`${data.userId} is ${data.isTyping ? 'typing' : 'not typing'}`);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (socket && inputText.trim()) {
      socket.emit('message:send', {
        conversationId: 'abc123',
        content: inputText,
        type: 'text',
        tempId: Date.now() // For optimistic UI
      });
      setInputText('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing:start', { conversationId: 'abc123' });
      
      // Stop typing after 2 seconds
      setTimeout(() => {
        socket.emit('typing:stop', { conversationId: 'abc123' });
      }, 2000);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg._id}>
            <strong>{msg.sender.name}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      <input
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
```

## Environment Variables

Add these to your `.env` file:

```bash
# JWT for Socket.io authentication
JWT_SECRET=your_super_secret_key

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000

# Socket.io configuration
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

## Features Included

✅ **Real-time Messaging** - Instant message delivery
✅ **Authentication** - JWT-based socket authentication
✅ **Rooms/Channels** - Group conversations support
✅ **Online Presence** - Track who's online/offline
✅ **Typing Indicators** - See when someone is typing
✅ **Read Receipts** - Know when messages are read
✅ **Message History** - Persistent storage in MongoDB
✅ **File Sharing** - Send images, videos, files
✅ **Message Reactions** - Add emoji reactions
✅ **Message Editing** - Edit/delete messages
✅ **Direct Chats** - 1-on-1 conversations
✅ **Group Chats** - Multiple participants
✅ **REST API Fallback** - Works without WebSocket

## How It Works

1. **Detection Phase**: Backendify scans your frontend code for:
   - Socket.io client imports
   - WebSocket connections
   - Chat-related component names
   - Message sending/receiving patterns
   - Presence tracking code

2. **Generation Phase**: If chat patterns are detected, generates:
   - Socket.io server with all event handlers
   - Message and Conversation Mongoose models
   - REST API routes for chat
   - Updated server.js with Socket.io integration
   - Socket.io dependencies in package.json

3. **Integration**: Automatically:
   - Creates HTTP server wrapper
   - Initializes Socket.io with CORS
   - Adds authentication middleware
   - Registers chat routes
   - Updates environment variables

## Testing

```bash
# Install dependencies
cd backend
npm install

# Start server
npm run dev

# Test Socket.io connection
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
socket.on('connect', () => console.log('Connected!'));
"
```

## Production Deployment

The Socket.io backend is production-ready with:
- Horizontal scaling support (use Redis adapter for multiple instances)
- Automatic reconnection
- Heartbeat/ping-pong
- Connection timeouts
- Error handling
- Rate limiting

## Scale to Multiple Servers

For horizontal scaling, add Redis adapter:

```javascript
// socket/index.js
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Limitations

- Socket.io client must be installed in frontend
- JWT token required for authentication
- MongoDB for message persistence
- WebSocket protocol must be allowed in firewall

## Next Steps

1. Install Socket.io client: `npm install socket.io-client`
2. Update frontend to use generated backend
3. Test real-time messaging
4. Add file upload service for media messages
5. Configure Redis for production scaling

---

**Generated by Backendify v2.0** 🚀
Any chat app, any size - backend generated automatically!
