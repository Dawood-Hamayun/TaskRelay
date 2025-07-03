// frontend/src/components/ui/UserAvatar.tsx
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCrown?: boolean;
}

// Helper function to generate avatar initials
const getAvatarInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (email && email.trim()) {
    return email.charAt(0).toUpperCase();
  }
  
  return 'U';
};

// Helper function to generate consistent avatar colors
const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
  ];
  
  // Generate a consistent hash from the userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg'
};

export function UserAvatar({ 
  user, 
  size = 'md', 
  className,
  showCrown = false 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const avatarInitials = getAvatarInitials(user.name, user.email);
  const avatarColor = getAvatarColor(user.id);
  const sizeClass = sizeClasses[size];
  
  // Check if we have a valid avatar URL
  const hasValidAvatar = user.avatar && 
    !imageError && 
    (user.avatar.startsWith('http') || user.avatar.startsWith('data:'));

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={cn(
      "relative rounded-full flex items-center justify-center font-semibold text-white overflow-hidden",
      sizeClass,
      className
    )}>
      {hasValidAvatar ? (
        <>
          {imageLoading && (
            <div className={cn("absolute inset-0 flex items-center justify-center", avatarColor)}>
              {avatarInitials}
            </div>
          )}
          <img 
            src={user.avatar} 
            alt={user.name || user.email}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center", avatarColor)}>
          {avatarInitials}
        </div>
      )}
      
      {showCrown && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// Alternative Avatar component that accepts any props for backward compatibility
export function Avatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  className,
  ...props 
}: {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const sizeClass = sizeClasses[size];
  const hasValidImage = src && !imageError && (src.startsWith('http') || src.startsWith('data:'));

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div 
      className={cn(
        "relative rounded-full flex items-center justify-center font-semibold text-white overflow-hidden bg-gray-500",
        sizeClass,
        className
      )}
      {...props}
    >
      {hasValidImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-500">
              {fallback || '?'}
            </div>
          )}
          <img 
            src={src} 
            alt={alt || 'Avatar'}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-500">
          {fallback || '?'}
        </div>
      )}
    </div>
  );
}