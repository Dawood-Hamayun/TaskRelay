// frontend/src/app/layout.tsx - FIXED with RouteGuard
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/themeProvider';
import RouteGuard from '@/components/RouteGuard';
import AppWrapper from '@/components/AppWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouteGuard>
                <AppWrapper>
                  {children}
                </AppWrapper>
              </RouteGuard>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}