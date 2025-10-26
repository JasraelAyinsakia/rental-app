'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function DashboardLayout({ 
  children, 
  userName, 
  userRole 
}: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Sidebar userRole={userRole} />
      
      <div className={cn('lg:pl-64 transition-all duration-300')}>
        <Header userName={userName} userRole={userRole} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

