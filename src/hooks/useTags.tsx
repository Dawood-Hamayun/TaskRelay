// frontend/src/hooks/useTags.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag } from '@/types/task';

interface CreateTagData {
  name: string;
  color: string;
}

export function useTags(projectId?: string) {
  const queryClient = useQueryClient();

  const {
    data: tags = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tags', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tags fetch error:', errorData);
        throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!projectId,
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: CreateTagData) => {
      if (!projectId) throw new Error('Project ID is required');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags/${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tag creation error:', errorData);
        throw new Error(`Failed to create tag: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
    },
    onError: (error) => {
      console.error('Create tag mutation error:', error);
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tag deletion error:', errorData);
        throw new Error(`Failed to delete tag: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    },
    onError: (error) => {
      console.error('Delete tag mutation error:', error);
    },
  });

  return {
    tags,
    createTag: createTagMutation.mutateAsync,
    deleteTag: deleteTagMutation.mutateAsync,
    isLoading,
    isCreating: createTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
    error,
  };
}