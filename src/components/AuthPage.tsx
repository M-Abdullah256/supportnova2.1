import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/index.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
  users: UserProfile[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onBackToHome?: () => void;
}

function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()
      );
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-[10px] tracking-widest opacity-80">{time ?? '--:--'}</span>;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  users,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
  onBackToHome,
}) => {
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved =
        localStorage.getItem('supportnova_theme') ||
        localStorage.getItem('supportnova_auth_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const currentTheme = propTheme || internalTheme;
  const isDark = currentTheme === 'dark';

  const handleToggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      const next = internalTheme === 'dark' ? 'light' : 'dark';
      setInternalTheme(next);
      localStorage.setItem('supportnova_theme', next);
      localStorage.setItem('supportnova_auth_theme', next);
    }
  };

  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot & Reset State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const criteria = {
    length: signUpPassword.length >= 8,
    hasUpper: /[A-Z]/.test(signUpPassword),
    hasLower: /[a-z]/.test(signUpPassword),
    hasNumberOrSpecial: /[0-9]/.test(signUpPassword) || /[^A-Za-z0-9]/.test(signUpPassword),
  };

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'EMPTY', color: isDark ? 'rgba(230,226,216,0.2)' : 'rgba(23,22,20,0.2)' };
    let score = 0;
    if (pwd.length >= 6) score += 20;
    if (pwd.length >= 8) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[a-z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 20;

    if (score <= 40) return { score, label: 'WEAK', color: '#D83B20' };
    if (score <= 80) return { score, label: 'MODERATE', color: '#E5A93C' };
    return { score: 100, label: 'VERIFIED', color: '#2EB886' };
  };

  const pwdStrength = calculatePasswordStrength(signUpPassword);

  /* ---------------- Form Validations ---------------- */
  useEffect(() => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (view === 'login') {
      if (!loginEmail.trim()) {
        errs.loginEmail = 'Email address is required.';
      } else if (!emailRegex.test(loginEmail.trim())) {
        errs.loginEmail = 'Enter a valid corporate email format.';
      }

      if (!loginPassword) {
        errs.loginPassword = 'Password is required.';
      } else if (loginPassword.length < 6) {
        errs.loginPassword = 'Password must be at least 6 characters.';
      }
    } else if (view === 'signup') {
      if (!signUpName.trim()) {
        errs.signUpName = 'Full name is required.';
      } else if (signUpName.trim().length < 2) {
        errs.signUpName = 'Name must be at least 2 characters.';
      } else if (signUpName.trim().length > 60) {
        errs.signUpName = 'Name cannot exceed 60 characters.';
      } else if (!/^[a-zA-Z\s.'-]+$/.test(signUpName.trim())) {
        errs.signUpName = 'Letters, spaces, and hyphens only.';
      }

      if (!signUpEmail.trim()) {
        errs.signUpEmail = 'Email address is required.';
      } else if (!emailRegex.test(signUpEmail.trim())) {
        errs.signUpEmail = 'Please provide a valid corporate email.';
      }

      if (!signUpPassword) {
        errs.signUpPassword = 'Password is required.';
      } else if (signUpPassword.length < 8) {
        errs.signUpPassword = 'Password must be at least 8 characters.';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(signUpPassword)) {
        errs.signUpPassword = 'Must contain both uppercase and lowercase letters.';
      } else if (!/(?=.*\d|.*[^A-Za-z0-9])/.test(signUpPassword)) {
        errs.signUpPassword = 'Must include at least one number or symbol.';
      }

      if (!signUpConfirmPassword) {
        errs.signUpConfirmPassword = 'Confirmation password is required.';
      } else if (signUpPassword !== signUpConfirmPassword) {
        errs.signUpConfirmPassword = 'Passwords do not match.';
      }
    } else if (view === 'forgot') {
      if (!forgotEmail.trim()) {
        errs.forgotEmail = 'Registered email address is required.';
      } else if (!emailRegex.test(forgotEmail.trim())) {
        errs.forgotEmail = 'Please provide a valid corporate email.';
      }
    } else if (view === 'reset') {
      if (!resetToken.trim()) {
        errs.resetToken = 'Verification reset code is required.';
      } else if (resetToken.trim().length < 4) {
        errs.resetToken = 'Verification code must be at least 4 characters.';
      }

      if (!newPassword) {
        errs.newPassword = 'New password is required.';
      } else if (newPassword.length < 8) {
        errs.newPassword = 'Password must be at least 8 characters.';
      }

      if (!confirmNewPassword) {
        errs.confirmNewPassword = 'Confirm your new password.';
      } else if (newPassword !== confirmNewPassword) {
        errs.confirmNewPassword = 'Passwords do not match.';
      }
    }

    setErrors(errs);
  }, [
    view,
    loginEmail,
    loginPassword,
    signUpName,
    signUpEmail,
    signUpPassword,
    signUpConfirmPassword,
    forgotEmail,
    resetToken,
    newPassword,
    confirmNewPassword,
  ]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setTouched({ loginEmail: true, loginPassword: true });

    if (errors.loginEmail || errors.loginPassword) {
      setErrorMessage('Please address all flagged fields before proceeding.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication rejected. Verify credentials.');
      setSuccessMessage(`Authenticated as ${data.user.name}. Opening ${data.user.role} workspace...`);
      setTimeout(() => onLoginSuccess(data.user, data.token), 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setTouched({
      signUpName: true,
      signUpEmail: true,
      signUpPassword: true,
      signUpConfirmPassword: true,
    });

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Form validation detected errors. Review and correct all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim().toLowerCase(),
          password: signUpPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      setSuccessMessage(`Account provisioned! Welcome, ${data.user.name}. Initializing portal...`);
      setTimeout(() => onLoginSuccess(data.user, data.token), 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setTouched({ forgotEmail: true });

    if (errors.forgotEmail) {
      setErrorMessage('Valid registered email address required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset code request failed.');
      if (data.resetToken) setResetToken(data.resetToken);
      setSuccessMessage(data.message || 'Verification reset code dispatched to email.');
      setView('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setTouched({ resetToken: true, newPassword: true, confirmNewPassword: true });

    if (errors.resetToken || errors.newPassword || errors.confirmNewPassword) {
      setErrorMessage('Please satisfy password criteria.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: resetToken.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed.');
      setSuccessMessage('Password modified successfully. Initializing session...');
      setTimeout(() => onLoginSuccess(data.user, data.token), 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoPersonaLogin = async (user: UserProfile) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Persona sign-in failed.');
      setSuccessMessage(`Authenticated as ${user.name} (${user.role})...`);
      setTimeout(() => onLoginSuccess(data.user, data.token), 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoPersonas: { role: UserRole; user: UserProfile; tag: string }[] = [
    { role: 'Customer', tag: 'TIER 1', user: users.find((u) => u.role === 'Customer') || { id: 'usr-cust-1', name: 'Sophia Chen', email: 'sophia.chen@example.com', role: 'Customer', title: 'Enterprise Client' } },
    { role: 'Agent', tag: 'TIER 2', user: users.find((u) => u.role === 'Agent') || { id: 'usr-agent-1', name: 'Marcus Vance', email: 'm.vance@supportnova.internal', role: 'Agent', title: 'Senior Resolution Specialist' } },
    { role: 'Reviewer', tag: 'QA AUDIT', user: users.find((u) => u.role === 'Reviewer') || { id: 'usr-rev-1', name: 'Dr. Tariq Al-Mansoor', email: 't.mansoor@supportnova.internal', role: 'Reviewer', title: 'Lead QA Auditor' } },
    { role: 'Manager', tag: 'SLA CTRL', user: users.find((u) => u.role === 'Manager') || { id: 'usr-mgr-1', name: 'Samantha Sterling', email: 's.sterling@supportnova.internal', role: 'Manager', title: 'Director of SLA' } },
    { role: 'Administrator', tag: 'ROOT', user: users.find((u) => u.role === 'Administrator') || { id: 'usr-adm-1', name: 'Waniya Mustafa', email: 'admin@supportnova.internal', role: 'Administrator', title: 'Lead Architect' } },
  ];

  return (
    <div
      className="auth-portal-scope min-h-screen flex flex-col justify-between selection:bg-[#D83B20] selection:text-white relative overflow-x-hidden font-sans transition-colors duration-300"
      style={{
        backgroundColor: isDark ? '#0C0C0C' : '#F7F6F2',
        color: isDark ? '#E6E2D8' : '#171614',
      }}
    >
      {/* High-priority theme-specific rules */}
      <style>{`
        .auth-portal-scope h1,
        .auth-portal-scope h2,
        .auth-portal-scope h3 {
          color: ${isDark ? '#E6E2D8' : '#171614'} !important;
          font-family: 'Phudu', sans-serif !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
        }

        .auth-portal-scope input:not([type="checkbox"]) {
          background-color: ${isDark ? '#161616' : '#FFFFFF'} !important;
          color: ${isDark ? '#E6E2D8' : '#171614'} !important;
          border-color: ${isDark ? 'rgba(230, 226, 216, 0.22)' : 'rgba(23, 22, 20, 0.16)'} !important;
          border-radius: 2px !important;
        }

        .auth-portal-scope input:not([type="checkbox"]):focus {
          border-color: #D83B20 !important;
          box-shadow: 0 0 0 1.5px #D83B20 !important;
          outline: none !important;
        }

        .auth-portal-scope input::placeholder {
          color: ${isDark ? 'rgba(230, 226, 216, 0.35)' : 'rgba(23, 22, 20, 0.35)'} !important;
        }

        .auth-portal-scope .ticks {
          background-image: repeating-linear-gradient(
            to bottom,
            ${isDark ? 'rgba(230, 226, 216, 0.18)' : 'rgba(23, 22, 20, 0.08)'} 0 1px,
            transparent 1px 14px
          );
        }
      `}</style>

      {/* Decorative Ticks on Left & Right */}
      <div className="ticks pointer-events-none absolute inset-y-0 left-0 w-3 opacity-30 z-20" />
      <div className="ticks pointer-events-none absolute inset-y-0 right-0 w-3 opacity-30 z-20" />

      {/* Top Header Bar */}
      <header
        className="px-6 py-3.5 md:px-12 border-b flex items-center justify-between z-30 backdrop-blur-md sticky top-0 transition-colors"
        style={{
          backgroundColor: isDark ? 'rgba(12, 12, 12, 0.88)' : 'rgba(247, 246, 242, 0.88)',
          borderColor: isDark ? 'rgba(230, 226, 216, 0.12)' : 'rgba(23, 22, 20, 0.1)',
        }}
      >
        <div className="flex items-center gap-4">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-[11px] uppercase font-bold tracking-wider border transition-colors cursor-pointer"
              style={{
                backgroundColor: isDark ? '#141414' : '#FFFFFF',
                borderColor: isDark ? 'rgba(230, 226, 216, 0.2)' : 'rgba(23, 22, 20, 0.14)',
                color: isDark ? '#E6E2D8' : '#171614',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}

          {/* SupportNova Logo: Linked to Landing Page & Theme Adaptive */}
          <div className="flex items-center gap-2">
            <button
      type="button"
      onClick={onBackToHome}
      style={{ color: isDark ? '#E6E2D8' : '#171614' }}
      className="display text-base md:text-lg tracking-[0.25em] text-left hover:!text-[#D83B20] transition-colors cursor-pointer"
      title="Return to Landing Page"
    >
      SupportNova
    </button>
            
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-semibold opacity-70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D83B20] animate-pulse" />
            <span>Deterministic SOP Verification Active</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 font-mono text-[11px] uppercase font-bold tracking-wider transition-colors cursor-pointer border"
            style={{
              backgroundColor: isDark ? '#161616' : '#FFFFFF',
              borderColor: isDark ? 'rgba(230, 226, 216, 0.2)' : 'rgba(23, 22, 20, 0.14)',
              color: isDark ? '#E6E2D8' : '#171614',
            }}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#D83B20]" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#D83B20]" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area — Balanced Layout with Larger Form */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center z-10">
        
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">
              Identity Protocol • Dual-Pipeline Core
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[0.92] tracking-tight">
            Autonomous<br />
            Complaint<br />
            <span className="text-[#D83B20]">Triage Gateway</span>
          </h1>

          <div
            className="space-y-1.5 border-l-2 border-[#D83B20] pl-3.5 max-w-md"
            style={{ color: isDark ? 'rgba(230, 226, 216, 0.8)' : 'rgba(23, 22, 20, 0.75)' }}
          >
            <div className="display text-xs tracking-[0.25em]">SupportNova Core</div>
            <p className="text-xs leading-relaxed font-sans font-medium">
              Every complaint classified with precision. Every GenAI response verified against approved company SOPs. Zero hallucinations, zero unauthorized promises.
            </p>
          </div>

          {/* Quick Metrics */}
          <div
            className="grid grid-cols-3 gap-3 border-t pt-3 max-w-md"
            style={{ borderColor: isDark ? 'rgba(230, 226, 216, 0.15)' : 'rgba(23, 22, 20, 0.12)' }}
          >
            <div>
              <span className="display text-2xl block">99%</span>
              <span className="font-mono text-[9px] uppercase tracking-wider block mt-0.5 opacity-60 font-semibold">
                Policy Accuracy
              </span>
            </div>
            <div>
              <span className="display text-2xl block">&lt; 2.4s</span>
              <span className="font-mono text-[9px] uppercase tracking-wider block mt-0.5 opacity-60 font-semibold">
                Latency Target
              </span>
            </div>
            <div>
              <span className="display text-2xl text-[#D83B20] block">P0-P3</span>
              <span className="font-mono text-[9px] uppercase tracking-wider block mt-0.5 opacity-60 font-semibold">
                Priority Matrix
              </span>
            </div>
          </div>

          {/* Quick Persona Simulation */}
          <div
            className="space-y-2 pt-3 border-t max-w-md"
            style={{ borderColor: isDark ? 'rgba(230, 226, 216, 0.1)' : 'rgba(23, 22, 20, 0.1)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                [Simulate Enterprise Persona]
              </span>
              <span className="font-mono text-[10px] text-[#D83B20] font-bold">★ 1-Click Launch</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {demoPersonas.map(({ role, tag, user }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoPersonaLogin(user)}
                  className="px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5"
                  style={{
                    backgroundColor: isDark ? '#141414' : '#FFFFFF',
                    borderColor: isDark ? 'rgba(230, 226, 216, 0.2)' : 'rgba(23, 22, 20, 0.14)',
                    color: isDark ? '#E6E2D8' : '#171614',
                  }}
                >
                  <span className="font-bold">{role}</span>
                  <span className="text-[9px] opacity-60 text-[#D83B20]">[{tag}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Increased Form Size (7 Cols, max-w-xl) */}
        <div className="lg:col-span-7 w-full max-w-xl mx-auto lg:ml-auto">
          <div
            className="border transition-all duration-300 relative rounded-none w-full"
            style={{
              backgroundColor: isDark ? '#141414' : '#FFFFFF',
              borderColor: isDark ? 'rgba(230, 226, 216, 0.18)' : 'rgba(23, 22, 20, 0.12)',
              boxShadow: isDark
                ? '0 30px 70px -15px rgba(0, 0, 0, 0.85)'
                : '0 25px 55px -12px rgba(23, 22, 20, 0.1), 0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* Header Tabs (Enlarged) */}
            <div
              className="grid grid-cols-2 border-b"
              style={{
                borderColor: isDark ? 'rgba(230, 226, 216, 0.12)' : 'rgba(23, 22, 20, 0.1)',
                backgroundColor: isDark ? '#181818' : '#EFECE5',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-4 px-6 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold text-center transition-all cursor-pointer ${
                  view === 'login'
                    ? isDark
                      ? 'bg-[#141414] text-white border-b-2 border-[#D83B20]'
                      : 'bg-white text-black border-b-2 border-[#D83B20]'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                [01] Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-4 px-6 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold text-center transition-all cursor-pointer ${
                  view === 'signup'
                    ? isDark
                      ? 'bg-[#141414] text-white border-b-2 border-[#D83B20]'
                      : 'bg-white text-black border-b-2 border-[#D83B20]'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                [02] Register
              </button>
            </div>

            {/* Inner Form Card: Enlarged Padding */}
            <div className="p-7 sm:p-9 md:p-10 space-y-5">
              {/* Notifications */}
              {errorMessage && (
                <div className="p-3 text-xs bg-[#D83B20]/15 border border-[#D83B20]/50 text-[#D83B20] flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div
                  className="p-3 text-xs flex items-center gap-2 font-mono border"
                  style={{
                    backgroundColor: isDark ? 'rgba(230, 226, 216, 0.08)' : 'rgba(23, 22, 20, 0.04)',
                    borderColor: isDark ? 'rgba(230, 226, 216, 0.2)' : 'rgba(23, 22, 20, 0.16)',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D83B20] shrink-0" />
                  <span className="leading-tight">{successMessage}</span>
                </div>
              )}

              {/* ===================== VIEW 1: SIGN IN ===================== */}
              {view === 'login' && (
                <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                  <div className="border-b pb-3 border-current/10">
                    <span className="font-mono text-xs text-[#D83B20] tracking-widest font-bold">
                      SRS REQ. LXV • SECURITY TIER
                    </span>
                    <h2 className="text-2xl sm:text-3xl mt-1">Access Workspace</h2>
                  </div>

                  {/* Corporate Email */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80">
                        Corporate Email *
                      </label>
                      {touched.loginEmail && !errors.loginEmail && (
                        <span className="text-[11px] font-mono text-emerald-500 font-bold">✓ Valid</span>
                      )}
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onBlur={() => handleBlur('loginEmail')}
                      placeholder="specialist@supportnova.internal"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                    {touched.loginEmail && errors.loginEmail && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.loginEmail}
                      </span>
                    )}
                  </div>

                  {/* Passkey / Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80">
                        Passkey / Password *
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onBlur={() => handleBlur('loginPassword')}
                        placeholder="••••••••"
                        className="w-full px-4 pr-11 py-3 text-sm font-mono border transition-all rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.loginPassword && errors.loginPassword && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.loginPassword}
                      </span>
                    )}
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded-none w-4 h-4 accent-[#D83B20] cursor-pointer"
                      />
                      <span className="font-mono text-xs uppercase tracking-wider opacity-70 font-semibold">
                        Keep Authenticated
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setView('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setTouched({});
                      }}
                      className="font-mono text-xs uppercase tracking-wider text-[#D83B20] hover:underline cursor-pointer font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* High-Impact Tactile Action Button (Enlarged) */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full group relative flex items-center justify-between p-0 overflow-hidden font-mono text-xs sm:text-sm uppercase font-bold tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.99] select-none"
                      style={{
                        backgroundColor: '#D83B20',
                        color: '#FFFFFF',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(216, 59, 32, 0.45)'
                          : '0 8px 20px -3px rgba(216, 59, 32, 0.35)',
                      }}
                    >
                      <div className="flex items-center gap-3 py-3.5 pl-5 pr-4">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="tracking-[0.16em]">
                          {isLoading ? 'Authenticating Handshake...' : 'Sign In To Workspace'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center h-12 w-16 bg-black/20 group-hover:bg-black/30 border-l border-white/20 transition-all duration-300">
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold text-base">
                          →
                        </span>
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* ===================== VIEW 2: SIGN UP ===================== */}
              {view === 'signup' && (
                <form onSubmit={handleSignUpSubmit} noValidate className="space-y-4">
                  <div className="border-b pb-3 border-current/10">
                    <span className="font-mono text-xs text-[#D83B20] tracking-widest font-bold">
                      SRS REQ. LXVI • ENTERPRISE ID
                    </span>
                    <h2 className="text-2xl sm:text-3xl mt-1">Provision Identity</h2>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      onBlur={() => handleBlur('signUpName')}
                      placeholder="Jordan Lee"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                    {touched.signUpName && errors.signUpName && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.signUpName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      onBlur={() => handleBlur('signUpEmail')}
                      placeholder="jordan.lee@example.com"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                    {touched.signUpEmail && errors.signUpEmail && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.signUpEmail}
                      </span>
                    )}
                  </div>

                  {/* Password & Security Meter */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80">
                        Master Password *
                      </label>
                      <span className="text-xs font-mono font-bold" style={{ color: pwdStrength.color }}>
                        [{pwdStrength.label}]
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        onBlur={() => handleBlur('signUpPassword')}
                        placeholder="Min 8 characters"
                        className="w-full px-4 pr-11 py-3 text-sm font-mono border transition-all rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2 font-mono text-[10px] uppercase tracking-wider font-semibold">
                      <span className={criteria.length ? 'text-emerald-500 font-bold' : 'opacity-40'}>
                        {criteria.length ? '✓' : '○'} 8+ Chars
                      </span>
                      <span className={criteria.hasUpper ? 'text-emerald-500 font-bold' : 'opacity-40'}>
                        {criteria.hasUpper ? '✓' : '○'} Uppercase
                      </span>
                      <span className={criteria.hasLower ? 'text-emerald-500 font-bold' : 'opacity-40'}>
                        {criteria.hasLower ? '✓' : '○'} Lowercase
                      </span>
                      <span className={criteria.hasNumberOrSpecial ? 'text-emerald-500 font-bold' : 'opacity-40'}>
                        {criteria.hasNumberOrSpecial ? '✓' : '○'} Num / Symbol
                      </span>
                    </div>

                    {touched.signUpPassword && errors.signUpPassword && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.signUpPassword}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur('signUpConfirmPassword')}
                      placeholder="Repeat password"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                    {touched.signUpConfirmPassword && errors.signUpConfirmPassword && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.signUpConfirmPassword}
                      </span>
                    )}
                  </div>

                  {/* High-Impact Action Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full group relative flex items-center justify-between p-0 overflow-hidden font-mono text-xs sm:text-sm uppercase font-bold tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.99] select-none"
                      style={{
                        backgroundColor: '#D83B20',
                        color: '#FFFFFF',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(216, 59, 32, 0.45)'
                          : '0 8px 20px -3px rgba(216, 59, 32, 0.35)',
                      }}
                    >
                      <div className="flex items-center gap-3 py-3.5 pl-5 pr-4">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="tracking-[0.16em]">
                          {isLoading ? 'Creating Identity...' : 'Complete Registration'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center h-12 w-16 bg-black/20 group-hover:bg-black/30 border-l border-white/20 transition-all duration-300">
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold text-base">
                          →
                        </span>
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* ===================== VIEW 3: FORGOT PASSWORD ===================== */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                  <div className="border-b pb-3 border-current/10">
                    <span className="font-mono text-xs text-[#D83B20] tracking-widest font-bold">
                      RECOVERY PROTOCOL
                    </span>
                    <h2 className="text-2xl sm:text-3xl mt-1">Recover Credentials</h2>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Registered Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onBlur={() => handleBlur('forgotEmail')}
                      placeholder="account@company.com"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                    {touched.forgotEmail && errors.forgotEmail && (
                      <span className="text-xs font-mono text-[#D83B20] mt-1.5 block font-semibold">
                        ⚠ {errors.forgotEmail}
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full group relative flex items-center justify-between p-0 overflow-hidden font-mono text-xs sm:text-sm uppercase font-bold tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.99] select-none"
                      style={{
                        backgroundColor: '#D83B20',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 20px -3px rgba(216, 59, 32, 0.35)',
                      }}
                    >
                      <div className="flex items-center gap-3 py-3.5 pl-5 pr-4">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="tracking-[0.16em]">
                          {isLoading ? 'Dispatching Payload...' : 'Send Verification Code'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center h-12 w-16 bg-black/20 group-hover:bg-black/30 border-l border-white/20 transition-all duration-300">
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold text-base">
                          →
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="font-mono text-xs text-[#D83B20] hover:underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      ← Back to Workspace Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* ===================== VIEW 4: RESET PASSWORD ===================== */}
              {view === 'reset' && (
                <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                  <div className="border-b pb-3 border-current/10">
                    <span className="font-mono text-xs text-[#D83B20] tracking-widest font-bold">
                      SESSION ENCRYPTION
                    </span>
                    <h2 className="text-2xl sm:text-3xl mt-1">Set New Password</h2>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Reset Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="e.g. rst-123456"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider font-bold opacity-80 block mb-1.5">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-3 text-sm font-mono border transition-all rounded-none"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full group relative flex items-center justify-between p-0 overflow-hidden font-mono text-xs sm:text-sm uppercase font-bold tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.99] select-none"
                      style={{
                        backgroundColor: '#D83B20',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 20px -3px rgba(216, 59, 32, 0.35)',
                      }}
                    >
                      <div className="flex items-center gap-3 py-3.5 pl-5 pr-4">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span className="tracking-[0.16em]">
                          {isLoading ? 'Recompiling Hashes...' : 'Update Password & Enter Console'}
                        </span>
                      </div>
                      <div className="flex items-center justify-center h-12 w-16 bg-black/20 group-hover:bg-black/30 border-l border-white/20 transition-all duration-300">
                        <span className="transition-transform duration-300 group-hover:translate-x-1.5 font-bold text-base">
                          →
                        </span>
                      </div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
};