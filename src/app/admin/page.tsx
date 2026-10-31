import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';
import { getDatabase } from '@/lib/db';
import {
  Layers,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Inbox,
  Shield,
  ArrowRight,
  Clock,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

export default async function AdminDashboardOverview() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const db = getDatabase();

  // Query real data from database (no placeholders or fake statistics)
  const publishedProgrammesCount = (
    await db.prepare('SELECT count(*) as c FROM programmes WHERE is_active = 1').get() as any
  ).c;

  const upcomingApprovedEventsCount = (
    await db.prepare("SELECT count(*) as c FROM events WHERE status = 'APPROVED'").get() as any
  ).c;

  const publishedArticlesCount = (
    await db.prepare('SELECT count(*) as c FROM articles WHERE is_published = 1').get() as any
  ).c;

  const galleryItemsCount = (
    await db.prepare('SELECT count(*) as c FROM gallery_items WHERE is_published = 1').get() as any
  ).c;

  const excoMembersCount = (
    await db.prepare('SELECT count(*) as c FROM exco_members WHERE is_published = 1').get() as any
  ).c;

  const pendingSubmissionsCount = (
    await db.prepare("SELECT count(*) as c FROM submissions WHERE status = 'NEW'").get() as any
  ).c;

  const recentAuditLogs = await db
    .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 6')
    .all() as any[];

  const statCards = [
    {
      title: 'Active Programmes',
      count: publishedProgrammesCount,
      href: '/admin/programmes',
      icon: Layers,
      description: 'Secondary Schools, Campus, Community',
    },
    {
      title: 'Approved Events',
      count: upcomingApprovedEventsCount,
      href: '/admin/events',
      icon: Calendar,
      description: 'Four eyes approved schedule items',
    },
    {
      title: 'Published Articles',
      count: publishedArticlesCount,
      href: '/admin/articles',
      icon: BookOpen,
      description: 'Educational insights and resources',
    },
    {
      title: 'Safeguarded Photos',
      count: galleryItemsCount,
      href: '/admin/gallery',
      icon: ImageIcon,
      description: 'Verified outreach media in gallery',
    },
    {
      title: 'Pending Inquiries',
      count: pendingSubmissionsCount,
      href: '/admin/submissions',
      icon: Inbox,
      description: 'Citizen messages awaiting review',
    },
    {
      title: 'Published Exco',
      count: excoMembersCount,
      href: '/admin/team',
      icon: UserPlus,
      description: 'Leadership shown on Structure page',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-navy-900 tracking-tight">
          System Overview
        </h1>
        <p className="text-sm text-navy-600 mt-1">
          Welcome back, {session.name}. Current role: <strong className="text-navy-900">{session.role.replace(/_/g, ' ')}</strong>.
        </p>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white p-5 rounded-xl border border-sand-200 shadow-sm hover:border-gold-500 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                  {stat.title}
                </span>
                <Icon className="w-4 h-4 text-gold-600" />
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-serif text-navy-900">
                  {stat.count}
                </span>
              </div>
              <p className="text-[11px] text-navy-600 truncate">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Recent Immutable Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold font-serif text-navy-900">
            Operational Shortcuts
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/events"
              className="p-3 rounded-lg bg-sand-50 hover:bg-sand-100 border border-sand-200 flex items-center justify-between transition-colors block text-xs font-bold text-navy-900"
            >
              <span>Review Draft Events for Approval</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
            <Link
              href="/admin/gallery"
              className="p-3 rounded-lg bg-sand-50 hover:bg-sand-100 border border-sand-200 flex items-center justify-between transition-colors block text-xs font-bold text-navy-900"
            >
              <span>Upload and Verify Minor Consent</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
            <Link
              href="/admin/articles"
              className="p-3 rounded-lg bg-sand-50 hover:bg-sand-100 border border-sand-200 flex items-center justify-between transition-colors block text-xs font-bold text-navy-900"
            >
              <span>Draft New Insights Article</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
            <Link
              href="/admin/team"
              className="p-3 rounded-lg bg-sand-50 hover:bg-sand-100 border border-sand-200 flex items-center justify-between transition-colors block text-xs font-bold text-navy-900"
            >
              <span>Add or Update Structure Exco Members</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
            <Link
              href="/admin/submissions"
              className="p-3 rounded-lg bg-sand-50 hover:bg-sand-100 border border-sand-200 flex items-center justify-between transition-colors block text-xs font-bold text-navy-900"
            >
              <span>Export Submissions (Audited CSV)</span>
              <ArrowRight className="w-4 h-4 text-gold-600" />
            </Link>
          </div>
        </div>

        {/* Append Only Audit Trail */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-sand-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-serif text-navy-900">
              Recent Security Audit Activity
            </h2>
            <Link href="/admin/audit" className="text-xs font-semibold text-gold-700 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-sand-50 border border-sand-200 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-navy-900">{log.action}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.outcome === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </div>
                  <p className="text-navy-700 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right flex-shrink-0 text-[10px] text-navy-500 font-mono">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
