// frontend/src/components/layout/Header.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <header className="bg-card border-b border-border px-6 h-20 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div>
            {/* Left side content can go here if needed */}
          </div>
          
          <div className="flex items-center gap-3">
            {children}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled
            >
              <Sun className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card border-b border-border px-6 h-20 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div>
          {/* Left side content can go here if needed */}
        </div>
        
        <div className="flex items-center gap-3">
          {children}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}