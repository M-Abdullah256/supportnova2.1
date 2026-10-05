import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onLoginWithCredentials?: (email: string, password?: string) => Promise<boolean>;
  onRegisterUser?: (userData: any) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onLoginWithCredentials,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'personas'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Customer');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onLoginWithCredentials) {
      const ok = await onLoginWithCredentials(email.trim(), password);
      if (ok) onClose();
      else setAuthError('Invalid credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegisterUser) {
      const ok = await onRegisterUser({ name: name.trim(), email: email.trim(), role, password });
      if (ok) onClose();
      else setAuthError('Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-[#E6E2D8]">
      <div className="w-full max-w-md bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/10">
          <span className="display text-lg text-[#E6E2D8]">Access Console</span>
          <button onClick={onClose} className="text-[#E6E2D8]/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-lg bg-[#181818] p-1 border border-[#E6E2D8]/10 text-xs font-mono">
          <button onClick={() => setActiveTab('signin')} className={`flex-1 py-1.5 rounded uppercase font-bold ${activeTab === 'signin' ? 'bg-[#D83B20] text-white' : 'text-[#E6E2D8]/60'}`}>Sign In</button>
          <button onClick={() => setActiveTab('signup')} className={`flex-1 py-1.5 rounded uppercase font-bold ${activeTab === 'signup' ? 'bg-[#D83B20] text-white' : 'text-[#E6E2D8]/60'}`}>Register</button>
          <button onClick={() => setActiveTab('personas')} className={`flex-1 py-1.5 rounded uppercase font-bold ${activeTab === 'personas' ? 'bg-[#D83B20] text-white' : 'text-[#E6E2D8]/60'}`}>Personas</button>
        </div>

        {authError && (
          <div className="p-2 text-xs font-mono bg-[#D83B20]/15 text-[#D83B20] border border-[#D83B20]/30 rounded">
            {authError}
          </div>
        )}

        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3 text-xs">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <button type="submit" className="w-full py-2.5 bg-[#D83B20] text-white font-mono uppercase font-bold rounded hover:bg-[#b82f17] transition cursor-pointer">
              Sign In
            </button>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 text-xs">
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (Min 6 Chars)" className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full p-2.5 rounded bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]">
              <option value="Customer">Customer</option>
              <option value="Agent">Agent</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
            <button type="submit" className="w-full py-2.5 bg-[#D83B20] text-white font-mono uppercase font-bold rounded hover:bg-[#b82f17] transition cursor-pointer">
              Register Account
            </button>
          </form>
        )}

        {activeTab === 'personas' && (
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onSelectUser(u); onClose(); }}
                className="p-2 text-left bg-[#161616] border border-[#E6E2D8]/15 hover:border-[#D83B20] rounded"
              >
                <div className="font-bold text-[#E6E2D8] truncate">{u.name}</div>
                <div className="text-[10px] text-[#D83B20]">{u.role}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};