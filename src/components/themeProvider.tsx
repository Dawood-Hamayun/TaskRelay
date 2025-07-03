'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,   // ← grab the type here
} from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}