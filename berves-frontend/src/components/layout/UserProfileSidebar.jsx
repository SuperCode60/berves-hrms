import React from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProfilePhoto from '../common/ProfilePhoto';

const UserProfileSidebar = ({ collapsed = false }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (collapsed) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-center">
          <ProfilePhoto
            src={user?.profile_photo_url}
            alt={user?.name}
            size="md"
            initials={user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-3 mb-3">
        <ProfilePhoto
          src={user?.profile_photo_url}
          alt={user?.name}
          size="md"
          initials={user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email}
          </p>
          {user?.roles && user.roles.length > 0 && (
            <p className="text-xs text-gray-400">
              {user.roles[0].name}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <button
          onClick={() => {/* Navigate to profile */}}
          className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <User size={14} />
          <span>Profile</span>
        </button>
        
        <button
          onClick={() => {/* Navigate to settings */}}
          className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileSidebar;
