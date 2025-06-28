// frontend/src/hooks/useMembers.ts - Enhanced debugging version
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { useAuth } from './useAuth';

export const useMembers = (projectId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      console.log('👤 Starting member role update:', { 
        memberId, 
        role, 
        projectId,
        userId: user?.userId,
        baseURL: API.defaults.baseURL
      });

      try {
        // Log the exact URL being called
        const url = `/members/${memberId}/role`;
        const fullUrl = `${API.defaults.baseURL}${url}`;
        console.log('🔗 Making request to:', fullUrl);

        const response = await API.put(url, { 
          role,
          projectId 
        });
        
        console.log('✅ Member role update successful:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ Member role update failed - Full error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          fullURL: error.config?.baseURL + error.config?.url
        });

        // Check if it's a network error
        if (!error.response) {
          console.error('❌ Network error - server might be down');
        }

        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Member role updated successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
    },
    onError: (error: any) => {
      console.error('❌ Mutation failed:', error);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      console.log('🗑️ Starting member removal:', { 
        memberId, 
        projectId,
        userId: user?.userId,
        baseURL: API.defaults.baseURL
      });

      try {
        const url = `/members/${memberId}?projectId=${projectId}`;
        const fullUrl = `${API.defaults.baseURL}${url}`;
        console.log('🔗 Making DELETE request to:', fullUrl);

        const response = await API.delete(url);
        
        console.log('✅ Member removal successful:', response.data);
        return memberId;
      } catch (error: any) {
        console.error('❌ Member removal failed - Full error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          fullURL: error.config?.baseURL + error.config?.url
        });

        if (!error.response) {
          console.error('❌ Network error - server might be down');
        }

        throw error;
      }
    },
    onSuccess: (memberId) => {
      console.log('✅ Member removed successfully, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
    },
    onError: (error: any) => {
      console.error('❌ Remove mutation failed:', error);
    },
  });

  return {
    updateMemberRole: (memberId: string, role: string) => 
      updateMemberRoleMutation.mutateAsync({ memberId, role }),
    isUpdating: updateMemberRoleMutation.isPending,
    
    removeMember: (memberId: string) => 
      removeMemberMutation.mutateAsync(memberId),
    isRemoving: removeMemberMutation.isPending,
  };
};

