import { useState } from 'react';

function ChatList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onCreateConversation,
  onLogout,
  currentUser,
  onlineUsers
}) {
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');

  const handleCreateChat = () => {
    if (newChatEmail.trim()) {
      onCreateConversation(newChatEmail);
      setNewChatEmail('');
      setShowNewChat(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(
      (p) => p._id !== currentUser._id && p._id !== currentUser.id
    );
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3>{currentUser?.name || 'User'}</h3>
            <span className="status online">Online</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={() => setShowNewChat(true)}
            title="New Chat"
          >
            ✏️
          </button>
          <button
            className="btn-icon"
            onClick={onLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>

      {showNewChat && (
        <div className="new-chat-form">
          <input
            type="email"
            placeholder="Enter user email..."
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
            autoFocus
          />
          <div className="new-chat-actions">
            <button className="btn-small" onClick={handleCreateChat}>
              Create
            </button>
            <button
              className="btn-small btn-secondary"
              onClick={() => setShowNewChat(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
            <p className="hint">Click ✏️ to start a new chat</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherParticipant(conversation);
            const isSelected =
              selectedConversation?._id === conversation._id;
            const isOnline = otherUser && isUserOnline(otherUser._id);

            return (
              <div
                key={conversation._id}
                className={`conversation-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {otherUser?.name?.[0]?.toUpperCase() || '?'}
                  {isOnline && <span className="online-indicator"></span>}
                </div>
                
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{otherUser?.name || 'Unknown User'}</h4>
                    <span className="time">
                      {conversation.lastMessageAt
                        ? new Date(conversation.lastMessageAt).toLocaleTimeString(
                            [],
                            { hour: '2-digit', minute: '2-digit' }
                          )
                        : ''}
                    </span>
                  </div>
                  
                  <p className="last-message">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatList;
