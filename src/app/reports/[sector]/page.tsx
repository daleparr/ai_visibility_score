// Sector Report Hub - shows latest report and archive

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { ReportViewer } from '@/components/industry-reports/ReportViewer';
import { SubscriptionCTA } from '@/components/industry-reports/SubscriptionCTA';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SectorReportPage({
  params,
}: {
  params: { sector: string };
}) {
  const sectorSlug = params.sector;
  
  // Get sector
  const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
  if (!sector) {
    redirect('/reports');
  }
  
  // Get latest report
  const latestReport = await industryReportsDB.getLatestReport(sector.id, true);
  if (!latestReport) {
    return (
      <div className="min-h-screen bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">{sector.name}</h1>
          <p className="text-slate-400 mb-8">
            No published reports available yet. Check back soon!
          </p>
          <Link
            href="/reports"
            className="text-emerald-400 hover:text-emerald-300"
          >
            ← Back to all sectors
          </Link>
        </div>
      </div>
    );
  }
  
  // Check user access
  const session = await getServerSession(authOptions);
  let accessLevel: 'free' | 'pro' | 'enterprise' = 'free';
  let subscription = null;
  
  if (session?.user?.id) {
    subscription = await industryReportsDB.checkUserAccess(
      session.user.id,
      sector.id
    );
    if (subscription) {
      accessLevel = subscription.tier as 'free' | 'pro' | 'enterprise';
    }
  }
  
  // Get archive reports (for subscribers)
  const archiveReports = accessLevel !== 'free'
    ? await industryReportsDB.getReportsForSector(sector.id, 12)
    : [];
  
  // Log view
  if (latestReport.id) {
    await industryReportsDB.incrementReportViews(latestReport.id);
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/reports"
            className="text-slate-400 hover:text-slate-300 mb-4 inline-block"
          >
            ← All Industries
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {sector.name}
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl">
            {sector.description}
          </p>
          
          {/* Subscription Badge */}
          <div className="mt-4">
            {accessLevel === 'free' && (
              <span className="px-4 py-2 bg-slate-700 text-slate-300 rounded-full text-sm">
                Free Preview
              </span>
            )}
            {accessLevel === 'pro' && (
              <span className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-full text-sm font-medium">
                ✓ Professional Subscriber
              </span>
            )}
            {accessLevel === 'enterprise' && (
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium">
                ✓ Enterprise Subscriber
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Latest Report */}
      <div className="container mx-auto px-4 py-12">
        <ReportViewer
          report={latestReport}
          sector={sector}
          accessLevel={accessLevel}
        />
        
        {/* Upgrade CTA for free users */}
        {accessLevel === 'free' && (
          <div className="mt-12">
            <SubscriptionCTA
              sectorSlug={sectorSlug}
              sectorName={sector.name}
            />
          </div>
        )}
        
        {/* Archive */}
        {archiveReports.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Report Archive
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archiveReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${sectorSlug}/${formatMonth(report.reportMonth)}`}
                  className="bg-slate-800/50 border border-slate-700 hover:border-emerald-500 rounded-lg p-6 transition"
                >
                  <div className="text-sm text-slate-400 mb-2">
                    {new Date(report.reportMonth).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {report.reportTitle}
                  </h3>
                  <div className="text-sm text-slate-400">
                    {report.viewCount} views
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMonth(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

