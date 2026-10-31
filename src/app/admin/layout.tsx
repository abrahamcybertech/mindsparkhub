import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Inbox,
  Users,
  UserPlus,
  Shield,
  Settings,
  LogOut,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { AdminSignOutButton } from '@/components/admin/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // If not logged in, render children directly (allows /admin/login to render)
  if (!session) {
    return <>{children}</>;
  }

  const canManageTeam = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/programmes', label: 'Programmes', icon: Layers },
    { href: '/admin/events', label: 'Events and Approvals', icon: Calendar },
    { href: '/admin/gallery', label: 'Safeguarded Gallery', icon: ImageIcon },
    { href: '/admin/articles', label: 'Insights Articles', icon: BookOpen },
    { href: '/admin/submissions', label: 'Applications and Inquiries', icon: Inbox },
    ...(canManageTeam
      ? [{ href: '/admin/team', label: 'Structure and Exco', icon: UserPlus }]
      : []),
    ...(session.role === 'SUPER_ADMIN'
      ? [{ href: '/admin/users', label: 'User Management', icon: Users }]
      : []),
    { href: '/admin/audit', label: 'Audit Logs', icon: Shield },
    { href: '/admin/account', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-navy-950 text-white flex-shrink-0 flex flex-col justify-between border-r border-navy-800">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-navy-800 flex items-center space-x-3">
            <div className="relative w-9 h-9 rounded overflow-hidden bg-navy-900 border border-gold-500/40">
              <Image
                src="/brand/mindspark.jpg"
                alt="MindSpark Hub"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold font-serif text-white tracking-tight text-base block">
                MindSpark <span className="text-gold-500">Hub</span>
              </span>
              <span className="text-xs text-navy-400 block font-mono">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-navy-200 hover:text-white hover:bg-navy-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gold-500 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-navy-800 space-y-3">
          <div className="p-3 bg-navy-900 rounded-lg">
            <p className="text-xs font-bold text-white truncate">{session.name}</p>
            <p className="text-xs text-navy-400 truncate">{session.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">
              {session.role.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-navy-400 hover:text-gold-400 flex items-center space-x-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <AdminSignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
