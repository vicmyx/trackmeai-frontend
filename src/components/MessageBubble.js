import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, onShowSources }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSourcesClick = () => {
    if (message.sources && message.sources.length > 0) {
      onShowSources(message.sources);
    }
  };

  const getSourceTypeIcon = (sourceType) => {
    switch (sourceType) {
      case 'trackmeai_docs':
        return '🏆';
      case 'internet_search':
        return '🌐';
      case 'general_ai':
        return '🤖';
      default:
        return '📚';
    }
  };


  const formatMessageContent = (content) => {
    if (!content) return content;
    
    // Split by double newlines for paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle numbered lists
      if (paragraph.match(/^\d+\.\s/)) {
        const items = paragraph.split(/(?=\d+\.\s)/);
        return (
          <div key={index} className="formatted-list">
            {items.filter(item => item.trim()).map((item, itemIndex) => (
              <div key={itemIndex} className="list-item">
                {formatTextWithBold(item.trim())}
              </div>
            ))}
          </div>
        );
      }
      
      // Handle bullet points
      if (paragraph.includes('•') || paragraph.includes('-')) {
        const items = paragraph.split(/(?=[•-]\s)/);
        return (
          <div key={index} className="formatted-list">
            {items.filter(item => item.trim()).map((item, itemIndex) => (
              <div key={itemIndex} className="list-item">
                {formatTextWithBold(item.trim())}
              </div>
            ))}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={index} className="paragraph">
          {formatTextWithBold(paragraph)}
        </div>
      );
    });
  };
  
  const formatTextWithBold = (text) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`message-bubble ${message.type}`}>
      <div className="message-content">
        {message.type === 'bot' && (
          <div className="bot-avatar">🔧</div>
        )}
        
        <div className="message-body">
          <div className={`message-text ${message.error ? 'error' : ''}`}>
            {message.type === 'bot' ? formatMessageContent(message.content) : message.content}
          </div>
          
          <div className="message-meta">
            <span className="timestamp">
              {formatTimestamp(message.timestamp)}
            </span>
            
            {message.sources && message.sources.length > 0 && (
              <div className="sources-info">
                <button 
                  className="sources-button"
                  onClick={handleSourcesClick}
                  title="View source information"
                >
                  {getSourceTypeIcon(message.sources[0]?.source_type)} 
                  {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
                </button>
                
                {/* Display subtle source indicators */}
                <div className="source-badges">
                  {message.has_trackmeai_sources && (
                    <span className="source-badge trackmeai" title="Premium Technical Documentation">
                      🏆
                    </span>
                  )}
                  {message.has_internet_sources && (
                    <span className="source-badge internet" title="Automotive Knowledge Network">
                      🌐
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {message.type === 'user' && (
          <div className="user-avatar">👤</div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;