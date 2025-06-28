// frontend/src/components/invites/InviteMembersModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Plus, Mail, Send, Users, Crown, Shield, Eye, User, Trash2, Check, Loader2 } from 'lucide-react';
import { useInvites } from '@/hooks/useInvites';
import { useAuth } from '@/hooks/useAuth';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

interface InviteRow {
  id: number;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  isValid: boolean;
}

export default function InviteMembersModal({ 
  isOpen, 
  onClose, 
  projectId,
  projectName
}: InviteMembersModalProps) {
  const [invites, setInvites] = useState<InviteRow[]>([
    { id: 1, email: '', role: 'MEMBER', isValid: false }
  ]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { createBatchInvites } = useInvites(projectId);
  const [isProcessing, setIsProcessing] = useState(false);

  const roles = [
    { 
      value: 'VIEWER' as const, 
      label: 'Viewer', 
      icon: Eye, 
      description: 'Can view project and tasks',
      color: 'text-zinc-600'
    },
    { 
      value: 'MEMBER' as const, 
      label: 'Member', 
      icon: User, 
      description: 'Can create and edit tasks, comment',
      color: 'text-blue-600'
    },
    { 
      value: 'ADMIN' as const, 
      label: 'Admin', 
      icon: Shield, 
      description: 'Can manage members and project settings',
      color: 'text-orange-600'
    },
    { 
      value: 'OWNER' as const, 
      label: 'Owner', 
      icon: Crown, 
      description: 'Full control over project',
      color: 'text-purple-600'
    }
  ];

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addInviteRow = () => {
    setInvites([...invites, { 
      id: Date.now(), 
      email: '', 
      role: 'MEMBER', 
      isValid: false 
    }]);
  };

  const updateInvite = (id: number, field: keyof InviteRow, value: string) => {
    setInvites(invites.map(invite => {
      if (invite.id === id) {
        const updated = { ...invite, [field]: value };
        if (field === 'email') {
          updated.isValid = validateEmail(value);
        }
        return updated;
      }
      return invite;
    }));
  };

  const removeInvite = (id: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter(invite => invite.id !== id));
    }
  };

  const handleSendInvites = async () => {
    const validInvites = invites.filter(invite => invite.isValid);
    if (validInvites.length === 0) {
      setErrors(['Please enter at least one valid email address']);
      return;
    }

    setIsProcessing(true);
    setErrors([]);

    try {
      const inviteData = validInvites.map(invite => ({
        email: invite.email,
        projectId,
        role: invite.role,
        message: message.trim() || undefined
      }));

      const { results, errors: inviteErrors } = await createBatchInvites(inviteData);
      
      if (inviteErrors.length > 0) {
        const errorMessages = inviteErrors.map(err => 
          `Failed to invite ${err.email}: ${err.error?.response?.data?.message || 'Unknown error'}`
        );
        setErrors(errorMessages);
      }

      if (results.length > 0) {
        // Success - close modal or show success state
        if (inviteErrors.length === 0) {
          // All invites successful
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Failed to send invites:', error);
      setErrors([error?.response?.data?.message || 'Failed to send invites. Please try again.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setInvites([{ id: 1, email: '', role: 'MEMBER', isValid: false }]);
    setMessage('');
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validInviteCount = invites.filter(invite => invite.isValid).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Invite Members</h2>
                <p className="text-sm text-muted-foreground">{projectName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}

          {/* Invite List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">
                Email Addresses
              </label>
              <button
                onClick={addInviteRow}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add more
              </button>
            </div>

            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={invite.email}
                    onChange={(e) => updateInvite(invite.id, 'email', e.target.value)}
                    className={`w-full h-10 pl-10 pr-4 text-sm bg-input border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 ${
                      invite.email && !invite.isValid 
                        ? 'border-destructive focus:ring-destructive' 
                        : invite.isValid 
                        ? 'border-emerald-500 focus:ring-emerald-500' 
                        : 'border-border'
                    }`}
                  />
                  {invite.isValid && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>

                <select
                  value={invite.role}
                  onChange={(e) => updateInvite(invite.id, 'role', e.target.value)}
                  className="h-10 px-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring min-w-[120px]"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                {invites.length > 1 && (
                  <button
                    onClick={() => removeInvite(invite.id)}
                    className="w-10 h-10 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Role Descriptions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-card-foreground">Permission Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map(role => {
                const Icon = role.icon;
                return (
                  <div key={role.value} className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 ${role.color}`} />
                    <div>
                      <div className="text-sm font-medium text-card-foreground">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">
              Personal Message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal note to your invitation..."
              className="w-full h-20 p-3 text-sm bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {validInviteCount > 0 && (
                <span>
                  Ready to invite {validInviteCount} member{validInviteCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-card-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvites}
                disabled={validInviteCount === 0 || isProcessing}
                className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invites
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}