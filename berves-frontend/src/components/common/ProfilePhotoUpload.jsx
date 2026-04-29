import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import ProfilePhoto from './ProfilePhoto';

const ProfilePhotoUpload = ({ 
  currentPhoto, 
  name, 
  size = 'xl',
  onPhotoChange,
  className = '',
  editable = true
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentPhoto);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setIsUploading(false);
      
      // Call parent callback with file
      if (onPhotoChange) {
        onPhotoChange(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onPhotoChange) {
      onPhotoChange(null);
    }
  };

  const handleClick = () => {
    if (!editable) return;
    fileInputRef.current?.click();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative group">
        <ProfilePhoto
          src={preview}
          alt={name}
          size={size}
          initials={getInitials(name)}
          className="cursor-pointer"
        />
        
        {editable && (
          <>
            {/* Upload overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleClick}
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </div>
            
            {/* Remove button */}
            {preview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
      
      {editable && (
        <button
          onClick={handleClick}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {preview ? 'Change Photo' : 'Upload Photo'}
        </button>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
