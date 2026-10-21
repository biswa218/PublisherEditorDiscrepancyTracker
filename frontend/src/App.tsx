import React, { useEffect, useState } from 'react';
import { AppUser, Journal, DefectCategory, RootCause } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { LogDiscrepancyModal } from './components/LogDiscrepancyModal';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { DiscrepancyRegister } from './pages/DiscrepancyRegister';
import { DiscrepancyDetail } from './pages/DiscrepancyDetail';
import { ReworkAnalytics } from './pages/ReworkAnalytics';
import { AdminTaxonomy } from './pages/AdminTaxonomy';
import { AuditTrail } from './pages/AuditTrail';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState<number | null>(null);
  const [registerFilters, setRegisterFilters] = useState<{ journalId?: number; categoryId?: number; status?: string; editorId?: number } | undefined>();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [categories, setCategories] = useState<DefectCategory[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [editors, setEditors] = useState<AppUser[]>([]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [openIncidentCount, setOpenIncidentCount] = useState(0);

  const loadInitialData = async () => {
    try {
      const [uRes, jRes, cRes, rcRes, kpiRes] = await Promise.all([
        api.getUsers(),
        api.getJournals(),
        api.getCategories(),
        api.getRootCauses(),
        api.getSummaryKPIs()
      ]);
      setUsers(uRes);
      if (uRes.length > 0 && !currentUser) {
        setCurrentUser(uRes[0]); // Eleanor Vance (Publisher) default
      }
      setJournals(jRes);
      setCategories(cRes);
      setRootCauses(rcRes);
      setEditors(uRes.filter(u => u.role === 'Editor'));
      setOpenIncidentCount(kpiRes.openDiscrepancies);
    } catch (err) {
      console.error('Failed to initialize app data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setSelectedDiscrepancyId(null);
  };

  const handleNavigateToRegister = (filters?: { journalId?: number; categoryId?: number; status?: string; editorId?: number }) => {
    setRegisterFilters(filters);
    setSelectedDiscrepancyId(null);
    setCurrentTab('register');
  };

  const handleDiscrepancyCreated = (newId: number) => {
    loadInitialData();
    setSelectedDiscrepancyId(newId);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span className="material-symbols-outlined animate-spin text-2xl text-secondary">
            progress_activity
          </span>
          <span>Initializing Publisher-Editor Discrepancy Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={setCurrentUser}
        onOpenLogModal={() => setIsLogModalOpen(true)}
      />

      <div className="flex flex-1 pt-16">
        {/* Persistent Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          openIncidentCount={openIncidentCount}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 ml-64 min-h-[calc(100vh-4rem)] bg-slate-50/50">
          {selectedDiscrepancyId ? (
            <DiscrepancyDetail
              discrepancyId={selectedDiscrepancyId}
              onBack={() => setSelectedDiscrepancyId(null)}
              currentUser={currentUser}
              allUsers={users}
              rootCauses={rootCauses}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <ExecutiveDashboard
                  onNavigateToRegister={handleNavigateToRegister}
                  onOpenLogModal={() => setIsLogModalOpen(true)}
                />
              )}

              {currentTab === 'register' && (
                <DiscrepancyRegister
                  onSelectDiscrepancy={setSelectedDiscrepancyId}
                  onOpenLogModal={() => setIsLogModalOpen(true)}
                  initialFilters={registerFilters}
                />
              )}

              {currentTab === 'analytics' && (
                <ReworkAnalytics
                  onNavigateToRegister={handleNavigateToRegister}
                />
              )}

              {currentTab === 'admin' && (
                <AdminTaxonomy
                  currentUser={currentUser}
                />
              )}

              {currentTab === 'audit' && (
                <AuditTrail />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Log Discrepancy Modal */}
      <LogDiscrepancyModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={handleDiscrepancyCreated}
        journals={journals}
        categories={categories}
        rootCauses={rootCauses}
        editors={editors}
        currentUser={currentUser}
      />
    </div>
  );
};

