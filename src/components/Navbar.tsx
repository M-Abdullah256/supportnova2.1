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
      case 'Customer': return <User className="w-3 h-3" />;
      case 'Agent': return <Bot className="w-3 h-3" />;
      case 'Reviewer': return <UserCheck className="w-3 h-3" />;
      case 'Manager': return <BarChart3 className="w-3 h-3" />;
      case 'Administrator': return <Settings className="w-3 h-3" />;
    }
  };

  const initials = currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase();

  return (
    <header className="support-navbar w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px] gap-4">

          {/* ---------- Brand & Role ---------- */}
          <div className="flex items-center gap-4 shrink-0 min-w-0">
            <span className="navbar-wordmark">SupportNova</span>

            <span className="navbar-role-badge">
              <span className="navbar-role-icon">{getRoleIcon(currentUser.role)}</span>
              <span>{getRoleLabel(currentUser.role)}</span>
            </span>
          </div>

          {/* ---------- Search ---------- */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
            <div className="navbar-search">
              <Search className="navbar-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  currentUser.role === 'Customer'
                    ? 'Search my tickets or orders…'
                    : 'Search requests, customers, or tags…'
                }
                className="navbar-search-input"
              />
              <span className="navbar-search-kbd">⌘K</span>
            </div>
          </div>

          {/* ---------- Right cluster ---------- */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* Customer CTA */}
            {currentUser.role === 'Customer' && onNewComplaintClick && (
              <button
                type="button"
                onClick={onNewComplaintClick}
                className="navbar-cta"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>
            )}

            {/* Reviewer priority badge */}
            {currentUser.role === 'Reviewer' && manualReviewCount > 0 && (
              <div className="navbar-alert">
                <span className="navbar-alert-dot">
                  <span className="navbar-alert-dot-ping" />
                  <span className="navbar-alert-dot-core" />
                </span>
                <AlertTriangle className="w-3 h-3" />
                <span>{manualReviewCount} to Review</span>
              </div>
            )}

            {/* Active counter for managers/admins */}
            {(currentUser.role === 'Manager' || currentUser.role === 'Administrator') && totalComplaints > 0 && (
              <div className="navbar-counter">
                <span className="navbar-counter-num">{totalComplaints}</span>
                <span className="navbar-counter-label">Active</span>
              </div>
            )}

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="navbar-profile"
              >
                <div className="navbar-profile-avatar">{initials}</div>
                <div className="navbar-profile-text">
                  <p className="navbar-profile-name">{currentUser.name}</p>
                  <p className="navbar-profile-sub">
                    {currentUser.department || currentUser.role}
                  </p>
                </div>
                <ChevronDown
                  className={`navbar-profile-chev ${profileDropdownOpen ? 'is-open' : ''}`}
                />
              </button>

              {profileDropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-head">
                    <div className="flex items-center gap-2.5">
                      <div className="navbar-profile-avatar navbar-profile-avatar-lg">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="navbar-dropdown-name">{currentUser.name}</p>
                        <p className="navbar-dropdown-email">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="navbar-dropdown-role">{currentUser.role}</span>
                      {currentUser.department && (
                        <span className="navbar-dropdown-dept">
                          <Building className="w-3 h-3" />
                          <span className="truncate max-w-[130px]">
                            {currentUser.department}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="navbar-dropdown-body">
                    {onOpenProfileModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="navbar-dropdown-item"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile & Active Token</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSignOut();
                      }}
                      className="navbar-dropdown-item navbar-dropdown-item-danger"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-mobile-toggle"
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