import React from 'react';
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from 'lucide-react';
import { UserRole, UserProfile } from '../types/index.ts';

interface AccessDeniedProps {
  requiredRole: UserRole | string;
  currentRole: UserRole;
  currentUser?: UserProfile | null;
  onSwitchRole: (role: UserRole) => void;
  onReturnToDashboard: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  currentRole,
  currentUser,
  onSwitchRole,
  onReturnToDashboard,
}) => {
  const getSuggestedRole = (): UserRole => {
    if (requiredRole === 'Administrator') return 'Administrator';
    if (requiredRole === 'Reviewer') return 'Reviewer';
    if (requiredRole === 'Manager') return 'Manager';
    if (requiredRole === 'Agent') return 'Agent';
    return 'Customer';
  };

  const suggestedRole = getSuggestedRole();

  return (
    <div className="py-12 sm:py-20 flex items-center justify-center px-4 bg-[#0F0F0F] text-[#E6E2D8]">
      <div className="max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden bg-[#121212] border border-[#D83B20]/40">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#D83B20]">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold mb-3 bg-[#D83B20]/10 border border-[#D83B20]/30 text-[#D83B20]">
          <Lock className="w-3 h-3" />
          <span>RBAC VIOLATION (HTTP 403)</span>
        </div>

        <h2 className="display text-2xl text-[#E6E2D8] mb-2">
          Restricted Portal Access
        </h2>

        <p className="text-xs mb-6 text-[#E6E2D8]/70 leading-relaxed font-mono">
          Persona <span className="text-[#D83B20] font-bold">{currentUser?.name || currentRole}</span> [{currentRole}] lacks clearance to execute operations in the <span className="text-white font-bold">{requiredRole}</span> zone.
        </p>

        <div className="rounded-xl p-3.5 mb-6 text-left space-y-2 bg-[#161616] border border-[#E6E2D8]/15 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#E6E2D8]/50">Current Persona:</span>
            <span className="text-[#E6E2D8] font-bold">{currentRole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#E6E2D8]/50">Required Role:</span>
            <span className="text-[#D83B20] font-bold">{requiredRole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#E6E2D8]/50">Security Rule:</span>
            <span className="text-[#E6E2D8]/80">Strict Role Boundary Separation</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => onSwitchRole(suggestedRole)}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] shadow-lg transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to {suggestedRole}</span>
          </button>

          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider bg-[#1A1A1A] text-[#E6E2D8] border border-[#E6E2D8]/20 hover:border-[#D83B20] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};