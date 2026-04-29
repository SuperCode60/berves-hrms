import React from 'react';
import ProfilePhoto from './ProfilePhoto';

const UserProfile = ({ 
  user, 
  size = 'lg',
  showEmail = true,
  showRole = true,
  showStatus = true,
  className = '',
  onClick = null
}) => {
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    online: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-800'
  };

  const statusColor = statusColors[user?.status] || statusColors.active;

  return (
    <div 
      className={`flex items-center space-x-3 ${className} ${onClick ? 'cursor-pointer hover:bg-gray-50 p-2 rounded-lg' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <ProfilePhoto
          src={user?.profile_photo_url}
          alt={user?.name}
          size={size}
          initials={initials}
          className="flex-shrink-0"
        />
        
        {/* Online indicator */}
        {user?.online_status && (
          <span className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ${
            user.online_status === 'online' ? 'bg-green-400' : 'bg-gray-300'
          } ring-2 ring-white`}></span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {user?.name || 'Unknown User'}
        </h4>
        
        {showEmail && user?.email && (
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
        )}
        
        {showRole && user?.roles && user.roles.length > 0 && (
          <p className="text-xs text-gray-500">
            {user.roles[0].name}
          </p>
        )}
        
        {showStatus && user?.status && (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {user.status}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
