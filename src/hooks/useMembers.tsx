// frontend/src/hooks/useMembers.tsx (Hardcoded for now)
'use client';

import { useState, useEffect } from 'react';
import { Member } from '@/types/task';

// Mock data for development
const MOCK_MEMBERS: Record<string, Member[]> = {
  'project-1': [
    {
      id: 'member-1',
      user: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      role: 'OWNER',
    },
    {
      id: 'member-2',
      user: {
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      role: 'ADMIN',
    },
    {
      id: 'member-3',
      user: {
        id: 'user-3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
      role: 'MEMBER',
    },
    {
      id: 'member-4',
      user: {
        id: 'user-4',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
      },
      role: 'MEMBER',
    },
  ],
  'project-2': [
    {
      id: 'member-5',
      user: {
        id: 'user-5',
        name: 'Alex Brown',
        email: 'alex@example.com',
      },
      role: 'OWNER',
    },
    {
      id: 'member-6',
      user: {
        id: 'user-6',
        name: 'Emily Davis',
        email: 'emily@example.com',
      },
      role: 'MEMBER',
    },
  ],
};

export function useMembers(projectId?: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projectMembers = projectId ? MOCK_MEMBERS[projectId] || [] : [];
      setMembers(projectMembers);
      setIsLoading(false);
    };

    if (projectId) {
      loadMembers();
    } else {
      setMembers([]);
      setIsLoading(false);
    }
  }, [projectId]);

  return {
    members,
    isLoading,
    error: null,
  };
}
