// frontend/src/hooks/useComments.tsx (Hardcoded for now)
'use client';

import { useState } from 'react';
import { Comment } from '@/types/task';

interface CreateCommentData {
  content: string;
}

interface CreateCommentParams {
  taskId: string;
  data: CreateCommentData;
}

// Mock data for development
const MOCK_COMMENTS: Record<string, Comment[]> = {
  'task-1': [
    {
      id: 'comment-1',
      content: 'This looks good! Just need to update the styling.',
      author: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'comment-2',
      content: 'Agreed. I can work on the mobile responsiveness.',
      author: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    },
  ],
  'task-2': [
    {
      id: 'comment-3',
      content: 'The API integration is complete. Ready for testing.',
      author: {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
  ],
};

export function useComments(taskId?: string) {
  const [comments, setComments] = useState<Comment[]>(
    taskId ? MOCK_COMMENTS[taskId] || [] : []
  );
  const [isCreating, setIsCreating] = useState(false);

  const createComment = async ({ taskId, data }: CreateCommentParams) => {
    setIsCreating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content: data.content,
      author: {
        id: 'current-user',
        name: 'Current User',
        email: 'current@example.com',
      },
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [newComment, ...prev]);
    setIsCreating(false);
    
    return newComment;
  };

  return {
    comments,
    createComment,
    isCreating,
    isLoading: false,
    error: null,
  };
}


