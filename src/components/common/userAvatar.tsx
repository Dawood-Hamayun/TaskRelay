// components/UserAvatar.tsx
import { User } from 'lucide-react';

interface UserAvatarProps {
  user?: {
    name?: string;
    email: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ 
  user, 
  size = 'sm', 
  className = ''
}: UserAvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  if (!user) {
    return (
      <div className={`${sizes[size]} rounded-full border-2 border-dashed border-muted flex items-center justify-center ${className}`}>
        <User className="w-3 h-3 text-muted-foreground" />
      </div>
    );
  }

  const initials = user.name?.charAt(0) || user.email.charAt(0);

  return (
    <div 
      className={`${sizes[size]} rounded-full bg-zinc-600 flex items-center justify-center text-white font-semibold shadow-sm ${className}`}
      title={user.name || user.email}
    >
      {initials.toUpperCase()}
    </div>
  );
}