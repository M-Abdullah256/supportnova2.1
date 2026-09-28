import React, { useState } from 'react';
import { Pagination } from './Pagination';
import type {
  PolicyDocument,
  RuleMatrixEntry,
  PromptTemplate,
  SecurityTestCase,
  UrgencyLevel,
  PriorityLevel,
  EscalationTier,
  UserProfile,
  UserRole,
} from '../types/index.ts';
import {
  BookOpen,
  Grid,
  FileCode,
  ShieldAlert,
  Plus,
  Trash2,
  Save,
  Play,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileUp,
  FileText,
  CheckCircle,
  Users,
  UserPlus,
  Search,
  Sparkles,
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
  onUpdatePromptTemplate,
  onAddPromptTemplate,
  onRollbackPrompt,
  onRollbackPolicy,
  onRunTestCase,
  onUploadDocument,
  onTogglePolicyStatus,
  onAddUser,
  onDeleteUser,
  departments = [],
}) => {
  const [activeTab, setActiveTab] = useState<'policies' | 'ruleMatrix' | 'prompts' | 'security' | 'users'>('policies');
  const [policyPage, setPolicyPage] = useState(1);
  const [rulePage, setRulePage] = useState(1);
  const [securityPage, setSecurityPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const adminPageSize = 8;
  const activePolicyCount = policies.filter((policy) => policy.status === 'Active').length;

  // Role Breakdown Stats
  const adminRoleCounts = (['Customer', 'Agent', 'Reviewer', 'Manager', 'Administrator'] as UserRole[]).map((role) => ({
    label: role === 'Administrator' ? 'Admin' : role,
    count: users.filter((user) => user.role === role).length,
  }));
  const maxAdminRoleCount = Math.max(...adminRoleCounts.map((item) => item.count), 1);

  // User Management State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  const filteredUsers = users.filter((user) => {
    if (userRoleFilter !== 'All' && user.role !== userRoleFilter) return false;
    if (!userSearch.trim()) return true;
    const query = userSearch.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.department || '').toLowerCase().includes(query) ||
      (user.company || '').toLowerCase().includes(query)
    );
  });

  const currentUserPage = Math.min(userPage, Math.max(1, Math.ceil(filteredUsers.length / adminPageSize)));
  const visibleUsers = filteredUsers.slice((currentUserPage - 1) * adminPageSize, currentUserPage * adminPageSize);

  const currentPolicyPage = Math.min(policyPage, Math.max(1, Math.ceil(policies.length / adminPageSize)));
  const visiblePolicies = policies.slice((currentPolicyPage - 1) * adminPageSize, currentPolicyPage * adminPageSize);

  const currentRulePage = Math.min(rulePage, Math.max(1, Math.ceil(ruleMatrix.length / adminPageSize)));
  const visibleRules = ruleMatrix.slice((currentRulePage - 1) * adminPageSize, currentRulePage * adminPageSize);

  const currentSecurityPage = Math.min(securityPage, Math.max(1, Math.ceil(testCases.length / adminPageSize)));
  const visibleSecurityTests = testCases.slice((currentSecurityPage - 1) * adminPageSize, currentSecurityPage * adminPageSize);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Agent');
  const [newUserDepartment, setNewUserDepartment] = useState('Customer Support');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCompany, setNewUserCompany] = useState('');
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Policy Form Modal / State
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyCategory, setNewPolicyCategory] = useState('Customer Support');
  const [newPolicySummary, setNewPolicySummary] = useState('');
  const [newPolicyVersion, setNewPolicyVersion] = useState('1.0');
  const [inspectPolicyChunks, setInspectPolicyChunks] = useState<PolicyDocument | null>(null);

  // Rule Matrix Modal / State
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [ruleCat, setRuleCat] = useState('Billing & Payments');
  const [ruleSubcat, setRuleSubcat] = useState('General');
  const [ruleDept, setRuleDept] = useState('Billing & Finance');
  const [ruleUrgency, setRuleUrgency] = useState<UrgencyLevel>('Medium');
  const [rulePriority, setRulePriority] = useState<PriorityLevel>('P2');
  const [ruleTriggers, setRuleTriggers] = useState('');
  const [ruleMandatoryEscalation, setRuleMandatoryEscalation] = useState(false);
  const [ruleEscalationTier, setRuleEscalationTier] = useState<EscalationTier>('None');
  const [ruleSla, setRuleSla] = useState(24);

  // Document File Upload State
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocumentId, setUploadDocumentId] = useState(() => `POL-UPL-${Date.now().toString(36).toUpperCase()}`);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Customer Support & SLA');
  const [uploadVersion, setUploadVersion] = useState('1.0');
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploadParsing, setUploadParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<any | null>(null);

  // Prompt Template Management State
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    promptTemplates.length > 0 ? promptTemplates[0].id : 'TPL-GEMINI-CORE'
  );
  const activePrompt =
    promptTemplates.find((t) => t.id === selectedPromptId) ||
    (promptTemplates.length > 0 ? promptTemplates[0] : null);
  const [promptText, setPromptText] = useState(activePrompt?.systemPrompt || '');
  const [promptChangelog, setPromptChangelog] = useState('');
  const [promptTemperature, setPromptTemperature] = useState(activePrompt?.temperature ?? 0.1);
  const [promptSaved, setPromptSaved] = useState(false);
  const [isAddingPromptTpl, setIsAddingPromptTpl] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplPurpose, setNewTplPurpose] = useState('');
  const [newTplOperation, setNewTplOperation] = useState<PromptTemplate['operation']>('Response Generation');
  const [newTplSystemPrompt, setNewTplSystemPrompt] = useState('');

  React.useEffect(() => {
    if (activePrompt) {
      setPromptText(activePrompt.systemPrompt);
      setPromptTemperature(activePrompt.temperature ?? 0.1);
      setPromptChangelog('');
    }
  }, [activePrompt?.id, activePrompt?.version]);

  const handleDocumentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a valid PDF, DOCX, or TXT file to upload.');
      return;
    }
    if (uploadFile.size === 0) {
      setUploadError('The selected file is empty.');
      return;
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit.');
      return;
    }
    if (uploadExpiryDate && uploadExpiryDate <= uploadEffectiveDate) {
      setUploadError('Expiry date must be later than the effective date.');
      return;
    }

    setUploadParsing(true);
    setUploadError(null);
    setUploadSuccessInfo(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1] || '';
          if (onUploadDocument) {
            const res = await onUploadDocument({
              filename: uploadFile.name,
              fileBase64: base64Data,
              title: uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''),
              documentId: uploadDocumentId,
              category: uploadCategory,
              version: uploadVersion,
              effectiveDate: uploadEffectiveDate,
              expiryDate: uploadExpiryDate || null,
            });
            setUploadSuccessInfo(res);
            setUploadFile(null);
            setUploadDocumentId(`POL-UPL-${Date.now().toString(36).toUpperCase()}`);
            setUploadTitle('');
            setTimeout(() => {
              setIsUploadingDoc(false);
              setUploadSuccessInfo(null);
            }, 2500);
          }
        } catch (err: any) {
          setUploadError(err.message || 'Failed to parse and upload document.');
        } finally {
          setUploadParsing(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Error reading file from disk.');
        setUploadParsing(false);
      };
      reader.readAsDataURL(uploadFile);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
      setUploadParsing(false);
    }
  };

  const [testResult, setTestResult] = useState<any>(null);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyTitle || !newPolicySummary) return;

    await onAddPolicy({
      title: newPolicyTitle,
      category: newPolicyCategory,
      summary: newPolicySummary,
      version: newPolicyVersion,
    });

    setIsAddingPolicy(false);
    setNewPolicyTitle('');
    setNewPolicySummary('');
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddRule({
      category: ruleCat,
      subcategory: ruleSubcat,
      department: ruleDept,
      urgency: ruleUrgency,
      priority: rulePriority,
      triggerConditions: ruleTriggers,
      mandatoryEscalation: ruleMandatoryEscalation,
      escalationTier: ruleEscalationTier,
      slaHours: Number(ruleSla),
      requiredActions: ['Inspect records and verify eligibility'],
      prohibitedActions: ['Do not issue compensation exceeding rule bounds'],
    });

    setIsAddingRule(false);
    setRuleTriggers('');
  };

  const handleRunSecurityBenchmark = async (testId: string) => {
    setRunningTestId(testId);
    setTestResult(null);
    try {
      const res = await onRunTestCase(testId);
      setTestResult(res);
    } finally {
      setRunningTestId(null);
    }
  };

  const badgeStyle = (role: UserRole): string => {
    switch (role) {
      case 'Customer': return 'bg-[rgba(210,21,21,0.08)] text-[#D21515] border-[rgba(210,21,21,0.25)]';
      case 'Agent': return 'bg-[rgba(23,23,23,0.06)] text-[#171717] border-[#C0BCB1]';
      case 'Reviewer': return 'bg-[rgba(192,188,177,0.3)] text-[#3A3A3A] border-[#C0BCB1]';
      case 'Manager': return 'bg-[rgba(58,58,58,0.08)] text-[#3A3A3A] border-[#C0BCB1]';
      case 'Administrator': return 'bg-[rgba(210,21,21,0.08)] text-[#D21515] border-[rgba(210,21,21,0.25)]';
    }
  };

  return (
<div className="admin-dashboard role-dashboard admin-page space-y-6">
      {/* Hero Header */}
      <section className="admin-hero">
  <div className="admin-hero-glow" aria-hidden />

  <div className="admin-hero-inner">

    {/* LEFT — badge + title + subtitle */}
    <div className="admin-hero-left">
      <div className="admin-hero-eyebrow">
        <span className="admin-pill">System Administration</span>
        <span className="admin-pill-sub">
          <Layers className="w-3.5 h-3.5" />
          Knowledge Base · Routing · Access Control
        </span>
      </div>

      <h1 className="admin-hero-title">Platform Administration</h1>
      <p className="admin-hero-sub">
        Configure knowledge base policies, routing rule matrix, GenAI prompt directives, and user accounts.
      </p>
    </div>

    {/* RIGHT — segmented tab control */}
    <nav className="admin-hero-nav" aria-label="Administration sections">
      {[
        { id: 'policies', icon: BookOpen, label: `Policies (${policies.length})` },
        { id: 'ruleMatrix', icon: Grid, label: `Rules (${ruleMatrix.length})` },
        { id: 'prompts', icon: FileCode, label: 'Prompts' },
        { id: 'security', icon: ShieldAlert, label: 'Security' },
        { id: 'users', icon: Users, label: `Users (${users.length})` },
      ].map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as any)}
            className={`admin-hero-tab ${isActive ? 'is-active' : ''}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  </div>
</section>

      {/* Analytics KPI Row */}
      {/* Analytics KPI Row */}
<section className="role-analytics" aria-label="Administration overview">
  <div className="role-kpi-grid">

    <div className="role-kpi role-kpi-gold">
      <div className="role-kpi-icon">
        <BookOpen className="w-5 h-5" />
      </div>
      <div className="role-kpi-body">
        <span>Active Policies</span>
        <strong>{activePolicyCount}</strong>
        <small>{policies.length} total indexed in knowledge base</small>
      </div>
    </div>

    <div className="role-kpi role-kpi-olive">
      <div className="role-kpi-icon">
        <Grid className="w-5 h-5" />
      </div>
      <div className="role-kpi-body">
        <span>Support Rules</span>
        <strong>{ruleMatrix.length}</strong>
        <small>Deterministic routing matrix</small>
      </div>
    </div>

    <div className="role-kpi role-kpi-sienna">
      <div className="role-kpi-icon">
        <FileCode className="w-5 h-5" />
      </div>
      <div className="role-kpi-body">
        <span>AI Templates</span>
        <strong>{promptTemplates.length}</strong>
        <small>Active prompt directives</small>
      </div>
    </div>

    <div className="role-kpi role-kpi-mahogany">
      <div className="role-kpi-icon">
        <Users className="w-5 h-5" />
      </div>
      <div className="role-kpi-body">
        <span>Team Accounts</span>
        <strong>{users.length}</strong>
        <small>Across 5 enterprise roles</small>
      </div>
    </div>

  </div>
</section>

      {/* ============================================================
          TAB: POLICIES
      ============================================================ */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
              <BookOpen className="w-4 h-4 text-[#D21515]" />
              <span>Knowledge Base & Policies</span>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setIsUploadingDoc(true); setIsAddingPolicy(false); }}
                className="px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5 bg-[#171717] text-white hover:bg-[#D21515] transition rounded-xl cursor-pointer shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload PDF / DOCX</span>
              </button>
              <button
                onClick={() => { setIsAddingPolicy(true); setIsUploadingDoc(false); }}
                className="px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1 bg-[#F0EFEA] text-[#171717] border border-[#C0BCB1] hover:border-[#171717] transition rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Manually</span>
              </button>
            </div>
          </div>

          {/* Upload Ingestion Form */}
          {isUploadingDoc && (
            <form onSubmit={handleDocumentUploadSubmit} className="p-5 space-y-4 bg-white border border-[#C0BCB1] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                <div className="flex items-center space-x-2">
                  <UploadCloud className="w-4 h-4 text-[#D21515]" />
                  <span className="text-xs font-bold text-[#171717]">Upload Policy Document (PDF, DOCX, TXT)</span>
                </div>
                <button type="button" onClick={() => setIsUploadingDoc(false)} className="text-xs text-[#6B6B6B] hover:text-[#171717]">Cancel</button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl text-xs flex items-center space-x-2 bg-[rgba(210,21,21,0.08)] border border-[rgba(210,21,21,0.25)] text-[#D21515]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccessInfo && (
                <div className="p-3 rounded-xl text-xs flex items-center space-x-2 bg-white border border-[#C0BCB1] text-[#171717]">
                  <CheckCircle className="w-4 h-4 text-[#D21515]" />
                  <span>{uploadSuccessInfo.message || 'Document parsed into traceable chunks!'}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-[#C0BCB1] rounded-xl p-6 text-center bg-[#F0EFEA]">
                <input
                  type="file"
                  id="policy-file-upload"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="policy-file-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                  <FileUp className="w-8 h-8 text-[#D21515]" />
                  <span className="text-xs font-semibold text-[#171717]">
                    {uploadFile ? uploadFile.name : 'Select or drop PDF, DOCX, or TXT file'}
                  </span>
                  <span className="text-[11px] text-[#6B6B6B]">
                    File will be split into traceable clauses and indexed for dual-pipeline validation.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Document ID</label>
                  <input type="text" value={uploadDocumentId} onChange={(e) => setUploadDocumentId(e.target.value)} required className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Title</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Return and Refund Guidelines v2.0" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Category</label>
                  <input type="text" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} required className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={uploadParsing || !uploadFile} className="px-4 py-2 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer shadow-sm">
                  {uploadParsing ? 'Parsing Document...' : 'Index Policy'}
                </button>
              </div>
            </form>
          )}

          {/* Manual Policy Form */}
          {isAddingPolicy && (
            <form onSubmit={handleCreatePolicy} className="p-5 space-y-4 bg-white border border-[#C0BCB1] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                <span className="text-xs font-bold text-[#171717]">Add New Policy Document (Manual)</span>
                <button type="button" onClick={() => setIsAddingPolicy(false)} className="text-xs text-[#6B6B6B] hover:text-[#171717]">Cancel</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Document Title</label>
                  <input type="text" value={newPolicyTitle} onChange={(e) => setNewPolicyTitle(e.target.value)} required placeholder="e.g. VIP Concierge Support SOP" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Category</label>
                  <input type="text" value={newPolicyCategory} onChange={(e) => setNewPolicyCategory(e.target.value)} required className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Version</label>
                  <input type="text" value={newPolicyVersion} onChange={(e) => setNewPolicyVersion(e.target.value)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#3A3A3A]">Document Summary & Rules</label>
                <textarea value={newPolicySummary} onChange={(e) => setNewPolicySummary(e.target.value)} rows={3} required placeholder="Detail the policy conditions, deadlines, and constraints..." className="w-full p-2.5 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer shadow-sm">
                  Save Policy to Knowledge Base
                </button>
              </div>
            </form>
          )}

          {/* Policy Cards Grid */}
<div className="admin-policy-grid">
  {visiblePolicies.map((pol) => (
    <article key={pol.id} className="admin-policy-card">

      {/* Top strip: doc ID + version + status + actions */}
      <div className="admin-policy-head">
        <div className="admin-policy-head-left">
          <span className="admin-policy-id">
            <FileText className="w-3 h-3" />
            {pol.id}
          </span>
          <span className="admin-policy-version">v{pol.version}</span>
        </div>

        <div className="admin-policy-head-right">
          <span className={`admin-policy-status status-${(pol.status || 'active').toLowerCase()}`}>
            {pol.status}
          </span>

          {onTogglePolicyStatus && (
            <button
              type="button"
              onClick={() => onTogglePolicyStatus(pol.id, pol.status === 'Active' ? 'Superseded' : 'Active')}
              className="admin-policy-toggle"
            >
              {pol.status === 'Active' ? 'Mark Outdated' : 'Set Active'}
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeletePolicy(pol.id)}
            className="admin-policy-delete"
            aria-label="Delete policy"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title + summary */}
      <h3 className="admin-policy-title">{pol.title}</h3>
      <p className="admin-policy-summary">{pol.summary}</p>

      {/* Meta footer */}
      <div className="admin-policy-meta">
        <span className="admin-policy-meta-count">
          <Layers className="w-3.5 h-3.5" />
          {(pol.sections ?? []).length} traceable section{(pol.sections ?? []).length === 1 ? '' : 's'}
        </span>

        <button
          type="button"
          onClick={() => setInspectPolicyChunks(pol)}
          className="admin-policy-inspect"
        >
          Inspect Chunks
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Version history */}
      {(pol.versionHistory ?? []).length > 0 && (
        <div className="admin-policy-history">
          <span className="admin-policy-history-label">
            Version History ({(pol.versionHistory ?? []).length})
          </span>
          <div className="admin-policy-history-list">
            {(pol.versionHistory ?? []).map((vh, vIdx) => (
              <div key={vIdx} className="admin-policy-history-row">
                <span className="admin-policy-history-meta">
                  <strong>v{vh.version}</strong>
                  <span className="admin-policy-history-sep">·</span>
                  <span>{vh.effectiveDate}</span>
                  {vh.summary && (
                    <>
                      <span className="admin-policy-history-sep">·</span>
                      <span className="admin-policy-history-summary">{vh.summary}</span>
                    </>
                  )}
                </span>

                {onRollbackPolicy && (
                  <button
                    type="button"
                    onClick={() => onRollbackPolicy(pol.id, vh.version)}
                    className="admin-policy-rollback"
                  >
                    Rollback
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  ))}
</div>
          <Pagination page={currentPolicyPage} pageSize={adminPageSize} totalItems={policies.length} onPageChange={setPolicyPage} />
        </div>
      )}

      {/* Policy Chunks Inspector Modal */}
      {inspectPolicyChunks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl bg-white border border-[#C0BCB1] rounded-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-[#E4E2DC] bg-[#F0EFEA]">
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
                  <FileText className="w-4 h-4 text-[#D21515]" />
                  <span>Traceable Chunks: {inspectPolicyChunks.title} (v{inspectPolicyChunks.version})</span>
                </h3>
                <span className="text-xs text-[#6B6B6B]">
                  {(inspectPolicyChunks.sections ?? []).length} deterministic chunks indexed for retrieval
                </span>
              </div>
              <button
                onClick={() => setInspectPolicyChunks(null)}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-white border border-[#C0BCB1] hover:border-[#171717] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
              {(inspectPolicyChunks.sections ?? []).map((sec, idx) => (
                <div key={sec.id || idx} className="p-3.5 rounded-xl space-y-1.5 bg-[#F0EFEA] border border-[#C0BCB1]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#D21515]">[{sec.id}] {sec.heading}</span>
                    <span className="text-[10px] text-[#6B6B6B]">~{sec.tokenEstimate || 30} tokens</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#3A3A3A]">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB: RULE MATRIX
      ============================================================ */}
      {activeTab === 'ruleMatrix' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
              <Grid className="w-4 h-4 text-[#D21515]" />
              <span>Deterministic Rule Matrix</span>
            </h2>
            <button
              onClick={() => setIsAddingRule(true)}
              className="px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1 bg-[#171717] text-white hover:bg-[#D21515] transition rounded-xl cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          </div>

          {isAddingRule && (
            <form onSubmit={handleCreateRule} className="p-5 space-y-4 bg-white border border-[#C0BCB1] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                <span className="text-xs font-bold text-[#171717]">Add New Rule Matrix Entry</span>
                <button type="button" onClick={() => setIsAddingRule(false)} className="text-xs text-[#6B6B6B]">Cancel</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Category</label>
                  <input type="text" value={ruleCat} onChange={(e) => setRuleCat(e.target.value)} required className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Subcategory</label>
                  <input type="text" value={ruleSubcat} onChange={(e) => setRuleSubcat(e.target.value)} required className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Responsible Dept</label>
                  <select value={ruleDept} onChange={(e) => setRuleDept(e.target.value)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">SLA (Hours)</label>
                  <input type="number" value={ruleSla} onChange={(e) => setRuleSla(Number(e.target.value))} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Urgency</label>
                  <select value={ruleUrgency} onChange={(e: any) => setRuleUrgency(e.target.value)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Mandatory Escalation</label>
                  <select value={ruleMandatoryEscalation ? 'true' : 'false'} onChange={(e) => setRuleMandatoryEscalation(e.target.value === 'true')} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    <option value="false">No (Frontline resolution)</option>
                    <option value="true">Yes (Mandatory)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Escalation Tier</label>
                  <select value={ruleEscalationTier} onChange={(e: any) => setRuleEscalationTier(e.target.value)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    <option value="None">None</option>
                    <option value="Supervisor Review">Supervisor Review</option>
                    <option value="Department Manager">Department Manager</option>
                    <option value="Specialist Team">Specialist Team</option>
                    <option value="Compliance Review">Compliance Review</option>
                    <option value="Critical Management Escalation">Critical Management Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#3A3A3A]">Trigger Conditions / Keywords</label>
                <input type="text" value={ruleTriggers} onChange={(e) => setRuleTriggers(e.target.value)} required placeholder="e.g. Keywords: smoke, sparks, swelling, thermal runaway" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer shadow-sm">
                  Save Rule to Matrix
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-2xl border border-[#C0BCB1] bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0EFEA] border-b border-[#C0BCB1]">
                <tr>
                  {['Rule ID', 'Category & Subcategory', 'Routing Dept', 'Urgency / Pri', 'Mandatory Escalation', 'Trigger Conditions', 'SLA', 'Action'].map((h) => (
                    <th key={h} className="py-3 px-3.5 font-semibold text-[#171717] uppercase tracking-wider text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-[#E4E2DC] hover:bg-[#F0EFEA]/50 transition">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-[#D21515]">{rule.id}</td>
                    <td className="py-2.5 px-3.5 font-medium text-[#171717]">{rule.category}<br /><span className="text-[11px] text-[#6B6B6B]">{rule.subcategory}</span></td>
                    <td className="py-2.5 px-3.5 text-[#3A3A3A] font-semibold">{rule.department}</td>
                    <td className="py-2.5 px-3.5 font-mono text-[#171717]">{rule.urgency} / {rule.priority}</td>
                    <td className="py-2.5 px-3.5">
                      {rule.mandatoryEscalation ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.25)]">
                          {rule.escalationTier}
                        </span>
                      ) : (
                        <span className="text-[#6B6B6B]">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-[#6B6B6B] truncate max-w-xs">{rule.triggerConditions}</td>
                    <td className="py-2.5 px-3.5 font-mono text-[#171717]">{rule.slaHours}h</td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button onClick={() => onDeleteRule(rule.id)} className="p-1 text-[#6B6B6B] hover:text-[#D21515] cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentRulePage} pageSize={adminPageSize} totalItems={ruleMatrix.length} onPageChange={setRulePage} />
        </div>
      )}

      {/* ============================================================
          TAB: PROMPTS
      ============================================================ */}
      {activeTab === 'prompts' && (
        <div className="p-6 bg-white border border-[#C0BCB1] rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E4E2DC] gap-2">
            <div>
              <h2 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
                <FileCode className="w-4 h-4 text-[#D21515]" />
                <span>AI Prompt Directive Templates</span>
              </h2>
              <p className="text-xs text-[#6B6B6B]">Configure system directives and temperature per operational task.</p>
            </div>
            <div className="flex items-center space-x-2">
              {promptSaved && (
                <span className="text-xs font-semibold text-[#171717] flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-[#D21515]" />
                  <span>Saved successfully</span>
                </span>
              )}
              <button
                onClick={() => setIsAddingPromptTpl(true)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer"
              >
                New Template
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            {(promptTemplates ?? []).map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedPromptId(tpl.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activePrompt?.id === tpl.id
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-[#F0EFEA] text-[#3A3A3A] border border-[#C0BCB1] hover:border-[#171717]'
                }`}
              >
                {tpl.name} (v{tpl.version})
              </button>
            ))}
          </div>

          {activePrompt && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="block font-bold text-[#6B6B6B]">Template ID</span>
                  <span className="font-mono font-bold text-[#D21515]">{activePrompt.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="block font-bold text-[#6B6B6B]">Model & Operation</span>
                  <span className="font-semibold text-[#171717]">{activePrompt.model} ({activePrompt.operation})</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="block font-bold text-[#6B6B6B]">Version</span>
                  <span className="font-semibold text-[#171717]">v{activePrompt.version} ({activePrompt.status})</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="block font-bold text-[#6B6B6B]">Temperature ({promptTemperature})</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={promptTemperature}
                    onChange={(e) => setPromptTemperature(Number(e.target.value))}
                    className="w-full mt-1.5 accent-[#D21515]"
                  />
                </div>
              </div>

              {(activePrompt.variables ?? []).length > 0 && (
                <div className="flex items-center space-x-2 text-xs p-2.5 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="font-bold text-[#171717]">Available Variables:</span>
                  <div className="flex flex-wrap gap-1">
                    {(activePrompt.variables ?? []).map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded font-mono text-[10px] bg-white text-[#D21515] border border-[#C0BCB1]">
                        {`{${v}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-[#171717]">System Prompt Directive</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={9}
                  className="w-full p-3 font-mono text-xs rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={promptChangelog}
                  onChange={(e) => setPromptChangelog(e.target.value)}
                  placeholder="Changelog note for this version..."
                  className="p-2.5 text-xs rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717] sm:col-span-2"
                />
                <button
                  onClick={async () => {
                    await onUpdatePromptTemplate(activePrompt.id, {
                      ...activePrompt,
                      systemPrompt: promptText,
                      temperature: promptTemperature,
                      changelog: promptChangelog || 'Updated prompt parameters',
                    });
                    setPromptSaved(true);
                    setPromptChangelog('');
                    setTimeout(() => setPromptSaved(false), 2000);
                  }}
                  className="py-2.5 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save New Version</span>
                </button>
              </div>

              {(activePrompt.history ?? []).length > 0 && (
                <div className="pt-3 border-t border-[#E4E2DC] space-y-2">
                  <span className="text-xs font-bold text-[#171717]">Version Timeline</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {(activePrompt.history ?? []).map((h, hIdx) => (
                      <div key={hIdx} className="p-2.5 rounded-xl flex items-center justify-between text-xs bg-[#F0EFEA] border border-[#C0BCB1]">
                        <div>
                          <span className="font-bold text-[#D21515]">v{h.version}</span>
                          <span className="text-[#6B6B6B] ml-2">({h.updatedAt})</span>
                          <p className="text-[11px] text-[#3A3A3A] italic">"{h.changelog}"</p>
                        </div>
                        {onRollbackPrompt && (
                          <button
                            onClick={() => onRollbackPrompt(activePrompt.id, h.version)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-[#C0BCB1] hover:border-[#171717] cursor-pointer"
                          >
                            Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Prompt Modal */}
      {isAddingPromptTpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 space-y-4 bg-white border border-[#C0BCB1] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
              <h3 className="text-sm font-bold text-[#171717]">Create AI Prompt Directive Template</h3>
              <button onClick={() => setIsAddingPromptTpl(false)} className="text-xs text-[#6B6B6B]">Cancel</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (onAddPromptTemplate && newTplName && newTplSystemPrompt) {
                  await onAddPromptTemplate({
                    name: newTplName,
                    purpose: newTplPurpose,
                    operation: newTplOperation,
                    systemPrompt: newTplSystemPrompt,
                  });
                  setIsAddingPromptTpl(false);
                  setNewTplName('');
                  setNewTplPurpose('');
                  setNewTplSystemPrompt('');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block mb-1 font-semibold text-[#3A3A3A]">Template Name</label>
                <input type="text" value={newTplName} onChange={(e) => setNewTplName(e.target.value)} required placeholder="e.g. Warranty Checker" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#3A3A3A]">System Directive</label>
                <textarea value={newTplSystemPrompt} onChange={(e) => setNewTplSystemPrompt(e.target.value)} required rows={5} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer">Create Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB: SECURITY BENCHMARKS
      ============================================================ */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-[#C0BCB1] rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
              <ShieldAlert className="w-4 h-4 text-[#D21515]" />
              <span>Adversarial Benchmarks & Defenses</span>
            </h2>
            <p className="text-xs text-[#6B6B6B]">
              Execute real-time security scenarios against prompt injections, override attacks, and unauthorized refund directives.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {visibleSecurityTests.map((tc) => {
                const isRunning = runningTestId === tc.id;
                return (
                  <div key={tc.id} className="p-4 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#D21515]">{tc.id}</span>
                      <span className="text-[10px] font-semibold text-[#6B6B6B]">{tc.category}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#171717]">{tc.name}</h3>
                    <p className="text-[11px] text-[#3A3A3A]">{tc.description}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRunSecurityBenchmark(tc.id)}
                        disabled={isRunning}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer flex items-center space-x-1"
                      >
                        <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                        <span>{isRunning ? 'Running Check...' : 'Run Benchmark'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination page={currentSecurityPage} pageSize={adminPageSize} totalItems={testCases.length} onPageChange={setSecurityPage} />
          </div>

          {/* Test Execution Output */}
          {testResult && (
            <div className="p-6 bg-white border border-[#C0BCB1] rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#D21515]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">
                      Benchmark Outcome: {testResult.testCase.name}
                    </h3>
                    <span className={`text-xs font-bold ${testResult.passedDefense ? 'text-[#171717]' : 'text-[#D21515]'}`}>
                      Status: {testResult.passedDefense ? 'Defense Passed (Attack Intercepted)' : 'Defense Compromised'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setTestResult(null)} className="text-xs text-[#6B6B6B] hover:text-[#171717] cursor-pointer">
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="text-[10px] font-bold block mb-1 text-[#6B6B6B]">Pipeline 1 GenAI</span>
                  <div>Urgency: <strong className="text-[#171717]">{testResult.pipeline1Output.urgency}</strong></div>
                  <div>Escalation: <strong className="text-[#171717]">{testResult.pipeline1Output.escalationRequired ? 'Yes' : 'No'}</strong></div>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="text-[10px] font-bold block mb-1 text-[#6B6B6B]">Python Validator</span>
                  <div>Status: <strong className="text-[#171717]">{testResult.pythonValidation?.status || 'Validated'}</strong></div>
                  <div>Threats: <strong className="text-[#D21515]">{testResult.pythonValidation?.findings?.length || 0}</strong></div>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="text-[10px] font-bold block mb-1 text-[#6B6B6B]">Rule Matrix P2</span>
                  <div>Flags: <strong className="text-[#D21515]">{(testResult.pipeline2Output.adversarialPromptFlags ?? []).length}</strong></div>
                  <div>Mandatory Esc: <strong className="text-[#171717]">{testResult.pipeline2Output.mandatoryEscalation ? 'YES' : 'No'}</strong></div>
                </div>
                <div className="p-3 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1]">
                  <span className="text-[10px] font-bold block mb-1 text-[#6B6B6B]">Triangulation Result</span>
                  <div>Status: <strong className="text-[#D21515]">{testResult.comparisonResult.verificationStatus}</strong></div>
                  <div>Score: <strong className="text-[#171717]">{testResult.comparisonResult.verificationScore}%</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB: USERS & RBAC
      ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold flex items-center space-x-2 text-[#171717]">
                <Users className="w-4 h-4 text-[#D21515]" />
                <span>Team Accounts & Role Governance</span>
              </h2>
              <p className="text-xs text-[#6B6B6B]">Manage role separation and session access across the platform.</p>
            </div>

            <button
              onClick={() => setIsAddingUser(true)}
              className="px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1.5 bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Search / Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#C0BCB1] rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B6B6B]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Filter by name, email, department..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Filter:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]"
              >
                <option value="All">All Roles</option>
                <option value="Customer">Customer</option>
                <option value="Agent">Agent</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#C0BCB1] bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0EFEA] border-b border-[#C0BCB1]">
                <tr>
                  {['User Identity', 'Role', 'Department', 'Job Title', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="py-3 px-3.5 font-semibold text-[#171717] uppercase tracking-wider text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr key={u.id} className="border-b border-[#E4E2DC] hover:bg-[#F0EFEA]/50 transition">
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-[#171717]">{u.name}</div>
                      <div className="text-[11px] text-[#6B6B6B]">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#3A3A3A]">{u.department || u.company || 'Customer Client'}</td>
                    <td className="py-2.5 px-3.5 text-[#6B6B6B]">{u.title || `${u.role} Specialist`}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EFEA] text-[#171717]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      {onDeleteUser && (
                        <button onClick={() => onDeleteUser(u.id)} className="p-1 text-[#6B6B6B] hover:text-[#D21515] cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={currentUserPage} pageSize={adminPageSize} totalItems={filteredUsers.length} onPageChange={setUserPage} />
        </div>
      )}

      {/* Add User Modal */}
      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-lg w-full p-6 space-y-4 bg-white border border-[#C0BCB1] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <h3 className="text-sm font-bold text-[#171717]">Create Enterprise Team Account</h3>
              <button onClick={() => setIsAddingUser(false)} className="text-xs text-[#6B6B6B]">✕</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newUserName.trim() || !newUserEmail.trim()) return;
                setUserActionLoading(true);
                try {
                  if (onAddUser) {
                    await onAddUser({
                      name: newUserName.trim(),
                      email: newUserEmail.trim(),
                      role: newUserRole,
                      department: newUserDepartment,
                      title: newUserTitle.trim() || `${newUserRole} Specialist`,
                      phone: newUserPhone.trim(),
                      company: newUserCompany.trim(),
                    });
                  }
                  setIsAddingUser(false);
                  setNewUserName('');
                  setNewUserEmail('');
                } finally {
                  setUserActionLoading(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Full Name</label>
                  <input type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="e.g. Rachel Adams" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Email</label>
                  <input type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="rachel@supportnova.internal" className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Assigned Role</label>
                  <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    <option value="Customer">Customer</option>
                    <option value="Agent">Agent</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-[#3A3A3A]">Department</label>
                  <select value={newUserDepartment} onChange={(e) => setNewUserDepartment(e.target.value)} className="w-full p-2 rounded-xl bg-[#F0EFEA] border border-[#C0BCB1] text-[#171717]">
                    <option value="Customer Support">Customer Support</option>
                    <option value="Hardware Diagnostics">Hardware Diagnostics</option>
                    <option value="Billing & Finance">Billing & Finance</option>
                    <option value="Account & Security">Account & Security</option>
                    <option value="Logistics & Shipping">Logistics & Shipping</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={userActionLoading} className="px-5 py-2 font-semibold bg-[#171717] text-white hover:bg-[#D21515] rounded-xl cursor-pointer shadow-sm">
                  {userActionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};