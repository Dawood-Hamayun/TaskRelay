// frontend/src/components/RouteGuard.tsx - Fixed to allow invite pages
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isInviteRoute = pathname.startsWith('/invites/'); // ✅ FIXED: Allow invite routes
  const isPublicRoute = isAuthPage || isInviteRoute || pathname === '/';

  useEffect(() => {
    // Don't redirect while auth is loading
    if (loading) return;

    console.log('🛡️ RouteGuard check:', {
      pathname,
      isAuthenticated,
      isAuthPage,
      isInviteRoute, // ✅ NEW: Show invite route status
      isPublicRoute
    });

    // ✅ FIXED: Don't redirect users away from invite pages
    // Invite pages should be accessible to both authenticated and unauthenticated users
    if (isInviteRoute) {
      console.log('🎫 Allowing access to invite page');
      return;
    }

    // Redirect unauthenticated users to login (except for public routes)
    if (!isAuthenticated && !isPublicRoute) {
      console.log('🔒 Redirecting unauthenticated user to login');
      router.push('/login');
      return;
    }

    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthenticated && isAuthPage) {
      console.log('✅ Redirecting authenticated user to dashboard');
      router.push('/dashboard');
      return;
    }

  }, [isAuthenticated, loading, pathname, router, isAuthPage, isInviteRoute, isPublicRoute]);

  // Show loading screen during auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Don't show loading for invite routes - let them render
  if (isInviteRoute) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting unauthenticated users
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}