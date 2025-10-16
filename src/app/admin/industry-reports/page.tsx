// Admin Dashboard for Industry Reports

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { industryReportsDB } from '@/lib/industry-reports/db';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IndustryReportsAdminPage() {
  // Check admin access
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/');
  }
  
  // Get all sectors with latest report info
  const sectors = await industryReportsDB.getSectors(false);
  const sectorsWithReports = await Promise.all(
    sectors.map(async (sector) => {
      const latestReport = await industryReportsDB.getLatestReport(sector.id, false);
      const schedule = await industryReportsDB.getProbeSchedule(sector.id);
      return { sector, latestReport, schedule };
    })
  );
  
  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Industry Reports Admin
          </h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              ← Back to Admin
            </Link>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Run All Probes
            </button>
          </div>
        </div>
        
        {/* Sectors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectorsWithReports.map(({ sector, latestReport, schedule }) => (
            <div
              key={sector.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {sector.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    sector.active
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {sector.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Latest Report Status */}
              <div className="mb-4 text-sm">
                {latestReport ? (
                  <>
                    <div className="text-slate-400">Latest Report:</div>
                    <div className="text-white font-medium">
                      {new Date(latestReport.reportMonth).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <div className={`text-xs mt-1 ${
                      latestReport.status === 'published'
                        ? 'text-emerald-400'
                        : latestReport.status === 'draft'
                        ? 'text-yellow-400'
                        : 'text-slate-400'
                    }`}>
                      Status: {latestReport.status}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500">No reports yet</div>
                )}
              </div>
              
              {/* Last Probe Run */}
              {schedule?.lastRunAt && (
                <div className="mb-4 text-sm">
                  <div className="text-slate-400">Last Probe:</div>
                  <div className="text-white">
                    {new Date(schedule.lastRunAt).toLocaleDateString()}
                  </div>
                  <div className={`text-xs mt-1 ${
                    schedule.lastRunStatus === 'success'
                      ? 'text-emerald-400'
                      : schedule.lastRunStatus === 'failed'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}>
                    {schedule.lastRunStatus}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/industry-reports/${sector.slug}`}
                  className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm text-center rounded hover:bg-slate-600 transition"
                >
                  Manage
                </Link>
                <ProbeButton sectorSlug={sector.slug} />
              </div>
            </div>
          ))}
        </div>
        
        {/* System Status */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StatusCard
              label="Total Sectors"
              value={sectors.length}
              color="blue"
            />
            <StatusCard
              label="Active Sectors"
              value={sectors.filter(s => s.active).length}
              color="emerald"
            />
            <StatusCard
              label="Published Reports"
              value={sectorsWithReports.filter(s => s.latestReport?.status === 'published').length}
              color="purple"
            />
            <StatusCard
              label="Pending Drafts"
              value={sectorsWithReports.filter(s => s.latestReport?.status === 'draft').length}
              color="yellow"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProbeButton({ sectorSlug }: { sectorSlug: string }) {
  return (
    <form action={`/api/industry-reports/probe/run`} method="POST">
      <input type="hidden" name="sectorSlug" value={sectorSlug} />
      <button
        type="submit"
        className="px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition"
      >
        Run Probe
      </button>
    </form>
  );
}

function StatusCard({ label, value, color }: {
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };
  
  return (
    <div>
      <div className="text-slate-400 text-sm mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
    </div>
  );
}

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return adminEmails.includes(email);
}

