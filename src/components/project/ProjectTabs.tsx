// frontend/src/components/project/ProjectTabs.tsx - Redesigned with 3 tabs
'use client';
import { useState } from 'react';
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
      avatar?: string;   // ← make optional
      color?: string;
    };
  };
}

interface Invite {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt: string;
  inviter: {
    name?: string;
    email: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  invites?: Invite[];
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
    inReview: number;
    overdue: number;
    todo: number;
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
  onInviteMembers,
}: ProjectTabsProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const invites           = project.invites ?? [];           // if you keep invites on the project
  const filteredMembers   = project.members.filter(m =>
    m.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInvites   = invites.filter(i =>
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5); // keep latest five
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
          projectId={project.id}
          currentProject={project}
          taskStats={taskStats}
          recentTasks={recentTasks}
          canManage={canManage}
          setActiveTab={() => {}}
          setIsInviteModalOpen={onInviteMembers}
        />
      </TabsContent>

      <TabsContent value="team" className="space-y-6 m-0">
        <ProjectTeamTab
          currentProject={project}
          invites={invites}
          filteredMembers={filteredMembers}
          filteredInvites={filteredInvites}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          canManage={canManage}
          setIsInviteModalOpen={onInviteMembers}
          canChangeRole={() => false}          // ← supply real helpers
          canRemoveMember={() => false}
          getAvailableRoles={() => []}
          setActionDialog={() => {}}
          formatDate={(d) => new Date(d).toLocaleDateString()}
          invitesLoading={false}
          resendInvite={() => {}}
          cancelInvite={() => {}}
          currentUserId={undefined}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6 m-0">
        {/* remove the component here; let ProjectDetailPage render it
            where all the state/handlers are available */}
        <p className="text-sm text-muted-foreground">
          Settings are available in the project detail page.
        </p>
      </TabsContent>
    </Tabs>
  );
}

