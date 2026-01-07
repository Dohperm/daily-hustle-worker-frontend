import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useThemeContext';

export default function AiChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! My name is Mr. Daily Hustler. How can I help you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1c1c1e' : '#ffffff';
  const containerBg = isDark ? '#121212' : '#f8f9fa';
  const textColor = isDark ? '#f8f9fa' : '#212529';
  const borderColor = isDark ? '#333' : '#dee2e6';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAiResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAiResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('task') || lowerMessage.includes('work')) {
      return "I can help you with tasks! You can find available tasks in the Tasks section. Complete them to earn money instantly.";
    }
    if (lowerMessage.includes('withdraw') || lowerMessage.includes('money') || lowerMessage.includes('payment')) {
      return "For withdrawals, you need a minimum of ₦1,000 and completed KYC verification. Check your Wallet section for more details.";
    }
    if (lowerMessage.includes('kyc') || lowerMessage.includes('verification')) {
      return "KYC verification helps secure your account and unlock all features. You can complete it in your Settings.";
    }
    if (lowerMessage.includes('referral') || lowerMessage.includes('invite')) {
      return "Great question! Share your referral link with friends. When they sign up and complete a task, you earn ₦500 instantly!";
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to help! You can also visit our Support section for FAQs, submit tickets, or contact us directly.";
    }
    
    return "Thank you for your message! I'm Mr. Daily Hustler, and I'm here to help with any questions about tasks, payments, or using the platform. What would you like to know?";
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '350px',
        height: '500px',
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          background: 'var(--dh-red)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h6 style={{ margin: 0, fontWeight: 'bold' }}>Mr. Daily Hustler</h6>
          <small style={{ opacity: 0.9 }}>AI Assistant</small>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: containerBg
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: message.sender === 'user' ? 'var(--dh-red)' : cardBg,
                color: message.sender === 'user' ? 'white' : textColor,
                border: message.sender === 'ai' ? `1px solid ${borderColor}` : 'none'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: cardBg
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `1px solid ${borderColor}`,
              borderRadius: '20px',
              backgroundColor: containerBg,
              color: textColor,
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              background: 'var(--dh-red)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}