import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  Lock,
  LogOut,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  BarChart3,
  Server,
  Key,
  Layers
} from 'lucide-react';
import { AdminUser, BusinessType, CustomerDemand, CompanyProfile } from '../types';
import { ADMIN_ACCOUNTS } from '../data/countries';

interface AdminPanelProps {
  currentUser: AdminUser | null;
  onLogin: (user: AdminUser) => void;
  onLogout: () => void;
  businessTypes: BusinessType[];
  onAddBusinessType: (bt: BusinessType) => void;
  onDeleteBusinessType: (id: string) => void;
  demands: CustomerDemand[];
  onClearAllDemands: () => void;
  onSeedSampleDemands: () => void;
  companyProfile: CompanyProfile;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onLogin,
  onLogout,
  businessTypes,
  onAddBusinessType,
  onDeleteBusinessType,
  demands,
  onClearAllDemands,
  onSeedSampleDemands,
  companyProfile,
}) => {
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@marketlead.io');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');

  // Admin Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'catalog' | 'demands' | 'users' | 'system'>('overview');

  // New Business Type Form State
  const [newBtName, setNewBtName] = useState('');
  const [newBtSector, setNewBtSector] = useState('Enterprise Technology & IT');
  const [newBtDeliveryMode, setNewBtDeliveryMode] = useState<'Online' | 'Offline' | 'Hybrid'>('Hybrid');
  const [newBtDesc, setNewBtDesc] = useState('');
  const [newBtDeliverables, setNewBtDeliverables] = useState('');
  const [newBtPriceRange, setNewBtPriceRange] = useState('$15,000 - $45,000');

  // Search in Business Types
  const [btSearch, setBtSearch] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = ADMIN_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === loginEmail.trim().toLowerCase() && acc.password === loginPassword.trim()
    );
    if (found) {
      onLogin({
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role as any,
        lastLogin: new Date().toISOString(),
      });
    } else {
      setLoginError('Invalid credentials. Check predefined admin credentials or enter valid password.');
    }
  };

  const handleCreateBusinessType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBtName.trim()) return;

    const newId = `BT-CUSTOM-${Date.now().toString().slice(-4)}`;
    const newBT: BusinessType = {
      business_id: newId,
      business_type_name: newBtName.trim(),
      online_or_onsite: newBtDeliveryMode === 'Offline' ? 'Onsite' : newBtDeliveryMode,
      place: 'Commercial Sector',
      approximately_area: '150 m2',
      popularity: 'High',
      delivery_mode: newBtDeliveryMode,
      business_description: newBtDesc.trim() || `Enterprise services for ${newBtName.trim()}`,
      deliverables: newBtDeliverables
        ? newBtDeliverables.split('\n').filter((d) => d.trim().length > 0)
        : ['Core Implementation', 'Milestone QA Deliverables', 'Turnkey Handover & Support'],
      target_customer_profiles: ['Enterprise Organizations', 'Mid-market Commercial Firms'],
      typical_price_range: newBtPriceRange.trim() || '$20,000 - $50,000',
    };

    onAddBusinessType(newBT);
    setNewBtName('');
    setNewBtDesc('');
    setNewBtDeliverables('');
    alert(`Added business type "${newBT.business_type_name}" with ID: ${newBT.business_id}`);
  };

  const filteredBusinessTypes = businessTypes.filter(
    (bt) =>
      bt.business_type_name.toLowerCase().includes(btSearch.toLowerCase()) ||
      bt.business_id.toLowerCase().includes(btSearch.toLowerCase()) ||
      bt.delivery_mode.toLowerCase().includes(btSearch.toLowerCase())
  );

  // If not logged in, render the secure login gate
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-md">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Control Portal</h2>
          <p className="text-xs text-slate-500">
            Sign in to manage catalog taxonomy, AI scraping parameters, system telemetry, and accounts.
          </p>
        </div>

        {loginError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Administrator Email</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Authenticate & Access Admin
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Quick Demo Credentials
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
            <div>
              <span className="text-teal-700 font-bold">SuperAdmin:</span> admin@marketlead.io / admin123
            </div>
            <div>
              <span className="text-purple-700 font-bold">Editor:</span> ops@marketlead.io / ops123
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, render the full admin dashboard
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                MarketLead Central Administration
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform Telemetry', icon: BarChart3 },
          { id: 'catalog', label: `Business Types (${businessTypes.length})`, icon: FileSpreadsheet },
          { id: 'demands', label: `Scraped Pipeline (${demands.length})`, icon: Database },
          { id: 'users', label: 'Admin Accounts', icon: Users },
          { id: 'system', label: 'Engine Config & AI Rules', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TELEMETRY OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Catalog Types</span>
              <div className="text-2xl font-black text-slate-900">{businessTypes.length}</div>
              <div className="text-[11px] text-teal-600 font-medium">500+ Taxonomy Registry</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Live Pipeline Demands</span>
              <div className="text-2xl font-black text-slate-900">{demands.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {demands.filter((d) => d.status === 'Won').length} Won Deals
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Active ISO Nations</span>
              <div className="text-2xl font-black text-slate-900">249</div>
              <div className="text-[11px] text-purple-600 font-medium">Full Global Coverage</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">A2A Protocol Status</span>
              <div className="text-2xl font-black text-cyan-600">Online</div>
              <div className="text-[11px] text-slate-500 font-mono">v1.2 Agent Handshake</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pipeline Deal Stage Breakdown
              </h3>
              <div className="space-y-2">
                {['New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won'].map((st) => {
                  const count = demands.filter((d) => d.status === st).length;
                  const pct = demands.length > 0 ? (count / demands.length) * 100 : 0;
                  return (
                    <div key={st} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{st}</span>
                        <span className="text-slate-900 font-mono">
                          {count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quick Platform Operations
              </h3>
              <div className="space-y-2">
                <button
                  onClick={onSeedSampleDemands}
                  className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-teal-600" />
                    <span>Seed Real Sample Demands Pipeline</span>
                  </span>
                  <span className="text-[10px] bg-teal-200/60 px-2 py-0.5 rounded font-mono">+6 Leads</span>
                </button>

                <button
                  onClick={onClearAllDemands}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span>Reset & Flush Demands Pipeline</span>
                  </span>
                  <span className="text-[10px] bg-rose-200/60 px-2 py-0.5 rounded font-mono">Clean DB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS TYPES CATALOG */}
      {activeAdminTab === 'catalog' && (
        <div className="space-y-6">
          {/* Create New Business Type Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <Plus className="h-4 w-4 text-teal-600" />
              <span>Register New Business Type in Catalog</span>
            </h3>
            <form onSubmit={handleCreateBusinessType} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Type Name *</label>
                  <input
                    type="text"
                    required
                    value={newBtName}
                    onChange={(e) => setNewBtName(e.target.value)}
                    placeholder="e.g. Autonomous Drone Mapping"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sector Classification</label>
                  <input
                    type="text"
                    value={newBtSector}
                    onChange={(e) => setNewBtSector(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Mode</label>
                  <select
                    value={newBtDeliveryMode}
                    onChange={(e) => setNewBtDeliveryMode(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline / On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
                  <textarea
                    rows={2}
                    value={newBtDesc}
                    onChange={(e) => setNewBtDesc(e.target.value)}
                    placeholder="Describe typical requirements, deliverables, and capabilities..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Deliverables (One per line)</label>
                  <textarea
                    rows={2}
                    value={newBtDeliverables}
                    onChange={(e) => setNewBtDeliverables(e.target.value)}
                    placeholder="Milestone 1&#10;Milestone 2&#10;QA Handover"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Add Business Type to 500+ Taxonomy
              </button>
            </form>
          </div>

          {/* Catalog Listing Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Registered Catalog ({filteredBusinessTypes.length} of {businessTypes.length})
              </h3>
              <input
                type="text"
                value={btSearch}
                onChange={(e) => setBtSearch(e.target.value)}
                placeholder="Search business types by name, ID, or mode..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 w-full sm:w-72"
              />
            </div>

            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Business ID</th>
                    <th className="py-2.5 px-3">Business Type Name</th>
                    <th className="py-2.5 px-3">Delivery Mode</th>
                    <th className="py-2.5 px-3">Price Range</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredBusinessTypes.slice(0, 100).map((bt) => (
                    <tr key={bt.business_id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{bt.business_id}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{bt.business_type_name}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {bt.delivery_mode}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-700">{bt.typical_price_range || '$20,000 - $50,000'}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onDeleteBusinessType(bt.business_id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete from Catalog"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              Showing first 100 rows. Use search box for complete taxonomy lookup.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: DEMANDS PIPELINE AUDIT */}
      {activeAdminTab === 'demands' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Active Scraped Customer Demands ({demands.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onSeedSampleDemands}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Seed Leads
              </button>
              <button
                onClick={onClearAllDemands}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Flush All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Budget</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {demands.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{d.customerCompany}</td>
                    <td className="py-2.5 px-3">
                      <div>{d.contactPerson}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.email}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{d.businessTypeName}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 font-mono">{d.budgetRange}</td>
                    <td className="py-2.5 px-3 text-slate-500">{d.location}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN ACCOUNTS */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Registered Platform Administrative Accounts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADMIN_ACCOUNTS.map((acc) => (
              <div key={acc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{acc.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800 uppercase">
                    {acc.role}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-600">{acc.email}</div>
                <div className="text-[10px] text-slate-400">Account ID: {acc.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM ENGINES */}
      {activeAdminTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Engine Telemetry & Runtime Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">Scraping Strategy</div>
              <p className="text-slate-600">
                Server-side proxy configured with client-side fallback. Ingests procurement RFPs, enterprise demands, and A2A buyer endpoints.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">Gemini LLM Integration</div>
              <p className="text-slate-600">
                Uses <code>gemini-2.5-flash</code> for rapid demand parsing and cold email drafting, and <code>gemini-2.5-pro</code> with thinking mode for complex commercial proposals.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">A2A Autonomous Agent Handshake</div>
              <p className="text-slate-600">
                Protocol adheres to structured JSON exchange including Capability Matching, Commercial Scoping, SLA Guarantees, and Final Agreement Sign-off.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">ISO Country Registry</div>
              <p className="text-slate-600">
                249 officially registered ISO 3166-1 alpha-2 nations with integrated flag iconography and dialing codes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
