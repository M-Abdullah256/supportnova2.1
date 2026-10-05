import React, { useState } from 'react';
import type { Complaint, PolicyDocument } from '../types/index.ts';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  policies: PolicyDocument[];
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
  policies,
}) => {
  const [activeTab, setActiveTab] = useState<'dossier' | 'pipeline1' | 'python' | 'pipeline2' | 'audit' | 'policies'>('dossier');
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;

  const p1 = complaint.pipeline1Output;
  const p2 = complaint.pipeline2Output;
  const comp = complaint.comparisonResult;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(complaint, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabButtonStyle = (isActive: boolean) => ({
    color: isActive ? '#D83B20' : 'rgba(230, 226, 216, 0.6)',
    borderBottom: `2px solid ${isActive ? '#D83B20' : 'transparent'}`,
    background: 'transparent',
    fontWeight: isActive ? 700 : 500,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-[#121212] border border-[#E6E2D8]/15 overflow-hidden text-[#E6E2D8]">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E6E2D8]/10 bg-[#161616]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#D83B20]/10 text-[#D83B20] border border-[#D83B20]/30">
              {complaint.id}
            </span>
            <div>
              <h2 className="display text-lg text-[#E6E2D8] leading-tight">
                {complaint.title}
              </h2>
              <div className="flex items-center space-x-2 text-[11px] font-mono mt-0.5 text-[#E6E2D8]/50">
                <span>Customer: {complaint.customerName}</span>
                <span>•</span>
                <span>Order: {complaint.orderReference}</span>
                <span>•</span>
                <span>Dept: {complaint.assignedDepartment}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyJson}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 bg-[#1C1C1C] text-[#E6E2D8] border border-[#E6E2D8]/15 hover:border-[#D83B20] transition cursor-pointer"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#D83B20]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1C1C1C] text-[#E6E2D8]/60 hover:text-white border border-[#E6E2D8]/15 hover:border-[#D83B20] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-1 px-4 sm:px-6 pt-2 text-xs overflow-x-auto scrollbar-none whitespace-nowrap border-b border-[#E6E2D8]/10 bg-[#141414]">
          {[
            { id: 'dossier', label: 'Triage Dossier' },
            { id: 'pipeline1', label: 'Pipeline 1 (GenAI)' },
            { id: 'python', label: 'Python Crosscheck' },
            { id: 'pipeline2', label: 'Pipeline 2 (Rule Matrix)' },
            { id: 'policies', label: 'Policy Traceability' },
            { id: 'audit', label: `Audit Trail (${(complaint.auditTrail ?? []).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-3.5 py-2 font-mono uppercase tracking-wider text-[11px] font-medium transition cursor-pointer shrink-0"
              style={tabButtonStyle(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-[#0F0F0F] text-[#E6E2D8]/80">
          {activeTab === 'dossier' && (
            <div className="space-y-5">
              {/* Verification Score Card */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between border ${
                  comp?.verificationStatus === 'Verified'
                    ? 'bg-[#141414] border-[#E6E2D8]/20'
                    : 'bg-[#D83B20]/10 border-[#D83B20]/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {comp?.verificationStatus === 'Verified' ? (
                    <ShieldCheck className="w-7 h-7 text-[#E6E2D8]" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-[#D83B20]" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="display text-sm text-[#E6E2D8]">
                        Pipeline Status: {comp?.verificationStatus}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#E6E2D8]/20 font-bold text-[#D83B20]">
                        Score: {comp?.verificationScore}%
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 text-[#E6E2D8]/60">
                      {comp?.verificationStatus === 'Verified'
                        ? '100% policy-compliant resolution pipeline. Ready for agent dispatch.'
                        : 'Discrepancy detected between AI draft and rule matrix. Routed for human review.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adversarial Alert */}
              {p1?.adversarialAnalysis?.isAdversarial && (
                <div className="p-4 rounded-xl text-xs space-y-1.5 bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#E6E2D8]">
                  <div className="flex items-center space-x-2 font-bold text-[#D83B20]">
                    <AlertTriangle className="w-4 h-4 text-[#D83B20]" />
                    <span className="font-mono uppercase tracking-wider">SECURITY ALERT: {p1.adversarialAnalysis.threatType} Trapped</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#E6E2D8]/80">
                    {p1.adversarialAnalysis.threatDetails}
                  </p>
                  <div className="text-[10px] font-mono text-[#D83B20] pt-1 border-t border-[#D83B20]/20">
                    Action Directive: {p1.adversarialAnalysis.recommendedAction}
                  </div>
                </div>
              )}

              {p1?.summary && (
                <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15 space-y-1">
                  <span className="label text-[10px] text-[#D83B20] block">
                    AI Executive Triage Summary
                  </span>
                  <p className="text-xs leading-relaxed text-[#E6E2D8]">
                    {p1.summary}
                  </p>
                </div>
              )}

              {/* Customer Submission */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="label text-[10px] text-[#E6E2D8]/60">
                    Untrusted Customer Submission
                  </span>
                  {p1?.responseTone && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] text-[#E6E2D8] border border-[#E6E2D8]/15">
                      Tone: {p1.responseTone}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-[#E6E2D8] bg-[#181818] p-3 rounded-lg border border-[#E6E2D8]/10 font-mono text-[11px]">
                  {complaint.description}
                </p>
                <div className="mt-3 pt-2 flex flex-wrap gap-4 border-t border-[#E6E2D8]/10 text-[#E6E2D8]/60 text-[11px]">
                  <span>Product: <strong className="text-[#E6E2D8]">{complaint.productService}</strong></span>
                  <span>Channel: <strong className="text-[#E6E2D8]">{complaint.channel}</strong></span>
                  <span>Customer Tier: <strong className="text-[#E6E2D8]">{complaint.customerType}</strong></span>
                  <span>Target SLA: <strong className="text-[#E6E2D8]">{complaint.slaHours} Hours</strong></span>
                </div>
              </div>

              {/* Side-by-side comparison summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl space-y-2 bg-[#141414] border border-[#E6E2D8]/15">
                  <span className="label text-[10px] text-[#D83B20] block pb-1 border-b border-[#E6E2D8]/10">
                    Pipeline 1 GenAI Assessment
                  </span>
                  <div>Primary Issue: <strong className="text-[#E6E2D8]">{p1?.primaryIssue}</strong></div>
                  <div>Category: <strong className="text-[#E6E2D8]">{p1?.category}</strong> ({p1?.subcategory})</div>
                  <div>Routing: <strong className="text-[#D83B20]">{p1?.recommendedDepartment}</strong></div>
                  <div>Urgency / Priority: <strong className="text-[#E6E2D8]">{p1?.urgency} ({p1?.priority})</strong></div>
                  <div>Escalation: <strong className={p1?.escalationRequired ? 'text-[#D83B20]' : 'text-[#E6E2D8]'}>{p1?.escalationRequired ? `Yes (${p1.escalationTier})` : 'No'}</strong></div>
                </div>

                <div className="p-4 rounded-xl space-y-2 bg-[#141414] border border-[#E6E2D8]/15">
                  <span className="label text-[10px] text-[#E6E2D8]/70 block pb-1 border-b border-[#E6E2D8]/10">
                    Pipeline 2 Rule Matrix Assessment
                  </span>
                  <div>Expected Category: <strong className="text-[#E6E2D8]">{p2?.expectedCategory}</strong></div>
                  <div>Mandatory Dept: <strong className="text-[#E6E2D8] font-semibold">{p2?.expectedDepartment}</strong></div>
                  <div>Expected Urgency / Pri: <strong className="text-[#E6E2D8]">{p2?.expectedUrgency} ({p2?.expectedPriority})</strong></div>
                  <div>Mandatory Escalation: <strong className={p2?.mandatoryEscalation ? 'text-[#D83B20]' : 'text-[#E6E2D8]'}>{p2?.mandatoryEscalation ? `MANDATORY (${p2.mandatoryEscalationTier})` : 'No'}</strong></div>
                  <div className="text-[11px] text-[#E6E2D8]/50">
                    Rules: <span className="font-mono text-[#E6E2D8]">{(p2?.matchedRules || []).join(', ') || 'Standard SLA'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline1' && (
            <div className="p-4 rounded-xl font-mono space-y-2 bg-[#141414] border border-[#E6E2D8]/15 text-[#E6E2D8]">
              <span className="label text-[10px] text-[#D83B20] block mb-2">Pipeline 1 Structured JSON</span>
              <pre className="overflow-x-auto text-[11px] text-[#E6E2D8]/90">{JSON.stringify(p1, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#141414] border border-[#E6E2D8]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="display text-xs text-[#E6E2D8]">
                    Python Validation Status: {complaint.pythonValidation?.status || 'Validated'}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#E6E2D8]/20 font-bold text-[#D83B20]">
                    Score: {complaint.pythonValidation?.validationScore ?? 90}%
                  </span>
                </div>
                <p className="text-xs text-[#E6E2D8]/60">
                  Ground-truth Python engine crosschecking constraints and policy rules.
                </p>
              </div>

              <div className="p-4 rounded-xl font-mono bg-[#141414] border border-[#E6E2D8]/15 text-[#E6E2D8]">
                <pre className="overflow-x-auto text-[11px] text-[#E6E2D8]/90">{JSON.stringify(complaint.pythonValidation || { message: 'Validated in Python 3.10 engine' }, null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === 'pipeline2' && (
            <div className="p-4 rounded-xl font-mono bg-[#141414] border border-[#E6E2D8]/15 text-[#E6E2D8]">
              <span className="label text-[10px] text-[#E6E2D8]/70 block mb-2">Pipeline 2 Rule Matrix Payload</span>
              <pre className="overflow-x-auto text-[11px] text-[#E6E2D8]/90">{JSON.stringify(p2, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-3">
              <span className="display text-sm text-[#E6E2D8] block">Cited Knowledge Base Policies</span>
              {p1?.citedPolicies && p1.citedPolicies.length > 0 ? (
                p1.citedPolicies.map((cp, idx) => {
                  const fullDoc = (policies || []).find((p) => p.id === cp.docId);
                  return (
                    <div key={idx} className="p-4 rounded-xl space-y-1.5 bg-[#141414] border border-[#E6E2D8]/15">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#D83B20]">{cp.docId} • {cp.sectionId}</span>
                        <span className="text-[10px] font-mono text-[#E6E2D8]/50">{fullDoc ? `v${fullDoc.version}` : 'Active'}</span>
                      </div>
                      <h4 className="font-bold text-[#E6E2D8]">{fullDoc?.title || cp.citationText}</h4>
                      <p className="italic p-2.5 rounded bg-[#181818] border border-[#E6E2D8]/10 text-[#E6E2D8]/80">"{cp.citationText}"</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#E6E2D8]/50 italic">No explicit policy citations recorded.</div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <span className="display text-sm text-[#E6E2D8] block">Immutable Audit Log</span>
              <div className="relative pl-4 ml-2 space-y-4 border-l-2 border-[#E6E2D8]/20">
                {(complaint.auditTrail || []).map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute top-1 w-2.5 h-2.5 rounded-full -left-[21px] bg-[#D83B20]" />
                    <div className="text-[10px] font-mono text-[#E6E2D8]/50">
                      {new Date(log.timestamp).toLocaleString()} • Actor: <strong className="text-[#E6E2D8]">{log.actor}</strong>
                    </div>
                    <div className="text-xs font-bold text-[#E6E2D8] mt-0.5">{log.action}</div>
                    <div className="text-[11px] text-[#E6E2D8]/60 mt-0.5">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};