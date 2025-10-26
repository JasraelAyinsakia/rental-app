'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package,
  Menu,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  userRole: string;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'STAFF'],
  },
  {
    title: 'Rentals',
    href: '/rentals',
    icon: FileText,
    roles: ['ADMIN', 'STAFF'],
  },
  {
    title: 'Moulds',
    href: '/moulds',
    icon: Package,
    roles: ['ADMIN', 'STAFF'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground"
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-card border-r',
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-64',
          'lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Package className="h-6 w-6 text-primary" />
            {!collapsed && (
              <span className="ml-3 text-lg font-semibold">
                Mould Tracker
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon size={20} />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Collapse Toggle (Desktop) */}
          <div className="hidden lg:flex items-center justify-center p-4 border-t">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-md hover:bg-accent"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}

