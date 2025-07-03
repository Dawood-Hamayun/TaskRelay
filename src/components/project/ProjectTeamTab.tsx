// frontend/src/components/project/ProjectTeamTab.tsx
'use client';

import React from 'react';
import { 
  Plus,
  Users,
  Crown,
  Shield,
  User,
  Eye,
  MoreHorizontal,
  UserMinus,
  Mail,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
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

interface ProjectMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
    color?: string;
  };
  createdAt: string;
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

interface ProjectTeamTabProps {
  currentProject: {
    members: ProjectMember[];
  };
  invites: Invite[];
  filteredMembers: ProjectMember[];
  filteredInvites: Invite[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canManage: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  canChangeRole: (member: ProjectMember) => boolean;
  canRemoveMember: (member: ProjectMember) => boolean;
  getAvailableRoles: (member: ProjectMember) => Array<[string, any]>;
  setActionDialog: (dialog: any) => void;
  formatDate: (date: string) => string;
  currentUserId?: string;
  invitesLoading: boolean;
  resendInvite: (id: string) => void;
  cancelInvite: (id: string) => void;
}

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

export function ProjectTeamTab({
  currentProject,
  invites,
  filteredMembers,
  filteredInvites,
  searchQuery,
  setSearchQuery,
  canManage,
  setIsInviteModalOpen,
  canChangeRole,
  canRemoveMember,
  getAvailableRoles,
  setActionDialog,
  formatDate,
  currentUserId,
  invitesLoading,
  resendInvite,
  cancelInvite
}: ProjectTeamTabProps) {
  
  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
        </div>
        {canManage && (
          <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Invite Members
          </Button>
        )}
      </div>

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
              const isCurrentUser = currentUserId === member.user.id;
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

      {/* Pending Invites */}
      {invites.length > 0 && (
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
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No invites match your search' : 'All team members have been added'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}