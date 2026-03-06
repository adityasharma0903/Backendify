import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function Chat() {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser] = useState('You');
  const messagesEndRef = useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('message:new', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('user:typing', (data) => {
      if (data.sender !== currentUser) {
        setIsTyping(true);
      }
    });

    newSocket.on('user:stopped-typing', () => {
      setIsTyping(false);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [currentUser]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/conversations`);
      const data = response.data.data || response.data;
      setConversations(data);
      if (data.length > 0) {
        setSelectedConversation(data[0]);
        loadMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Fallback data
      const dummyConversations = [
        { id: 1, name: 'John Doe', lastMessage: 'See you tomorrow!', timestamp: new Date() },
        { id: 2, name: 'Jane Smith', lastMessage: 'Thanks for the update', timestamp: new Date() },
        { id: 3, name: 'Team Discussion', lastMessage: 'Meeting at 3 PM', timestamp: new Date(), isGroup: true },
      ];
      setConversations(dummyConversations);
      setSelectedConversation(dummyConversations[0]);
      loadMessages(dummyConversations[0].id);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/messages`);
      setMessages(response.data.data || response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback data
      setMessages([
        { id: 1, sender: 'John Doe', text: 'Hey! How are you?', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, sender: currentUser, text: 'Hi! I\'m doing great, thanks!', timestamp: new Date(Date.now() - 3000000) },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message = {
      sender: currentUser,
      text: newMessage,
      conversationId: selectedConversation.id,
      timestamp: new Date()
    };

    try {
      // Send via API
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/conversations/${selectedConversation.id}/messages`, message);
      setMessages([...messages, response.data.data || response.data]);
      
      // Emit via Socket.io
      if (socket) {
        socket.emit('message:send', message);
      }
      
      setNewMessage('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    const isUserTyping = text.length > 0;
    setIsTyping(isUserTyping);
    
    // Emit typing event via Socket.io
    if (socket) {
      socket.emit(isUserTyping ? 'user:typing' : 'user:stopped-typing', {
        sender: currentUser,
        conversationId: selectedConversation.id
      });
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    loadMessages(conv.id);
  };

  return (
    <div className="page">
      <h2>💬 Chat & Messaging</h2>

      <div className="chat-container">
        <div className="conversations-list">
          <h3>Conversations</h3>
          <ul>
            {conversations.map(conv => (
              <li
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="conv-header">
                  <strong>{conv.name}</strong>
                  {conv.isGroup && <span className="group-badge">👥</span>}
                </div>
                <small className="last-message">{conv.lastMessage}</small>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-area">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h3>{selectedConversation.name}</h3>
                {selectedConversation.isGroup && <span className="group-badge">Group</span>}
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <p className="empty-message">No messages yet</p>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}
                    >
                      <div className="message-sender">{msg.sender}</div>
                      <div className="message-content">{msg.text}</div>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  className="message-input"
                />
                <button type="submit" disabled={newMessage.trim() === ''}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
