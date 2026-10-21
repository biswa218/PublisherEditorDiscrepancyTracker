import React from 'react';

export type NavTab = 'dashboard' | 'register' | 'analytics' | 'admin' | 'audit';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openIncidentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openIncidentCount = 0
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Dashboard',
      icon: 'analytics',
      sublabel: 'KPIs & Rework Overview'
    },
    {
      id: 'register' as NavTab,
      label: 'Discrepancy Register',
      icon: 'checklist_rtl',
      badge: openIncidentCount > 0 ? String(openIncidentCount) : undefined,
      sublabel: 'Filter & Search Ledger'
    },
    {
      id: 'analytics' as NavTab,
      label: 'Rework & Attribution',
      icon: 'hub',
      sublabel: 'Editor & Journal Matrices'
    },
    {
      id: 'admin' as NavTab,
      label: 'Taxonomy & Admin',
      icon: 'tune',
      sublabel: 'Categories & Associations'
    },
    {
      id: 'audit' as NavTab,
      label: 'System Audit Trail',
      icon: 'history_toggle_off',
      sublabel: 'Tamper-Evident History'
    }
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-30 flex flex-col justify-between py-4">
      <div className="px-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Scholarly Integrity System
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-all group ${
                isActive
                  ? 'bg-slate-100 text-primary font-semibold border-l-4 border-secondary pl-2'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-lg ${
                    isActive ? 'text-secondary font-bold' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{item.label}</span>
                  <span className="text-[11px] text-slate-400 font-normal leading-tight">
                    {item.sublabel}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Footer Info */}
      <div className="px-4 py-3 border-t border-slate-100 mx-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-semibold text-slate-600">SQLite Monolith Online</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          Taylor &amp; Francis FRD v5.6 Baseline · WAL Mode active
        </div>
      </div>
    </aside>
  );
};

