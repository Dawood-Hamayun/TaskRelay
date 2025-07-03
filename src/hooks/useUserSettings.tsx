// frontend/src/hooks/useUserSettings.ts - Updated to sync avatar changes with projects
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import API from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  _count?: {
    members: number;
    comments: number;
    sentInvites: number;
    createdMeetings: number;
  };
}

export interface UserStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalComments: number;
  sentInvites: number;
  createdMeetings: number;
  completionRate: number;
}

export interface UpdateProfileData {
  email?: string;
  name?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAvatarData {
  avatar: string;
}

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Get current user profile
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useQuery<UserProfile>({
    queryKey: ['user', 'profile', user?.userId],
    queryFn: async () => {
      console.log('🔍 Fetching user profile');
      const res = await API.get('/users/me');
      console.log('✅ User profile fetched:', res.data);
      return res.data;
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });

  // Get user stats
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useQuery<UserStats>({
    queryKey: ['user', 'stats', user?.userId],
    queryFn: async () => {
      console.log('📊 Fetching user stats');
      const res = await API.get('/users/me/stats');
      console.log('✅ User stats fetched:', res.data);
      return res.data;
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: 600000, // 10 minutes
    retry: 2,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      console.log('📝 Updating profile:', data);
      const res = await API.put('/users/me/profile', data);
      console.log('✅ Profile updated:', res.data);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      // Update profile cache
      queryClient.setQueryData(['user', 'profile', user?.userId], updatedProfile);
      
      // Invalidate projects cache since member names might have changed
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
      
      // If email changed, we might need to update auth state - but your auth uses JWT
      // so this would require a new login
      if (updatedProfile.email !== user?.email) {
        console.log('⚠️ Email changed - user may need to re-login');
      }
      
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
      console.error('❌ Failed to update profile:', error);
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      console.log('🔐 Updating password');
      const res = await API.put('/users/me/password', data);
      console.log('✅ Password updated');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update password';
      toast.error(message);
      console.error('❌ Failed to update password:', error);
    },
  });

  // Update avatar mutation
  const updateAvatarMutation = useMutation({
    mutationFn: async (data: UpdateAvatarData) => {
      console.log('📷 Updating avatar');
      const res = await API.put('/users/me/avatar', data);
      console.log('✅ Avatar updated:', res.data);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      // Update profile cache
      queryClient.setQueryData(['user', 'profile', user?.userId], updatedProfile);
      
      // IMPORTANT: Invalidate projects cache to refresh member avatars
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
      
      // Also invalidate any member-specific queries
      queryClient.invalidateQueries({ queryKey: ['members'] });
      
      toast.success('Profile picture updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update profile picture';
      toast.error(message);
      console.error('❌ Failed to update avatar:', error);
    },
  });

  // Remove avatar mutation
  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Removing avatar');
      const res = await API.delete('/users/me/avatar');
      console.log('✅ Avatar removed:', res.data);
      return res.data;
    },
    onSuccess: (updatedProfile) => {
      // Update profile cache
      queryClient.setQueryData(['user', 'profile', user?.userId], updatedProfile);
      
      // IMPORTANT: Invalidate projects cache to refresh member avatars
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
      
      // Also invalidate any member-specific queries
      queryClient.invalidateQueries({ queryKey: ['members'] });
      
      toast.success('Profile picture removed');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to remove profile picture';
      toast.error(message);
      console.error('❌ Failed to remove avatar:', error);
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      console.log('💥 Deleting account');
      const res = await API.delete('/users/me', { data: { password } });
      console.log('✅ Account deleted');
      return res.data;
    },
    onSuccess: () => {
      // Clear all caches
      queryClient.clear();
      
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete account';
      toast.error(message);
      console.error('❌ Failed to delete account:', error);
    },
  });

  // Upload avatar to a service (placeholder for actual implementation)
  const uploadAvatar = async (file: File): Promise<string> => {
    console.log('📤 Uploading avatar file:', file.name, file.size);
    
    // This is a placeholder implementation using base64
    // In production, you'd upload to a proper storage service like:
    // - AWS S3
    // - Cloudinary  
    // - Google Cloud Storage
    // - Azure Blob Storage
    // - Your own file server
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        console.log('✅ Avatar converted to base64');
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('❌ Failed to read file');
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

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
  const getAvatarColor = (text: string): string => {
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
    
    // Generate a consistent hash from the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value to ensure positive index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return {
    // Data
    profile,
    stats,
    
    // Loading states
    profileLoading,
    statsLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    isRemovingAvatar: removeAvatarMutation.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    
    // Error states
    profileError,
    statsError,
    
    // Actions
    updateProfile: updateProfileMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    updateAvatar: updateAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    uploadAvatar,
    refetchProfile,
    refetchStats,
    
    // Helpers
    getAvatarInitials,
    getAvatarColor,
  };
};