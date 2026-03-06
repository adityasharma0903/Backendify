import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

function ChatWindow({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  typingUsers,
  onlineUsers
}) {
  const [messageText, setMessageText] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    // Emit typing start
    onTypingStart();
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to emit typing stop
    const timeout = setTimeout(() => {
      onTypingStop();
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
      onTypingStop();
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const getOtherParticipant = () => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(
      (p) => p._id !== currentUser._id && p._id !== currentUser.id
    );
  };

  const otherUser = getOtherParticipant();
  const isOnline = otherUser && onlineUsers.has(otherUser._id);
  const isTyping = typingUsers.size > 0;

  if (!conversation) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <div className="empty-chat-icon">💬</div>
          <h2>WhatsApp Clone</h2>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {otherUser?.name?.[0]?.toUpperCase() || '?'}
            {isOnline && <span className="online-indicator"></span>}
          </div>
          <div>
            <h3>{otherUser?.name || 'Unknown User'}</h3>
            <span className={`status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={
                  message.sender?._id === currentUser._id ||
                  message.sender?._id === currentUser.id
                }
              />
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">{otherUser?.name} is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type a message..."
          value={messageText}
          onChange={handleInputChange}
          onBlur={onTypingStop}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!messageText.trim()}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
