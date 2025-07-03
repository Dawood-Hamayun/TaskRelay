// frontend/src/app/projects/[id]/page.tsx - Fixed Project Detail Page
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  AlertTriangle, 
  Star,
  BarChart3,
  Users,
  Settings,
  ArrowLeft,
  Crown,
  Shield,
  User,
  Eye,
  UserMinus,
  Trash2
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useInvites } from '@/hooks/useInvites';
import { useMembers } from '@/hooks/useMembers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ProjectOverviewTab } from '@/components/project/ProjectOverviewTab';
import { ProjectTeamTab } from '@/components/project/ProjectTeamTab';
import { ProjectSettingsTab } from '@/components/project/ProjectSettingsTab';
import InviteMembersModal from '@/components/invites/InviteMembersModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading, getUserRole, canManageProject, updateProject, deleteProject, isUpdating, isDeleting } = useProjects();
  const { tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { invites, isLoading: invitesLoading, cancelInvite, resendInvite } = useInvites(projectId);
  const { updateMemberRole, removeMember, isUpdating: isUpdatingMember, isRemoving } = useMembers(projectId);
  
  // Find current project
  const currentProject = projects.find(p => p.id === projectId);
  const userRole = currentProject ? getUserRole(currentProject, user?.userId || '') : null;
  const canManage = currentProject ? canManageProject(currentProject, user?.userId || '') : false;

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Settings form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Team management state
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDialog, setActionDialog] = useState<{
    type: 'remove' | 'role' | null;
    member?: any;
    newRole?: string;
  }>({ type: null });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description || ''
      });
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject) {
      const hasFormChanges = 
        formData.name !== currentProject.name ||
        formData.description !== (currentProject.description || '');
      setHasChanges(hasFormChanges);
    }
  }, [formData, currentProject]);

  if (!mounted) {
    return null;
  }

  if (projectsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Project not found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button 
              onClick={() => router.push('/projects')}
              variant="outline"
            >
              ← Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length,
    todo: tasks.filter(t => t.status === 'TODO').length
  };
  
  // Recent activities
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Role configuration
  const roleInfo = {
    OWNER: { 
      icon: Crown, 
      label: 'Owner', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    ADMIN: { 
      icon: Shield, 
      label: 'Admin', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    MEMBER: { 
      icon: User, 
      label: 'Member', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    VIEWER: { 
      icon: Eye, 
      label: 'Viewer', 
      color: 'text-zinc-600',
      bgColor: 'bg-zinc-100 dark:bg-zinc-900/20'
    }
  };

  // Helper functions
  const getStatusBadge = () => {
    switch (currentProject.status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
            Completed
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
            Active
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Team management functions
  const filteredMembers = currentProject.members.filter(member =>
    member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvites = invites.filter(invite =>
    invite.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Team management functions
  const canChangeRole = (member: any) => {
    const isCurrentUser = user?.userId === member.user.id;
    if (!canManage) return false;
    if (member.role === 'OWNER' && !isCurrentUser) return false;
    if (userRole === 'ADMIN' && ['OWNER', 'ADMIN'].includes(member.role) && !isCurrentUser) return false;
    return true;
  };

  const canRemoveMember = (member: any) => {
    const isCurrentUser = user?.userId === member.user.id;
    if (isCurrentUser && ['MEMBER', 'VIEWER'].includes(userRole || '')) return true;
    if (!canManage) return false;
    if (member.role === 'OWNER' && !isCurrentUser) return false;
    if (userRole === 'ADMIN' && ['OWNER', 'ADMIN'].includes(member.role) && !isCurrentUser) return false;
    return true;
  };

  const getAvailableRoles = (member: any) => {
    if (userRole === 'OWNER') {
      return Object.entries(roleInfo).filter(([key]) => key !== member.role);
    }
    if (userRole === 'ADMIN') {
      return Object.entries(roleInfo).filter(([key]) => 
        key !== 'OWNER' && key !== member.role
      );
    }
    return [];
  };

  // Settings functions
  const handleSave = async () => {
  console.log('💾 handleSave called with formData:', formData);
  
  const newErrors: Record<string, string> = {};
  
  if (!formData.name.trim()) {
    newErrors.name = 'Project name is required';
  }
  
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length === 0) {
    try {
      // Prepare the update data - this is the key fix!
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      };
      
      console.log('📝 Calling updateProject with:', { projectId, data: updateData });
      
      // Call updateProject with the correct parameters
      await updateProject({
        projectId: projectId,
        data: updateData
      });
      
      console.log('✅ Project updated successfully');
      setHasChanges(false);
      setErrors({});
    } catch (error: any) {
      console.error('❌ Failed to update project:', error);
      setErrors({ 
        submit: error.message || 'Failed to update project. Please try again.' 
      });
    }
  }
};

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      router.push('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setShowDeleteDialog(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = async () => {
    if (!actionDialog.member || !actionDialog.newRole) return;
    try {
      await updateMemberRole(actionDialog.member.id, actionDialog.newRole);
      setActionDialog({ type: null });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRemoveMember = async () => {
    if (!actionDialog.member) return;
    try {
      await removeMember(actionDialog.member.id);
      setActionDialog({ type: null });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Projects
            </Button>
          </div>
        </Header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Project Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{currentProject.name}</h1>
                  {userRole === 'OWNER' && <Star className="w-6 h-6 text-amber-500 fill-amber-500" />}
                  {getStatusBadge()}
                </div>
                
                {currentProject.description && (
                  <p className="text-muted-foreground text-lg max-w-2xl">
                    {currentProject.description}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Created {formatDate(currentProject.createdAt)}</span>
                  <span>•</span>
                  <span>{currentProject.members.length} member{currentProject.members.length !== 1 ? 's' : ''}</span>
                  {userRole && (
                    <>
                      <span>•</span>
                      <span>You're a {userRole.toLowerCase()}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Team Avatars */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {currentProject.members.slice(0, 5).map((member, index) => (
                    <div
                      key={member.id}
                      className={`w-10 h-10 rounded-full ${member.user.color} flex items-center justify-center text-white text-sm font-semibold border-2 border-background shadow-sm`}
                      style={{ zIndex: 10 - index }}
                      title={member.user.name || member.user.email}
                    >
                      {member.user.avatar}
                    </div>
                  ))}
                  {currentProject.members.length > 5 && (
                    <div 
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold border-2 border-background shadow-sm"
                      style={{ zIndex: 5 }}
                    >
                      +{currentProject.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'team', label: 'Team', icon: Users },
                  { key: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-4 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                        activeTab === tab.key
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="pb-8">
              {activeTab === 'overview' && (
                <ProjectOverviewTab
                  projectId={projectId}
                  currentProject={currentProject}
                  taskStats={taskStats}
                  recentTasks={recentTasks}
                  canManage={canManage}
                  setActiveTab={setActiveTab}
                  setIsInviteModalOpen={setIsInviteModalOpen}
                />
              )}
              
              {activeTab === 'team' && (
                <ProjectTeamTab
                  currentProject={currentProject}
                  invites={invites}
                  filteredMembers={filteredMembers}
                  filteredInvites={filteredInvites}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  canManage={canManage}
                  setIsInviteModalOpen={setIsInviteModalOpen}
                  canChangeRole={canChangeRole}
                  canRemoveMember={canRemoveMember}
                  getAvailableRoles={getAvailableRoles}
                  setActionDialog={setActionDialog}
                  formatDate={formatDate}
                  currentUserId={user?.userId}
                  invitesLoading={invitesLoading}
                  resendInvite={resendInvite}
                  cancelInvite={cancelInvite}
                />
              )}
              
              {activeTab === 'settings' && (
                <ProjectSettingsTab
                  userRole={userRole}
                  formData={formData}
                  hasChanges={hasChanges}
                  errors={errors}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                  taskStats={taskStats}
                  currentProject={currentProject}
                  handleInputChange={handleInputChange}
                  handleSave={handleSave}
                  setShowDeleteDialog={setShowDeleteDialog}
                  setFormData={setFormData}
                  setErrors={setErrors}
                />
              )}
            </div>
          </div>
        </main>

        {/* Modals */}
        <InviteMembersModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          projectId={projectId}
          projectName={currentProject.name}
        />

        {/* Role Change Dialog */}
        <AlertDialog 
          open={actionDialog.type === 'role'} 
          onOpenChange={() => setActionDialog({ type: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog.newRole === 'OWNER' ? 'Transfer Ownership' : 'Change Role'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog.newRole === 'OWNER' ? (
                  <div className="space-y-2">
                    <p>You are about to transfer ownership to <strong>{actionDialog.member?.user.name || actionDialog.member?.user.email}</strong>.</p>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                  </div>
                ) : (
                  `Change ${actionDialog.member?.user.name || actionDialog.member?.user.email}'s role to ${roleInfo[actionDialog.newRole as keyof typeof roleInfo]?.label}?`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdatingMember}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRoleChange}
                disabled={isUpdatingMember}
                className={actionDialog.newRole === 'OWNER' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {isUpdatingMember ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Confirm'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Remove Member Dialog */}
        <AlertDialog 
          open={actionDialog.type === 'remove'} 
          onOpenChange={() => setActionDialog({ type: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {user?.userId === actionDialog.member?.user.id ? 'Leave Project' : 'Remove Member'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user?.userId === actionDialog.member?.user.id ? (
                  'Are you sure you want to leave this project? You will lose access to all project data.'
                ) : (
                  `Remove ${actionDialog.member?.user.name || actionDialog.member?.user.email} from this project?`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {user?.userId === actionDialog.member?.user.id ? 'Leaving...' : 'Removing...'}
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    {user?.userId === actionDialog.member?.user.id ? 'Leave Project' : 'Remove Member'}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Project
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{currentProject.name}</strong>? 
                This action cannot be undone and will permanently delete:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All tasks and subtasks</li>
                  <li>All meetings and calendar events</li>
                  <li>All project data and files</li>
                  <li>All team member access</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}