import React, { useState, useEffect, useCallback } from 'react';
import type {
  Complaint,
  PolicyDocument,
  RuleMatrixEntry,
  PromptTemplate,
  SecurityTestCase,
  UserProfile,
} from './types/index.ts';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { AgentDashboard } from './components/AgentDashboard';
import { ReviewerQueue } from './components/ReviewerQueue';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AdminPortal } from './components/AdminPortal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { UserProfileModal } from './components/UserProfileModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { INITIAL_USERS, DEPARTMENTS } from './data/initialData';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // 1. Theme State for Dashboards & Auth (Defaults to 'dark' and persists in localStorage)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('supportnova_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('supportnova_theme', next);
      return next;
    });
  }, []);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('supportnova_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('supportnova_auth_token') || null;
    } catch {
      return null;
    }
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [ruleMatrix, setRuleMatrix] = useState<RuleMatrixEntry[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [testCases, setTestCases] = useState<SecurityTestCase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [inspectComplaint, setInspectComplaint] = useState<Complaint | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentDepartment, setCurrentDepartment] = useState('All');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Universal API Fetch Client with Pydantic (HTTP 422/409/400) Error Parsing
   */
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers || {});
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
      if (currentUser) {
        headers.set('x-user-role', currentUser.role);
        headers.set('x-user-email', currentUser.email);
        headers.set('x-user-id', currentUser.id);
      }
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      try {
        const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.error || 'Access Denied (403): Unauthorized operation for your role.';
          showNotification('error', msg);
          throw new Error(msg);
        }

        if (res.status === 401) {
          showNotification('error', 'Session expired. Please sign in again.');
          setCurrentUser(null);
          setAuthToken(null);
          setShowLanding(true);
          localStorage.removeItem('supportnova_auth_user');
          localStorage.removeItem('supportnova_auth_token');
          throw new Error('Unauthorized');
        }

        if (res.status === 422) {
          const errData = await res.json().catch(() => ({}));
          let detailedMsg = errData.error;
          if (Array.isArray(errData.details) && errData.details.length > 0) {
            const first = errData.details[0];
            const field = first.loc?.filter((l: any) => l !== 'body').join('.') || 'input';
            detailedMsg = `Validation failed on '${field}': ${first.msg}`;
          }
          showNotification('error', detailedMsg || 'Validation Error: Check your form inputs.');
          throw new Error(detailedMsg || 'Validation Error');
        }

        if (res.status === 400 || res.status === 409) {
          const errData = await res.json().catch(() => ({}));
          const msg = errData.error || `Request rejected (${res.status}).`;
          showNotification('error', msg);
          throw new Error(msg);
        }

        return res;
      } catch (err: any) {
        if (!err.message?.includes('Validation Error') && !err.message?.includes('Access Denied')) {
          showNotification('error', err.message || 'Network communication error.');
        }
        throw err;
      }
    },
    [authToken, currentUser, showNotification]
  );

  const fetchData = useCallback(
    async (activeUser?: UserProfile | null) => {
      const user = activeUser !== undefined ? activeUser : currentUser;
      if (!user) return;

      try {
        setIsLoading(true);
        const complaintsUrl =
          user.role === 'Customer'
            ? `/api/complaints?email=${encodeURIComponent(user.email)}`
            : '/api/complaints';

        const promises: Promise<Response | null>[] = [
          apiFetch(complaintsUrl),
          apiFetch('/api/knowledge-base'),
          apiFetch('/api/rule-matrix'),
        ];

        if (user.role === 'Administrator') {
          promises.push(apiFetch('/api/prompt-templates'));
          promises.push(apiFetch('/api/test-scenarios'));
          promises.push(apiFetch('/api/users').catch(() => null));
        }

        const [compRes, polRes, ruleRes, promptRes, testRes, userRes] = await Promise.all(promises);

        if (compRes && compRes.ok) {
          const data = await compRes.json();
          setComplaints(data?.complaints ?? []);
        }
        if (polRes && polRes.ok) {
          const data = await polRes.json();
          setPolicies(data?.policies ?? []);
        }
        if (ruleRes && ruleRes.ok) {
          const data = await ruleRes.json();
          setRuleMatrix(data?.ruleMatrix ?? []);
        }
        if (promptRes && promptRes.ok) {
          const data = await promptRes.json();
          setPromptTemplates(data?.promptTemplates ?? []);
        }
        if (testRes && testRes.ok) {
          const data = await testRes.json();
          setTestCases(data?.testCases ?? []);
        }
        if (userRes && userRes.ok) {
          const data = await userRes.json();
          setUsers(data?.users ?? []);
        }
      } catch (err) {
        console.error('Failed to load SupportNova data:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [apiFetch, currentUser]
  );

  useEffect(() => {
    if (currentUser && authToken) {
      fetchData(currentUser);
    }
  }, [currentUser, authToken, fetchData]);

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setShowLanding(false);
    localStorage.setItem('supportnova_auth_user', JSON.stringify(user));
    localStorage.setItem('supportnova_auth_token', token);
    showNotification('success', `Welcome, ${user.name}! Accessing ${user.role} workspace.`);
  };

  const handleSignOut = async () => {
    try {
      if (authToken) {
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('supportnova_auth_user');
    localStorage.removeItem('supportnova_auth_token');
    setCurrentUser(null);
    setAuthToken(null);
    setComplaints([]);
    setShowLanding(true);
    showNotification('success', 'You have been signed out.');
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const res = await apiFetch(`/api/users/${currentUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data.user);
      localStorage.setItem('supportnova_auth_user', JSON.stringify(data.user));
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? data.user : u)));
      showNotification('success', 'Profile updated successfully.');
    }
  };

  const handleSubmitComplaint = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          customerName: currentUser?.name || formData.customerName,
          customerEmail: currentUser?.email || formData.customerEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaints((prev) => [data.complaint, ...prev]);
        showNotification(
          'success',
          data.complaint.pipeline1Output?.pipelineStatus === 'GENAI_UNAVAILABLE'
            ? `Complaint ${data.complaint.id} queued for manual verification.`
            : `Complaint ${data.complaint.id} triaged via Dual-Pipeline Engine.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (complaintId: string, text: string, nextStatus?: any) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        sender: currentUser?.role === 'Customer' ? 'Customer' : 'Agent',
        senderName: currentUser?.name || 'Support Specialist',
        text,
        nextStatus,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', 'Message posted.');
    }
  };

  const handleCustomerEscalate = async (complaintId: string, reason: string) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', 'Ticket escalated for supervisor review.');
    }
  };

  const handleCustomerFeedback = async (complaintId: string, rating: number, feedback: string) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });

    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', 'CSAT evaluation recorded.');
    }
  };

  const handleUpdateStatus = async (complaintId: string, status: any, dept?: string, agent?: string) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        assignedDepartment: dept,
        assignedAgent: agent || currentUser?.name,
        actor: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Agent',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', `Status updated to ${status}.`);
    }
  };

  const handleReviewDecision = async (complaintId: string, decisionData: any) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        ...decisionData,
        reviewedBy: currentUser?.name || 'Reviewer Specialist',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', `Decision: ${decisionData.decision} applied to ${complaintId}`);
    }
  };

  const handleReAnalyze = async (complaintId: string) => {
    const res = await apiFetch(`/api/complaints/${complaintId}/re-analyze`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? data.complaint : c))
      );
      showNotification('success', `Ticket ${complaintId} re-evaluated against ground truth.`);
    }
  };

  const handleUploadDocument = async (uploadData: any) => {
    const res = await apiFetch('/api/knowledge-base/upload', {
      method: 'POST',
      body: JSON.stringify(uploadData),
    });
    if (res.ok) {
      const data = await res.json();
      const polRes = await apiFetch('/api/knowledge-base');
      if (polRes.ok) {
        const polData = await polRes.json();
        setPolicies(polData?.policies ?? []);
      }
      showNotification('success', data.message || `Document parsed into ${data.chunkCount} clauses.`);
      return data;
    }
  };

  const handleTogglePolicyStatus = async (id: string, newStatus: string) => {
    const res = await apiFetch(`/api/knowledge-base/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setPolicies((prev) => prev.map((p) => (p.id === id ? data.policy : p)));
      showNotification('success', `Policy status updated to ${newStatus}.`);
    }
  };

  const handleAddPolicy = async (policyData: any) => {
    const res = await apiFetch('/api/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
    if (res.ok) {
      const data = await res.json();
      setPolicies((prev) => [...prev, data.policy]);
      showNotification('success', `Policy ${data.policy.id} indexed.`);
    }
  };

  const handleUpdatePolicy = async (id: string, policyData: any) => {
    const res = await apiFetch(`/api/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
    if (res.ok) {
      const data = await res.json();
      setPolicies((prev) => prev.map((p) => (p.id === id ? data.policy : p)));
      showNotification('success', `Policy ${id} saved.`);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    const res = await apiFetch(`/api/knowledge-base/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      showNotification('success', `Policy ${id} deleted.`);
    }
  };

  const handleAddRule = async (ruleData: any) => {
    const res = await apiFetch('/api/rule-matrix', {
      method: 'POST',
      body: JSON.stringify(ruleData),
    });
    if (res.ok) {
      const data = await res.json();
      setRuleMatrix((prev) => [...prev, data.rule]);
      showNotification('success', `Rule ${data.rule.id} added.`);
    }
  };

  const handleUpdateRule = async (id: string, ruleData: any) => {
    const res = await apiFetch(`/api/rule-matrix/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData),
    });
    if (res.ok) {
      const data = await res.json();
      setRuleMatrix((prev) => prev.map((r) => (r.id === id ? data.rule : r)));
      showNotification('success', `Rule ${id} updated.`);
    }
  };

  const handleDeleteRule = async (id: string) => {
    const res = await apiFetch(`/api/rule-matrix/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRuleMatrix((prev) => prev.filter((r) => r.id !== id));
      showNotification('success', `Rule ${id} deleted.`);
    }
  };

  const handleAddPromptTemplate = async (templateData: any) => {
    const res = await apiFetch('/api/prompt-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    if (res.ok) {
      const data = await res.json();
      setPromptTemplates((prev) => [...prev, data.promptTemplate]);
      showNotification('success', `Prompt template '${data.promptTemplate.name}' indexed.`);
    }
  };

  const handleUpdatePromptTemplate = async (id: string, templateData: any) => {
    const res = await apiFetch(`/api/prompt-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
    if (res.ok) {
      const data = await res.json();
      setPromptTemplates((prev) =>
        prev.map((t) => (t.id === id ? data.promptTemplate : t))
      );
      showNotification('success', `Prompt template ${id} updated.`);
    }
  };

  const handleRollbackPrompt = async (id: string, targetVersion: string) => {
    const res = await apiFetch(`/api/prompt-templates/${id}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ targetVersion }),
    });
    if (res.ok) {
      const data = await res.json();
      setPromptTemplates((prev) =>
        prev.map((t) => (t.id === id ? data.promptTemplate : t))
      );
      showNotification('success', `Prompt template rolled back to v${targetVersion}.`);
    }
  };

  const handleRollbackPolicy = async (id: string, targetVersion: string) => {
    const res = await apiFetch(`/api/knowledge-base/${id}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ targetVersion }),
    });
    if (res.ok) {
      const data = await res.json();
      setPolicies((prev) => prev.map((p) => (p.id === id ? data.policy : p)));
      showNotification('success', `Policy document rolled back to v${targetVersion}.`);
    }
  };

  const handleRunTestCase = async (testCaseId: string) => {
    const res = await apiFetch('/api/test-scenarios/run', {
      method: 'POST',
      body: JSON.stringify({ testCaseId }),
    });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Test case run failed');
  };

  const handleAddUser = async (userData: any) => {
    const res = await apiFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => [...prev, data.user]);
      showNotification('success', `User ${data.user.name} created.`);
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    const res = await apiFetch(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      showNotification('success', `User ${data.user.name} updated.`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showNotification('success', 'User removed.');
    }
  };

  const searchedComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.productService.toLowerCase().includes(q) ||
      c.orderReference.toLowerCase().includes(q) ||
      (c.pipeline1Output?.category || '').toLowerCase().includes(q)
    );
  });

  const manualReviewCount = complaints.filter(
    (c) => c.comparisonResult?.verificationStatus === 'Manual Review'
  ).length;

 // VIEW 1: Unauthenticated Flow (Landing Page or Auth Screen)
  if (!currentUser || !authToken) {
    if (showLanding) {
      return (
        <LandingPage
          onGetStarted={() => setShowLanding(false)}
          onLogin={() => setShowLanding(false)}
        />
      );
    }

    return (
      <AuthPage 
        onLoginSuccess={handleLoginSuccess} 
        users={users}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBackToHome={() => setShowLanding(true)}
      />
    );
  }

  // VIEW 2: Authenticated Flow (Dashboards with Scoped data-theme={theme})
  return (
    <ErrorBoundary>
      <div 
        className="support-app min-h-screen theme-canvas flex flex-col font-sans w-full overflow-x-hidden" 
        data-theme={theme}
      >
        {notification && (
          <div
            className="fixed bottom-5 right-5 z-[200] flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs theme-surface animate-in fade-in"
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#D83B20] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#D83B20] shrink-0" />
            )}
            <span className="font-mono">{notification.message}</span>
          </div>
        )}

        <Navbar
          currentUser={currentUser}
          manualReviewCount={manualReviewCount}
          totalComplaints={complaints.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onSignOut={handleSignOut}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#D83B20] animate-spin" />
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Loading {currentUser.role} Workspace Data...
              </p>
            </div>
          ) : (
            <>
              {currentUser.role === 'Customer' && (
                <CustomerPortal
                  complaints={searchedComplaints}
                  onSubmitComplaint={handleSubmitComplaint}
                  onSendMessage={(id, text) => handleSendMessage(id, text)}
                  onSelectComplaint={(c) => setInspectComplaint(c)}
                  isLoading={isSubmitting}
                  currentUser={currentUser}
                  policies={policies}
                  onEscalateComplaint={handleCustomerEscalate}
                  onSubmitFeedback={handleCustomerFeedback}
                />
              )}

              {currentUser.role === 'Agent' && (
                <AgentDashboard
                  complaints={searchedComplaints}
                  onSelectComplaint={(c) => setInspectComplaint(c)}
                  onSendMessage={(id, text, nextSt) => handleSendMessage(id, text, nextSt)}
                  onUpdateStatus={handleUpdateStatus}
                  currentDepartment={currentDepartment}
                  onDepartmentChange={setCurrentDepartment}
                  departments={DEPARTMENTS}
                />
              )}

              {currentUser.role === 'Reviewer' && (
                <ReviewerQueue
                  complaints={searchedComplaints}
                  onSelectComplaint={(c) => setInspectComplaint(c)}
                  onReviewDecision={handleReviewDecision}
                  onReAnalyze={handleReAnalyze}
                  departments={DEPARTMENTS}
                />
              )}

              {currentUser.role === 'Manager' && (
                <ManagerDashboard
                  complaints={searchedComplaints}
                  departments={DEPARTMENTS}
                  onSelectComplaint={(c) => setInspectComplaint(c)}
                />
              )}

              {currentUser.role === 'Administrator' && (
                <AdminPortal
                  policies={policies}
                  ruleMatrix={ruleMatrix}
                  promptTemplates={promptTemplates}
                  testCases={testCases}
                  users={users}
                  onAddPolicy={handleAddPolicy}
                  onUpdatePolicy={handleUpdatePolicy}
                  onDeletePolicy={handleDeletePolicy}
                  onUploadDocument={handleUploadDocument}
                  onTogglePolicyStatus={handleTogglePolicyStatus}
                  onAddRule={handleAddRule}
                  onUpdateRule={handleUpdateRule}
                  onDeleteRule={handleDeleteRule}
                  onUpdatePromptTemplate={handleUpdatePromptTemplate}
                  onAddPromptTemplate={handleAddPromptTemplate}
                  onRollbackPrompt={handleRollbackPrompt}
                  onRollbackPolicy={handleRollbackPolicy}
                  onRunTestCase={handleRunTestCase}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  departments={DEPARTMENTS}
                />
              )}
            </>
          )}
        </main>

        {inspectComplaint && (
          <ComplaintDetailModal
            complaint={inspectComplaint}
            onClose={() => setInspectComplaint(null)}
            policies={policies}
          />
        )}

        {profileModalOpen && (
          <UserProfileModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            currentUser={currentUser}
            authToken={authToken}
            onUpdateProfile={handleUpdateProfile}
            onSignOut={handleSignOut}
            onSwitchPersona={() => {
              setProfileModalOpen(false);
              handleSignOut();
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}