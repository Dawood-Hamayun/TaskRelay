// frontend/src/components/project/ProjectTasksTab.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ExternalLink } from 'lucide-react';

interface ProjectTasksTabProps {
  projectId: string;
}

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const router = useRouter();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-medium mb-2">Task Management</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        View and manage all project tasks in the dedicated task board with kanban and list views.
      </p>
      <Button 
        onClick={() => router.push(`/tasks?project=${projectId}`)}
        className="gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Open Task Board
      </Button>
    </div>
  );
}