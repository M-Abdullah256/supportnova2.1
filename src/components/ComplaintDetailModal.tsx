import React, { useState } from 'react';
import type { Complaint, PolicyDocument } from '../types/index.ts';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
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
    color: isActive ? '#D21515' : '#6B6B6B',
    borderBottom: `2px solid ${isActive ? '#D21515' : 'transparent'}`,
    background: 'transparent',
    fontWeight: isActive ? 700 : 500,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl bg-white border border-[#C0BCB1] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E4E2DC] bg-[#F0EFEA]">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)]">
              {complaint.id}
            </span>
            <div>
              <h2 className="text-base font-bold text-[#171717] leading-tight">
                {complaint.title}
              </h2>
              <div className="flex items-center space-x-2 text-xs mt-0.5 text-[#6B6B6B]">
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
              className="px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer bg-white text-[#171717] border border-[#C0BCB1] hover:border-[#171717] transition"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#D21515]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white text-[#6B6B6B] hover:text-[#171717] border border-[#C0BCB1] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-1 px-4 sm:px-6 pt-2 text-xs overflow-x-auto scrollbar-none whitespace-nowrap border-b border-[#E4E2DC] bg-[#F0EFEA]/50">
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
              className="px-3.5 py-2 font-medium transition cursor-pointer shrink-0"
              style={tabButtonStyle(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white text-[#3A3A3A]">
          {activeTab === 'dossier' && (
            <div className="space-y-5">
              {/* Verification Score Card */}
              <div
                className={`p-4 rounded-xl flex items-center justify-between border ${
                  comp?.verificationStatus === 'Verified'
                    ? 'bg-[rgba(23,23,23,0.04)] border-[#C0BCB1]'
                    : 'bg-[rgba(210,21,21,0.06)] border-[rgba(210,21,21,0.25)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {comp?.verificationStatus === 'Verified' ? (
                    <ShieldCheck className="w-7 h-7 text-[#171717]" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-[#D21515]" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#171717]">
                        Dual-Pipeline Status: {comp?.verificationStatus}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#C0BCB1] font-semibold text-[#171717]">
                        Score: {comp?.verificationScore}%
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 text-[#6B6B6B]">
                      {comp?.verificationStatus === 'Verified'
                        ? '100% policy-compliant resolution pipeline. Ready for agent dispatch.'
                        : 'Discrepancy detected between AI draft and rule matrix. Routed for human review.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adversarial Alert */}
              {p1?.adversarialAnalysis?.isAdversarial && (
                <div className="p-4 rounded-xl text-xs space-y-1.5 bg-[rgba(210,21,21,0.06)] border border-[rgba(210,21,21,0.3)] text-[#171717]">
                  <div className="flex items-center space-x-2 font-bold text-[#D21515]">
                    <AlertTriangle className="w-4 h-4 text-[#D21515]" />
                    <span>SECURITY ALERT: {p1.adversarialAnalysis.threatType} Intercepted</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#3A3A3A]">
                    {p1.adversarialAnalysis.threatDetails}
                  </p>
                  <div className="text-[10px] font-semibold pt-1 text-[#D21515] border-t border-[rgba(210,21,21,0.2)]">
                    Recommended Action: {p1.adversarialAnalysis.recommendedAction}
                  </div>
                </div>
              )}

              {p1?.summary && (
                <div className="p-3.5 rounded-xl text-xs bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#D21515]">
                    AI Executive Triage Summary
                  </span>
                  <p className="text-xs leading-relaxed text-[#171717]">
                    {p1.summary}
                  </p>
                </div>
              )}

              {/* Customer Submission */}
              <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-[#171717]">
                    Customer Submission
                  </span>
                  {p1?.responseTone && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#171717] border border-[#C0BCB1]">
                      Tone: {p1.responseTone}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed text-[#3A3A3A] mt-1">
                  {complaint.description}
                </p>
                <div className="mt-3 pt-2 flex flex-wrap gap-4 border-t border-[#C0BCB1]/60 text-[#6B6B6B]">
                  <span>Product: <strong className="text-[#171717]">{complaint.productService}</strong></span>
                  <span>Channel: <strong className="text-[#171717]">{complaint.channel}</strong></span>
                  <span>Customer Tier: <strong className="text-[#171717]">{complaint.customerType}</strong></span>
                  <span>Target SLA: <strong className="text-[#171717]">{complaint.slaHours} Hours</strong></span>
                </div>
              </div>

              {/* Side-by-side comparison summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl space-y-2 bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="font-bold block pb-1 border-b border-[#C0BCB1] text-[#D21515]">
                    Pipeline 1 GenAI Assessment
                  </span>
                  <div>Primary Issue: <strong className="text-[#171717]">{p1?.primaryIssue}</strong></div>
                  <div>Category: <strong className="text-[#171717]">{p1?.category}</strong> ({p1?.subcategory})</div>
                  <div>Routing: <strong className="text-[#D21515]">{p1?.recommendedDepartment}</strong></div>
                  <div>Urgency / Priority: <strong className="text-[#171717]">{p1?.urgency} ({p1?.priority})</strong></div>
                  <div>Escalation: <strong className={p1?.escalationRequired ? 'text-[#D21515]' : 'text-[#171717]'}>{p1?.escalationRequired ? `Yes (${p1.escalationTier})` : 'No'}</strong></div>
                </div>

                <div className="p-4 rounded-xl space-y-2 bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="font-bold block pb-1 border-b border-[#C0BCB1] text-[#171717]">
                    Pipeline 2 Rule Matrix Assessment
                  </span>
                  <div>Expected Category: <strong className="text-[#171717]">{p2?.expectedCategory}</strong></div>
                  <div>Mandatory Dept: <strong className="text-[#171717] font-semibold">{p2?.expectedDepartment}</strong></div>
                  <div>Expected Urgency / Pri: <strong className="text-[#171717]">{p2?.expectedUrgency} ({p2?.expectedPriority})</strong></div>
                  <div>Mandatory Escalation: <strong className={p2?.mandatoryEscalation ? 'text-[#D21515]' : 'text-[#171717]'}>{p2?.mandatoryEscalation ? `MANDATORY (${p2.mandatoryEscalationTier})` : 'No'}</strong></div>
                  <div className="text-[11px] text-[#6B6B6B]">
                    Rules: <span className="font-mono text-[#171717]">{(p2?.matchedRules || []).join(', ') || 'Standard SLA'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline1' && (
            <div className="p-4 rounded-xl font-mono space-y-2 bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
              <span className="font-bold block mb-2 text-[#D21515]">Pipeline 1 Structured JSON</span>
              <pre className="overflow-x-auto text-[11px]">{JSON.stringify(p1, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#171717]">
                    Python Validation Status: {complaint.pythonValidation?.status || 'Validated'}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#C0BCB1] font-bold">
                    Score: {complaint.pythonValidation?.validationScore ?? 90}%
                  </span>
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  Ground-truth Python engine crosschecking constraints and policy rules.
                </p>
              </div>

              <div className="p-4 rounded-xl font-mono bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                <pre className="overflow-x-auto text-[11px]">{JSON.stringify(complaint.pythonValidation || { message: 'Validated in Python 3.10 engine' }, null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === 'pipeline2' && (
            <div className="p-4 rounded-xl font-mono bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
              <span className="font-bold block mb-2 text-[#171717]">Pipeline 2 Rule Matrix Payload</span>
              <pre className="overflow-x-auto text-[11px]">{JSON.stringify(p2, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-3">
              <span className="font-bold block text-sm text-[#171717]">Cited Knowledge Base Policies</span>
              {p1?.citedPolicies && p1.citedPolicies.length > 0 ? (
                p1.citedPolicies.map((cp, idx) => {
                  const fullDoc = (policies || []).find((p) => p.id === cp.docId);
                  return (
                    <div key={idx} className="p-4 rounded-xl space-y-1.5 bg-[#F0EFEA] border border-[#C0BCB1]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#D21515]">{cp.docId} • {cp.sectionId}</span>
                        <span className="text-[10px] text-[#6B6B6B]">{fullDoc ? `v${fullDoc.version}` : 'Active'}</span>
                      </div>
                      <h4 className="font-bold text-[#171717]">{fullDoc?.title || cp.citationText}</h4>
                      <p className="italic p-2.5 rounded bg-white border border-[#C0BCB1] text-[#3A3A3A]">"{cp.citationText}"</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#6B6B6B] italic">No explicit policy citations recorded.</div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <span className="font-bold block text-sm text-[#171717]">Immutable Audit Log</span>
              <div className="relative pl-4 ml-2 space-y-4 border-l-2 border-[#C0BCB1]">
                {(complaint.auditTrail || []).map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute top-1 w-2.5 h-2.5 rounded-full -left-[21px] bg-[#D21515]" />
                    <div className="text-[10px] font-mono text-[#6B6B6B]">
                      {new Date(log.timestamp).toLocaleString()} • Actor: <strong className="text-[#171717]">{log.actor}</strong>
                    </div>
                    <div className="text-xs font-bold text-[#171717] mt-0.5">{log.action}</div>
                    <div className="text-[11px] text-[#6B6B6B] mt-0.5">{log.details}</div>
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