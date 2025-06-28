// frontend/src/hooks/useInvites.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '@/lib/api';

export interface Invite {
  id: string;
  email: string;
  projectId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  message?: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
    description?: string;
  };
  inviter: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface CreateInviteData {
  email: string;
  projectId: string;
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  message?: string;
}

export const useInvites = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Get project invites
  const { data: invites = [], isLoading, error } = useQuery<Invite[]>({
    queryKey: ['invites', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      console.log('Fetching invites for project:', projectId);
      const res = await API.get(`/invites/project/${projectId}`);
      console.log('Invites response:', res.data);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (data: CreateInviteData) => {
      console.log('Creating invite:', data);
      const res = await API.post('/invites', data);
      console.log('Invite created:', res.data);
      return res.data;
    },
    onSuccess: (newInvite) => {
      console.log('Invite creation successful, updating cache');
      // Optimistically update the cache
      queryClient.setQueryData<Invite[]>(['invites', projectId], (old) => {
        return old ? [newInvite, ...old] : [newInvite];
      });
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['invites', projectId] });
      // Invalidate projects to update member counts
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Failed to create invite:', error);
    },
  });

  // Cancel invite mutation
  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      console.log('Cancelling invite:', inviteId);
      await API.delete(`/invites/${inviteId}`);
      return inviteId;
    },
    onSuccess: (deletedInviteId) => {
      console.log('Invite cancellation successful, updating cache');
      // Optimistically remove from cache
      queryClient.setQueryData<Invite[]>(['invites', projectId], (old) => {
        return old ? old.filter(invite => invite.id !== deletedInviteId) : [];
      });
    },
    onError: (error) => {
      console.error('Failed to cancel invite:', error);
    },
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      console.log('Resending invite:', inviteId);
      const res = await API.post(`/invites/${inviteId}/resend`);
      console.log('Invite resent:', res.data);
      return res.data;
    },
    onSuccess: (updatedInvite) => {
      console.log('Invite resend successful, updating cache');
      // Update the specific invite in cache
      queryClient.setQueryData<Invite[]>(['invites', projectId], (old) => {
        return old ? old.map(invite => 
          invite.id === updatedInvite.invite.id ? updatedInvite.invite : invite
        ) : [];
      });
    },
    onError: (error) => {
      console.error('Failed to resend invite:', error);
    },
  });

  // Batch create invites
  const createBatchInvites = async (inviteList: CreateInviteData[]) => {
    console.log('Creating batch invites:', inviteList);
    const results = [];
    const errors = [];

    for (const inviteData of inviteList) {
      try {
        const result = await createInviteMutation.mutateAsync(inviteData);
        results.push(result);
      } catch (error) {
        console.error('Failed to create invite:', inviteData.email, error);
        errors.push({ email: inviteData.email, error });
      }
    }

    return { results, errors };
  };

  return {
    invites,
    isLoading,
    error,
    createInvite: createInviteMutation.mutateAsync,
    isCreatingInvite: createInviteMutation.isPending,
    cancelInvite: cancelInviteMutation.mutateAsync,
    isCancellingInvite: cancelInviteMutation.isPending,
    resendInvite: resendInviteMutation.mutateAsync,
    isResendingInvite: resendInviteMutation.isPending,
    createBatchInvites,
  };
};

// Hook for public invite acceptance (no auth required)
export const useInviteAcceptance = () => {
  const queryClient = useQueryClient();

  // Get invite by token (public)
  const getInviteByToken = async (token: string) => {
    console.log('Fetching invite by token:', token);
    const res = await API.get(`/invites/${token}`);
    console.log('Invite details:', res.data);
    return res.data;
  };

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      console.log('Accepting invite:', token);
      const res = await API.post(`/invites/${token}/accept`);
      console.log('Invite accepted:', res.data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate projects and invites to refresh data
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
    onError: (error) => {
      console.error('Failed to accept invite:', error);
    },
  });

  // Decline invite mutation (public, no auth required)
  const declineInviteMutation = useMutation({
    mutationFn: async (token: string) => {
      console.log('Declining invite:', token);
      const res = await API.post(`/invites/${token}/decline`);
      console.log('Invite declined:', res.data);
      return res.data;
    },
    onError: (error) => {
      console.error('Failed to decline invite:', error);
    },
  });

  return {
    getInviteByToken,
    acceptInvite: acceptInviteMutation.mutateAsync,
    isAcceptingInvite: acceptInviteMutation.isPending,
    declineInvite: declineInviteMutation.mutateAsync,
    isDecliningInvite: declineInviteMutation.isPending,
  };
};