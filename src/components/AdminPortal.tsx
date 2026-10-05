import React, { useState } from 'react';
import { Pagination } from './Pagination';
import type {
  PolicyDocument,
  RuleMatrixEntry,
  PromptTemplate,
  SecurityTestCase,
  UrgencyLevel,
  PriorityLevel,
  UserProfile,
  UserRole,
} from '../types/index.ts';
import {
  BookOpen,
  Grid,
  ShieldAlert,
  Trash2,
  Users,
  Play,
  UploadCloud,
  Plus,
  FileText,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AdminPortalProps {
  policies: PolicyDocument[];
  ruleMatrix: RuleMatrixEntry[];
  promptTemplates: PromptTemplate[];
  testCases: SecurityTestCase[];
  users?: UserProfile[];
  onAddPolicy: (policy: any) => Promise<void>;
  onUpdatePolicy: (id: string, policy: any) => Promise<void>;
  onDeletePolicy: (id: string) => Promise<void>;
  onAddRule: (rule: any) => Promise<void>;
  onUpdateRule: (id: string, rule: any) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onUpdatePromptTemplate: (id: string, template: any) => Promise<void>;
  onAddPromptTemplate?: (template: any) => Promise<void>;
  onRollbackPrompt?: (id: string, targetVersion: string) => Promise<void>;
  onRollbackPolicy?: (id: string, targetVersion: string) => Promise<void>;
  onRunTestCase: (testCaseId: string) => Promise<any>;
  onUploadDocument?: (payload: any) => Promise<any>;
  onTogglePolicyStatus?: (id: string, newStatus: string) => Promise<void>;
  onAddUser?: (userData: any) => Promise<void>;
  onUpdateUser?: (id: string, userData: any) => Promise<void>;
  onDeleteUser?: (id: string) => Promise<void>;
  departments: string[];
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  policies = [],
  ruleMatrix = [],
  promptTemplates = [],
  testCases = [],
  users = [],
  onAddPolicy,
  onDeletePolicy,
  onAddRule,
  onDeleteRule,
  onRunTestCase,
  onUploadDocument,
  onAddUser,
  onDeleteUser,
  departments = [],
}) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'ruleMatrix' | 'security' | 'users'>('policies');

  // Pagination states
  const [policyPage, setPolicyPage] = useState(1);
  const [rulePage, setRulePage] = useState(1);
  const [securityPage, setSecurityPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const policyPageSize = 6;
  const tablePageSize = 8;

  // Safe paginated subsets
  const currentPolicyPage = Math.min(policyPage, Math.max(1, Math.ceil(policies.length / policyPageSize)));
  const visiblePolicies = policies.slice((currentPolicyPage - 1) * policyPageSize, currentPolicyPage * policyPageSize);

  const currentRulePage = Math.min(rulePage, Math.max(1, Math.ceil(ruleMatrix.length / tablePageSize)));
  const visibleRules = ruleMatrix.slice((currentRulePage - 1) * tablePageSize, currentRulePage * tablePageSize);

  const currentUserPage = Math.min(userPage, Math.max(1, Math.ceil(users.length / tablePageSize)));
  const visibleUsers = users.slice((currentUserPage - 1) * tablePageSize, currentUserPage * tablePageSize);

  const currentSecurityPage = Math.min(securityPage, Math.max(1, Math.ceil(testCases.length / policyPageSize)));
  const visibleTestCases = testCases.slice((currentSecurityPage - 1) * policyPageSize, currentSecurityPage * policyPageSize);

  // File Upload State
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentId, setUploadDocumentId] = useState(() => `POL-UPL-${Date.now().toString(36).toUpperCase()}`);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Customer Support & SLA');
  const [uploadVersion, setUploadVersion] = useState('1.0');
  const [uploadParsing, setUploadParsing] = useState(false);

  // Manual Policy State
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState('Customer Support');
  const [newPolicySummary, setNewPolicySummary] = useState('');
  const [newPolicyVersion, setNewPolicyVersion] = useState('1.0');

  // Rule State
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [ruleCat, setRuleCat] = useState('Billing & Payments');
  const [ruleSubcat, setRuleSubcat] = useState('General');
  const [ruleDept, setRuleDept] = useState('Billing & Finance');
  const [ruleUrgency, setRuleUrgency] = useState<UrgencyLevel>('Medium');
  const [rulePriority, setRulePriority] = useState<PriorityLevel>('P2');
  const [ruleTriggers, setRuleTriggers] = useState('');
  const [ruleSla, setRuleSla] = useState(24);

  // User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Agent');

  // Security Test Execution
  const [testResult, setTestResult] = useState<any>(null);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  const handleDocumentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1] || '';
        if (onUploadDocument) {
          await onUploadDocument({
            filename: uploadFile.name,
            fileBase64: base64Data,
            title: uploadTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, ''),
            documentId: uploadDocumentId.trim().toUpperCase(),
            category: uploadCategory.trim(),
            version: uploadVersion.trim(),
          });
          setIsUploadingDoc(false);
          setUploadFile(null);
          setPolicyPage(1);
        }
      };
      reader.readAsDataURL(uploadFile);
    } finally {
      setUploadParsing(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddPolicy({
      title: newPolicyTitle.trim(),
      category: newPolicyCategory.trim(),
      summary: newPolicySummary.trim(),
      version: newPolicyVersion.trim(),
    });
    setIsAddingPolicy(false);
    setNewPolicyTitle('');
    setNewPolicySummary('');
    setPolicyPage(1);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddRule({
      category: ruleCat.trim(),
      subcategory: ruleSubcat.trim(),
      department: ruleDept.trim(),
      urgency: ruleUrgency,
      priority: rulePriority,
      triggerConditions: ruleTriggers.trim(),
      slaHours: Number(ruleSla),
      requiredActions: ['Inspect records and verify eligibility'],
      prohibitedActions: ['Do not issue compensation exceeding rule bounds'],
    });
    setIsAddingRule(false);
    setRuleTriggers('');
    setRulePage(1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddUser) {
      await onAddUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
      });
    }
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserEmail('');
    setUserPage(1);
  };

  const handleRunSecurityTest = async (testId: string) => {
    setRunningTestId(testId);
    setTestResult(null);
    try {
      const res = await onRunTestCase(testId);
      setTestResult(res);
    } finally {
      setRunningTestId(null);
    }
  };

  return (
    <div className="space-y-6 text-[#E6E2D8]">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D83B20] text-xs">✳</span>
              <span className="label text-[#E6E2D8]/70">Enterprise Governance Hub</span>
            </div>
            <h1 className="display text-3xl sm:text-4xl text-[#E6E2D8]">
              System Administration
            </h1>
            <p className="text-xs text-[#E6E2D8]/65 mt-2 max-w-xl leading-relaxed">
              Configure organizational policies, decision rule matrices, AI prompts, and access permissions.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#1A1A1A] border border-[#E6E2D8]/15">
            {[
              { id: 'policies', icon: BookOpen, label: `Policies (${policies.length})` },
              { id: 'ruleMatrix', icon: Grid, label: `Rules (${ruleMatrix.length})` },
              { id: 'security', icon: ShieldAlert, label: `Security (${testCases.length})` },
              { id: 'users', icon: Users, label: `Users (${users.length})` },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeTab === id
                    ? 'bg-[#D83B20] text-white shadow-md'
                    : 'text-[#E6E2D8]/70 hover:text-white hover:bg-black/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* ===================== 1. POLICIES TAB ===================== */}
      {activeTab === 'policies' && (
        <div className="p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl space-y-6 shadow-xl">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E2D8]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#D83B20] text-xs">✳</span>
                <h2 className="display text-xl sm:text-2xl text-[#E6E2D8]">Policy Knowledge Base</h2>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-[10px] text-[#E6E2D8]/60 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{policies.length} Documented Clauses</span>
                <span>•</span>
                <span>Active Precedence Mode</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => { setIsUploadingDoc(!isUploadingDoc); setIsAddingPolicy(false); }}
                className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingPolicy(!isAddingPolicy); setIsUploadingDoc(false); }}
                className="px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-[#1A1A1A] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] rounded-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
              </button>
            </div>
          </div>

          {/* Upload Drawer Form */}
          {isUploadingDoc && (
            <form onSubmit={handleDocumentUploadSubmit} className="p-6 bg-[#161616] border border-[#E6E2D8]/15 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="display text-sm text-[#E6E2D8] flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#D83B20]" />
                  <span>Parse &amp; Index Document (PDF, DOCX, TXT)</span>
                </span>
                <span className="font-mono text-[10px] text-[#E6E2D8]/50 uppercase">Auto-Clause Extraction</span>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-mono p-3 bg-[#121212] border border-[#E6E2D8]/20 rounded-lg text-[#E6E2D8]"
              />
              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsUploadingDoc(false)} className="px-3.5 py-1.5 text-xs font-mono text-[#E6E2D8]/60 cursor-pointer">Cancel</button>
                <button type="submit" disabled={uploadParsing || !uploadFile} className="px-5 py-2 text-xs font-mono font-bold uppercase bg-[#D83B20] text-white rounded-lg cursor-pointer disabled:opacity-50">
                  {uploadParsing ? 'Parsing & Vectorizing...' : 'Index Document Clauses'}
                </button>
              </div>
            </form>
          )}

          {/* Add Clause Manual Form */}
          {isAddingPolicy && (
            <form onSubmit={handleCreatePolicy} className="p-6 bg-[#161616] border border-[#E6E2D8]/15 rounded-xl space-y-4 animate-in fade-in text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="display text-sm text-[#E6E2D8] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D83B20]" />
                  <span>Create Manual Ground-Truth Policy</span>
                </span>
                <span className="text-[10px] text-[#E6E2D8]/50 uppercase">Direct Rule Definition</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" value={newPolicyTitle} onChange={(e) => setNewPolicyTitle(e.target.value)} placeholder="Clause Title (e.g. Lost in Transit Claims)" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
                <input type="text" value={newPolicyCategory} onChange={(e) => setNewPolicyCategory(e.target.value)} placeholder="Category (e.g. Logistics & Carrier SLA)" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
              </div>
              <textarea value={newPolicySummary} onChange={(e) => setNewPolicySummary(e.target.value)} rows={3} placeholder="Full operative text and criteria..." required className="w-full p-3 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-xs text-[#E6E2D8]" />
              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsAddingPolicy(false)} className="px-3.5 py-1.5 text-xs text-[#E6E2D8]/60 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold uppercase bg-[#D83B20] text-white rounded-lg cursor-pointer">Save Active Clause</button>
              </div>
            </form>
          )}

          {/* Upgraded Policy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visiblePolicies.map((pol) => (
              <div
                key={pol.id}
                className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-xl border bg-[#161616] border-[#E6E2D8]/15 hover:border-[#D83B20] transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
              >
                <div>
                  {/* Top Bar: ID, Version, Category, Trash */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E6E2D8]/10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-[#D83B20] tracking-wider px-2 py-0.5 rounded bg-[#D83B20]/10 border border-[#D83B20]/25">
                        {pol.id}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold opacity-60">
                        v{pol.version}
                      </span>
                      <span
                      className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border"
                      style={{
                        borderColor: 'var(--border-line)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {pol.category || 'General SOP'}
                    </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeletePolicy(pol.id)}
                      className="opacity-40 group-hover:opacity-100 hover:!text-[#D83B20] transition-all p-1 rounded hover:bg-[#D83B20]/10 cursor-pointer"
                      title="Delete Clause"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

             {/* Title */}
                <h4
                  className="display text-base leading-snug tracking-tight mb-2 transition-colors group-hover:text-[#D83B20]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {pol.title}
                </h4>

                {/* Summary (High-contrast in both Light & Dark modes) */}
                <p
                  className="text-xs leading-relaxed font-sans line-clamp-3 font-medium opacity-90"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {pol.summary}
                </p>
              </div>

              {/* Bottom Meta Status */}
              <div
                className="flex items-center justify-between pt-3 mt-4 border-t font-mono text-[10px]"
                style={{ borderColor: 'var(--border-line)', color: 'var(--text-muted)' }}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Active Precedence</span>
                </span>
                <span className="font-bold text-[#D83B20] uppercase tracking-wider">
                  Verified Ground-Truth
                </span>
              </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={currentPolicyPage}
            pageSize={policyPageSize}
            totalItems={policies.length}
            onPageChange={setPolicyPage}
          />
        </div>
      )}

      {/* ===================== 2. RULE MATRIX TAB ===================== */}
      {activeTab === 'ruleMatrix' && (
        <div className="p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E2D8]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#D83B20] text-xs">✳</span>
                <h2 className="display text-xl sm:text-2xl text-[#E6E2D8]">Deterministic Rule Matrix</h2>
              </div>
              <span className="font-mono text-[10px] text-[#E6E2D8]/50 uppercase tracking-wider mt-1 block">
                {ruleMatrix.length} Operational Resolution Rules (100% Deterministic)
              </span>
            </div>
            <button
              onClick={() => setIsAddingRule(true)}
              className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#D83B20] text-white rounded-lg cursor-pointer hover:bg-[#b82f17] transition shadow-md"
            >
              Add Rule
            </button>
          </div>

          {isAddingRule && (
            <form onSubmit={handleCreateRule} className="p-5 bg-[#161616] border border-[#E6E2D8]/15 rounded-xl space-y-3 text-xs font-mono animate-in fade-in">
              <span className="display text-sm text-[#E6E2D8] block">Create Deterministic Resolution Rule</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={ruleCat} onChange={(e) => setRuleCat(e.target.value)} placeholder="Category" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
                <input type="text" value={ruleDept} onChange={(e) => setRuleDept(e.target.value)} placeholder="Responsible Dept" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
                <input type="number" value={ruleSla} onChange={(e) => setRuleSla(Number(e.target.value))} placeholder="SLA Hours" className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
              </div>
              <input type="text" value={ruleTriggers} onChange={(e) => setRuleTriggers(e.target.value)} placeholder="Trigger Keywords (e.g. smoke, swollen, sparks)" required className="w-full p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsAddingRule(false)} className="px-3.5 py-1.5 text-xs text-[#E6E2D8]/60 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold uppercase bg-[#D83B20] text-white rounded-lg cursor-pointer">Save Rule</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E6E2D8]/15 bg-[#161616]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1C1C1C] border-b border-[#E6E2D8]/10 text-[#E6E2D8]/60 text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Rule ID</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Keywords</th>
                  <th className="p-3.5">SLA</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRules.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b transition-colors hover:bg-[#D83B20]/5"
                    style={{ borderColor: 'var(--border-line)' }}
                  >
                    <td className="p-3.5 font-bold text-[#D83B20]">{r.id}</td>
                    <td className="p-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{r.category}</td>
                    <td className="p-3.5 opacity-80" style={{ color: 'var(--text-primary)' }}>{r.department}</td>
                    <td className="p-3.5 truncate max-w-xs opacity-70" style={{ color: 'var(--text-primary)' }}>{r.triggerConditions}</td>
                    <td className="p-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{r.slaHours}h</td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => onDeleteRule(r.id)} className="opacity-40 hover:opacity-100 hover:text-[#D83B20] cursor-pointer p-1 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={currentRulePage}
            pageSize={tablePageSize}
            totalItems={ruleMatrix.length}
            onPageChange={setRulePage}
          />
        </div>
      )}

      {/* ===================== 3. SECURITY TAB ===================== */}
      {activeTab === 'security' && (
        <div className="p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E2D8]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#D83B20] text-xs">✳</span>
                <h2 className="display text-xl sm:text-2xl text-[#E6E2D8]">Adversarial &amp; Security Benchmarks</h2>
              </div>
              <span className="font-mono text-[10px] text-[#E6E2D8]/50 uppercase tracking-wider mt-1 block">
                {testCases.length} Adversarial Test Payloads (Prompt Injection Defense)
              </span>
            </div>
          </div>

          {testResult && (
            <div className="p-4 rounded-xl bg-[#161616] border border-[#D83B20]/40 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[#D83B20] font-bold">
                <span>TEST EXECUTION: {testResult.scenarioId}</span>
                <span>STATUS: {testResult.passed ? 'TRAPPED (PASSED)' : 'FAILED'}</span>
              </div>
              <p className="text-[#E6E2D8]/80">{testResult.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTestCases.map((tc) => (
              <div key={tc.id} className="p-5 rounded-xl bg-[#161616] border border-[#E6E2D8]/15 space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#D83B20] font-bold">{tc.id}</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-[#E6E2D8]/70 border border-[#E6E2D8]/10">
                    {tc.adversarialType}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#E6E2D8]">{tc.title}</h4>
                <p className="text-[11px] text-[#E6E2D8]/60 font-mono line-clamp-2">{tc.inputPrompt}</p>

                <div className="pt-2 flex justify-end border-t border-[#E6E2D8]/10">
                  <button
                    onClick={() => handleRunSecurityTest(tc.id)}
                    disabled={runningTestId === tc.id}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    <span>{runningTestId === tc.id ? 'Running...' : 'Execute Test'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={currentSecurityPage}
            pageSize={policyPageSize}
            totalItems={testCases.length}
            onPageChange={setSecurityPage}
          />
        </div>
      )}

      {/* ===================== 4. USERS TAB ===================== */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E2D8]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#D83B20] text-xs">✳</span>
                <h2 className="display text-xl sm:text-2xl text-[#E6E2D8]">Team &amp; Persona Accounts</h2>
              </div>
              <span className="font-mono text-[10px] text-[#E6E2D8]/50 uppercase tracking-wider mt-1 block">
                {users.length} Registered Enterprise Personas
              </span>
            </div>
            <button
              onClick={() => setIsAddingUser(true)}
              className="px-4 py-2 text-xs font-mono font-bold uppercase bg-[#D83B20] text-white rounded-lg cursor-pointer hover:bg-[#b82f17] transition shadow-md"
            >
              Add User
            </button>
          </div>

          {isAddingUser && (
            <form onSubmit={handleCreateUser} className="p-5 bg-[#161616] border border-[#E6E2D8]/15 rounded-xl space-y-3 text-xs font-mono animate-in fade-in">
              <span className="display text-sm text-[#E6E2D8] block">Add Account Persona</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Full Name" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Email" required className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]" />
                <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="p-2.5 bg-[#121212] rounded-lg border border-[#E6E2D8]/20 text-[#E6E2D8]">
                  <option value="Customer">Customer</option>
                  <option value="Agent">Agent</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Manager">Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsAddingUser(false)} className="px-3.5 py-1.5 text-[#E6E2D8]/60 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 font-bold uppercase bg-[#D83B20] text-white rounded-lg cursor-pointer">Create Persona</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E6E2D8]/15 bg-[#161616]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1C1C1C] border-b border-[#E6E2D8]/10 text-[#E6E2D8]/60 text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b transition-colors hover:bg-[#D83B20]/5"
                    style={{ borderColor: 'var(--border-line)' }}
                  >
                    <td className="p-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{u.name}</td>
                    <td className="p-3.5 opacity-70" style={{ color: 'var(--text-primary)' }}>{u.email}</td>
                    <td className="p-3.5 font-bold text-[#D83B20]">{u.role}</td>
                    <td className="p-3.5 text-right">
                      {onDeleteUser && (
                        <button onClick={() => onDeleteUser(u.id)} className="opacity-40 hover:opacity-100 hover:text-[#D83B20] cursor-pointer p-1 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={currentUserPage}
            pageSize={tablePageSize}
            totalItems={users.length}
            onPageChange={setUserPage}
          />
        </div>
      )}
    </div>
  );
};