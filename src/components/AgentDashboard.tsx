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
  User,
  Package,
  MessageSquare,
  Sparkles,
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
  const [responseError, setResponseError] = useState<string | null>(null);

  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationTier, setEscalationTier] = useState<EscalationTier>('Supervisor Review');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationError, setEscalationError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [listPage, setListPage] = useState(1);
  const [showInternalGuidance, setShowInternalGuidance] = useState(true);

  const selected = (complaints ?? []).find((c) => c.id === selectedId);

  React.useEffect(() => {
    if (selected) {
      setResponseDraft(selected.pipeline1Output?.draftedResponse || '');
      setIsEscalating(false);
      setResponseError(null);
      setEscalationError(null);
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

  const handleSendResponse = async () => {
    if (!selected) return;
    setResponseError(null);

    if (!responseDraft.trim() || responseDraft.trim().length < 5) {
      setResponseError('Response message must be at least 5 characters long.');
      return;
    }
    if (responseDraft.trim().length > 8000) {
      setResponseError('Response cannot exceed 8,000 characters.');
      return;
    }

    await onSendMessage(selected.id, responseDraft.trim(), 'In Progress');
  };

  const handleExecuteEscalation = async () => {
    if (!selected) return;
    setEscalationError(null);

    if (!escalationReason.trim() || escalationReason.trim().length < 5) {
      setEscalationError('Please provide a reason of at least 5 characters for escalation.');
      return;
    }

    await onSendMessage(
      selected.id,
      `[ESCALATED TO ${escalationTier}]: ${escalationReason.trim()}`,
      'Escalated'
    );
    setIsEscalating(false);
    setEscalationReason('');
  };

  return (
    <div className="space-y-6 text-[#E6E2D8]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D83B20] text-xs">✳</span>
              <span className="label text-[#E6E2D8]/70">Specialist Core Workspace</span>
            </div>
            <h1 className="display text-3xl sm:text-4xl text-[#E6E2D8]">
              Assigned Tickets &amp; Actions
            </h1>
            <p className="text-xs text-[#E6E2D8]/65 mt-2 max-w-xl leading-relaxed">
              Review AI-drafted responses against verified organizational policies before replying to customers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-xl border border-[#E6E2D8]/15">
              <span className="label text-[10px] text-[#E6E2D8]/60">Department</span>
              <select
                value={currentDepartment}
                onChange={(e) => {
                  onDepartmentChange(e.target.value);
                  setListPage(1);
                }}
                className="bg-transparent border-none text-xs text-[#E6E2D8] focus:ring-0 cursor-pointer"
              >
                <option value="All" className="bg-[#141414]">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#141414]">{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-[#E6E2D8]/15">
              {['All', 'Assigned', 'In Progress', 'Escalated', 'Resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setListPage(1); }}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-lg transition cursor-pointer ${
                    statusFilter === st ? 'bg-[#D83B20] text-white font-bold' : 'text-[#E6E2D8]/60 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active In Queue', val: filtered.length, sub: 'Assigned cases', icon: Inbox },
          { label: 'Resolved Tickets', val: filtered.filter(i => i.status === 'Resolved').length, sub: 'Closed cases', icon: CheckCircle },
          { label: 'SLA Warnings', val: filtered.filter(i => i.slaRiskStatus !== 'Safe').length, sub: 'Risk countdown', icon: Clock },
          { label: 'Dual-Pipe Verified', val: filtered.filter(i => i.comparisonResult?.verificationStatus === 'Verified').length, sub: '100% Policy Match', icon: ShieldCheck },
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
      </section>

      {/* Main Workspace Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Worklist */}
        <aside className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#E6E2D8]/60 px-1">
            <span>TICKET STREAM ({filtered.length})</span>
            <span className="text-[#D83B20]">PRIORITY</span>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl text-xs text-[#E6E2D8]/50">
                <Inbox className="w-6 h-6 mx-auto mb-2 text-[#E6E2D8]/40" />
                <span>No tickets match this filter.</span>
              </div>
            ) : (
              visibleRequests.map((item) => {
                const isSelected = item.id === selectedId;
                const isVerified = item.comparisonResult?.verificationStatus === 'Verified';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#181818] border-[#D83B20] shadow-[0_0_15px_rgba(216,59,32,0.15)]'
                        : 'bg-[#121212] border-[#E6E2D8]/15 hover:border-[#E6E2D8]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#D83B20]">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isVerified ? 'bg-[#D83B20]/15 text-[#D83B20]' : 'bg-[#1C1C1C] text-[#E6E2D8]/70'}`}>
                        {isVerified ? 'VERIFIED' : 'REVIEW'}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#E6E2D8] mt-1.5 line-clamp-1">{item.title}</h3>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#E6E2D8]/50">
                      <span>{item.customerName}</span>
                      <span>{item.pipeline1Output?.priority || 'P3'} · {item.pipeline1Output?.urgency || 'Med'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <Pagination page={currentPage} pageSize={pageSize} totalItems={filtered.length} onPageChange={setListPage} />
        </aside>

        {/* Right Column: Case Management Area */}
        <main className="lg:col-span-8">
          {selected ? (
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#E6E2D8]/15 space-y-5">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E2D8]/10">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#E6E2D8]/60">
                    <span className="text-[#D83B20] font-bold">{selected.id}</span>
                    <span>•</span>
                    <span>{selected.customerName} ({selected.customerType})</span>
                    <span>•</span>
                    <span>{new Date(selected.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="display text-xl text-[#E6E2D8] mt-1">{selected.title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button type="button" onClick={() => onSelectComplaint(selected)} className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg bg-[#1A1A1A] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition cursor-pointer flex items-center space-x-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                  <button type="button" onClick={() => onUpdateStatus(selected.id, 'Resolved')} className="px-3.5 py-1.5 text-xs font-mono uppercase font-bold tracking-wider rounded-lg bg-[#D83B20] text-white hover:bg-[#b82f17] transition cursor-pointer flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>
              </header>

              {/* Customer message */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#E6E2D8]/10 space-y-2">
                <span className="label text-[10px] text-[#D83B20] block">Customer Intake Narrative</span>
                <p className="text-xs text-[#E6E2D8]/90 leading-relaxed font-mono">{selected.description}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-[10px] font-mono text-[#E6E2D8]/50 border-t border-[#E6E2D8]/10">
                  <span>Product: <strong className="text-[#E6E2D8]">{selected.productService}</strong></span>
                  <span>Order: <strong className="text-[#E6E2D8]">{selected.orderReference}</strong></span>
                  <span>Sentiment: <strong className="text-[#D83B20]">{selected.pipeline1Output?.sentiment || 'Neutral'}</strong></span>
                </div>
              </div>

              {/* Compliance check card */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="display text-xs text-[#E6E2D8] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#D83B20]" />
                    <span>Dual-Pipeline Verification</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-[#D83B20] border border-[#E6E2D8]/15">
                    Score: {selected.comparisonResult?.verificationScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#1A1A1A] border border-[#E6E2D8]/10">
                    <span className="text-[9px] text-[#E6E2D8]/40 block">RULE MATCH</span>
                    <strong className="text-[#E6E2D8] truncate block">{(selected.pipeline2Output?.matchedRules || []).join(', ') || 'Standard SLA'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#1A1A1A] border border-[#E6E2D8]/10">
                    <span className="text-[9px] text-[#E6E2D8]/40 block">PYTHON ENGINE</span>
                    <strong className="text-[#E6E2D8] block">{selected.pythonValidation?.status || 'Active'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#1A1A1A] border border-[#E6E2D8]/10">
                    <span className="text-[9px] text-[#E6E2D8]/40 block">POLICY CHECK</span>
                    <strong className="text-[#D83B20] block">{selected.pipeline2Output?.policyEligibilityApproved ? 'Approved' : 'Restricted'}</strong>
                  </div>
                  <div className="p-2.5 rounded bg-[#1A1A1A] border border-[#E6E2D8]/10">
                    <span className="text-[9px] text-[#E6E2D8]/40 block">TARGET SLA</span>
                    <strong className="text-[#E6E2D8] block">{selected.slaHours}h</strong>
                  </div>
                </div>
              </div>

              {/* Reply composer */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="display text-xs text-[#E6E2D8] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#D83B20]" />
                    <span>Customer Response Draft</span>
                  </span>
                  <span className="label text-[9px] text-[#E6E2D8]/40">Editable prior to dispatch</span>
                </div>

                {responseError && (
                  <div className="p-2.5 rounded-lg text-xs bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#D83B20] font-mono">
                    {responseError}
                  </div>
                )}

                <textarea
                  value={responseDraft}
                  onChange={(e) => setResponseDraft(e.target.value)}
                  rows={6}
                  placeholder="Compose verified response to customer..."
                  className="w-full p-3 text-xs rounded-xl bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8] font-mono focus:border-[#D83B20] focus:outline-none"
                />

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEscalating(!isEscalating)}
                    className="px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-lg border border-[#D83B20]/40 text-[#D83B20] hover:bg-[#D83B20]/10 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Escalate Case</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendResponse}
                    disabled={selected.comparisonResult?.verificationStatus === 'Manual Review' || !responseDraft.trim()}
                    className="px-5 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded-lg bg-[#D83B20] text-white hover:bg-[#b82f17] transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Response</span>
                  </button>
                </div>

                {/* Escalation Drawer */}
                {isEscalating && (
                  <div className="p-4 rounded-xl border border-[#D83B20]/30 bg-[#181818] space-y-3 mt-3">
                    <h4 className="display text-xs text-[#E6E2D8]">Escalate to Higher Authority</h4>
                    {escalationError && (
                      <div className="p-2 text-xs text-[#D83B20] font-mono">{escalationError}</div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Target Authority</label>
                        <select
                          value={escalationTier}
                          onChange={(e: any) => setEscalationTier(e.target.value)}
                          className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]"
                        >
                          <option value="Supervisor Review">Supervisor Review</option>
                          <option value="Department Manager">Department Manager</option>
                          <option value="Compliance Review">Compliance Review</option>
                          <option value="Critical Management Escalation">Critical Management Escalation</option>
                        </select>
                      </div>
                      <div>
                        <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Reason Narrative *</label>
                        <input
                          type="text"
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                          placeholder="e.g. Safety hazard or SLA risk..."
                          className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button type="button" onClick={() => setIsEscalating(false)} className="px-3 py-1.5 text-xs font-mono rounded-lg bg-[#1A1A1A] text-[#E6E2D8]/70 hover:text-white">
                        Cancel
                      </button>
                      <button type="button" onClick={handleExecuteEscalation} className="px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-lg bg-[#D83B20] text-white hover:bg-[#b82f17]">
                        Confirm Escalation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#E6E2D8]/50 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl">
              Select a ticket from the left stream to begin triage.
            </div>
          )}
        </main>
      </section>
    </div>
  );
};