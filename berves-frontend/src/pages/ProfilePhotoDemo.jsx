import React, { useState } from 'react';
import ProfilePhoto from '../components/common/ProfilePhoto';
import ProfilePhotoUpload from '../components/common/ProfilePhotoUpload';
import EmployeeCard from '../components/common/EmployeeCard';
import UserProfile from '../components/common/UserProfile';
import Avatar from '../components/common/Avatar';

const ProfilePhotoDemo = () => {
  const [currentPhoto, setCurrentPhoto] = useState(null);

  // Sample employee data
  const sampleEmployees = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@berves.com',
      employee_id: 'BEL-0001',
      department: { name: 'Engineering' },
      position: 'Software Engineer',
      phone: '+233123456789',
      status: 'active',
      profile_photo_url: '/storage/profile-photos/P8DOf7E5phyM8hPeUil6eMcIliLU3T3Jde9VYahb.jpg'
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@berves.com',
      employee_id: 'BEL-0002',
      department: { name: 'HR' },
      position: 'HR Manager',
      phone: '+233123456790',
      status: 'active',
      profile_photo_url: null // Will show initials
    },
    {
      id: 3,
      first_name: 'Michael',
      last_name: 'Johnson',
      email: 'michael.johnson@berves.com',
      employee_id: 'BEL-0003',
      department: { name: 'Finance' },
      position: 'Accountant',
      phone: '+233123456791',
      status: 'on_leave',
      profile_photo_url: null
    }
  ];

  const sampleUser = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@berves.com',
    profile_photo_url: '/storage/profile-photos/P8DOf7E5phyM8hPeUil6eMcIliLU3T3Jde9VYahb.jpg',
    roles: [{ name: 'admin' }],
    status: 'active'
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Photo System Demo</h1>
        <p className="text-gray-600">Demonstration of profile photo components with fallback to initials</p>
      </div>

      {/* Profile Photo Upload Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Photo Upload</h2>
        <div className="flex justify-center">
          <ProfilePhotoUpload
            currentPhoto={currentPhoto}
            name="John Doe"
            size="3xl"
            onPhotoChange={(file) => {
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => setCurrentPhoto(e.target.result);
                reader.readAsDataURL(file);
              } else {
                setCurrentPhoto(null);
              }
            }}
          />
        </div>
      </div>

      {/* Avatar Component Variations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Avatar Component Sizes</h2>
        <div className="flex items-end space-x-4">
          <div className="text-center">
            <Avatar name="John Doe" size="xs" />
            <p className="text-xs mt-1">xs</p>
          </div>
          <div className="text-center">
            <Avatar name="John Doe" size="sm" />
            <p className="text-xs mt-1">sm</p>
          </div>
          <div className="text-center">
            <Avatar name="John Doe" size="md" />
            <p className="text-xs mt-1">md</p>
          </div>
          <div className="text-center">
            <Avatar name="John Doe" size="lg" />
            <p className="text-xs mt-1">lg</p>
          </div>
          <div className="text-center">
            <Avatar name="John Doe" size="xl" />
            <p className="text-xs mt-1">xl</p>
          </div>
          <div className="text-center">
            <Avatar name="John Doe" size="2xl" />
            <p className="text-xs mt-1">2xl</p>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Employee Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onClick={() => console.log('Clicked employee:', employee)}
            />
          ))}
        </div>
      </div>

      {/* User Profiles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">User Profiles</h2>
        <div className="space-y-4">
          <UserProfile
            user={sampleUser}
            size="lg"
            showEmail={true}
            showRole={true}
            showStatus={true}
            onClick={() => console.log('Clicked user profile')}
          />
          
          <UserProfile
            user={{
              ...sampleUser,
              name: 'Jane Smith',
              email: 'jane.smith@berves.com',
              profile_photo_url: null,
              roles: [{ name: 'hr' }],
              status: 'online'
            }}
            size="md"
            showEmail={true}
            showRole={true}
            showStatus={true}
          />
        </div>
      </div>

      {/* Profile Photo Fallbacks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Photo Fallbacks</h2>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <ProfilePhoto
              src="/storage/profile-photos/P8DOf7E5phyM8hPeUil6eMcIliLU3T3Jde9VYahb.jpg"
              alt="Existing Photo"
              size="lg"
              initials="JD"
            />
            <p className="text-sm mt-2">Existing Photo</p>
          </div>
          
          <div className="text-center">
            <ProfilePhoto
              src="/non-existent-photo.jpg"
              alt="Broken URL"
              size="lg"
              initials="JS"
              backgroundColor="bg-blue-500"
            />
            <p className="text-sm mt-2">Broken URL → Initials</p>
          </div>
          
          <div className="text-center">
            <ProfilePhoto
              src={null}
              alt="No Photo"
              size="lg"
              initials="MJ"
              backgroundColor="bg-green-500"
            />
            <p className="text-sm mt-2">No Photo → Initials</p>
          </div>
          
          <div className="text-center">
            <ProfilePhoto
              src={null}
              alt="Default"
              size="lg"
              showInitials={false}
              backgroundColor="bg-gray-300"
            />
            <p className="text-sm mt-2">Default Icon</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Profile Photo Features:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Automatic fallback to colored initials when photo is missing</li>
          <li>• Proper error handling for broken image URLs</li>
          <li>• Upload functionality with file validation</li>
          <li>• Multiple size options (xs, sm, md, lg, xl, 2xl, 3xl)</li>
          <li>• Consistent styling across all components</li>
          <li>• Responsive design with hover effects</li>
          <li>• Integration with Laravel storage system</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePhotoDemo;
