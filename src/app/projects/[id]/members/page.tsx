// frontend/src/app/projects/[id]/members/page.tsx - Project Members Page with Avatar Support
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  AlertTriangle, 
  Users,
  Plus,
  Search,
  Filter,
  Crown,
  Shield,
  User,
  Eye,
  MoreHorizontal,
  UserMinus,
  Settings,
  Mail,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useInvites } from '@/hooks/useInvites';
import { useMembers } from '@/hooks/useMembers';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import InviteMembersModal from '@/components/invites/InviteMembersModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// Helper functions for avatar handling
const getAvatarInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (email && email.trim()) {
    return email.charAt(0).toUpperCase();
  }
  
  return 'U';
};

const getAvatarColor = (userId: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
  ];
  
  // Generate a consistent hash from the userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { user } = useAuth();
  const { projects, getUserRole, canManageProject } = useProjects();
  const { invites, isLoading: invitesLoading, cancelInvite, resendInvite } = useInvites(projectId);
  const { updateMemberRole, removeMember, isUpdating, isRemoving } = useMembers(projectId);
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    type: 'remove' | 'role' | null;
    member?: any;
    newRole?: string;
  }>({ type: null });

  const currentProject = projects.find(p => p.id === projectId);
  const userRole = currentProject ? getUserRole(currentProject, user?.userId || '') : null;
  const canManage = currentProject ? canManageProject(currentProject, user?.userId || '') : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!currentProject) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Project not found</h2>
            <Button onClick={() => router.push('/projects')} variant="outline">
              ← Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const roleInfo = {
    OWNER: { 
      icon: Crown, 
      label: 'Owner', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'Full control over the project'
    },
    ADMIN: { 
      icon: Shield, 
      label: 'Admin', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'Can manage members and settings'
    },
    MEMBER: { 
      icon: User, 
      label: 'Member', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Can create and edit tasks'
    },
    VIEWER: { 
      icon: Eye, 
      label: 'Viewer', 
      color: 'text-zinc-600',
      bgColor: 'bg-zinc-100 dark:bg-zinc-900/20',
      description: 'Can view project content'
    }
  };

  const filteredMembers = currentProject.members.filter(member =>
    member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInvites = invites.filter(invite =>
    invite.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          {canManage && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite Members
            </Button>
          )}
        </Header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/projects/${projectId}`)}
                >
                  ← Project Overview
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
                  <p className="text-muted-foreground mt-1">{currentProject.name}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <div className="flex space-x-8">
                {[
                  { key: 'members', label: 'Members', count: currentProject.members.length },
                  { key: 'invites', label: 'Pending Invites', count: invites.length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={activeTab === 'members' ? 'Search members...' : 'Search invites...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Role Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(roleInfo).map(([roleKey, role]) => {
                    const count = currentProject.members.filter(m => m.role === roleKey).length;
                    const Icon = role.icon;
                    return (
                      <Card key={roleKey}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl ${role.bgColor} flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${role.color}`} />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">{role.label}s</div>
                              <div className={`text-2xl font-bold ${role.color}`}>{count}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Members List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredMembers.map(member => {
                        const role = roleInfo[member.role as keyof typeof roleInfo];
                        const RoleIcon = role.icon;
                        const isCurrentUser = user?.userId === member.user.id;
                        const avatarInitials = getAvatarInitials(member.user.name, member.user.email);
                        const avatarColor = getAvatarColor(member.user.id);

                        return (
                          <div key={member.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={member.user.avatar} alt={member.user.name || member.user.email} />
                                <AvatarFallback className={`text-sm font-semibold text-white ${avatarColor}`}>
                                  {avatarInitials}
                                </AvatarFallback>
                              </Avatar>
                              {member.role === 'OWNER' && (
                                <Crown className="absolute -top-1 -right-1 w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">
                                  {member.user.name || member.user.email}
                                </h3>
                                {isCurrentUser && (
                                  <span className="text-xs text-muted-foreground">(You)</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{member.user.email}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge className={`${role.bgColor} ${role.color} border-0`}>
                                  <RoleIcon className="w-3 h-3 mr-1" />
                                  {role.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Joined {formatDate(member.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {(canChangeRole(member) || canRemoveMember(member)) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {canChangeRole(member) && getAvailableRoles(member).length > 0 && (
                                    <>
                                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2">
                                        Change Role
                                      </DropdownMenuLabel>
                                      {getAvailableRoles(member).map(([roleKey, roleData]) => {
                                        const RoleIcon = roleData.icon;
                                        return (
                                          <DropdownMenuItem
                                            key={roleKey}
                                            onClick={() => setActionDialog({
                                              type: 'role',
                                              member,
                                              newRole: roleKey
                                            })}
                                            className="gap-2"
                                          >
                                            <RoleIcon className={`w-4 h-4 ${roleData.color}`} />
                                            <span>Make {roleData.label}</span>
                                          </DropdownMenuItem>
                                        );
                                      })}
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  
                                  {canRemoveMember(member) && (
                                    <DropdownMenuItem
                                      onClick={() => setActionDialog({
                                        type: 'remove',
                                        member
                                      })}
                                      className="gap-2 text-destructive focus:text-destructive"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                      <span>{isCurrentUser ? 'Leave Project' : 'Remove Member'}</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {filteredMembers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium text-foreground mb-2">No members found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'invites' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invites ({filteredInvites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {invitesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredInvites.map(invite => {
                        const role = roleInfo[invite.role as keyof typeof roleInfo];
                        const RoleIcon = role.icon;

                        return (
                          <div key={invite.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Mail className="w-6 h-6 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground">{invite.email}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge className={`${role.bgColor} ${role.color} border-0`}>
                                  <RoleIcon className="w-3 h-3 mr-1" />
                                  {role.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Invited by {invite.inviter.name || invite.inviter.email}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(invite.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {canManage && (
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resendInvite(invite.id)}
                                  className="gap-2"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Resend
                                </Button>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelInvite(invite.id)}
                                  className="gap-2 text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {filteredInvites.length === 0 && (
                        <div className="text-center py-12">
                          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="font-medium text-foreground mb-2">No pending invites</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchQuery ? 'No invites match your search' : 'All team members have been added'}
                          </p>
                          {canManage && !searchQuery && (
                            <Button
                              onClick={() => setIsInviteModalOpen(true)}
                              className="gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Invite Members
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
              <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRoleChange}
                disabled={isUpdating}
                className={actionDialog.newRole === 'OWNER' ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {isUpdating ? (
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
      </div>
    </div>
  );
}