// app/components/AppWrapper
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { user, hasProject } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user && !hasProject && pathname !== '/create-project') {
      router.push('/create-project');
    }
  }, [user, hasProject, pathname]);

  return <>{children}</>;
}