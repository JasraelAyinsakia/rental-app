'use client';

import { signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName: string;
  userRole: string;
}

export function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">{userRole}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="gap-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
}

