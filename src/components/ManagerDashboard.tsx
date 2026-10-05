import React, { useState } from 'react';
import type { Complaint } from '../types/index.ts';
import { Pagination } from './Pagination';
import {
  BarChart3,
  Clock,
  Download,
  Building,
  Activity,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface ManagerDashboardProps {
  complaints: Complaint[];
  departments: string[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  complaints,
  departments,
  onSelectComplaint,
}) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [tablePage, setTablePage] = useState(1);

  const filtered = selectedDept === 'All'
    ? (complaints ?? [])
    : (complaints ?? []).filter((c) => c.assignedDepartment === selectedDept);

  const total = (filtered ?? []).length;
  const verified = (filtered ?? []).filter((c) => c.comparisonResult?.verificationStatus === 'Verified').length;
  const manualReview = (filtered ?? []).filter((c) => c.comparisonResult?.verificationStatus === 'Manual Review').length;
  const autoVerificationRate = total > 0 ? Math.round((verified / total) * 100) : 100;

  const resolved = (filtered ?? []).filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const escalated = (filtered ?? []).filter((c) => c.status === 'Escalated').length;
  const slaBreached = (filtered ?? []).filter((c) => c.slaRiskStatus === 'Breached').length;
  const slaApproaching = (filtered ?? []).filter((c) => c.slaRiskStatus === 'Approaching').length;
  const slaComplianceRate = total > 0 ? Math.round(((total - slaBreached) / total) * 100) : 100;

  const tablePageSize = 10;
  const currentTablePage = Math.min(tablePage, Math.max(1, Math.ceil(filtered.length / tablePageSize)));
  const visibleRows = filtered.slice((currentTablePage - 1) * tablePageSize, currentTablePage * tablePageSize);

  const deptCounts: Record<string, number> = {};
  (complaints ?? []).forEach((c) => {
    if (c?.assignedDepartment) {
      deptCounts[c.assignedDepartment] = (deptCounts[c.assignedDepartment] || 0) + 1;
    }
  });

  const categoryCounts: Record<string, number> = {};
  (complaints ?? []).forEach((c) => {
    const cat = c?.pipeline1Output?.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Title', 'Customer', 'Type', 'Department', 'Category',
      'Urgency', 'Priority', 'Status', 'VerificationStatus', 'VerificationScore',
      'SLARisk', 'SubmittedAt',
    ];

    const rows = filtered.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.customerName}"`,
      c.customerType,
      `"${c.assignedDepartment}"`,
      `"${c.pipeline1Output?.category || ''}"`,
      c.pipeline1Output?.urgency || 'Low',
      c.pipeline1Output?.priority || 'P3',
      c.status,
      c.comparisonResult?.verificationStatus || 'N/A',
      c.comparisonResult?.verificationScore || 0,
      c.slaRiskStatus,
      c.submittedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supportnova_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D83B20] text-xs">✳</span>
              <span className="label text-[#E6E2D8]/70">Operations Command Hub</span>
            </div>
            <h1 className="display text-3xl sm:text-4xl text-[#E6E2D8]">
              SLA &amp; Performance Telemetry
            </h1>
            <p className="text-xs text-[#E6E2D8]/65 mt-2 max-w-xl leading-relaxed">
              Real-time audit across department throughput, dual-pipeline verification compliance, and countdown risks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-xl border border-[#E6E2D8]/15">
              <span className="label text-[10px] text-[#E6E2D8]/60">Department</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setTablePage(1);
                }}
                className="bg-transparent border-none text-xs text-[#E6E2D8] focus:ring-0 cursor-pointer"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#141414]">{d}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', val: total, sub: `${resolved} Resolved`, icon: FileText },
          { label: 'Dual-Pipe Auto-Rate', val: `${autoVerificationRate}%`, sub: `${verified} Verified · ${manualReview} In Review`, icon: ShieldCheck },
          { label: 'SLA Adherence', val: `${slaComplianceRate}%`, sub: `${slaBreached} Breached`, icon: Clock },
          { label: 'Escalation Volume', val: escalated, sub: `${total > 0 ? Math.round((escalated / total) * 100) : 0}% of all tickets`, icon: AlertTriangle },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#121212] border border-[#E6E2D8]/15 flex items-start gap-3">
            <div className="p-2 rounded bg-[#1A1A1A] text-[#D83B20] border border-[#E6E2D8]/10">
              <kpi.icon className="w-4 h-4" />
            </div>
            <div>
              <span className="label text-[10px] text-[#E6E2D8]/50 block">{kpi.label}</span>
              <strong className="display text-2xl text-[#E6E2D8] mt-0.5 block">{kpi.val}</strong>
              <span className="text-[10px] text-[#E6E2D8]/60">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Workload by Department (Red Bar) */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-[#E6E2D8]/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/10">
            <div>
              <h3 className="display text-base text-[#E6E2D8]">Workload by Department</h3>
              <span className="label text-[9px] text-[#E6E2D8]/50">Active Ticket Concentration</span>
            </div>
            <Building className="w-4 h-4 text-[#D83B20]" />
          </div>

          <div className="space-y-3">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#E6E2D8]">{dept}</span>
                    <span className="text-[#D83B20] font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D83B20] transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Requests by Category (High-Contrast Theme-Adaptive Bar) */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-[#E6E2D8]/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/10">
            <div>
              <h3 className="display text-base text-[#E6E2D8]">Requests by Category</h3>
              <span className="label text-[9px] text-[#E6E2D8]/50">Grievance Taxonomy Breakdown</span>
            </div>
            <BarChart3 className="w-4 h-4 text-[#D83B20]" />
          </div>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#E6E2D8]">{cat}</span>
                    <span className="text-[#E6E2D8]/80 font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: 'var(--text-primary, #E6E2D8)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-[#E6E2D8]/15 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/10">
          <div>
            <h3 className="display text-base text-[#E6E2D8]">Attention Queue</h3>
            <span className="label text-[9px] text-[#E6E2D8]/50">Approaching SLA Limits or Flagged Escalations</span>
          </div>
          <Clock className="w-4 h-4 text-[#D83B20]" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E6E2D8]/15 bg-[#141414]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] border-b border-[#E6E2D8]/10">
              <tr>
                {['Ticket ID', 'Title', 'Department', 'Priority', 'SLA Status', 'Action'].map((h) => (
                  <th key={h} className="py-3 px-3.5 font-mono text-[10px] uppercase tracking-wider text-[#E6E2D8]/60">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((c) => (
                <tr key={c.id} className="border-b border-[#E6E2D8]/10 hover:bg-[#1A1A1A] transition">
                  <td className="py-2.5 px-3.5 font-mono font-bold text-[#D83B20]">
                    {c.id}
                  </td>
                  <td className="py-2.5 px-3.5 font-medium text-[#E6E2D8] max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="py-2.5 px-3.5 text-[#E6E2D8]/80 font-mono">
                    {c.assignedDepartment}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E6E2D8]/80">
                    {c.pipeline1Output?.urgency} / {c.pipeline1Output?.priority}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.slaRiskStatus === 'Breached'
                          ? 'bg-[#D83B20]/15 text-[#D83B20] border border-[#D83B20]/30'
                          : c.slaRiskStatus === 'Approaching'
                          ? 'bg-[#E6E2D8]/10 text-[#E6E2D8] border border-[#E6E2D8]/20'
                          : 'bg-[#1C1C1C] text-[#E6E2D8]/60 border border-[#E6E2D8]/15'
                      }`}
                    >
                      {c.slaRiskStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="px-3 py-1 rounded text-xs font-mono font-semibold bg-[#1C1C1C] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={currentTablePage} pageSize={tablePageSize} totalItems={filtered.length} onPageChange={setTablePage} />
      </div>
    </div>
  );
};