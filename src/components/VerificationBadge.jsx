import React from 'react';

const VerificationBadge = ({ 
  type = 'worker', // 'worker' or 'advertiser'
  verified = false,
  size = 'sm', // 'sm', 'md', 'lg'
  showText = true 
}) => {
  console.log('VerificationBadge render:', { type, verified, size, showText });
  const sizeMap = {
    sm: { icon: '12px', text: '0.7rem', padding: '2px 6px' },
    md: { icon: '14px', text: '0.8rem', padding: '4px 8px' },
    lg: { icon: '16px', text: '0.9rem', padding: '6px 10px' }
  };

  const typeConfig = {
    worker: {
      icon: 'bi-person-check-fill',
      text: 'Verified Worker',
      color: '#28a745'
    },
    advertiser: {
      icon: 'bi-megaphone-fill', 
      text: 'Verified Advertiser',
      color: '#007bff'
    }
  };

  if (!verified) {
    console.log('Badge not verified, returning null');
    return null;
  }

  const config = typeConfig[type];
  const sizing = sizeMap[size];

  return (
    <span
      className="d-inline-flex align-items-center rounded-pill"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
        padding: sizing.padding,
        fontSize: sizing.text,
        fontWeight: '600'
      }}
    >
      <i 
        className={`bi ${config.icon} me-1`}
        style={{ fontSize: sizing.icon }}
      />
      {showText && config.text}
    </span>
  );
};

export default VerificationBadge;