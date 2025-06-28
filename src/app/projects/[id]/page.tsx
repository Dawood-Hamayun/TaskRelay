// frontend/src/app/projects/[id]/page.tsx - Updated with member management
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Crown, 
  Shield, 
  User, 
  Eye, 
  Mail, 
  Search,
  Filter,
  RefreshCw,
  X,
  Loader2,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useInvites } from '@/hooks/useInvites';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import InviteMembersModal from '@/components/invites/InviteMembersModal';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
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

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    type: 'remove' | 'role' | null;
    member?: any;
    newRole?: string;
  }>({ type: null });
  
  const { user } = useAuth();
  const { projects, canManageProject, getUserRole } = useProjects();
  const { invites, isLoading: invitesLoading, cancelInvite, resendInvite } = useInvites(projectId);
  const { updateMemberRole, removeMember, isUpdating, isRemoving } = useMembers(projectId);
  
  // Find current project
  const currentProject = projects.find(p => p.id === projectId);
  const currentUserRole = currentProject ? getUserRole(currentProject, user?.userId || '') : null;
  const canManage = currentProject ? canManageProject(currentProject, user?.userId || '') : false;

  const roleInfo = {
    OWNER: { icon: Crown, label: 'Owner', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
    ADMIN: { icon: Shield, label: 'Admin', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
    MEMBER: { icon: User, label: 'Member', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    VIEWER: { icon: Eye, label: 'Viewer', color: 'text-zinc-600', bgColor: 'bg-zinc-100 dark:bg-zinc-900/20' }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canChangeRole = (member: any) => {
    const isCurrentUser = user?.userId === member.user.id;
    if (!canManage) return false;
    if (member.role === 'OWNER' && !isCurrentUser) return false;
    if (currentUserRole === 'ADMIN' && ['OWNER', 'ADMIN'].includes(member.role) && !isCurrentUser) return false;
    return true;
  };

  const canRemoveMember = (member: any) => {
    const isCurrentUser = user?.userId === member.user.id;
    if (isCurrentUser && ['MEMBER', 'VIEWER'].includes(currentUserRole || '')) return true;
    if (!canManage) return false;
    if (member.role === 'OWNER' && !isCurrentUser) return false;
    if (currentUserRole === 'ADMIN' && ['OWNER', 'ADMIN'].includes(member.role) && !isCurrentUser) return false;
    return true;
  };

  const getAvailableRoles = (member: any) => {
    if (currentUserRole === 'OWNER') {
      return Object.entries(roleInfo).filter(([key]) => key !== member.role);
    }
    if (currentUserRole === 'ADMIN') {
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

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite(inviteId);
    } catch (error) {
      console.error('Failed to cancel invite:', error);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInvite(inviteId);
    } catch (error) {
      console.error('Failed to resend invite:', error);
    }
  };

  const filteredMembers = currentProject ? currentProject.members.filter(member =>
    member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const filteredInvites = invites.filter(invite =>
    invite.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentProject) {
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

  const MemberCard = ({ member }: { member: any }) => {
    const role = roleInfo[member.role as keyof typeof roleInfo];
    const RoleIcon = role.icon;
    const isCurrentUser = user?.userId === member.user.id;

    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${member.user.color} flex items-center justify-center text-white text-sm font-semibold`}>
              {member.user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-card-foreground truncate">
                  {member.user.name || member.user.email}
                  {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                </h3>
                {member.role === 'OWNER' && <Crown className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-sm text-muted-foreground truncate">{member.user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Joined {formatDate(member.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full ${role.bgColor} flex items-center gap-1`}>
              <RoleIcon className={`w-3 h-3 ${role.color}`} />
              <span className={`text-xs font-medium ${role.color}`}>{role.label}</span>
            </div>
            {(canChangeRole(member) || canRemoveMember(member)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                            {roleKey === 'OWNER' && (
                              <Crown className="w-3 h-3 text-amber-500 ml-auto" />
                            )}
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
        </div>
      </div>
    );
  };

  const InviteCard = ({ invite }: { invite: any }) => {
    const role = roleInfo[invite.role as keyof typeof roleInfo];
    const RoleIcon = role.icon;

    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-card-foreground truncate">{invite.email}</h3>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>Invited by {invite.inviter.name || invite.inviter.email}</span>
                <span>{formatDate(invite.createdAt)}</span>
                <span>Expires {formatDate(invite.expiresAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full ${role.bgColor} flex items-center gap-1`}>
              <RoleIcon className={`w-3 h-3 ${role.color}`} />
              <span className={`text-xs font-medium ${role.color}`}>{role.label}</span>
            </div>
            {canManage && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleResendInvite(invite.id)}
                  className="w-7 h-7 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors"
                  title="Resend invite"
                >
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                </button>
                <button 
                  onClick={() => handleCancelInvite(invite.id)}
                  className="w-7 h-7 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                  title="Cancel invite"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          {canManage && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Invite Members
            </Button>
          )}
        </Header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
                  <p className="text-muted-foreground">{currentProject.name}</p>
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
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={activeTab === 'members' ? 'Search members...' : 'Search invites...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
              <button className="w-10 h-10 border border-border rounded-lg hover:bg-accent flex items-center justify-center transition-colors">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Role Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(roleInfo).map(([roleKey, role]) => {
                    const count = currentProject.members.filter(m => m.role === roleKey).length;
                    const RoleIcon = role.icon;
                    return (
                      <div key={roleKey} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <RoleIcon className={`w-4 h-4 ${role.color}`} />
                          <span className="text-sm font-medium text-card-foreground">{role.label}s</span>
                        </div>
                        <div className="text-2xl font-bold text-card-foreground">{count}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Members List */}
                <div className="space-y-3">
                  {filteredMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>

                {filteredMembers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invites' && (
              <div className="space-y-4">
                {invitesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Loading invites...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {filteredInvites.map(invite => (
                        <InviteCard key={invite.id} invite={invite} />
                      ))}
                    </div>

                    {filteredInvites.length === 0 && (
                      <div className="text-center py-12">
                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No pending invites</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ? 'No invites match your search' : 'All team members have been added to the project'}
                        </p>
                        {canManage && !searchQuery && (
                          <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Plus className="w-4 h-4" />
                            Invite Members
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Invite Members Modal */}
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
              <AlertDialogTitle className="flex items-center gap-2">
                {actionDialog.newRole === 'OWNER' ? (
                  <>
                    <Crown className="w-5 h-5 text-amber-500" />
                    Transfer Ownership
                  </>
                ) : (
                  `Change Role`
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {actionDialog.newRole === 'OWNER' ? (
                  <div className="space-y-2">
                    <p>
                      You are about to transfer ownership to{' '}
                      <strong>{actionDialog.member?.user.name || actionDialog.member?.user.email}</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • You will become an Admin<br/>
                      • They will have full control<br/>
                      • This cannot be undone by you
                    </p>
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
                  `Confirm Change`
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
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                {user?.userId === actionDialog.member?.user.id ? 'Leave Project' : 'Remove Member'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user?.userId === actionDialog.member?.user.id ? (
                  `Are you sure you want to leave this project? You will lose access to all project data.`
                ) : (
                  `Remove ${actionDialog.member?.user.name || actionDialog.member?.user.email} from this project? They will lose access to all project data.`
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