function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-time">
        {formatTime(message.timestamp)}
        {isOwn && (
          <span className="message-status">
            {message.status === 'sending' && '🕐'}
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.readBy?.length > 0 && '✓✓'}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
