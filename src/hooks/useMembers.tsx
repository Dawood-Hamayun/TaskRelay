// frontend/src/hooks/useMembers.tsx - Fixed to get project members dynamically
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';
import { useAuth } from './useAuth';
import { useProjects } from './useProjects';

export interface Member {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
    color?: string;
  };
}

export const useMembers = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { projects } = useProjects();

  // Get members from the project data (already loaded)
  const getProjectMembers = (): Member[] => {
    if (!projectId || !projects.length) return [];
    
    const project = projects.find(p => p.id === projectId);
    if (!project?.members) return [];
    
    // Transform project members to the expected format
    return project.members.map(member => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        color: member.user.color,
      }
    }));
  };

  // Fallback query if project data isn't available
  const { 
    data: apiMembers = [], 
    isLoading: isLoadingApi, 
    error 
  } = useQuery<Member[]>({
    queryKey: ['members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        console.log('🔍 Fetching members for project:', projectId);
        const response = await API.get(`/projects/${projectId}/members`);
        console.log('✅ Members fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Failed to fetch members:', error);
        // Return empty array instead of throwing to allow fallback
        return [];
      }
    },
    enabled: !!projectId && projects.length === 0, // Only fetch if projects not loaded yet
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get members from project data first, fallback to API
  const projectMembers = getProjectMembers();
  const members = projectMembers.length > 0 ? projectMembers : apiMembers;
  const isLoading = projects.length === 0 ? isLoadingApi : false;

  console.log('👥 Members hook state:', {
    projectId,
    projectsCount: projects.length,
    projectMembers: projectMembers.length,
    apiMembers: apiMembers.length,
    finalMembers: members.length,
    isLoading
  });

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      console.log('👤 Updating member role:', { memberId, role, projectId });
      
      const response = await API.put(`/members/${memberId}/role`, { 
        role,
        projectId 
      });
      
      console.log('✅ Member role updated:', response.data);
      return response.data;
    },
    onSuccess: () => {
      console.log('✅ Member role updated, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
    onError: (error) => {
      console.error('❌ Failed to update member role:', error);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      console.log('🗑️ Removing member:', { memberId, projectId });
      
      const response = await API.delete(`/members/${memberId}?projectId=${projectId}`);
      console.log('✅ Member removed:', response.data);
      return memberId;
    },
    onSuccess: () => {
      console.log('✅ Member removed, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['projects', user?.userId] });
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
    },
    onError: (error) => {
      console.error('❌ Failed to remove member:', error);
    },
  });

  // Helper functions
  const getMemberById = (memberId: string): Member | undefined => {
    return members.find(member => member.id === memberId);
  };

  const getMemberByUserId = (userId: string): Member | undefined => {
    return members.find(member => member.user.id === userId);
  };

  const canManageMember = (targetMember: Member, currentUserId: string): boolean => {
    const currentMember = getMemberByUserId(currentUserId);
    if (!currentMember) return false;
    
    // Owners can manage everyone, admins can manage members/viewers
    if (currentMember.role === 'OWNER') return true;
    if (currentMember.role === 'ADMIN') {
      return ['MEMBER', 'VIEWER'].includes(targetMember.role);
    }
    
    return false;
  };

  return {
    members,
    isLoading,
    error,
    
    // Mutations
    updateMemberRole: (memberId: string, role: string) => 
      updateMemberRoleMutation.mutateAsync({ memberId, role }),
    isUpdating: updateMemberRoleMutation.isPending,
    
    removeMember: (memberId: string) => 
      removeMemberMutation.mutateAsync(memberId),
    isRemoving: removeMemberMutation.isPending,
    
    // Helper functions
    getMemberById,
    getMemberByUserId,
    canManageMember,
  };
};