import React, { useState } from 'react';
import type { Complaint } from '../types/index.ts';
import { Pagination } from './Pagination';
import {
  BarChart3,
  Clock,
  Download,
  Building,
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
    <div className="manager-dashboard role-dashboard space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 md:p-7 bg-white border border-[#C0BCB1] shadow-[0_6px_0_rgba(23,23,23,0.05),0_20px_45px_rgba(23,23,23,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C0BCB1] via-[#D21515] to-[#C0BCB1]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)] font-mono">
                Team Overview
              </span>
              <span className="text-xs text-[#6B6B6B]">
                SLA Compliance & Triaging Operations
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#171717] mt-1.5 tracking-tight">
              Operations & SLA Dashboard
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Live metrics across department workloads, resolution rates, and SLA breach risks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setTablePage(1);
              }}
              className="rounded-xl px-3 py-2 text-xs bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717] focus:outline-none focus:border-[#D21515]"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="role-kpi-grid">
        <div className="role-kpi role-kpi-gold">
          <span>Total Requests</span>
          <strong>{total}</strong>
          <small>
            Dept: {selectedDept} · <span className="font-semibold text-[#171717]">{resolved} Resolved</span>
          </small>
        </div>

        <div className="role-kpi role-kpi-olive">
          <span>Verification Rate</span>
          <strong>{autoVerificationRate}%</strong>
          <small>
            <span>{verified} Verified</span> · {manualReview} In Review
          </small>
        </div>

        <div className="role-kpi role-kpi-sienna">
          <span>Within SLA</span>
          <strong>{slaComplianceRate}%</strong>
          <small>
            <span className={slaBreached > 0 ? 'text-[#D21515] font-semibold' : ''}>{slaBreached} Breached</span> · {slaApproaching} Approaching
          </small>
        </div>

        <div className="role-kpi role-kpi-mahogany">
          <span>Escalations</span>
          <strong>{escalated}</strong>
          <small>
            Of all cases · <span className="text-[#D21515] font-semibold">{total > 0 ? Math.round((escalated / total) * 100) : 0}%</span>
          </small>
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