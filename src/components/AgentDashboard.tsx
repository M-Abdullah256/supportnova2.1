import React, { useState } from 'react';
import type { Complaint, EscalationTier } from '../types/index.ts';
import { Pagination } from './Pagination';
import {
  Inbox,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
  ArrowUpRight,
  CheckCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  HelpCircle,
} from 'lucide-react';

interface AgentDashboardProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onSendMessage: (complaintId: string, text: string, nextStatus?: any) => Promise<void>;
  onUpdateStatus: (complaintId: string, status: any, dept?: string, agent?: string) => Promise<void>;
  currentDepartment: string;
  onDepartmentChange: (dept: string) => void;
  departments: string[];
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  complaints,
  onSelectComplaint,
  onSendMessage,
  onUpdateStatus,
  currentDepartment,
  onDepartmentChange,
  departments,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    (complaints ?? []).length > 0 ? complaints[0].id : null
  );
  const [responseDraft, setResponseDraft] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationTier, setEscalationTier] = useState<EscalationTier>('Supervisor Review');
  const [escalationReason, setEscalationReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [listPage, setListPage] = useState(1);
  const [showInternalGuidance, setShowInternalGuidance] = useState(true);

  const selected = (complaints ?? []).find((c) => c.id === selectedId);

  React.useEffect(() => {
    if (selected) {
      setResponseDraft(selected.pipeline1Output?.draftedResponse || '');
      setIsEscalating(false);
    }
  }, [selectedId, selected]);

  const filtered = (complaints ?? []).filter((c) => {
    if (currentDepartment !== 'All' && c.assignedDepartment !== currentDepartment) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    return true;
  });

  const pageSize = 6;
  const currentPage = Math.min(listPage, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visibleRequests = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const agentOpenCount = filtered.filter((item) => item.status !== 'Resolved' && item.status !== 'Closed').length;
  const agentResolvedCount = filtered.filter((item) => item.status === 'Resolved' || item.status === 'Closed').length;
  const agentUrgentCount = filtered.filter((item) => item.slaRiskStatus !== 'Safe').length;
  const agentVerifiedCount = filtered.filter((item) => item.comparisonResult?.verificationStatus === 'Verified').length;
  const agentStatusCounts = [
    { label: 'Assigned', count: filtered.filter((item) => item.status === 'Assigned').length, color: 'resolved' },
    { label: 'In Progress', count: filtered.filter((item) => item.status === 'In Progress').length, color: 'active' },
    { label: 'Escalated', count: filtered.filter((item) => item.status === 'Escalated').length, color: 'active' },
    { label: 'Resolved', count: agentResolvedCount, color: 'verified' },
  ];
  const agentStatusMax = Math.max(...agentStatusCounts.map((item) => item.count), 1);

  const handleSendResponse = async () => {
    if (!selected || !responseDraft.trim()) return;
    await onSendMessage(selected.id, responseDraft.trim(), 'In Progress');
  };

  const handleResolve = async () => {
    if (!selected) return;
    await onUpdateStatus(selected.id, 'Resolved');
  };

  const handleExecuteEscalation = async () => {
    if (!selected) return;
    await onSendMessage(
      selected.id,
      `[ESCALATED TO ${escalationTier}]: ${escalationReason || 'Forwarded for higher-level specialist resolution.'}`,
      'Escalated'
    );
    setIsEscalating(false);
  };

  return (
    <div className="agent-dashboard role-dashboard space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 md:p-7 bg-white border border-[#C0BCB1] shadow-[0_6px_0_rgba(23,23,23,0.05),0_20px_45px_rgba(23,23,23,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C0BCB1] via-[#D21515] to-[#C0BCB1]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)] font-mono">
                Agent Workspace
              </span>
              <span className="text-xs text-[#6B6B6B]">
                Dual-Pipeline Verified Triage
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#171717] mt-1.5 tracking-tight">
              Assigned Tickets & Actions
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Review AI-drafted responses against cited policies before replying to customers.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#6B6B6B] font-medium">Department:</span>
            <select
              value={currentDepartment}
              onChange={(e) => {
                onDepartmentChange(e.target.value);
                setListPage(1);
              }}
              className="rounded-xl px-3 py-1.5 text-xs bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717] focus:outline-none focus:border-[#D21515]"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-[#E4E2DC] overflow-x-auto text-xs">
          <span className="text-[#6B6B6B] font-semibold text-[11px]">Filter:</span>
          {['All', 'Assigned', 'In Progress', 'Escalated', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setListPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition font-medium text-xs cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'bg-[#F0EFEA] text-[#3A3A3A] border border-[#C0BCB1] hover:border-[#171717]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <section className="role-analytics" aria-label="Agent Workload Overview">
        <div className="role-kpi-grid">
          <div className="role-kpi role-kpi-gold">
            <span>Open Tickets</span>
            <strong>{agentOpenCount}</strong>
            <small>Active in queue</small>
          </div>
          <div className="role-kpi role-kpi-olive">
            <span>Resolved</span>
            <strong>{agentResolvedCount}</strong>
            <small>Successfully closed</small>
          </div>
          <div className="role-kpi role-kpi-mahogany">
            <span>Urgent SLA</span>
            <strong>{agentUrgentCount}</strong>
            <small>At risk or breached</small>
          </div>
          <div className="role-kpi role-kpi-sienna">
            <span>Verified Status</span>
            <strong>{agentVerifiedCount}</strong>
            <small>100% policy match</small>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worklist Sidebar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] px-1 font-semibold">
            <span>Tickets ({filtered.length})</span>
            <span>Priority Queue</span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#C0BCB1] p-8 text-center text-[#6B6B6B] text-xs">
              No tickets matching current filters.
            </div>
          ) : (
            visibleRequests.map((item) => {
              const isSelected = item.id === selectedId;
              const isVerified = item.comparisonResult?.verificationStatus === 'Verified';
              const p1 = item.pipeline1Output;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative bg-white ${
                    isSelected
                      ? 'border-[#171717] shadow-md ring-2 ring-[#171717]'
                      : 'border-[#C0BCB1] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#D21515]">
                      {item.id}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {isVerified ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-[rgba(23,23,23,0.06)] text-[#171717] border border-[#C0BCB1]">
                          <ShieldCheck className="w-3 h-3 text-[#171717]" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Review</span>
                        </span>
                      )}

                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded font-mono ${
                          item.slaRiskStatus === 'Breached'
                            ? 'bg-[rgba(210,21,21,0.12)] text-[#D21515] border border-[#D21515]'
                            : item.slaRiskStatus === 'Approaching'
                            ? 'bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1]'
                            : 'bg-[#F0EFEA] text-[#3A3A3A] border border-[#C0BCB1]'
                        }`}
                      >
                        {item.slaRiskStatus}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-[#171717] line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-[#6B6B6B] mt-2">
                    <span className="flex items-center space-x-1 truncate max-w-[170px]">
                      <Tag className="w-3 h-3 text-[#6B6B6B]" />
                      <span>{p1?.category || item.assignedDepartment}</span>
                    </span>
                    <span className="font-mono font-medium text-[#171717]">
                      {p1?.priority || 'P3'} ({p1?.urgency || 'Med'})
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <Pagination page={currentPage} pageSize={pageSize} totalItems={filtered.length} onPageChange={setListPage} />
        </div>

        {/* Workspace Detail */}
        <div className="lg:col-span-7">
          {selected ? (
            <div className="bg-white rounded-2xl border border-[#C0BCB1] p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-[#D21515]">{selected.id}</span>
                    <span className="text-[#C0BCB1]">•</span>
                    <span className="text-[#6B6B6B]">
                      {selected.customerName} ({selected.customerType})
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#171717] mt-1 tracking-tight">
                    {selected.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectComplaint(selected)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1] hover:border-[#171717] transition cursor-pointer flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] transition cursor-pointer flex items-center space-x-1 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>

              {/* Customer Submission */}
              <div className="bg-[#F0EFEA] border border-[#C0BCB1] rounded-xl p-4">
                <span className="text-[11px] font-bold text-[#171717] uppercase tracking-wider block mb-1">
                  Customer's Message
                </span>
                <p className="text-xs text-[#3A3A3A] leading-relaxed">
                  {selected.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-[#C0BCB1]/60 text-[11px] text-[#6B6B6B]">
                  <span>Product: <strong className="text-[#171717]">{selected.productService}</strong></span>
                  <span>Order: <strong className="text-[#171717]">{selected.orderReference}</strong></span>
                  <span>Sentiment: <strong className="text-[#D21515]">{selected.pipeline1Output?.sentiment || 'Neutral'}</strong></span>
                </div>
              </div>

              {/* Verification Callout */}
              <div
                className={`p-4 rounded-xl border ${
                  selected.comparisonResult?.verificationStatus === 'Verified'
                    ? 'bg-[rgba(23,23,23,0.03)] border-[#C0BCB1]'
                    : 'bg-[rgba(210,21,21,0.05)] border-[rgba(210,21,21,0.25)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#D21515]" />
                    <span className="text-xs font-bold text-[#171717]">
                      Dual-Pipeline Compliance Check
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#D21515]">
                    Match Score: {selected.comparisonResult?.verificationScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                  <div className="bg-white p-2.5 rounded-lg border border-[#C0BCB1]">
                    <span className="text-[10px] text-[#6B6B6B] block">Matched Rule</span>
                    <span className="font-semibold text-[#171717] text-[11px] truncate block">
                      {(selected.pipeline2Output?.matchedRules || []).join(', ') || 'Standard SLA'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#C0BCB1]">
                    <span className="text-[10px] text-[#6B6B6B] block">Python Engine</span>
                    <span className="font-semibold text-[#171717] text-[11px] block">
                      {selected.pythonValidation?.status || 'Active'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#C0BCB1]">
                    <span className="text-[10px] text-[#6B6B6B] block">Policy Eligibility</span>
                    <span className={`font-semibold text-[11px] block ${selected.pipeline2Output?.policyEligibilityApproved ? 'text-[#171717]' : 'text-[#D21515]'}`}>
                      {selected.pipeline2Output?.policyEligibilityApproved ? 'Approved' : 'Restricted'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#C0BCB1]">
                    <span className="text-[10px] text-[#6B6B6B] block">Target SLA</span>
                    <span className="font-semibold text-[#171717] text-[11px] block">
                      {selected.slaHours} Hours
                    </span>
                  </div>
                </div>

                {selected.comparisonResult && (selected.comparisonResult.discrepancies || []).length > 0 && (
                  <div className="mt-3 p-3 bg-white border border-[#C0BCB1] rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#D21515] flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      Discrepancies identified:
                    </span>
                    <ul className="list-disc pl-4 text-[11px] text-[#3A3A3A] space-y-0.5">
                      {(selected.comparisonResult.discrepancies || []).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Guidance Toggle */}
              {selected.pipeline1Output?.internalAgentGuidance && (
                <div className="bg-[#F0EFEA] border border-[#C0BCB1] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowInternalGuidance(!showInternalGuidance)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#171717] cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-[#D21515]" />
                      <span>Agent Guidance & Recommended Steps</span>
                    </span>
                    {showInternalGuidance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showInternalGuidance && (
                    <div className="p-4 text-xs text-[#3A3A3A] space-y-2 border-t border-[#C0BCB1]">
                      <p className="bg-white p-2.5 rounded-lg border border-[#C0BCB1] italic text-[#171717]">
                        {selected.pipeline1Output.internalAgentGuidance}
                      </p>
                      {(selected.pipeline1Output.resolutionSteps || []).length > 0 && (
                        <div className="mt-2">
                          <span className="font-bold text-[#171717] block mb-1">
                            Action steps:
                          </span>
                          <ul className="space-y-1 pl-4 list-decimal text-[#3A3A3A] text-xs">
                            {(selected.pipeline1Output.resolutionSteps || []).map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reply Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#171717] flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-[#D21515]" />
                    <span>Customer Response Draft</span>
                  </label>
                  <span className="text-[10px] text-[#6B6B6B]">Editable before sending</span>
                </div>
                <textarea
                  value={responseDraft}
                  onChange={(e) => setResponseDraft(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl p-3 text-xs leading-relaxed bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717] focus:bg-white focus:border-[#D21515] focus:outline-none"
                />

                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => setIsEscalating(!isEscalating)}
                    className="px-3 py-2 rounded-xl border border-[rgba(210,21,21,0.3)] text-[#D21515] bg-[rgba(210,21,21,0.06)] hover:bg-[#D21515] hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate Ticket</span>
                  </button>

                  <button
                    onClick={handleSendResponse}
                    disabled={selected.comparisonResult?.verificationStatus === 'Manual Review'}
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#171717] text-white hover:bg-[#D21515] disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selected.comparisonResult?.verificationStatus === 'Manual Review'
                        ? 'Requires Reviewer Clearance'
                        : 'Send Response to Customer'}
                    </span>
                  </button>
                </div>

                {isEscalating && (
                  <div className="mt-4 p-4 bg-[#F0EFEA] border border-[rgba(210,21,21,0.3)] rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#D21515]">
                      Escalate to Higher Authority
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3A3A3A] mb-1">Target Tier</label>
                        <select
                          value={escalationTier}
                          onChange={(e: any) => setEscalationTier(e.target.value)}
                          className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                        >
                          <option value="Supervisor Review">Supervisor Review</option>
                          <option value="Department Manager">Department Manager</option>
                          <option value="Specialist Team">Specialist Team</option>
                          <option value="Compliance Review">Compliance Review</option>
                          <option value="Critical Management Escalation">Critical Management Escalation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3A3A3A] mb-1">Reason</label>
                        <input
                          type="text"
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                          placeholder="e.g. Safety hazard or SLA risk"
                          className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setIsEscalating(false)}
                        className="px-3 py-1.5 rounded-xl text-xs text-[#6B6B6B] hover:text-[#171717] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteEscalation}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#D21515] text-white hover:bg-[#A01010] cursor-pointer shadow-sm"
                      >
                        Confirm Escalation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#C0BCB1] p-12 text-center text-[#6B6B6B] text-xs">
              Select a ticket to review and draft responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};