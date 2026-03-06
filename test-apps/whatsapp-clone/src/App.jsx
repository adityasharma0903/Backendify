import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Login from './components/Login';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const selectedConversationRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Login/Signup
  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      alert(message + '\n\n' + (error.response?.status === 401 ? 'Hint: Try signing up first if you don\'t have an account.' : ''));
    }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        name,
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error('Signup failed:', error);
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      alert(message + '\n\n' + (error.response?.status === 409 ? 'Hint: This email is already registered. Try logging in instead.' : ''));
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token) return;

    console.log('\n🔌 SOCKET.IO CONNECTION');
    console.log(`  Token: ${token.substring(0, 20)}...`);
    
    const newSocket = io(API_URL, {
      auth: { token }
    });

    // ✅ Add global debug function
    window.socketDebug = {
      isConnected: () => console.log(`Socket connected: ${newSocket.connected}`),
      getSocketId: () => console.log(`Socket ID: ${newSocket.id}`),
      getSelectedConv: () => console.log(`Selected conversation: ${selectedConversation?._id}`),
      emoji: () => console.log(`🔌 Socket.io is ${newSocket.connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`),
    };

    newSocket.on('connect', () => {
      console.log(`  ✅ Connected! Socket ID: ${newSocket.id}`);
    });

    newSocket.on('connect_error', (error) => {
      console.log(`  ❌ Connection error: ${error.message}`);
    });

    newSocket.on('disconnect', () => {
      console.log(`  ❌ Disconnected from Socket.io`);
    });

    // User presence
    newSocket.on('user:online', (data) => {
      console.log(`  👋 User online: ${data.userId}`);
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    newSocket.on('user:offline', (data) => {
      console.log(`  👋 User offline: ${data.userId}`);
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // New message received
    newSocket.on('message:new', (data) => {
      const activeConversation = selectedConversationRef.current;
      const activeConversationId = activeConversation?._id?.toString();
      const incomingConversationId = data?.conversationId?.toString();
      const isActiveConversation =
        !!activeConversationId && activeConversationId === incomingConversationId;

      console.log(`\n📨 MESSAGE RECEIVED`);
      console.log(`  Conversation: ${data.conversationId}`);
      console.log(`  Message: "${data.message.content}"`);
      console.log(`  Sender: ${data.message.sender?.name || 'Unknown'}`);
      console.log(`  Selected conversation: ${activeConversationId || 'none'}`);
      console.log(`  Match: ${isActiveConversation}`);
      
      if (isActiveConversation) {
        console.log(`  ✅ Adding to current chat`);
        setMessages(prev => {
          const exists = prev.some(
            msg => msg?._id?.toString() === data.message?._id?.toString()
          );

          if (exists) {
            return prev;
          }

          return [...prev, { ...data.message, status: 'sent' }];
        });
        
        // Mark as read automatically
        newSocket.emit('message:read', {
          messageId: data.message._id,
          conversationId: data.conversationId
        });
      } else {
        console.log(`  ℹ️ Message is for different conversation, not adding to UI`);
      }
      
      // Update conversation list
      fetchConversations();
    });

    // Message sent confirmation
    newSocket.on('message:sent', (data) => {
      console.log('✅ Message sent:', data);
      setMessages(prev => {
        const tempId = data?.tempId?.toString();
        if (!tempId) {
          return prev;
        }

        const tempIndex = prev.findIndex(msg => msg?._id?.toString() === tempId);
        if (tempIndex === -1) {
          return prev;
        }

        const updated = [...prev];
        updated[tempIndex] = { ...data.message, status: 'sent' };
        return updated;
      });
    });

    // Conversation joined confirmation
    newSocket.on('conversation:joined', (data) => {
      console.log(`\n✅ CONVERSATION JOINED`);
      console.log(`  Conversation: ${data.conversationId}`);
      console.log(`  You are now in the room and can receive messages!\n`);
    });

    // Typing indicators
    newSocket.on('typing:update', (data) => {
      console.log('⌨️ Typing update:', data);
      const activeConversation = selectedConversationRef.current;
      const activeConversationId = activeConversation?._id?.toString();
      const typingConversationId = data?.conversationId?.toString();
      
      if (activeConversationId && activeConversationId === typingConversationId) {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (data.isTyping) {
            updated.set(data.userId, true);
          } else {
            updated.delete(data.userId);
          }
          return updated;
        });
      }
    });

    // New conversation
    newSocket.on('conversation:new', (data) => {
      console.log('💬 New conversation:', data);
      fetchConversations();
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    if (!token) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    console.log(`\n🎯 SELECT CONVERSATION`);
    console.log(`  Conversation ID: ${conversation._id}`);
    console.log(`  Conversation name: ${conversation.name || 'N/A'}`);
    console.log(`  Participants: ${JSON.stringify(conversation.participants)}`);
    
    selectedConversationRef.current = conversation;
    setSelectedConversation(conversation);
    setMessages([]);
    
    // Join conversation room
    if (socket) {
      console.log(`  📡 Emitting conversation:join to Socket.io...`);
      socket.emit('conversation:join', {
        conversationId: conversation._id
      });
    } else {
      console.log(`  ❌ Socket not connected!`);
    }
    
    // Fetch messages
    fetchMessages(conversation._id);
  };

  // Send message
  const handleSendMessage = (content, type = 'text') => {
    if (!socket || !selectedConversation) {
      console.log('❌ Cannot send: Socket or Conversation not ready');
      return;
    }
    
    const tempId = Date.now();
    
    console.log(`\n📤 SEND MESSAGE`);
    console.log(`  Conversation: ${selectedConversation._id}`);
    console.log(`  Message: "${content}"`);
    console.log(`  Temp ID: ${tempId}`);
    console.log(`  Socket connected: ${socket.connected}`);
    console.log(`  Socket ID: ${socket.id}`);
    
    socket.emit('message:send', {
      conversationId: selectedConversation._id,
      content,
      type,
      tempId
    });
    
    console.log(`✅ Emitted to server`);
    
    // Optimistic UI update
    const tempMessage = {
      _id: tempId,
      content,
      type,
      sender: user,
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, tempMessage]);
  };

  // Start typing
  const handleTypingStart = () => {
    if (!socket || !selectedConversation) return;
    
    socket.emit('typing:start', {
      conversationId: selectedConversation._id
    });
  };

  // Stop typing
  const handleTypingStop = () => {
    if (!socket || !selectedConversation) return;
    
    socket.emit('typing:stop', {
      conversationId: selectedConversation._id
    });
  };

  // Create new conversation
  const handleCreateConversation = async (participantEmail) => {
    try {
      if (!participantEmail || !participantEmail.trim()) {
        alert('Please enter an email address');
        return;
      }

      // First, find user by email
      console.log('🔍 Searching for user:', participantEmail);
      const userResponse = await axios.get(
        `${API_URL}/api/users?email=${participantEmail.toLowerCase().trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('👤 User search response:', userResponse.data);
      
      const participant = userResponse.data.data?.[0];
      if (!participant) {
        alert(`User not found!\n\nNo user with email: ${participantEmail}\n\nMake sure they have signed up first.`);
        return;
      }

      // Don't create conversation with yourself
      if (participant._id === user._id || participant._id === user.id) {
        alert('You cannot create a conversation with yourself!');
        return;
      }
      
      console.log('💬 Creating conversation with:', participant.name);
      
      // Create conversation
      const response = await axios.post(
        `${API_URL}/api/chat/conversations`,
        {
          participantIds: [participant._id],
          type: 'direct'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const newConversation = response.data.data;
      console.log('✅ Conversation created:', newConversation);
      
      setConversations(prev => [newConversation, ...prev]);
      handleSelectConversation(newConversation);
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      const message = error.response?.data?.message || 'Failed to create conversation';
      alert(`Error: ${message}\n\n${error.response?.status === 401 ? 'You need to be logged in.' : 'Please try again.'}`);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  // If not logged in, show login
  if (!token || !user) {
    return (
      <Login 
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <ChatList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          onLogout={handleLogout}
          currentUser={user}
          onlineUsers={onlineUsers}
        />
        
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          currentUser={user}
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          typingUsers={typingUsers}
          onlineUsers={onlineUsers}
        />
      </div>
    </div>
  );
}

export default App;
