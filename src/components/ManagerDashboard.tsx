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
      'ID',
      'Title',
      'Customer',
      'Type',
      'Department',
      'Category',
      'Urgency',
      'Priority',
      'Status',
      'VerificationStatus',
      'VerificationScore',
      'SLARisk',
      'SubmittedAt',
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
    link.setAttribute('download', `supportnova_performance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
<div className="manager-dashboard role-dashboard manager-page space-y-6">
        {/* Header */}
      <section className="manager-hero">
  <div className="manager-hero-glow" aria-hidden />

  <div className="manager-hero-inner">

    <div className="manager-hero-left">
      <div className="manager-hero-eyebrow">
        <span className="manager-pill">Operations Command</span>
        <span className="manager-pill-sub">
          <Activity className="w-3.5 h-3.5" />
          Live SLA &amp; Team Performance
        </span>
      </div>

      <h1 className="manager-hero-title">Operations &amp; SLA Dashboard</h1>
      <p className="manager-hero-sub">
        Live metrics across department workloads, resolution rates, and SLA breach risks.
      </p>
    </div>

    <nav className="manager-hero-nav" aria-label="Manager controls">
      <div className="manager-hero-dept">
        <span className="manager-hero-dept-label">Department</span>
        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setTablePage(1);
          }}
          className="manager-hero-dept-select"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleExportCSV}
        className="manager-hero-export"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export CSV</span>
      </button>
    </nav>
  </div>
</section>
      {/* KPI Cards */}
      {/* KPI Cards */}
<div className="role-kpi-grid">

  <div className="role-kpi role-kpi-gold">
    <div className="role-kpi-icon">
      <FileText className="w-5 h-5" />
    </div>
    <div className="role-kpi-body">
      <span>Total Requests</span>
      <strong>{total}</strong>
      <small>
        Dept: {selectedDept} · {resolved} Resolved
      </small>
    </div>
  </div>

  <div className="role-kpi role-kpi-olive">
    <div className="role-kpi-icon">
      <ShieldCheck className="w-5 h-5" />
    </div>
    <div className="role-kpi-body">
      <span>Verification Rate</span>
      <strong>{autoVerificationRate}%</strong>
      <small>
        {verified} Verified · {manualReview} In Review
      </small>
    </div>
  </div>

  <div className="role-kpi role-kpi-sienna">
    <div className="role-kpi-icon">
      <Clock className="w-5 h-5" />
    </div>
    <div className="role-kpi-body">
      <span>Within SLA</span>
      <strong>{slaComplianceRate}%</strong>
      <small>
        {slaBreached} Breached · {slaApproaching} Approaching
      </small>
    </div>
  </div>

  <div className="role-kpi role-kpi-mahogany">
    <div className="role-kpi-icon">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="role-kpi-body">
      <span>Escalations</span>
      <strong>{escalated}</strong>
      <small>
        Of all cases · {total > 0 ? Math.round((escalated / total) * 100) : 0}%
      </small>
    </div>
  </div>

</div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="role-chart-card">
          <div className="role-chart-title mb-4">
            <div>
              <strong>Requests by Team</strong>
              <small>Distribution across departments</small>
            </div>
            <Building className="w-4 h-4 text-[#D21515]" />
          </div>

          <div className="role-bar-chart">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              return (
                <div key={dept} className="role-bar-row">
                  <span>{dept}</span>
                  <div><i className="role-bar-gold" style={{ width: `${pct}%` }} /></div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Category */}
        <div className="role-chart-card">
          <div className="role-chart-title mb-4">
            <div>
              <strong>Requests by Type</strong>
              <small>Category classification breakdown</small>
            </div>
            <BarChart3 className="w-4 h-4 text-[#D21515]" />
          </div>

          <div className="role-bar-chart">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              return (
                <div key={cat} className="role-bar-row">
                  <span>{cat}</span>
                  <div><i className="role-bar-sienna" style={{ width: `${pct}%` }} /></div>
                  <b>{count}</b>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="role-chart-card">
        <div className="flex items-center justify-between mb-4">
          <div className="role-chart-title">
            <div>
              <strong>Requests Needing Attention</strong>
              <small>Approaching SLA limits or escalated tickets</small>
            </div>
          </div>
          <Clock className="w-4 h-4 text-[#D21515]" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#C0BCB1]">
          <table className="w-full text-left text-xs bg-white">
            <thead className="bg-[#F0EFEA]">
              <tr>
                <th className="py-3 px-3 font-semibold text-[#171717]">Ticket ID</th>
                <th className="py-3 px-3 font-semibold text-[#171717]">Title</th>
                <th className="py-3 px-3 font-semibold text-[#171717]">Department</th>
                <th className="py-3 px-3 font-semibold text-[#171717]">Priority</th>
                <th className="py-3 px-3 font-semibold text-[#171717]">SLA Status</th>
                <th className="py-3 px-3 font-semibold text-[#171717] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((c) => (
                <tr key={c.id} className="border-b border-[#E4E2DC] hover:bg-[#F0EFEA]/50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#D21515]">
                    {c.id}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#171717] max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="py-2.5 px-3 text-[#3A3A3A]">
                    {c.assignedDepartment}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#3A3A3A]">
                    {c.pipeline1Output?.urgency} / {c.pipeline1Output?.priority}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        c.slaRiskStatus === 'Breached'
                          ? 'bg-[rgba(210,21,21,0.12)] text-[#D21515] border border-[#D21515]'
                          : c.slaRiskStatus === 'Approaching'
                          ? 'bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1]'
                          : 'bg-[#F0EFEA] text-[#3A3A3A] border border-[#C0BCB1]'
                      }`}
                    >
                      {c.slaRiskStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectComplaint(c)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1] hover:border-[#171717] transition cursor-pointer"
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