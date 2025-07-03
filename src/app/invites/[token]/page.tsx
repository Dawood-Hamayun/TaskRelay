// frontend/src/app/invites/[token]/page.tsx - Working version
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Users, 
  Calendar, 
  Clock, 
  Mail, 
  Shield, 
  User, 
  Crown, 
  Eye,
  ArrowRight,
  Loader2,
  UserPlus
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import API from '@/lib/api';
import Image from 'next/image';

export default function InviteAcceptancePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [decision, setDecision] = useState<'accepted' | 'declined' | null>(null);
  const [error, setError] = useState<string>('');
  const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
  const [isDecliningInvite, setIsDecliningInvite] = useState(false);
  
  const { user, token: authToken } = useAuth();

  const roleInfo = {
    VIEWER: { icon: Eye, label: 'Viewer', color: 'text-zinc-600', description: 'Can view project and tasks' },
    MEMBER: { icon: User, label: 'Member', color: 'text-blue-600', description: 'Can create and edit tasks, comment' },
    ADMIN: { icon: Shield, label: 'Admin', color: 'text-orange-600', description: 'Can manage members and project settings' },
    OWNER: { icon: Crown, label: 'Owner', color: 'text-purple-600', description: 'Full control over project' }
  };

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setError('Invalid invite link');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading invite for token:', token);
        const res = await API.get(`/invites/${token}`);
        console.log('📧 Invite loaded:', res.data);
        setInvite(res.data);
      } catch (error: any) {
        console.error('❌ Failed to load invite:', error);
        setError(error?.response?.data?.message || 'Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Expired';
    if (diffInHours < 24) {
      return `${diffInHours} hours`;
    } else {
      const days = Math.ceil(diffInHours / 24);
      return `${days} days`;
    }
  };

  const handleAccept = async () => {
    try {
      setError('');
      
      // If not authenticated, redirect to auth with invite token
      if (!authToken) {
        console.log('🔒 Not authenticated, redirecting to auth flow');
        router.push(`/login?invite=${token}`);
        return;
      }
      
      // Check if the authenticated user's email matches the invite
      if (invite?.email && user?.email !== invite.email) {
          setError(
            `This invite is for ${invite.email}, but you're signed in as ${user?.email ?? 'unknown account'}. ` +
            'Please sign in with the correct account or ask for a new invite.'
          );
      }
      
      // Accept the invite
      console.log('✅ Accepting invite for authenticated user');
      setIsAcceptingInvite(true);
      const result = await API.post(`/invites/${token}/accept`);
      console.log('🎉 Invite accepted:', result.data);
      setDecision('accepted');
      
      // Redirect to project after a brief delay
      setTimeout(() => {
        router.push(`/projects/${invite.project.id}`);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Failed to accept invite:', error);
      setError(error?.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsAcceptingInvite(false);
    }
  };

  const handleDecline = async () => {
    try {
      setError('');
      setIsDecliningInvite(true);
      await API.post(`/invites/${token}/decline`);
      console.log('❌ Invite declined');
      setDecision('declined');
    } catch (error: any) {
      console.error('❌ Failed to decline invite:', error);
      setError(error?.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setIsDecliningInvite(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-card-foreground">Invitation Issue</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => router.push(`/login?invite=${token}`)}
              className="block w-full px-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors border border-border rounded-lg hover:bg-accent"
            >
              Try Signing In
            </button>
            <button 
              onClick={() => router.push(`/signup?invite=${token}`)}
              className="block w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'accepted') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-card-foreground">Welcome to the team!</h1>
            <p className="text-muted-foreground">
              You've successfully joined <strong>{invite.project.name}</strong>
            </p>
          </div>
          <div className="text-center space-y-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Redirecting to project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (decision === 'declined') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-gray-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-card-foreground">Invitation Declined</h1>
            <p className="text-muted-foreground">
              You've declined the invitation to join <strong>{invite.project.name}</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            You can close this page now.
          </p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Invitation not found</p>
        </div>
      </div>
    );
  }

  const role = roleInfo[invite.role as keyof typeof roleInfo];
  const RoleIcon = role.icon;
  const timeUntilExpiry = getTimeUntilExpiry(invite.expiresAt);
  const isExpired = timeUntilExpiry === 'Expired';

  // Check if user email doesn't match invite email
  const emailMismatch = authToken && user?.email && invite.email && user.email !== invite.email;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/taskrelay.svg"
              alt="TaskRelay"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <h1 className="font-semibold text-card-foreground">TaskRelay</h1>
              <p className="text-xs text-muted-foreground">Project Invitation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Debug Info */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p><strong>🔍 Debug Info:</strong></p>
            <p>Token: {token}</p>
            <p>Authenticated: {authToken ? 'Yes' : 'No'}</p>
            <p>User Email: {user?.email || 'None'}</p>
            <p>Invite Email: {invite.email}</p>
            <p>Project: {invite.project.name}</p>
          </div>

          {/* Invitation Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-card-foreground">You're Invited!</h1>
              <p className="text-lg text-muted-foreground">
                <strong className="text-card-foreground">{invite.inviter.name || invite.inviter.email}</strong> has invited you to collaborate
              </p>
            </div>
          </div>

          {/* Email Mismatch Warning */}
          {emailMismatch && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                    Email Mismatch
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                    This invite is for <strong>{invite.email}</strong>, but you're signed in as <strong>{user?.email}</strong>. 
                    Please sign in with the correct account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expired Notice */}
          {isExpired && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-700 dark:text-red-400 font-medium">This invitation has expired</p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                Please contact the project owner for a new invitation
              </p>
            </div>
          )}

          {/* Project Card */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-card-foreground">{invite.project.name}</h2>
                  {invite.project.description && (
                    <p className="text-muted-foreground">{invite.project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                  <RoleIcon className={`w-4 h-4 ${role.color}`} />
                  <span className="text-sm font-medium text-card-foreground">{role.label}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">As a {role.label}, you'll be able to:</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>

            {invite.message && (
              <div className="border-l-4 border-primary/30 pl-4 py-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Personal message:</p>
                <p className="text-card-foreground italic">"{invite.message}"</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Invited {formatDate(invite.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className={isExpired ? 'text-red-600 dark:text-red-400' : ''}>
                  {isExpired ? 'Expired' : `Expires in ${timeUntilExpiry}`}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && !emailMismatch && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!isExpired && !emailMismatch && (
            <div className="space-y-4">
              {!authToken ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      To accept this invitation, please sign in or create an account
                    </p>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/login?invite=${token}`)}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Sign In & Accept
                  </button>
                  
                  <button
                    onClick={() => router.push(`/signup?invite=${token}`)}
                    className="w-full h-12 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account & Accept
                  </button>
                  
                  <button
                    onClick={handleDecline}
                    disabled={isDecliningInvite}
                    className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {isDecliningInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Declining...
                      </>
                    ) : (
                      'Decline Invitation'
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={isAcceptingInvite || isDecliningInvite}
                    className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAcceptingInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Accept Invitation
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={isAcceptingInvite || isDecliningInvite}
                    className="flex-1 h-12 bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDecliningInvite ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Decline
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email Mismatch Actions */}
          {emailMismatch && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/login?invite=${token}`)}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <ArrowRight className="w-4 h-4" />
                Sign In with {invite.email}
              </button>
              <button
                onClick={handleDecline}
                disabled={isDecliningInvite}
                className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isDecliningInvite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Declining...
                  </>
                ) : (
                  'Decline Invitation'
                )}
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            By accepting this invitation, you agree to TaskRelay's terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}