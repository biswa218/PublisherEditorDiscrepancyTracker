import React from 'react';
import { AppUser, UserRole } from '../types';

interface HeaderProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onOpenLogModal: () => void;
  onSearchGlobal?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onOpenLogModal,
  onSearchGlobal
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-surface-container shadow-sm z-40">
      <div className="w-full h-16 px-6 flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded bg-primary-container text-white flex items-center justify-center font-bold font-display text-lg tracking-wider shadow-inner">
            TF
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-primary font-display tracking-tight">
                Taylor &amp; Francis
              </span>
              <span className="text-xs bg-primary-container text-white px-1.5 py-0.5 rounded font-mono font-medium">
                DISCREPANCY TRACKER
              </span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium tracking-wide">
              Scholarly Operations &amp; Attribution Intelligence
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search discrepancies, manuscripts, journals..."
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded text-sm text-on-surface placeholder:text-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              onChange={(e) => onSearchGlobal && onSearchGlobal(e.target.value)}
            />
          </div>
        </div>

        {/* Right side controls: Role Switcher & Log Discrepancy Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Role / User Switcher */}
          <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1 rounded border border-slate-200">
            <span className="material-symbols-outlined text-slate-500 text-base">
              badge
            </span>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                Active Persona
              </span>
              <select
                aria-label="Active Persona"
                data-testid="user-role-select"
                value={currentUser.id}
                onChange={(e) => {
                  const u = allUsers.find(x => x.id === Number(e.target.value));
                  if (u) onSelectUser(u);
                }}
                className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.display_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            data-testid="log-discrepancy-btn"
            onClick={onOpenLogModal}
            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-primary-container px-3.5 py-1.5 rounded text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-base">
              add_circle
            </span>
            <span>Log Discrepancy</span>
          </button>
        </div>
      </div>
    </header>
  );
};

