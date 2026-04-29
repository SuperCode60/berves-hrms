import React from 'react';
import ProfilePhoto from './ProfilePhoto';

const EmployeeCard = ({ 
  employee, 
  className = '',
  showDetails = true,
  size = 'md',
  onClick = null 
}) => {
  const initials = employee?.first_name && employee?.last_name 
    ? `${employee.first_name.charAt(0).toUpperCase()}${employee.last_name.charAt(0).toUpperCase()}`
    : 'U';

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800'
  };

  const statusColor = statusColors[employee?.status] || statusColors.active;

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <ProfilePhoto
          src={employee?.profile_photo_url}
          alt={`${employee?.first_name} ${employee?.last_name}`}
          size={size}
          initials={initials}
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {employee?.first_name} {employee?.last_name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {employee?.status || 'active'}
            </span>
          </div>
          
          {showDetails && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-500">
                {employee?.employee_id || employee?.employee_number}
              </p>
              <p className="text-sm text-gray-500">
                {employee?.job_title || employee?.position}
              </p>
              <p className="text-sm text-gray-500">
                {employee?.department?.name || employee?.department}
              </p>
              <p className="text-sm text-gray-500">
                {employee?.email}
              </p>
              <p className="text-sm text-gray-500">
                {employee?.phone}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
