// frontend/src/app/login/page.tsx - Fixed invite token handling
'use client';

import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  Moon,
  Sun,
  Users,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [autoAcceptedProject, setAutoAcceptedProject] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    const message = searchParams.get('message');
    if (message) {
      console.log('Success message:', message);
    }

    // ✅ FIXED: Get invite token from URL params
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      console.log('🎫 Login with invite token:', inviteParam);
      setInviteToken(inviteParam);
      
      // Fetch invite info to show context
      fetchInviteInfo(inviteParam);
    }
  }, [searchParams]);

  const fetchInviteInfo = async (token: string) => {
    try {
      console.log('🔍 Fetching invite info for token:', token);
      const res = await API.get(`/invites/${token}`);
      console.log('📧 Invite info received:', res.data);
      setInviteInfo(res.data);
      
      // Pre-fill email if invite has one
      if (res.data.email) {
        setEmail(res.data.email);
      }
    } catch (error) {
      console.error('❌ Failed to fetch invite info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Submitting login:', { 
        email, 
        hasInviteToken: !!inviteToken,
        inviteToken 
      });

      // ✅ FIXED: Build URL with invite token as query parameter
      let url = '/auth/login';
      if (inviteToken) {
        url += `?inviteToken=${inviteToken}`;
      }
      
      const res = await API.post(url, { email, password });
      console.log('✅ Login response:', res.data);

      // Login with the token
      await login(res.data.access_token);
      
      // Check if invite was auto-accepted
      if (res.data.autoAcceptedProject) {
        setAutoAcceptedProject(res.data.autoAcceptedProject);
        setShowSuccessMessage(true);
        
        // Redirect to the project after showing success
        setTimeout(() => {
          router.push(`/projects/${res.data.autoAcceptedProject.id}`);
        }, 2500);
      } else {
        // Normal login flow - redirect to dashboard
        router.push('/dashboard');
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  // Success message for auto-accepted invite
  if (showSuccessMessage && autoAcceptedProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/taskrelay.svg"
              alt="TaskRelay"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-semibold text-foreground">TaskRelay</span>
          </div>

          <Card className="border border-border shadow-sm bg-card">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-card-foreground">Welcome back!</h1>
                <p className="text-muted-foreground">
                  You've successfully joined {autoAcceptedProject.name}.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Joined {autoAcceptedProject.name}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Taking you to your project...
                </p>
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/taskrelay.svg"
            alt="TaskRelay"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-semibold text-foreground">TaskRelay</span>
        </div>

        {/* Invite Context */}
        {inviteInfo && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  You're invited to join {inviteInfo.project.name}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  by {inviteInfo.inviter.name || inviteInfo.inviter.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="border border-border shadow-sm bg-card relative">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-card-foreground">
                  {inviteInfo ? 'Sign in to accept invite' : 'Welcome back'}
                </h1>
                <p className="text-muted-foreground">
                  {inviteInfo ? 'Sign in to join the project' : 'Sign in to your TaskRelay account'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Email Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || (inviteInfo && !!email)}
                      className="h-12 pl-12 text-base bg-input border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all duration-200"
                      autoFocus={!inviteInfo || !email}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pl-12 pr-12 text-base bg-input border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all duration-200"
                      autoFocus={inviteInfo && !!email}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        {inviteInfo ? 'Sign in & Join Project' : 'Sign in'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground font-medium">New to TaskRelay?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link href={inviteToken ? `/signup?invite=${inviteToken}` : '/signup'}>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground font-semibold transition-all duration-200"
                  >
                    Create an account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}