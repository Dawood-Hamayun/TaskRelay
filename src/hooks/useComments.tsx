// frontend/src/hooks/useComments.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/types/task';

interface CreateCommentData {
  content: string;
}

interface CreateCommentParams {
  taskId: string;
  data: CreateCommentData;
}

export function useComments(taskId?: string) {
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: !!taskId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ taskId, data }: CreateCommentParams) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${taskId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    comments,
    createComment: createCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isLoading,
    error,
  };
}

