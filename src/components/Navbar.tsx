import React, { useState, useEffect, useRef } from 'react';
import { UserRole, UserProfile } from '../types/index.ts';
import {
  Search,
  PlusCircle,
  LogOut,
  ChevronDown,
  User,
  Bot,
  UserCheck,
  BarChart3,
  Settings,
  AlertTriangle,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  manualReviewCount: number;
  totalComplaints: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfileModal?: () => void;
  onSignOut: () => void;
  onNewComplaintClick?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  manualReviewCount,
  searchQuery,
  onSearchChange,
  onOpenProfileModal,
  onSignOut,
  onNewComplaintClick,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-[100] w-full theme-canvas backdrop-blur-md border-b" style={{ borderColor: 'var(--border-line)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px] gap-4">

          {/* Brand */}
          <div className="flex items-center gap-4">
            <span className="display text-lg tracking-[0.2em]">
              SupportNova
            </span>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded theme-surface border">
              <span className="label text-[10px]">{currentUser.role}</span>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tickets, orders, or policies..."
                className="w-full !pl-10 !pr-12 py-2 text-xs rounded-lg transition-colors"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border pointer-events-none"
                style={{ borderColor: 'var(--border-line)', color: 'var(--text-muted)' }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-lg border theme-surface transition cursor-pointer hover:border-[#D83B20]"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#E6E2D8]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#121212]" />
                )}
              </button>
            )}

            {currentUser.role === 'Customer' && onNewComplaintClick && (
              <button
                type="button"
                onClick={onNewComplaintClick}
                className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#D83B20] text-white hover:bg-[#b82f17] transition cursor-pointer flex items-center space-x-1.5 rounded"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded border theme-surface transition cursor-pointer hover:border-[#D83B20]"
              >
                <div className="w-7 h-7 rounded bg-[#D83B20] text-white font-mono text-xs flex items-center justify-center font-bold">
                  {initials}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 theme-surface border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="p-2.5 border-b" style={{ borderColor: 'var(--border-line)' }}>
                    <p className="text-xs font-bold leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] font-mono uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentUser.role}</p>
                  </div>
                  <div className="pt-1.5 space-y-1">
                    {onOpenProfileModal && (
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onOpenProfileModal(); }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded transition flex items-center gap-2 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile &amp; Session</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setProfileDropdownOpen(false); onSignOut(); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#D83B20] rounded transition flex items-center gap-2 cursor-pointer hover:bg-[#D83B20]/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};