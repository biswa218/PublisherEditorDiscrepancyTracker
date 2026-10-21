import React, { useEffect, useState } from 'react';
import { DefectCategory, RootCause, Journal, AppUser } from '../types';
import { api } from '../services/api';

interface AdminTaxonomyProps {
  currentUser: AppUser;
}

export const AdminTaxonomy: React.FC<AdminTaxonomyProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'rootCauses' | 'journals' | 'associations' | 'maintenance'>('categories');
  const [categories, setCategories] = useState<DefectCategory[]>([]);
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [editorsWithJournals, setEditorsWithJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Category Form State
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<number | ''>('');

  // New Root Cause Form State
  const [newRcCode, setNewRcCode] = useState('');
  const [newRcName, setNewRcName] = useState('');
  const [newRcCat, setNewRcCat] = useState('Process');
  const [newRcDesc, setNewRcDesc] = useState('');

  // New Journal Form State
  const [newJCode, setNewJCode] = useState('');
  const [newJName, setNewJName] = useState('');
  const [newJIssn, setNewJIssn] = useState('');
  const [newJDiscipline, setNewJDiscipline] = useState('');

  // Editor-Journal Mapping State
  const [mapEditorId, setMapEditorId] = useState<number | ''>('');
  const [mapJournalId, setMapJournalId] = useState<number | ''>('');
  const [mapRoleTitle, setMapRoleTitle] = useState('Editor-in-Chief');

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cRes, rcRes, jRes, ejRes] = await Promise.all([
        api.getCategories(),
        api.getRootCauses(),
        api.getJournals(true),
        api.getEditorsWithJournals()
      ]);
      setCategories(cRes);
      setRootCauses(rcRes);
      setJournals(jRes);
      setEditorsWithJournals(ejRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatCode || !newCatName) return;
    try {
      await api.createCategory({
        category_code: newCatCode,
        category_name: newCatName,
        parent_id: newCatParentId ? Number(newCatParentId) : null,
        description: newCatDesc,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name
      });
      setSuccessMsg(`Defect Category '${newCatName}' created successfully.`);
      setNewCatCode('');
      setNewCatName('');
      setNewCatDesc('');
      setNewCatParentId('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddRootCause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRcCode || !newRcName) return;
    try {
      await api.createRootCause({
        cause_code: newRcCode,
        cause_name: newRcName,
        category: newRcCat,
        description: newRcDesc,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name
      });
      setSuccessMsg(`Root Cause '${newRcName}' registered successfully.`);
      setNewRcCode('');
      setNewRcName('');
      setNewRcDesc('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJCode || !newJName) return;
    try {
      await api.createJournal({
        journal_code: newJCode,
        journal_name: newJName,
        issn: newJIssn,
        discipline: newJDiscipline,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name
      });
      setSuccessMsg(`Journal '${newJName}' added to master registry.`);
      setNewJCode('');
      setNewJName('');
      setNewJIssn('');
      setNewJDiscipline('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMapEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapEditorId || !mapJournalId) return;
    try {
      await api.associateEditorJournal({
        editor_id: Number(mapEditorId),
        journal_id: Number(mapJournalId),
        role_title: mapRoleTitle,
        actor_id: currentUser.id,
        actor_name: currentUser.display_name
      });
      setSuccessMsg(`Editor associated with journal successfully (FR-057).`);
      setMapEditorId('');
      setMapJournalId('');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to initial baseline seed data? This will restore clean test data.')) {
      return;
    }
    try {
      await api.resetSeed();
      setSuccessMsg('SQLite database successfully reset and re-seeded with pristine baseline data.');
      loadAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" data-testid="admin-taxonomy-view">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">tune</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary font-display tracking-tight">
                Taxonomy &amp; Master Reference Configuration
              </h1>
              <span className="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                FR-054..057
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Maintain defect category hierarchies, root-cause taxonomies, publication journals, and editor associations.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
          {[
            { id: 'categories', label: 'Defect Categories (FR-007, FR-054)', icon: 'category' },
            { id: 'rootCauses', label: 'Root Cause Taxonomy (FR-010)', icon: 'psychology' },
            { id: 'journals', label: 'Journals Master Data (FR-057)', icon: 'menu_book' },
            { id: 'associations', label: 'Editor–Journal Links (FR-057)', icon: 'people' },
            { id: 'maintenance', label: 'Database Reset & Seed', icon: 'settings_backup_restore' }
          ].map(tab => (
            <button
              key={tab.id}
              data-testid={`admin-tab-${tab.id}`}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setSuccessMsg(null);
              }}
              className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-secondary text-primary font-bold bg-slate-50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div 
          data-testid="admin-success-banner"
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-primary font-display">
                Approved Defect Classification Taxonomy
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 hover:bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-slate-100 px-2 py-0.5 rounded">
                        {cat.category_code}
                      </span>
                      <span className="font-semibold text-slate-900 text-xs">{cat.category_name}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      ACTIVE
                    </span>
                  </div>
                  {cat.description && <p className="text-xs text-slate-500">{cat.description}</p>}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pl-4 pt-1 space-y-1 border-l-2 border-slate-200 ml-2">
                      {cat.subcategories.map(sub => (
                        <div key={sub.id} className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                          <span className="font-mono font-medium">{sub.category_code}</span>
                          <span>·</span>
                          <span className="font-medium text-slate-800">{sub.category_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Add Defect Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Category Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-category-code-input"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  placeholder="e.g. CAT-DATA"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-category-name-input"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Data Availability Statement"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Parent Category (Optional - For Subcategories)
                </label>
                <select
                  data-testid="new-category-parent-select"
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                >
                  <option value="">-- None (Top-Level Category) --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Operational guidelines and defect examples."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                data-testid="submit-new-category-btn"
                className="w-full py-2 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-all"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Root Causes */}
      {activeTab === 'rootCauses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-primary font-display">
                Root Cause Master Taxonomy (FR-010)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Root Cause Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rootCauses.map((rc) => (
                    <tr key={rc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{rc.cause_code}</td>
                      <td className="px-4 py-3 font-semibold">{rc.cause_name}</td>
                      <td className="px-4 py-3 text-slate-500">{rc.category}</td>
                      <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs">{rc.description || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Root Cause Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Register Root Cause</h3>
            <form onSubmit={handleAddRootCause} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Cause Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-rc-code-input"
                  value={newRcCode}
                  onChange={(e) => setNewRcCode(e.target.value)}
                  placeholder="e.g. RC-VENDOR"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Cause Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-rc-name-input"
                  value={newRcName}
                  onChange={(e) => setNewRcName(e.target.value)}
                  placeholder="e.g. Vendor Parsing Failure"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Classification Category</label>
                <select
                  data-testid="new-rc-category-select"
                  value={newRcCat}
                  onChange={(e) => setNewRcCat(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                >
                  <option value="Human">Human Error</option>
                  <option value="Process">Process Gap</option>
                  <option value="Training">Training Gap</option>
                  <option value="System">System Defect</option>
                  <option value="Configuration">Configuration Issue</option>
                  <option value="Data">Data Quality</option>
                  <option value="Integration">Integration Failure</option>
                  <option value="Communication">Communication Gap</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newRcDesc}
                  onChange={(e) => setNewRcDesc(e.target.value)}
                  placeholder="Defect cause taxonomy description."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                data-testid="submit-new-rc-btn"
                className="w-full py-2 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-all"
              >
                Register Root Cause
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Journals */}
      {activeTab === 'journals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-primary font-display">
                Publication Journals Master Registry (FR-057)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Journal Name</th>
                    <th className="px-4 py-3">ISSN</th>
                    <th className="px-4 py-3">Discipline</th>
                    <th className="px-4 py-3 text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{j.journal_code}</td>
                      <td className="px-4 py-3 font-semibold">{j.journal_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{j.issn || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{j.discipline || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          {j.active === 1 ? 'YES' : 'NO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Journal Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Add Journal</h3>
            <form onSubmit={handleAddJournal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Journal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-journal-code-input"
                  value={newJCode}
                  onChange={(e) => setNewJCode(e.target.value)}
                  placeholder="e.g. BRJ"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Journal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  data-testid="new-journal-name-input"
                  value={newJName}
                  onChange={(e) => setNewJName(e.target.value)}
                  placeholder="e.g. British Robotic Journal"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">ISSN</label>
                <input
                  type="text"
                  value={newJIssn}
                  onChange={(e) => setNewJIssn(e.target.value)}
                  placeholder="e.g. 2381-8901"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Discipline</label>
                <input
                  type="text"
                  value={newJDiscipline}
                  onChange={(e) => setNewJDiscipline(e.target.value)}
                  placeholder="e.g. Engineering & Automation"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                data-testid="submit-new-journal-btn"
                className="w-full py-2 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-container transition-all"
              >
                Register Journal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Editor-Journal Associations */}
      {activeTab === 'associations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-primary font-display">
                Editor–Journal Roster Associations (FR-057)
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {editorsWithJournals.map((ed) => (
                <div key={ed.id} className="p-4 hover:bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-primary text-xs">{ed.display_name}</span>
                      <span className="text-[11px] text-slate-400 block">{ed.email}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ed.journals.length} Associated Journals
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {ed.journals.map((j: any) => (
                      <span key={j.journal_id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[11px]">
                        <span className="font-mono font-bold">[{j.journal_code}]</span>
                        <span>{j.journal_name}</span>
                        <span className="text-[10px] text-teal-600">({j.role_title})</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary font-display">Map Editor to Journal</h3>
            <form onSubmit={handleMapEditor} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Editor <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="map-editor-select"
                  value={mapEditorId}
                  onChange={(e) => setMapEditorId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                  required
                >
                  <option value="">-- Select Editor --</option>
                  {editorsWithJournals.map(e => (
                    <option key={e.id} value={e.id}>{e.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Journal <span className="text-red-500">*</span>
                </label>
                <select
                  data-testid="map-journal-select"
                  value={mapJournalId}
                  onChange={(e) => setMapJournalId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-secondary"
                  required
                >
                  <option value="">-- Select Journal --</option>
                  {journals.map(j => (
                    <option key={j.id} value={j.id}>[{j.journal_code}] {j.journal_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Role Title</label>
                <input
                  type="text"
                  value={mapRoleTitle}
                  onChange={(e) => setMapRoleTitle(e.target.value)}
                  placeholder="e.g. Section Editor"
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:outline-none focus:border-secondary"
                />
              </div>

              <button
                type="submit"
                data-testid="submit-mapping-btn"
                className="w-full py-2 bg-secondary text-white rounded text-xs font-semibold hover:bg-secondary/90 transition-all"
              >
                Assign Association
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Database Reset &amp; Baseline Reseeding
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Resetting the database re-executes the baseline seed script, replenishing initial discrepancies (PED-000001 through PED-000010), journals, categories, root causes, and rework logs.
          </p>
          <button
            type="button"
            data-testid="reset-seed-btn"
            onClick={handleResetSeed}
            className="px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset and Reseed SQLite Database</span>
          </button>
        </div>
      )}
    </div>
  );
};

