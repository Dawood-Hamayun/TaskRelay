// frontend/src/components/project/ProjectTabs.tsx - Redesigned with 3 tabs
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ProjectTeamTab } from './ProjectTeamTab';
import { ProjectSettingsTab } from './ProjectSettingsTab';
import { BarChart3, Users, Settings } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BACKLOG';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  assignee?: {
    user: {
      name?: string;
      email: string;
      avatar: string;
      color: string;
    };
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  members: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    user: {
      id: string;
      name?: string;
      email: string;
      avatar: string;
      color: string;
    };
    createdAt: string;
  }>;
}

interface ProjectTabsProps {
  project: Project;
  tasks: Task[];
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  userRole: string | null;
  canManage: boolean;
  isTasksLoading: boolean;
  onInviteMembers: () => void;
}

export function ProjectTabs({ 
  project, 
  tasks, 
  taskStats, 
  userRole, 
  canManage, 
  isTasksLoading,
  onInviteMembers 
}: ProjectTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <div className="flex items-center justify-center">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-background">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-background">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6 m-0">
        <ProjectOverviewTab
          project={project}
          tasks={tasks}
          taskStats={taskStats}
          userRole={userRole}
          canManage={canManage}
          isTasksLoading={isTasksLoading}
          onInviteMembers={onInviteMembers}
        />
      </TabsContent>

      <TabsContent value="team" className="space-y-6 m-0">
        <ProjectTeamTab 
          project={project}
          userRole={userRole}
          canManage={canManage}
          onInviteMembers={onInviteMembers}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6 m-0">
        <ProjectSettingsTab 
          project={project}
          userRole={userRole}
          canManage={canManage}
        />
      </TabsContent>
    </Tabs>
  );
}

