import React from 'react';

const ProfilePhoto = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  showInitials = true,
  initials = '',
  backgroundColor = 'bg-gray-300'
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
    '3xl': 'h-24 w-24 text-3xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <div className={`relative inline-block ${className}`}>
        <img
          src={src}
          alt={alt || 'Profile'}
          className={`${currentSizeClass} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
        {/* Fallback div (hidden by default) */}
        <div 
          className={`${currentSizeClass} ${backgroundColor} rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm`}
          style={{ display: 'none' }}
        >
          {initials || alt?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    );
  }

  if (showInitials && initials) {
    return (
      <div 
        className={`${currentSizeClass} ${backgroundColor} rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm ${className}`}
      >
        {initials}
      </div>
    );
  }

  // Default user icon
  return (
    <div className={`${currentSizeClass} ${backgroundColor} rounded-full flex items-center justify-center border-2 border-white shadow-sm ${className}`}>
      <svg 
        className="h-1/2 w-1/2 text-white" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );
};

export default ProfilePhoto;
