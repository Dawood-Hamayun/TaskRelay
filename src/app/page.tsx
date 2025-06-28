// frontend/src/app/page.tsx - FIXED
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log('Homepage: checking auth status', { isAuthenticated, loading });

    if (!isAuthenticated) {
      console.log('Homepage: not authenticated, redirecting to login');
      router.push('/login');
    }
    // If authenticated, AppWrapper will handle the project-based redirect
  }, [isAuthenticated, loading, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading TaskRelay...</p>
      </div>
    </div>
  );
}