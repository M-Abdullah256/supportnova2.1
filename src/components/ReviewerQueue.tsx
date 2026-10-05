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
  XCircle,
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
  const queueCases = (complaints ?? []).filter(
    (c) =>
      c.pipeline1Output?.pipelineStatus === 'GENAI_UNAVAILABLE' ||
      c.comparisonResult?.verificationStatus === 'Manual Review' ||
      (c.comparisonResult && c.comparisonResult.verificationScore < 85) ||
      (c.pipeline2Output && (c.pipeline2Output.adversarialPromptFlags || []).length > 0) ||
      (c.pipeline2Output && (c.pipeline2Output.unsupportedPromiseFlags || []).length > 0)
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    (queueCases ?? []).length > 0 ? queueCases[0].id : null
  );
  const [listPage, setListPage] = useState(1);
  const pageSize = 6;
  const currentPage = Math.min(listPage, Math.max(1, Math.ceil(queueCases.length / pageSize)));
  const visibleQueueCases = queueCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selected = (complaints ?? []).find((c) => c.id === selectedId);

  // Reviewer Override State
  const [overrideDept, setOverrideDept] = useState('');
  const [overrideCategory, setOverrideCategory] = useState('');
  const [overrideUrgency, setOverrideUrgency] = useState<UrgencyLevel>('High');
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('P2');
  const [overrideResponse, setOverrideResponse] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selected) {
      setOverrideDept(selected.assignedDepartment || selected.pipeline2Output?.expectedDepartment || 'Customer Support');
      setOverrideCategory(selected.pipeline1Output?.category || selected.pipeline2Output?.expectedCategory || '');
      setOverrideUrgency(selected.pipeline2Output?.expectedUrgency || 'High');
      setOverridePriority(selected.pipeline2Output?.expectedPriority || 'P2');
      setOverrideResponse(selected.pipeline1Output?.draftedResponse || '');
      setReviewerNotes('');
      setDecisionError(null);
    }
  }, [selectedId, selected]);

  const handleAction = async (decision: 'Approved' | 'Modified' | 'Rejected' | 'Reclassified' | 'Reassigned' | 'Escalated') => {
    if (!selected) return;
    setDecisionError(null);

    if (decision === 'Modified' && overrideResponse.trim().length < 10) {
      setDecisionError('Modified customer response must contain at least 10 characters.');
      return;
    }
    if ((decision === 'Rejected' || decision === 'Escalated' || decision === 'Modified') && reviewerNotes.trim().length < 5) {
      setDecisionError('Audit compliance requires a reason/justification of at least 5 characters in Review Notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReviewDecision(selected.id, {
        reviewedBy: 'Dr. Tariq Al-Mansoor (Reviewer Lead)',
        decision,
        overriddenDepartment: overrideDept,
        overriddenCategory: overrideCategory,
        overriddenUrgency: overrideUrgency,
        overriddenPriority: overridePriority,
        overriddenResponse: overrideResponse.trim(),
        notes: reviewerNotes.trim() || `Reviewer action: ${decision}`,
      });
    } catch (err: any) {
      setDecisionError(err.message || 'Adjudication decision failed.');
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
    <div className="space-y-6 text-[#E6E2D8]">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D83B20] text-xs">✳</span>
              <span className="label text-[#E6E2D8]/70">Reviewer Governance Queue</span>
            </div>
            <h1 className="display text-3xl sm:text-4xl text-[#E6E2D8]">
              QA Adjudication &amp; Policy Clearance
            </h1>
            <p className="text-xs text-[#E6E2D8]/65 mt-2 max-w-xl leading-relaxed">
              Investigate AI hallucinations, override routing tiers, and sign off binding decisions for customer communication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#E6E2D8]/15 text-center">
              <span className="label text-[9px] text-[#E6E2D8]/50 block">FLAGGED INFLOW</span>
              <span className="display text-2xl text-[#D83B20]">{queueCases.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#E6E2D8]/60 px-1">
            <span>FLAGGED CASES ({queueCases.length})</span>
            <span className="text-[#D83B20]">INSPECTION</span>
          </div>

          <div className="space-y-2">
            {queueCases.length === 0 ? (
              <div className="bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl p-8 text-center text-[#E6E2D8]/50 text-xs">
                <CheckCircle2 className="w-8 h-8 text-[#D83B20] mx-auto mb-2" />
                <p className="display text-base text-[#E6E2D8]">All Clear</p>
                <p className="text-[11px] text-[#E6E2D8]/50 mt-1">Zero pending policy discrepancies in queue.</p>
              </div>
            ) : (
              visibleQueueCases.map((item) => {
                const isSelected = item.id === selectedId;
                const score = item.comparisonResult?.verificationScore ?? 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#181818] border-[#D83B20] shadow-[0_0_15px_rgba(216,59,32,0.15)]'
                        : 'bg-[#121212] border-[#E6E2D8]/15 hover:border-[#E6E2D8]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className="text-xs font-bold text-[#D83B20]">{item.id}</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-[#1C1C1C] text-[#E6E2D8] border border-[#E6E2D8]/15 font-bold">
                        {score}% Match
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-[#E6E2D8] line-clamp-1">{item.title}</h3>
                    <div className="text-[10px] font-mono text-[#E6E2D8]/50 flex justify-between mt-2">
                      <span>{item.customerName}</span>
                      <span className="text-[#D83B20]">{item.comparisonResult?.discrepancies?.length || 0} Flags</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Pagination page={currentPage} pageSize={pageSize} totalItems={queueCases.length} onPageChange={setListPage} />
        </div>

        {/* Right: Adjudication Form & Triangulation Result */}
        <div className="lg:col-span-8">
          {selected ? (
            <div className="bg-[#121212] rounded-2xl border border-[#E6E2D8]/15 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E2D8]/10">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#E6E2D8]/60">
                    <span className="text-[#D83B20] font-bold">{selected.id}</span>
                    <span>•</span>
                    <span>{selected.customerName} ({selected.customerType})</span>
                  </div>
                  <h2 className="display text-xl text-[#E6E2D8] mt-1">{selected.title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase bg-[#1A1A1A] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin text-[#D83B20]' : ''}`} />
                    <span>Re-Evaluate</span>
                  </button>
                  <button
                    onClick={() => onSelectComplaint(selected)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold bg-[#D83B20] text-white hover:bg-[#b82f17] transition cursor-pointer flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>

              {decisionError && (
                <div className="p-3 text-xs font-mono bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#D83B20] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{decisionError}</span>
                </div>
              )}

              {/* Untrusted Complaint Box */}
              <div className="p-4 rounded-xl bg-[#161616] border border-[#E6E2D8]/10 space-y-1">
                <span className="label text-[10px] text-[#D83B20]">Original Untrusted Complaint</span>
                <p className="text-xs text-[#E6E2D8] leading-relaxed font-mono">{selected.description}</p>
              </div>

              {/* Triangulation 3-Way Grid */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E2D8]/10 pb-2">
                  <span className="display text-xs text-[#E6E2D8] flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#D83B20]" />
                    <span>Triangulation Inspection Matrix</span>
                  </span>
                  <span className="text-xs font-mono text-[#D83B20] font-bold">
                    Agreement Score: {selected.comparisonResult?.verificationScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[#181818] border border-[#E6E2D8]/10 space-y-1">
                    <span className="text-[10px] text-[#D83B20] font-bold block">1. GenAI Recommendation</span>
                    <div>Dept: <strong className="text-[#E6E2D8]">{selected.pipeline1Output?.recommendedDepartment}</strong></div>
                    <div>Urgency: <strong className="text-[#E6E2D8]">{selected.pipeline1Output?.urgency}</strong></div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#181818] border border-[#E6E2D8]/10 space-y-1">
                    <span className="text-[10px] text-[#E6E2D8] font-bold block">2. Python Crosscheck</span>
                    <div>Status: <strong className="text-[#E6E2D8]">{selected.pythonValidation?.status}</strong></div>
                    <div>Score: <strong className="text-[#E6E2D8]">{selected.pythonValidation?.validationScore}%</strong></div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#181818] border border-[#E6E2D8]/10 space-y-1">
                    <span className="text-[10px] text-[#D83B20] font-bold block">3. Rule Matrix (P2)</span>
                    <div>Dept: <strong className="text-[#E6E2D8]">{selected.pipeline2Output?.expectedDepartment}</strong></div>
                    <div>Urgency: <strong className="text-[#E6E2D8]">{selected.pipeline2Output?.expectedUrgency}</strong></div>
                  </div>
                </div>
              </div>

              {/* Execution Form */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15 space-y-4">
                <h3 className="display text-xs text-[#E6E2D8]">Binding Review Decision Override</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Override Dept</label>
                    <select
                      value={overrideDept}
                      onChange={(e) => setOverrideDept(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d} className="bg-[#141414]">{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Override Urgency</label>
                    <select
                      value={overrideUrgency}
                      onChange={(e: any) => setOverrideUrgency(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Override Priority</label>
                    <select
                      value={overridePriority}
                      onChange={(e: any) => setOverridePriority(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]"
                    >
                      <option value="P1">P1 (Immediate)</option>
                      <option value="P2">P2 (Urgent)</option>
                      <option value="P3">P3 (Standard)</option>
                      <option value="P4">P4 (Low)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Adjusted Customer Response Draft</label>
                  <textarea
                    value={overrideResponse}
                    onChange={(e) => setOverrideResponse(e.target.value)}
                    rows={4}
                    className="w-full p-3 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8] font-mono focus:border-[#D83B20]"
                  />
                </div>

                <div>
                  <label className="label text-[9px] text-[#E6E2D8]/60 block mb-1">Audit Justification Notes *</label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter policy reasons for override..."
                    className="w-full p-2 text-xs rounded-lg bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8] font-mono focus:border-[#D83B20]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6E2D8]/10">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('Rejected')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-lg border border-[#D83B20]/40 text-[#D83B20] hover:bg-[#D83B20]/10 text-xs font-mono font-bold uppercase transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('Escalated')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8] hover:border-[#D83B20] text-xs font-mono font-bold uppercase transition"
                    >
                      Escalate
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('Modified')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#1C1C1C] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition"
                    >
                      Approve with Changes
                    </button>
                    <button
                      onClick={() => handleAction('Approved')}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase bg-[#D83B20] text-white hover:bg-[#b82f17] transition shadow-md"
                    >
                      Approve Original
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#E6E2D8]/50 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl">
              Select a ticket from the left stream to begin adjudication.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};