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
    setEscalationReason('');
  };

  const statusFilters = ['All', 'Assigned', 'In Progress', 'Escalated', 'Resolved'];

  return (
    <div className="agent-dashboard role-dashboard agent-page">

      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="agent-hero">
  <div className="agent-hero-glow" aria-hidden />

  <div className="agent-hero-inner">

    {/* LEFT — same stack as customer hero */}
    <div className="agent-hero-left">
      <div className="agent-hero-eyebrow">
        <span className="agent-pill">Agent Workspace</span>
        <span className="agent-pill-sub">
          <ShieldCheck className="w-3.5 h-3.5" />
          Dual-Pipeline Verified Triage
        </span>
      </div>

      <h1 className="agent-hero-title">Assigned Tickets &amp; Actions</h1>
      <p className="agent-hero-sub">
        Review AI-drafted responses against cited policies before replying to customers.
      </p>
    </div>

    {/* RIGHT — same segmented-control language as customer hero */}
    <nav className="agent-hero-nav" aria-label="Agent filters">

      {/* Row 1 — Department select */}
      <div className="agent-hero-dept">
        <span className="agent-hero-dept-label">Department</span>
        <select
          value={currentDepartment}
          onChange={(e) => {
            onDepartmentChange(e.target.value);
            setListPage(1);
          }}
          className="agent-hero-dept-select"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Row 2 — Status segmented control */}
      <div className="agent-hero-tabs" role="tablist">
        {['All', 'Assigned', 'In Progress', 'Escalated', 'Resolved'].map((st) => (
          <button
            key={st}
            type="button"
            role="tab"
            aria-selected={statusFilter === st}
            onClick={() => { setStatusFilter(st); setListPage(1); }}
            className={`agent-hero-tab ${statusFilter === st ? 'is-active' : ''}`}
          >
            {st}
          </button>
        ))}
      </div>

    </nav>
  </div>
</section>

      {/* ============================================================
          KPI ROW
      ============================================================ */}
      <section className="agent-kpi-grid">
        <div className="agent-kpi">
          <div className="agent-kpi-icon"><Inbox className="w-5 h-5" /></div>
          <div className="agent-kpi-body">
            <span className="agent-kpi-label">Open Tickets</span>
            <strong className="agent-kpi-value">{agentOpenCount}</strong>
            <small className="agent-kpi-sub">Active in queue</small>
          </div>
        </div>

        <div className="agent-kpi">
          <div className="agent-kpi-icon"><CheckCircle className="w-5 h-5" /></div>
          <div className="agent-kpi-body">
            <span className="agent-kpi-label">Resolved</span>
            <strong className="agent-kpi-value">{agentResolvedCount}</strong>
            <small className="agent-kpi-sub">Successfully closed</small>
          </div>
        </div>

        <div className="agent-kpi">
          <div className="agent-kpi-icon"><Clock className="w-5 h-5" /></div>
          <div className="agent-kpi-body">
            <span className="agent-kpi-label">Urgent SLA</span>
            <strong className="agent-kpi-value">{agentUrgentCount}</strong>
            <small className="agent-kpi-sub">At risk or breached</small>
          </div>
        </div>

        <div className="agent-kpi">
          <div className="agent-kpi-icon"><ShieldCheck className="w-5 h-5" /></div>
          <div className="agent-kpi-body">
            <span className="agent-kpi-label">Verified Status</span>
            <strong className="agent-kpi-value">{agentVerifiedCount}</strong>
            <small className="agent-kpi-sub">100% policy match</small>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN WORKSPACE
      ============================================================ */}
      <section className="agent-workspace">

        {/* ---------- Left: Worklist ---------- */}
        <aside className="agent-worklist">
          <header className="agent-worklist-head">
            <div>
              <span className="agent-section-label">Ticket Queue</span>
              <h2 className="agent-worklist-title">
                {filtered.length} {filtered.length === 1 ? 'ticket' : 'tickets'}
              </h2>
            </div>
            <span className="agent-worklist-badge">Priority order</span>
          </header>

          <div className="agent-worklist-body">
            {filtered.length === 0 ? (
              <div className="agent-empty">
                <Inbox className="w-7 h-7" />
                <p className="agent-empty-title">No tickets found</p>
                <p className="agent-empty-sub">Adjust the department or status filter.</p>
              </div>
            ) : (
              visibleRequests.map((item) => {
                const isSelected = item.id === selectedId;
                const isVerified = item.comparisonResult?.verificationStatus === 'Verified';
                const p1 = item.pipeline1Output;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`agent-ticket ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="agent-ticket-top">
                      <span className="agent-ticket-id">{item.id}</span>
                      <span className={`agent-ticket-status ${isVerified ? 'is-verified' : 'is-review'}`}>
                        {isVerified ? 'Verified' : 'Review'}
                      </span>
                    </div>

                    <h3 className="agent-ticket-title">{item.title}</h3>

                    <div className="agent-ticket-meta">
                      <span className="agent-ticket-cat">
                        <Tag className="w-3 h-3" />
                        {p1?.category || item.assignedDepartment}
                      </span>
                      <span className={`agent-ticket-sla sla-${item.slaRiskStatus?.toLowerCase() || 'safe'}`}>
                        {item.slaRiskStatus}
                      </span>
                    </div>

                    <div className="agent-ticket-footer">
                      <span className="agent-ticket-cust">
                        <User className="w-3 h-3" />
                        {item.customerName}
                      </span>
                      <span className="agent-ticket-priority">
                        {p1?.priority || 'P3'} · {p1?.urgency || 'Med'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="agent-worklist-foot">
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setListPage}
            />
          </div>
        </aside>

        {/* ---------- Right: Workspace ---------- */}
        <main className="agent-detail">
          {!selected ? (
            <div className="agent-detail-empty">
              <Sparkles className="w-8 h-8" />
              <p>Select a ticket from the queue to start working.</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <header className="agent-detail-head">
                <div className="agent-detail-head-left">
                  <div className="agent-detail-meta">
                    <span className="agent-detail-id">{selected.id}</span>
                    <span className="agent-detail-sep">•</span>
                    <span>{selected.customerName} ({selected.customerType})</span>
                    <span className="agent-detail-sep">•</span>
                    <span>{new Date(selected.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="agent-detail-title">{selected.title}</h2>
                </div>

                <div className="agent-detail-actions">
                  <button
                    type="button"
                    onClick={() => onSelectComplaint(selected)}
                    className="agent-btn agent-btn-ghost"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResolve}
                    className="agent-btn agent-btn-primary"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </header>

              {/* Customer message */}
              <section className="agent-panel">
                <div className="agent-panel-head">
                  <span className="agent-panel-title">
                    <MessageSquare className="w-4 h-4" />
                    Customer&rsquo;s Message
                  </span>
                </div>
                <div className="agent-panel-body">
                  <p className="agent-message">{selected.description}</p>
                  <div className="agent-message-meta">
                    <span>
                      <Package className="w-3.5 h-3.5" />
                      <strong>{selected.productService}</strong>
                    </span>
                    <span>
                      <FileText className="w-3.5 h-3.5" />
                      Order <strong>{selected.orderReference}</strong>
                    </span>
                    <span>
                      Sentiment <strong className="text-accent">{selected.pipeline1Output?.sentiment || 'Neutral'}</strong>
                    </span>
                  </div>
                </div>
              </section>

              {/* Compliance check */}
              <section className="agent-panel">
                <div className="agent-panel-head agent-panel-head-split">
                  <span className="agent-panel-title">
                    <ShieldCheck className="w-4 h-4" />
                    Dual-Pipeline Compliance Check
                  </span>
                  <span className="agent-score">
                    Match Score <strong>{selected.comparisonResult?.verificationScore}%</strong>
                  </span>
                </div>
                <div className="agent-panel-body">
                  <div className="agent-metric-grid">
                    <div className="agent-metric">
                      <span className="agent-metric-label">Matched Rule</span>
                      <span className="agent-metric-value">
                        {(selected.pipeline2Output?.matchedRules || []).join(', ') || 'Standard SLA'}
                      </span>
                    </div>
                    <div className="agent-metric">
                      <span className="agent-metric-label">Python Engine</span>
                      <span className="agent-metric-value">
                        {selected.pythonValidation?.status || 'Active'}
                      </span>
                    </div>
                    <div className="agent-metric">
                      <span className="agent-metric-label">Policy Eligibility</span>
                      <span className={`agent-metric-value ${selected.pipeline2Output?.policyEligibilityApproved ? '' : 'text-accent'}`}>
                        {selected.pipeline2Output?.policyEligibilityApproved ? 'Approved' : 'Restricted'}
                      </span>
                    </div>
                    <div className="agent-metric">
                      <span className="agent-metric-label">Target SLA</span>
                      <span className="agent-metric-value">{selected.slaHours} Hours</span>
                    </div>
                  </div>

                  {selected.comparisonResult && (selected.comparisonResult.discrepancies || []).length > 0 && (
                    <div className="agent-discrepancies">
                      <span className="agent-discrepancies-head">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Discrepancies identified
                      </span>
                      <ul>
                        {(selected.comparisonResult.discrepancies || []).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* Agent guidance (collapsible) */}
              {selected.pipeline1Output?.internalAgentGuidance && (
                <section className="agent-panel">
                  <button
                    type="button"
                    onClick={() => setShowInternalGuidance(!showInternalGuidance)}
                    className="agent-panel-head agent-panel-head-button"
                  >
                    <span className="agent-panel-title">
                      <HelpCircle className="w-4 h-4" />
                      Agent Guidance &amp; Recommended Steps
                    </span>
                    {showInternalGuidance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showInternalGuidance && (
                    <div className="agent-panel-body">
                      <p className="agent-guidance-quote">
                        {selected.pipeline1Output.internalAgentGuidance}
                      </p>
                      {(selected.pipeline1Output.resolutionSteps || []).length > 0 && (
                        <div className="agent-steps">
                          <span className="agent-steps-label">Action steps</span>
                          <ol>
                            {(selected.pipeline1Output.resolutionSteps || []).map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Reply composer */}
              <section className="agent-panel agent-composer">
                <div className="agent-panel-head agent-panel-head-split">
                  <span className="agent-panel-title">
                    <FileText className="w-4 h-4" />
                    Customer Response Draft
                  </span>
                  <span className="agent-composer-hint">Editable before sending</span>
                </div>
                <div className="agent-panel-body">
                  <textarea
                    value={responseDraft}
                    onChange={(e) => setResponseDraft(e.target.value)}
                    rows={7}
                    placeholder="Compose your response to the customer…"
                    className="agent-composer-textarea"
                  />

                  <div className="agent-composer-actions">
                    <button
                      type="button"
                      onClick={() => setIsEscalating(!isEscalating)}
                      className="agent-btn agent-btn-danger"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Escalate Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendResponse}
                      disabled={selected.comparisonResult?.verificationStatus === 'Manual Review'}
                      className="agent-btn agent-btn-primary agent-btn-lg"
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
                    <div className="agent-escalation">
                      <h4 className="agent-escalation-title">
                        <ArrowUpRight className="w-4 h-4" />
                        Escalate to Higher Authority
                      </h4>
                      <div className="agent-escalation-grid">
                        <div>
                          <label className="agent-escalation-label">Target Tier</label>
                          <select
                            value={escalationTier}
                            onChange={(e: any) => setEscalationTier(e.target.value)}
                            className="agent-escalation-select"
                          >
                            <option value="Supervisor Review">Supervisor Review</option>
                            <option value="Department Manager">Department Manager</option>
                            <option value="Specialist Team">Specialist Team</option>
                            <option value="Compliance Review">Compliance Review</option>
                            <option value="Critical Management Escalation">Critical Management Escalation</option>
                          </select>
                        </div>
                        <div>
                          <label className="agent-escalation-label">Reason</label>
                          <input
                            type="text"
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                            placeholder="e.g. Safety hazard or SLA risk"
                            className="agent-escalation-input"
                          />
                        </div>
                      </div>
                      <div className="agent-escalation-actions">
                        <button
                          type="button"
                          onClick={() => setIsEscalating(false)}
                          className="agent-btn agent-btn-ghost"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleExecuteEscalation}
                          className="agent-btn agent-btn-primary"
                        >
                          Confirm Escalation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </section>
    </div>
  );
};