// frontend/src/components/AppWrapper.tsx - Simplified without pending invite logic
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { projects, isLoading } = useProjects();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isInviteRoute = pathname.startsWith('/invites/');
  const isHomePage = pathname === '/';

  useEffect(() => {
    // Only handle routing for authenticated users
    if (!isAuthenticated || isAuthPage || isInviteRoute || isLoading) return;

    console.log('🔍 AppWrapper routing logic:', {
      pathname,
      projectsCount: projects.length,
      isLoading
    });

    // ✅ SIMPLIFIED: Only handle homepage redirect
    // No more pending invite logic - it's handled in auth service
    if (isHomePage) {
      console.log('🏠 Redirecting home to dashboard');
      router.push('/dashboard');
      return;
    }

  }, [
    isAuthenticated, 
    projects, 
    isLoading, 
    pathname, 
    router, 
    isAuthPage, 
    isInviteRoute, 
    isHomePage
  ]);

  // Show loading while checking projects for authenticated users on app pages
  if (isAuthenticated && !isAuthPage && !isInviteRoute && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}