import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useThemeContext';

const KycModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!show) return null;

  const handleVerifyNow = () => {
    onClose();
    navigate('/dashboard/settings');
  };

  return (
    <div className="kyc-modal-overlay">
      <div className="kyc-modal">
        <div className="kyc-modal-content">
          <div className="kyc-icon-container">
            <div className="kyc-icon">
              <i className="bi bi-shield-exclamation" />
            </div>
            <div className="kyc-pulse"></div>
          </div>
          
          <h3 className="kyc-title">Account Verification Required</h3>
          <p className="kyc-message">
            Complete your KYC verification to unlock all features and secure your account.
          </p>
          
          <div className="kyc-buttons">
            <button className="kyc-btn kyc-btn-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-2" />
              Cancel
            </button>
            <button className="kyc-btn kyc-btn-primary" onClick={handleVerifyNow}>
              <i className="bi bi-shield-check me-2" />
              Verify Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .kyc-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        .kyc-modal {
          background: ${isDark ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'};
          border-radius: 20px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.4s ease;
          overflow: hidden;
          position: relative;
        }

        .kyc-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff5722, #ff7043);
        }

        .kyc-modal-content {
          padding: 2rem;
          text-align: center;
        }

        .kyc-icon-container {
          position: relative;
          margin-bottom: 1.5rem;
          display: inline-block;
        }

        .kyc-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ff5722, #ff7043);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          animation: bounce 2s infinite;
          position: relative;
          z-index: 2;
        }

        .kyc-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border: 3px solid #ff5722;
          border-radius: 50%;
          animation: pulse 2s infinite;
          opacity: 0.6;
        }

        .kyc-title {
          color: ${isDark ? '#f0f0f0' : '#333'};
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .kyc-message {
          color: ${isDark ? '#aaa' : '#666'};
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 2rem;
        }

        .kyc-buttons {
          display: flex;
          gap: 1rem;
        }

        .kyc-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kyc-btn-secondary {
          background: ${isDark ? '#333' : '#e9ecef'};
          color: ${isDark ? '#aaa' : '#6c757d'};
        }

        .kyc-btn-secondary:hover {
          background: ${isDark ? '#444' : '#dee2e6'};
          transform: translateY(-2px);
        }

        .kyc-btn-primary {
          background: linear-gradient(135deg, #ff5722, #ff7043);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
        }

        .kyc-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255, 87, 34, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default KycModal;