import { clsx } from 'clsx';
import { getInitials } from '../../utils';

const COLORS = ['#0d9488','#2563eb','#d97706','#dc2626','#7c3aed','#059669','#c2410c'];

export const Avatar = ({ name, photo, size='md', className, employeeId }) => {
  const sizes = { 
    xs:'w-6 h-6 text-xs', 
    sm:'w-7 h-7 text-xs', 
    md:'w-9 h-9 text-sm', 
    lg:'w-12 h-12 text-base', 
    xl:'w-16 h-16 text-xl',
    '2xl':'w-20 h-20 text-2xl'
  };
  
  const color = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
  
  // Handle profile photo URL - construct proper storage path if needed
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    
    // If it's already a full URL, return as is
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    
    // If it's a relative path starting with 'storage/', it's already correct
    if (photoUrl.startsWith('storage/')) {
      return `/${photoUrl}`;
    }
    
    // If it's just a filename, prepend the storage path
    if (photoUrl.includes('.')) {
      return `/storage/profile-photos/${photoUrl}`;
    }
    
    return photoUrl;
  };

  const photoSrc = getPhotoUrl(photo);
  
  if (photoSrc) {
    return (
      <div className={clsx('relative', className)}>
        <img 
          src={photoSrc} 
          alt={name || 'Profile'} 
          className={clsx('rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm', sizes[size])}
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
          className={clsx('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 border-2 border-white shadow-sm', sizes[size])}
          style={{ background: color, display: 'none' }}
        >
          {getInitials(name)}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={clsx('rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 border-2 border-white shadow-sm', sizes[size], className)}
      style={{ background: color }}
    >
      {getInitials(name)}
    </div>
  );
};
