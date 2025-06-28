// frontend/src/app/signup/page.tsx - Fixed invite token handling
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
  User,
  Check,
  Moon,
  Sun,
  CheckCircle,
  Users,
  Loader2
} from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [autoAcceptedProject, setAutoAcceptedProject] = useState<any>(null);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    
    // ✅ FIXED: Get invite token from URL params
    const inviteParam = searchParams.get('invite');
    if (inviteParam) {
      console.log('🎫 Signup with invite token:', inviteParam);
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
      setError('Failed to load invitation details. The invite may be invalid or expired.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('📝 Submitting signup:', { 
        email, 
        name, 
        hasInviteToken: !!inviteToken,
        inviteToken 
      });

      // ✅ FIXED: Build URL with invite token as query parameter
      let url = '/auth/signup';
      if (inviteToken) {
        url += `?inviteToken=${inviteToken}`;
      }
      
      const res = await API.post(url, { email, password, name });
      console.log('✅ Signup response:', res.data);

      // If signup includes auto-login (has access_token), login immediately
      if (res.data.access_token) {
        await login(res.data.access_token);
        
        // Set success state with project info
        setAutoAcceptedProject(res.data.autoAcceptedProject);
        setSuccess(true);
        
        // Redirect based on whether they joined a project
        setTimeout(() => {
          if (res.data.autoAcceptedProject) {
            router.push(`/projects/${res.data.autoAcceptedProject.id}`);
          } else {
            router.push('/dashboard');
          }
        }, 2500);
      } else {
        // Old flow - just show success and redirect to login
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?message=Account created successfully. Please log in.');
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      if (error.response?.status === 409) {
        setError('Email already registered. Please use a different email or try logging in.');
      } else if (error.response?.data?.message) {
        setError(Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = {
    hasLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password)
  };

  const strongPassword = Object.values(passwordStrength).filter(Boolean).length >= 3;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return null;
  }

  // ✅ Enhanced success screen
  if (success) {
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
                <h1 className="text-2xl font-bold text-card-foreground">
                  {autoAcceptedProject ? 'Welcome to the team!' : 'Account Created!'}
                </h1>
                <p className="text-muted-foreground">
                  {autoAcceptedProject 
                    ? `Welcome to TaskRelay, ${name}! You've successfully joined ${autoAcceptedProject.name}.`
                    : `Welcome to TaskRelay, ${name}! Your account has been created successfully.`
                  }
                </p>
              </div>

              {autoAcceptedProject && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Joined {autoAcceptedProject.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {autoAcceptedProject 
                    ? 'Taking you to your project...'
                    : 'Taking you to your dashboard...'
                  }
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
                  {inviteInfo ? 'Join the team' : 'Create your account'}
                </h1>
                <p className="text-muted-foreground">
                  {inviteInfo 
                    ? 'Create your account to accept the invitation'
                    : 'Start your journey with TaskRelay today'
                  }
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
                  {/* Name Field */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <Input
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 pl-12 text-base bg-input border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all duration-200"
                      autoFocus={!inviteInfo}
                    />
                  </div>

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
                      autoFocus={inviteInfo && !email}
                    />
                    {inviteInfo && email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        placeholder="Create a strong password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={loading}
                        className="h-12 pl-12 pr-12 text-base bg-input border-border focus:border-ring focus:ring-1 focus:ring-ring transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                strongPassword ? 'bg-green-500' : 'bg-amber-500'
                              }`}
                              style={{ 
                                width: `${(Object.values(passwordStrength).filter(Boolean).length / 4) * 100}%` 
                              }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            strongPassword ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {strongPassword ? 'Strong' : 'Good'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center gap-1 ${
                            passwordStrength.hasLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                          }`}>
                            <Check className="w-3 h-3" />
                            6+ characters
                          </div>
                          <div className={`flex items-center gap-1 ${
                            passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                          }`}>
                            <Check className="w-3 h-3" />
                            Number
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !strongPassword}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        {inviteInfo ? 'Create account & Join' : 'Create account'}
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
                  <span className="px-4 bg-card text-muted-foreground font-medium">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link href={inviteToken ? `/login?invite=${inviteToken}` : '/login'}>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-border text-card-foreground hover:bg-accent hover:text-accent-foreground font-semibold transition-all duration-200"
                  >
                    Sign in instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}