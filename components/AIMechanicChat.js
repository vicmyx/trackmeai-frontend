import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SourcePanel from './SourcePanel';
import config from '../config';
import './AIMechanicChat.css';

const AIMechanicChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const messagesEndRef = useRef(null);


  // Sample questions for quick start - Radical SR3 specific
  const sampleQuestions = [
    "What are the pre-session checks I should perform?",
    "How do I properly bed in the brakes?",
    "I want to buy new tires",
    "Need to purchase brake pads",
    "What should I check if my car won't start?",
    "How do I adjust the seat and pedals correctly?"
  ];

  useEffect(() => {
    // Check API health on component mount
    checkApiHealth();
    
    // Add welcome message
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Hi! I'm your Radical Assistant. I can help you find information from your Radical SR3 Owner's Manual and Handling Guide.",
      timestamp: new Date(),
      sources: []
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/health`);
      const data = await response.json();
      setIsHealthy(data.status === 'healthy');
    } catch (error) {
      console.error('API health check failed:', error);
      setIsHealthy(false);
    }
  };

  const askQuestion = async (question) => {
    if (!question || !question.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date(),
      sources: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${config.apiUrl}/ask-ai-mechanic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          top_k: 5
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer,
        timestamp: new Date(),
        sources: data.source_chunks || [],
        has_trackmeai_sources: data.has_trackmeai_sources || false,
        has_internet_sources: data.has_internet_sources || false,
        total_confidence: data.total_confidence || 0,
        error: data.error,
        purchase_flow: data.purchase_flow || false,
        purchase_step: data.purchase_step || null
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error asking question:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        timestamp: new Date(),
        sources: [],
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSampleQuestion = (question) => {
    askQuestion(question);
  };

  const handleNewChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: "Hi! I'm your Radical Assistant. I can help you find information from your Radical SR3 Owner's Manual and Handling Guide.",
      timestamp: new Date(),
      sources: []
    }]);
    setInputValue('');
    setSelectedSources([]);
  };

  const showSources = (sources) => {
    // Filter to only show PDF documentation sources
    const pdfSources = sources.filter(source => 
      source.source_type === 'trackmeai_docs' || 
      source.manual_id || 
      source.metadata?.manual_id
    );
    setSelectedSources(pdfSources);
  };

  return (
    <div className="ai-mechanic-chat">
      <div className="chat-container">
        {/* API Status */}
        <div className={`api-status ${isHealthy ? 'healthy' : 'unhealthy'}`}>
          <span className="status-indicator"></span>
{isHealthy ? 'Radical Assistant Online' : 'Radical Assistant Offline'}
        </div>

        {/* Welcome Section - Only show when no user messages */}
        {messages.length <= 1 && (
          <div className="welcome-section">
            <div className="greeting-message">
              <h2>Hi! I'm your Radical Assistant</h2>
              <p>Ask me anything about your Radical SR3. I'll search through your owner's manual and handling guide to find the information you need.</p>
            </div>
            
            <div className="sample-questions">
              <h3>Try asking:</h3>
              <div className="question-buttons">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="sample-question-btn"
                    onClick={() => handleSampleQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages - Only show when there are user messages */}
        {messages.length > 1 && (
          <div className="messages-container">
            {messages.slice(1).map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onShowSources={showSources}
              />
            ))}
            
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="input-form">
          <div className="chat-controls">
            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleNewChat}
                className="new-chat-button"
              >
                + Start New Chat
              </button>
            )}
            <div className="input-container">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your Radical SR3..."
                disabled={isLoading || !isHealthy}
                className="message-input"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={isLoading || !isHealthy}
                className="send-button"
              >
                {isLoading ? (
                  '⏳'
                ) : (
                  <svg width="18" height="14" viewBox="0 0 127 102" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.30666 0C42.48 15.6667 82.5733 32 122.707 47.8267C124.853 49.0933 127.52 48.68 126.787 51.96C123.373 53.7867 119.613 55.0133 116.04 56.48C81.72 70.1733 47.4 83.84 13.08 97.52C9.45333 98.9467 5.85333 100.64 2.09333 101.693L0.266663 100.16C4.05333 91.9733 9.01333 84.32 13.2133 76.3333C16.88 70.2667 19.7733 63.4933 23.96 57.8C37.0533 55.88 50.5067 55 63.68 53.3733C70.08 52.4267 77.1333 52.7867 83.2267 50.6C63.8667 47.9067 44.2667 46.5067 24.8667 44.12C23.1467 44 22.2133 41.1333 21.28 39.9067C14.2667 27.0533 6.97333 14.3333 0 1.46666C0.76 0.959998 1.53333 0.48 2.30666 0Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Source Panel */}
      {selectedSources.length > 0 && (
        <SourcePanel
          sources={selectedSources}
          onClose={() => setSelectedSources([])}
        />
      )}
    </div>
  );
};

export default AIMechanicChat;