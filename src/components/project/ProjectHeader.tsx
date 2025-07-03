// frontend/src/components/project/ProjectHeader.tsx
'use client';

import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    createdAt: string;
    members: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        name?: string;
        email: string;
        avatar: string;
        color: string;
      };
    }>;
  };
  userRole: string | null;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}

export function ProjectHeader({ project, userRole, taskStats }: ProjectHeaderProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400';
      case 'archived': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/projects')}
          className="text-muted-foreground hover:text-foreground"
        >
          ← Projects
        </Button>
      </div>
      
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            {userRole === 'OWNER' && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
            </Badge>
          </div>
          
          {project.description && (
            <p className="text-muted-foreground max-w-2xl">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created {formatDate(project.createdAt)}</span>
            <span>•</span>
            <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{taskStats.total} tasks</span>
            {userRole && (
              <>
                <span>•</span>
                <span>You're a {userRole.toLowerCase()}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((member, index) => (
              <div
                key={member.id}
                className={`w-8 h-8 rounded-full ${member.user.color} flex items-center justify-center text-white text-xs font-medium border-2 border-background`}
                style={{ zIndex: 10 - index }}
                title={member.user.name || member.user.email}
              >
                {member.user.avatar}
              </div>
            ))}
            {project.members.length > 3 && (
              <div 
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium border-2 border-background"
                style={{ zIndex: 7 }}
              >
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}