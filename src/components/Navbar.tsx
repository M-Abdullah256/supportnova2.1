import React, { useState, useEffect, useRef } from 'react';
import { UserRole, UserProfile } from '../types/index.ts';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User,
  Bot,
  UserCheck,
  BarChart3,
  Settings,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile;
  manualReviewCount: number;
  totalComplaints: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfileModal?: () => void;
  onSignOut: () => void;
  activeNavTab?: string;
  onNavTabChange?: (tab: string) => void;
  onNewComplaintClick?: () => void;
}

// Geometric Brand Mark
const BrandMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  manualReviewCount,
  totalComplaints,
  searchQuery,
  onSearchChange,
  onOpenProfileModal,
  onSignOut,
  onNewComplaintClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown cleanly when clicking anywhere outside (no backdrop div needed)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'Customer': return 'Customer';
      case 'Agent': return 'Agent';
      case 'Reviewer': return 'Reviewer';
      case 'Manager': return 'Manager';
      case 'Administrator': return 'Admin';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Customer': return <User className="w-3 h-3 text-[#D21515]" />;
      case 'Agent': return <Bot className="w-3 h-3 text-[#171717]" />;
      case 'Reviewer': return <UserCheck className="w-3 h-3 text-[#3A3A3A]" />;
      case 'Manager': return <BarChart3 className="w-3 h-3 text-[#3A3A3A]" />;
      case 'Administrator': return <Settings className="w-3 h-3 text-[#D21515]" />;
    }
  };

  const initials = currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E2DFD7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand & Role Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#D21515] text-white shadow-xs">
              <BrandMark className="w-4 h-4" />
            </div>

            <div className="flex items-center">
              <span className="font-bold text-sm tracking-tight text-[#171717]">
                SupportNova
              </span>

              <div className="h-4 w-px bg-[#E2DFD7] mx-2.5" />

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F4F0] text-[#3A3A3A] border border-[#DDD9CE]">
                {getRoleIcon(currentUser.role)}
                <span>{getRoleLabel(currentUser.role)}</span>
              </span>
            </div>
          </div>

          {/* Centered Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  currentUser.role === 'Customer'
                    ? 'Search my tickets or orders...'
                    : 'Search requests, customers, or tags...'
                }
                className="w-full rounded-lg pl-8 pr-10 py-1.5 text-xs bg-[#F5F4F0] border border-[#E2DFD7] text-[#171717] placeholder-[#8C8C8C] focus:bg-white focus:border-[#171717] focus:outline-none transition-colors"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8C8C8C] bg-white border border-[#E2DFD7] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2.5">
            
            {/* Customer CTA */}
            {currentUser.role === 'Customer' && onNewComplaintClick && (
              <button
                type="button"
                onClick={onNewComplaintClick}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D21515] text-white hover:bg-[#B91212] transition shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            )}

            {/* Reviewer Priority Badge */}
            {currentUser.role === 'Reviewer' && manualReviewCount > 0 && (
              <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D21515] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D21515]" />
                </span>
                <AlertTriangle className="w-3 h-3" />
                <span>{manualReviewCount} to Review</span>
              </div>
            )}

            {/* Active Counter for Managers / Admins */}
            {(currentUser.role === 'Manager' || currentUser.role === 'Administrator') && totalComplaints > 0 && (
              <div className="hidden lg:flex items-center space-x-1 text-xs text-[#737373] px-2 py-1 bg-[#F5F4F0] border border-[#E2DFD7] rounded-md font-medium">
                <span>{totalComplaints} Active</span>
              </div>
            )}

            {/* User Profile Dropdown Anchor */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 pl-1.5 pr-2.5 py-1 rounded-lg text-xs border border-[#DDD9CE] hover:border-[#171717] transition cursor-pointer"
                style={{ backgroundColor: '#F5F4F0', color: '#171717' }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0"
                  style={{ backgroundColor: '#171717', color: '#FFFFFF' }}
                >
                  {initials}
                </div>

                <div className="hidden sm:block text-left max-w-[130px] truncate leading-tight">
                  <p className="font-semibold text-xs text-[#171717] truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-[#737373] truncate">{currentUser.department || currentUser.role}</p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-[#8C8C8C]" />
              </button>

              {/* Flyout Menu (No backdrop div -> Screen remains bright and clear) */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl z-50 border border-[#C0BCB1] overflow-hidden"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* User Identity Header */}
                  <div className="p-3.5 border-b border-[#EBE8E1]" style={{ backgroundColor: '#F8F7F4' }}>
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                        style={{ backgroundColor: '#171717', color: '#FFFFFF' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#171717] truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-[#737373] truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider bg-[rgba(210,21,21,0.08)] text-[#D21515] border border-[rgba(210,21,21,0.22)] font-mono">
                        {currentUser.role}
                      </span>
                      {currentUser.department && (
                        <span className="text-[10px] text-[#737373] flex items-center gap-1">
                          <Building className="w-3 h-3 text-[#8C8C8C]" />
                          <span className="truncate max-w-[130px]">{currentUser.department}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="p-1.5" style={{ backgroundColor: '#FFFFFF' }}>
                    {onOpenProfileModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 rounded-lg text-[#171717] hover:bg-[#F0EFEA] transition cursor-pointer"
                        style={{ backgroundColor: 'transparent', color: '#171717' }}
                      >
                        <User className="w-3.5 h-3.5 text-[#D21515]" />
                        <span>Profile & Active Token</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 rounded-lg text-[#D21515] hover:bg-[rgba(210,21,21,0.06)] border-t border-[#EBE8E1] mt-1 transition cursor-pointer font-semibold"
                      style={{ backgroundColor: 'transparent', color: '#D21515' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg border border-[#E2DFD7] bg-[#F5F4F0] text-[#737373] hover:text-[#171717]"
              style={{ backgroundColor: '#F5F4F0', color: '#737373' }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};