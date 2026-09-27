import React, { useState, useEffect } from 'react';
import { Pagination } from './Pagination';
import type { Complaint, UrgencyLevel, PriorityLevel } from '../types/index.ts';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  RefreshCw,
  ShieldAlert,
  ExternalLink,
  ShieldCheck,
  Check,
  XCircle,
  ArrowUpRight,
  Shield,
  FileText,
} from 'lucide-react';

interface ReviewerQueueProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
  onReviewDecision: (complaintId: string, decisionData: any) => Promise<void>;
  onReAnalyze: (complaintId: string) => Promise<void>;
  departments: string[];
}

export const ReviewerQueue: React.FC<ReviewerQueueProps> = ({
  complaints,
  onSelectComplaint,
  onReviewDecision,
  onReAnalyze,
  departments,
}) => {
  // Filter for cases requiring manual review or with low verification scores
  const queueCases = (complaints ?? []).filter(
    (c) =>
      c.pipeline1Output?.pipelineStatus === 'GENAI_UNAVAILABLE' ||
      c.comparisonResult?.verificationStatus === 'Manual Review' ||
      (c.comparisonResult && c.comparisonResult.verificationScore < 85) ||
      (c.pipeline2Output && (c.pipeline2Output.adversarialPromptFlags || []).length > 0) ||
      (c.pipeline2Output && (c.pipeline2Output.unsupportedPromiseFlags || []).length > 0)
  );

  const reviewVerified = (complaints ?? []).filter((item) => item.comparisonResult?.verificationStatus === 'Verified').length;
  const reviewFlaggedCount = queueCases.filter((item) => (item.pipeline2Output?.adversarialPromptFlags?.length ?? 0) > 0).length;
  const reviewPromiseCount = queueCases.filter((item) => (item.pipeline2Output?.unsupportedPromiseFlags?.length ?? 0) > 0).length;

  const [selectedId, setSelectedId] = useState<string | null>(
    (queueCases ?? []).length > 0 ? queueCases[0].id : null
  );
  const [listPage, setListPage] = useState(1);
  const pageSize = 6;
  const currentPage = Math.min(listPage, Math.max(1, Math.ceil(queueCases.length / pageSize)));
  const visibleQueueCases = queueCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selected = (complaints ?? []).find((c) => c.id === selectedId);

  // Reviewer Modification Inputs
  const [overrideDept, setOverrideDept] = useState('');
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideUrgency, setOverrideUrgency] = useState<UrgencyLevel>('High');
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('P2');
  const [overrideResponse, setOverrideResponse] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selected) {
      setOverrideDept(selected.assignedDepartment || selected.pipeline2Output?.expectedDepartment || 'Customer Support');
      setOverrideCategory(selected.pipeline1Output?.category || selected.pipeline2Output?.expectedCategory || '');
      setOverrideUrgency(selected.pipeline2Output?.expectedUrgency || 'High');
      setOverridePriority(selected.pipeline2Output?.expectedPriority || 'P2');
      setOverrideResponse(selected.pipeline1Output?.draftedResponse || '');
      setReviewerNotes('');
    }
  }, [selectedId, selected]);

  const handleAction = async (decision: 'Approved' | 'Modified' | 'Rejected' | 'Reclassified' | 'Reassigned' | 'Escalated') => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await onReviewDecision(selected.id, {
        reviewedBy: 'Dr. Tariq Al-Mansoor (Reviewer Lead)',
        decision,
        overriddenDepartment: overrideDept,
        overriddenCategory: overrideCategory,
        overriddenUrgency: overrideUrgency,
        overriddenPriority: overridePriority,
        overriddenResponse: overrideResponse,
        notes: reviewerNotes || `Reviewer action: ${decision}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await onReAnalyze(selected.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reviewer-dashboard role-dashboard space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 md:p-7 bg-white border border-[#C0BCB1] shadow-[0_6px_0_rgba(23,23,23,0.04),0_20px_45px_rgba(23,23,23,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C0BCB1] via-[#D21515] to-[#C0BCB1]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)] font-mono flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Reviewer Queue
              </span>
              <span className="text-xs text-[#6B6B6B]">
                Dual-Pipeline Discrepancy & Safety Inspection
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#171717] mt-1.5 tracking-tight">
              QA Adjudication & Compliance Queue
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Audit flagged cases, investigate AI policy deviations, and execute binding decision overrides.
            </p>
          </div>

          <div className="bg-[#F0EFEA] border border-[#C0BCB1] p-3 rounded-2xl flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block font-mono">Pending Review</span>
              <span className="text-2xl font-mono font-bold text-[#D21515]">{queueCases.length}</span>
            </div>
            <div className="w-px h-8 bg-[#C0BCB1]" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B] block font-mono">Total Inflow</span>
              <span className="text-2xl font-mono font-bold text-[#171717]">{complaints.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <section className="role-analytics" aria-label="Review workload overview">
        <div className="role-kpi-grid">
          <div className="role-kpi role-kpi-gold">
            <span>Pending Review</span>
            <strong>{queueCases.length}</strong>
            <small>Awaiting human adjudication</small>
          </div>
          <div className="role-kpi role-kpi-olive">
            <span>Cleared Status</span>
            <strong>{reviewVerified}</strong>
            <small>Passed dual-pipeline checks</small>
          </div>
          <div className="role-kpi role-kpi-mahogany">
            <span>Unsafe Injections</span>
            <strong>{reviewFlaggedCount}</strong>
            <small>Prompt threats intercepted</small>
          </div>
          <div className="role-kpi role-kpi-sienna">
            <span>Promise Flags</span>
            <strong>{reviewPromiseCount}</strong>
            <small>Unauthorized refund claims</small>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Case Worklist */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B] px-1 font-semibold">
            <span>Flagged Tickets ({queueCases.length})</span>
            <span>Priority Queue</span>
          </div>

          {queueCases.length === 0 ? (
            <div className="bg-white border border-[#C0BCB1] rounded-2xl p-8 text-center text-[#6B6B6B] text-xs">
              <CheckCircle2 className="w-8 h-8 text-[#171717] mx-auto mb-2 opacity-80" />
              <p className="font-bold text-[#171717]">All Clear</p>
              <p className="text-[11px] mt-1 text-[#6B6B6B]">Every ticket passed dual-pipeline verification.</p>
            </div>
          ) : (
            visibleQueueCases.map((item) => {
              const isSelected = item.id === selectedId;
              const score = item.comparisonResult?.verificationScore ?? 0;
              const hasAdversarial = (item.pipeline2Output?.adversarialPromptFlags?.length ?? 0) > 0;
              const hasUnsupported = (item.pipeline2Output?.unsupportedPromiseFlags?.length ?? 0) > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer relative bg-white ${
                    isSelected
                      ? 'border-[#171717] shadow-sm ring-2 ring-[#171717]'
                      : 'border-[#C0BCB1] hover:border-[#171717]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#D21515]">
                      {item.id}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {hasAdversarial && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded font-mono bg-[rgba(210,21,21,0.1)] text-[#D21515] border border-[rgba(210,21,21,0.25)]">
                          UNSAFE
                        </span>
                      )}
                      {hasUnsupported && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded font-mono bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1]">
                          PROMISE
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1]">
                        {item.pipeline1Output?.pipelineStatus === 'GENAI_UNAVAILABLE' ? 'OFFLINE' : `${score}%`}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-[#171717] line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  <div className="text-[11px] text-[#6B6B6B] flex items-center justify-between mt-2">
                    <span className="truncate max-w-[170px]">{item.customerName}</span>
                    <span className="text-[#D21515] font-mono text-[10px] font-bold">
                      {item.comparisonResult?.discrepancies?.length || 0} issues
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <Pagination page={currentPage} pageSize={pageSize} totalItems={queueCases.length} onPageChange={setListPage} />
        </div>

        {/* Right Column: Case Adjudication Detail */}
        <div className="lg:col-span-8">
          {selected ? (
            <div className="bg-white rounded-2xl border border-[#C0BCB1] p-6 shadow-xs space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-[#D21515]">{selected.id}</span>
                    <span className="text-[#C0BCB1]">•</span>
                    <span className="text-[#6B6B6B]">{selected.customerName} ({selected.customerType})</span>
                    <span className="text-[#C0BCB1]">•</span>
                    <span className="text-[#6B6B6B]">{new Date(selected.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-base font-bold text-[#171717] mt-1 tracking-tight">
                    {selected.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-xl text-xs bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1] hover:border-[#171717] flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin text-[#D21515]' : ''}`} />
                    <span>Re-Analyze</span>
                  </button>
                  <button
                    onClick={() => onSelectComplaint(selected)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] transition cursor-pointer flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Dossier</span>
                  </button>
                </div>
              </div>

              {/* Original Untrusted Customer Text */}
              <div className="bg-[#F0EFEA] border border-[#C0BCB1] rounded-xl p-4 text-xs">
                <span className="text-[10px] font-mono font-bold text-[#D21515] uppercase tracking-wider block mb-1">
                  Original Untrusted Complaint Text
                </span>
                <p className="text-[#171717] leading-relaxed bg-white p-3 rounded-lg border border-[#C0BCB1]">
                  {selected.description}
                </p>
                <div className="mt-2 text-[11px] text-[#6B6B6B] flex flex-wrap gap-4">
                  <span>Product: <strong className="text-[#171717]">{selected.productService}</strong></span>
                  <span>Order: <strong className="text-[#171717]">{selected.orderReference}</strong></span>
                  <span>Customer Claimed: <strong className="text-[#D21515]">{selected.requestedResolution || 'None'}</strong></span>
                </div>
              </div>

              {/* GenAI Unavailable Notice if Applicable */}
              {selected.pipeline1Output?.pipelineStatus === 'GENAI_UNAVAILABLE' && (
                <div role="alert" className="border border-[rgba(210,21,21,0.3)] bg-[rgba(210,21,21,0.06)] rounded-xl p-4 text-xs text-[#D21515]">
                  <strong className="block font-mono uppercase tracking-wider mb-1">GenAI Analysis Unavailable</strong>
                  <p className="text-[#3A3A3A]">This complaint was not analyzed by GenAI. Manual classification and triage are required.</p>
                  <p className="mt-1 text-[11px] text-[#6B6B6B]">{selected.pipeline1Output.error} (Attempts: {selected.pipeline1Output.attempts ?? 0})</p>
                </div>
              )}

              {/* Triangulation Inspection Card */}
              <div className="border border-[#C0BCB1] rounded-xl overflow-hidden">
                <div className="bg-[#F0EFEA] px-4 py-2.5 border-b border-[#C0BCB1] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171717] flex items-center space-x-1.5 uppercase font-mono">
                    <ShieldAlert className="w-4 h-4 text-[#D21515]" />
                    <span>Triangulation Results</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#D21515] border border-[#C0BCB1]">
                    {selected.comparisonResult ? `Agreement Score: ${selected.comparisonResult.verificationScore}%` : 'Not run'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#C0BCB1] text-xs bg-white">
                  {/* P1 Column */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#E4E2DC]">
                      <span className="font-bold text-[#D21515]">Pipeline 1 (GenAI)</span>
                      <span className="text-[10px] font-mono text-[#6B6B6B]">
                        {selected.pipeline1Output?.modelUsed || 'Gemini 1.5'}
                      </span>
                    </div>
                    <div className="space-y-1 text-[#3A3A3A]">
                      <div>Category: <strong className="text-[#171717]">{selected.pipeline1Output?.category || 'N/A'}</strong></div>
                      <div>Routing: <strong className="text-[#D21515]">{selected.pipeline1Output?.recommendedDepartment || 'N/A'}</strong></div>
                      <div>Priority: <strong className="text-[#171717]">{selected.pipeline1Output?.priority} ({selected.pipeline1Output?.urgency})</strong></div>
                      <div>Escalation: <strong className={selected.pipeline1Output?.escalationRequired ? 'text-[#D21515]' : ''}>{selected.pipeline1Output?.escalationRequired ? `Yes (${selected.pipeline1Output.escalationTier})` : 'No'}</strong></div>
                    </div>
                  </div>

                  {/* Python Column */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#E4E2DC]">
                      <span className="font-bold text-[#171717]">Python Crosscheck</span>
                      <span className="text-[10px] font-mono text-[#6B6B6B]">Python 3.10</span>
                    </div>
                    <div className="space-y-1 text-[#3A3A3A]">
                      <div>Status: <strong className="text-[#171717]">{selected.pythonValidation?.status || 'Validated'}</strong></div>
                      <div>Score: <strong className="text-[#171717]">{selected.pythonValidation?.validationScore ?? 90}%</strong></div>
                      <div>Threats: <strong className={(selected.pythonValidation?.adversarialThreats?.length || 0) > 0 ? 'text-[#D21515]' : ''}>{selected.pythonValidation?.adversarialThreats?.length || 0} detected</strong></div>
                      <div>Findings: <strong className="text-[#171717]">{selected.pythonValidation?.findings?.length || 0} flagged</strong></div>
                    </div>
                  </div>

                  {/* P2 Column */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#E4E2DC]">
                      <span className="font-bold text-[#171717]">Pipeline 2 (Matrix)</span>
                      <span className="text-[10px] font-mono text-[#6B6B6B]">Deterministic</span>
                    </div>
                    <div className="space-y-1 text-[#3A3A3A]">
                      <div>Expected: <strong className="text-[#171717]">{selected.pipeline2Output?.expectedCategory || 'Standard'}</strong></div>
                      <div>Mandatory Dept: <strong className="text-[#171717] font-semibold">{selected.pipeline2Output?.expectedDepartment || 'General Support'}</strong></div>
                      <div>Priority: <strong className="text-[#171717]">{selected.pipeline2Output?.expectedPriority} ({selected.pipeline2Output?.expectedUrgency})</strong></div>
                      <div>Escalation: <strong className={selected.pipeline2Output?.mandatoryEscalation ? 'text-[#D21515]' : ''}>{selected.pipeline2Output?.mandatoryEscalation ? 'MANDATORY' : 'None'}</strong></div>
                    </div>
                  </div>
                </div>

                {selected.comparisonResult?.discrepancies && (selected.comparisonResult.discrepancies || []).length > 0 && (
                  <div className="bg-[rgba(210,21,21,0.06)] border-t border-[rgba(210,21,21,0.2)] p-3 text-xs text-[#D21515]">
                    <span className="font-bold block mb-1">Discrepancy Inspector ({selected.comparisonResult.discrepancies.length}):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#3A3A3A]">
                      {(selected.comparisonResult.discrepancies || []).map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Reviewer Action Form */}
              <div className="bg-[#F0EFEA] border border-[#C0BCB1] rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-[#171717] uppercase tracking-wider flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#D21515]" />
                  <span>Execute Adjudication Decision</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171717] mb-1">Override Department</label>
                    <select
                      value={overrideDept}
                      onChange={(e) => setOverrideDept(e.target.value)}
                      className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171717] mb-1">Override Urgency</label>
                    <select
                      value={overrideUrgency}
                      onChange={(e: any) => setOverrideUrgency(e.target.value)}
                      className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171717] mb-1">Override Priority</label>
                    <select
                      value={overridePriority}
                      onChange={(e: any) => setOverridePriority(e.target.value)}
                      className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                    >
                      <option value="P1">P1 (Immediate)</option>
                      <option value="P2">P2 (Urgent)</option>
                      <option value="P3">P3 (Standard)</option>
                      <option value="P4">P4 (Low)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171717] mb-1">Adjusted Customer Response Draft</label>
                  <textarea
                    value={overrideResponse}
                    onChange={(e) => setOverrideResponse(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl p-2.5 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#171717] mb-1">Review Notes (Recorded to Audit Trail)</label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Provide justification for override or approval..."
                    className="w-full rounded-xl p-2 text-xs bg-white border border-[#C0BCB1] text-[#171717]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#C0BCB1]">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction('Rejected')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl border border-[rgba(210,21,21,0.3)] text-[#D21515] bg-white hover:bg-[rgba(210,21,21,0.06)] text-xs font-semibold cursor-pointer"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleAction('Escalated')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl border border-[#C0BCB1] text-[#171717] bg-white hover:border-[#171717] text-xs font-semibold cursor-pointer"
                    >
                      Escalate to Manager
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction('Modified')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1] hover:border-[#171717] cursor-pointer"
                    >
                      Approve with Changes
                    </button>
                    <button
                      onClick={() => handleAction('Approved')}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] shadow-xs cursor-pointer"
                    >
                      Approve as Suggested
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#C0BCB1] p-12 text-center text-[#6B6B6B] text-xs">
              Select a ticket from the queue on the left to begin review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};