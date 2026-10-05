import React, { useState } from 'react';
import { X, Mail, Building, Phone, KeyRound, Check, Copy } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  authToken: string | null;
  onUpdateProfile?: (updated: Partial<UserProfile>) => Promise<void>;
  onSignOut: () => void;
  onSwitchPersona: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onUpdateProfile,
  onSignOut,
  onSwitchPersona,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [department, setDepartment] = useState(currentUser?.department || '');

  if (!isOpen || !currentUser) return null;

  const handleCopy = () => {
    if (authToken) {
      navigator.clipboard.writeText(authToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      await onUpdateProfile({ name: name.trim(), phone: phone.trim() || undefined, department: department.trim() || undefined });
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-[#E6E2D8]">
      <div className="w-full max-w-md bg-[#121212] border border-[#E6E2D8]/15 rounded-2xl p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D8]/10">
          <div>
            <h3 className="display text-base text-[#E6E2D8]">{currentUser.name}</h3>
            <span className="label text-[9px] text-[#D83B20]">{currentUser.role} Persona</span>
          </div>
          <button onClick={onClose} className="text-[#E6E2D8]/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {!isEditing ? (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded bg-[#161616] border border-[#E6E2D8]/10 space-y-1">
              <span className="text-[10px] text-[#E6E2D8]/50 block">EMAIL IDENTIFIER</span>
              <span className="text-[#E6E2D8]">{currentUser.email}</span>
            </div>

            <div className="p-3 rounded bg-[#161616] border border-[#E6E2D8]/10 space-y-1">
              <span className="text-[10px] text-[#E6E2D8]/50 block">BEARER TOKEN</span>
              <div className="flex items-center justify-between">
                <span className="truncate max-w-[200px] text-[10px] text-[#E6E2D8]/70">{authToken}</span>
                <button onClick={handleCopy} className="text-[#D83B20] text-[10px] uppercase font-bold">
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsEditing(true)} className="flex-1 py-2 bg-[#1A1A1A] border border-[#E6E2D8]/20 hover:border-[#D83B20] text-xs font-mono uppercase rounded">
                Edit Profile
              </button>
              <button onClick={onSwitchPersona} className="flex-1 py-2 bg-[#D83B20]/15 border border-[#D83B20]/30 text-[#D83B20] hover:bg-[#D83B20] hover:text-white text-xs font-mono uppercase rounded transition">
                Switch Role
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3 text-xs font-mono">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" className="w-full p-2 bg-[#161616] border border-[#E6E2D8]/20 rounded text-[#E6E2D8]" />
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="w-full p-2 bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 bg-[#161616] border border-[#E6E2D8]/20 text-[#E6E2D8]" />
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-[#1A1A1A] text-xs uppercase font-mono rounded">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-[#D83B20] text-white text-xs font-mono uppercase font-bold rounded">Save</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};