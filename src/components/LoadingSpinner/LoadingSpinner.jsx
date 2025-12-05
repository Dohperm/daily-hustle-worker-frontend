import React from 'react';
import { useTheme } from '../../hooks/useThemeContext';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'dots', 
  fullScreen = false,
  message = 'Loading...' 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '60px'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    })
  };

  const renderSpinner = () => {
    const spinnerSize = sizeMap[size];
    
    switch (variant) {
      case 'pulse':
        return (
          <div 
            style={{
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff5722, #ff7043)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        );
      
      case 'spin':
        return (
          <div 
            style={{
              width: spinnerSize,
              height: spinnerSize,
              border: `3px solid ${isDark ? '#2a2a2a' : '#e5e7eb'}`,
              borderTop: '3px solid #ff5722',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        );
      
      case 'bounce':
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: size === 'small' ? '8px' : size === 'large' ? '16px' : '12px',
                  height: size === 'small' ? '8px' : size === 'large' ? '16px' : '12px',
                  borderRadius: '50%',
                  background: '#ff5722',
                  animation: `bounce 1.4s ease-in-out infinite both`,
                  animationDelay: `${i * 0.16}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'dots':
      default:
        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: size === 'small' ? '6px' : size === 'large' ? '12px' : '8px',
                  height: size === 'small' ? '6px' : size === 'large' ? '12px' : '8px',
                  borderRadius: '50%',
                  background: '#ff5722',
                  animation: `dotFlashing 1.4s infinite linear alternate`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        @keyframes dotFlashing {
          0% { opacity: 1; }
          50%, 100% { opacity: 0.2; }
        }
      `}</style>
      
      <div style={containerStyle}>
        {renderSpinner()}
        {message && (
          <p style={{
            margin: 0,
            fontSize: size === 'small' ? '0.875rem' : '1rem',
            color: isDark ? '#aaa' : '#666',
            fontWeight: 500
          }}>
            {message}
          </p>
        )}
      </div>
    </>
  );
};

export default LoadingSpinner;