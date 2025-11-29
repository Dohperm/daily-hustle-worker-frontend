import React from 'react';
import VerificationBadge from './VerificationBadge';

const UserVerificationStatus = ({ user, showAvatar = true, size = 'sm' }) => {
  const { 
    username, 
    photo, 
    verifiedWorker = false, 
    verifiedAdvertiser = false 
  } = user || {};

  return (
    <div className="d-flex align-items-center gap-2">
      {showAvatar && (
        <img
          src={photo || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
          alt={username}
          className="rounded-circle"
          style={{
            width: size === 'lg' ? '40px' : size === 'md' ? '32px' : '24px',
            height: size === 'lg' ? '40px' : size === 'md' ? '32px' : '24px',
            objectFit: 'cover'
          }}
        />
      )}
      <div className="d-flex flex-column">
        <span className="fw-bold" style={{ fontSize: size === 'lg' ? '1rem' : '0.9rem' }}>
          {username}
        </span>
        <div className="d-flex gap-1">
          <VerificationBadge 
            type="worker" 
            verified={verifiedWorker} 
            size={size}
            showText={false}
          />
          <VerificationBadge 
            type="advertiser" 
            verified={verifiedAdvertiser} 
            size={size}
            showText={false}
          />
        </div>
      </div>
    </div>
  );
};

export default UserVerificationStatus;