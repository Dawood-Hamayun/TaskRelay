// frontend/src/app/settings/page.tsx - Fixed version
'use client';

import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  User, 
  Lock, 
  Camera, 
  Trash2, 
  Save, 
  Loader2, 
  Settings,
  BarChart3,
  Target,
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Upload,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { logout } = useAuth();
  const {
    profile,
    stats,
    profileLoading,
    statsLoading,
    isUpdatingProfile,
    isUpdatingPassword,
    isUpdatingAvatar,
    isRemovingAvatar,
    isDeletingAccount,
    updateProfile,
    updatePassword,
    updateAvatar,
    removeAvatar,
    deleteAccount,
    uploadAvatar,
    getAvatarInitials,
    getAvatarColor,
  } = useUserSettings();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name.trim() || undefined,
        email: profileForm.email.trim(),
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      // Clear form on success
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const avatarUrl = await uploadAvatar(file);
      await updateAvatar({ avatar: avatarUrl });
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Avatar upload error:', error);
    }

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }

    try {
      await deleteAccount(deletePassword);
      // Logout after successful deletion
      logout();
    } catch (error) {
      // Error handling is done in the hook
      setDeletePassword('');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'account' as const, label: 'Account', icon: Settings },
  ];

  const avatarInitials = getAvatarInitials(profile?.name, profile?.email);
  const avatarColor = getAvatarColor(profile?.email || 'user');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Account Settings</span>
          </div>
        </Header>

        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">
                Manage your account settings and preferences
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-3">
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stats Card */}
                {stats && !statsLoading && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Your Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-foreground">{stats.totalProjects}</div>
                          <div className="text-xs text-muted-foreground">Projects</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-foreground">{stats.completedTasks}</div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completion Rate</span>
                          <span className="font-medium text-foreground">{stats.completionRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comments</span>
                          <span className="font-medium text-foreground">{stats.totalComments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Meetings</span>
                          <span className="font-medium text-foreground">{stats.createdMeetings}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Profile Picture Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          Profile Picture
                        </CardTitle>
                        <CardDescription>
                          Upload a picture to personalize your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={profile?.avatar} alt={profile?.name || profile?.email} />
                            <AvatarFallback className={`text-2xl font-semibold text-white ${avatarColor}`}>
                              {avatarInitials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdatingAvatar}
                                className="gap-2"
                              >
                                {isUpdatingAvatar ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                Upload Photo
                              </Button>
                              
                              {profile?.avatar && (
                                <Button
                                  variant="outline"
                                  onClick={handleRemoveAvatar}
                                  disabled={isRemovingAvatar}
                                  className="gap-2"
                                >
                                  {isRemovingAvatar ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Remove
                                </Button>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              JPG, PNG or GIF. Max size 5MB.
                            </p>
                          </div>
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </CardContent>
                    </Card>

                    {/* Profile Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                placeholder="Enter your full name"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                disabled={isUpdatingProfile}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                disabled={isUpdatingProfile}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Member Since</Label>
                            <p className="text-sm text-muted-foreground">
                              {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={isUpdatingProfile}
                              className="gap-2"
                            >
                              {isUpdatingProfile ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'password' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                      </CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder="Enter your current password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              disabled={isUpdatingPassword}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Enter your new password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              disabled={isUpdatingPassword}
                              required
                              minLength={6}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your new password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            disabled={isUpdatingPassword}
                            required
                            minLength={6}
                          />
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Password Requirements:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• At least 6 characters long</li>
                            <li>• Different from your current password</li>
                            <li>• Consider using a mix of letters, numbers, and symbols</li>
                          </ul>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="gap-2"
                          >
                            {isUpdatingPassword ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Update Password
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    {/* Account Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Account Information
                        </CardTitle>
                        <CardDescription>
                          Your account details and activity summary
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">User ID</Label>
                              <p className="text-sm text-muted-foreground font-mono break-all">
                                {profile?.id}
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Email Address</Label>
                              <p className="text-sm text-muted-foreground">
                                {profile?.email}
                              </p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Member Since</Label>
                              <p className="text-sm text-muted-foreground">
                                {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM d, yyyy') : 'Unknown'}
                              </p>
                            </div>
                          </div>

                          {stats && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Activity Summary</Label>
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Projects</span>
                                    <span className="font-medium">{stats.totalProjects}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tasks Completed</span>
                                    <span className="font-medium">{stats.completedTasks}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Comments Posted</span>
                                    <span className="font-medium">{stats.totalComments}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Meetings Created</span>
                                    <span className="font-medium">{stats.createdMeetings}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>
                          Irreversible actions that will permanently affect your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                          <h4 className="font-semibold text-destructive mb-2">Delete Account</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Once you delete your account, there is no going back. This will permanently delete 
                            your account and remove all of your data from our servers. This action cannot be undone.
                          </p>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your account
                                  and remove all of your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="delete-password">Enter your password to confirm</Label>
                                  <Input
                                    id="delete-password"
                                    type="password"
                                    placeholder="Password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletePassword('')}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteAccount}
                                  disabled={!deletePassword || isDeletingAccount}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {isDeletingAccount ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Account'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}