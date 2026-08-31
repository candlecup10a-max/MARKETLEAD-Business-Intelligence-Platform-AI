import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Activity,
  ArrowRight,
  Shield,
  FileCheck2,
  Radar,
  Building2,
  Users
} from 'lucide-react';
import { MarketLeadLogo } from './MarketLeadLogo';
import { AdminUser, BusinessType } from '../types';

interface AdminPageProps {
  currentUser: AdminUser | null;
  onLogin: (user: AdminUser) => void;
  onLogout: () => void;
  onNavigateTab: (tab: 'scraper' | 'company' | 'catalog' | 'conversations' | 'proposals') => void;
  selectedBusinessType: BusinessType;
  totalDemandsCount: number;
}

const PRESET_ADMINS: {
  role: AdminUser['role'];
  name: string;
  email: string;
  pass: string;
  badgeColor: string;
  permissions: string[];
}[] = [
  {
    role: 'Super Admin',
    name: 'Sarah Chen',
    email: 'admin@marketlead.io',
    pass: 'admin123',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    permissions: ['Full System Scraper Access', 'A2A Agent Orchestration', 'Database Export', 'Financial Proposals Approval', 'User Management'],
  },
  {
    role: 'Lead Ops Manager',
    name: 'Marcus Vance',
    email: 'ops@marketlead.io',
    pass: 'leadops2026',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    permissions: ['Web Scraper Execution', 'Country Filter Management', 'Demand Enrichment', 'Outreach Queue'],
  },
  {
    role: 'Commercial Executive',
    name: 'Elena Rostova',
    email: 'exec@marketlead.io',
    pass: 'execmarket',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    permissions: ['Proposal Vault', 'Direct Client Negotiation', 'Won Deals Tracking', 'Executive Analytics'],
  },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateTab,
  selectedBusinessType,
  totalDemandsCount,
}) => {
  // Login form state
  const [email, setEmail] = useState('admin@marketlead.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminUser['role']>('Super Admin');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Quick preset login handler
  const handleSelectPreset = (preset: (typeof PRESET_ADMINS)[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setRole(preset.role);
    setErrorMsg(null);
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter a valid administrator email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    // Simulate secure authentication verification
    setTimeout(() => {
      setIsLoading(false);
      // Look for matching preset or create authenticated session
      const matchedPreset = PRESET_ADMINS.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      const authenticatedUser: AdminUser = {
        id: matchedPreset ? `ADM-${matchedPreset.role.substring(0, 3).toUpperCase()}-01` : 'ADM-USR-99',
        name: matchedPreset ? matchedPreset.name : email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        email: email.trim(),
        role: role,
        lastLogin: new Date().toLocaleString(),
        permissions: matchedPreset
          ? matchedPreset.permissions
          : ['Web Scraper Execution', 'Customer Outreach', 'Proposal Management'],
      };

      onLogin(authenticatedUser);
      setSuccessNotice(`Welcome back, ${authenticatedUser.name}!`);
    }, 600);
  };

  // If user is already authenticated, show the Admin Dashboard & Management Hub
  if (currentUser) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Admin Session Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-teal-600/20 shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">{currentUser.name}</h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Session Active</span>
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center space-x-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{currentUser.email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Logged in: {currentUser.lastLogin}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Operational Launchpad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateTab('scraper')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Radar className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Launch</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Scraper & Demands Engine</div>
              <p className="text-xs text-slate-500 mt-1">
                {totalDemandsCount} live leads cached for {selectedBusinessType.business_type_name}.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('company')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Company & A2A Profile</div>
              <p className="text-xs text-slate-500 mt-1">
                Configure corporate identity, services catalog, and A2A negotiation rules.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('proposals')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Review</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Commercial Proposal Vault</div>
              <p className="text-xs text-slate-500 mt-1">
                Track tiered proposals, scope documents, and client negotiation milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Permissions Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permissions Granted */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">Active Role Permissions</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {currentUser.permissions.length} Authorized Capabilities
              </span>
            </div>

            <div className="space-y-2">
              {currentUser.permissions.map((perm, idx) => (
                <div
                  key={`perm-${idx}-${perm}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="font-medium text-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{perm}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    GRANTED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Security & Core Health */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-teal-600" />
                <h2 className="text-sm font-bold text-slate-900">System Infrastructure Status</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Web Scraper Cluster</div>
                <div className="text-sm font-bold text-slate-900 mt-1">249 Regions Online</div>
                <div className="text-[11px] text-teal-600 mt-0.5">ISO 3166-1 Global Mesh</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">AI Grounding Core</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Gemini 2.5 Active</div>
                <div className="text-[11px] text-teal-600 mt-0.5">Automated Match Scoring</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">A2A Handshake Protocol</div>
                <div className="text-sm font-bold text-slate-900 mt-1">v2.4 JSON-RPC Encrypted</div>
                <div className="text-[11px] text-teal-600 mt-0.5">Mutual Token Auth</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Authentication Engine</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Admin Portal Guard</div>
                <div className="text-[11px] text-emerald-600 mt-0.5">Zero Third-Party Leaks</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start space-x-2">
                <Shield className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Admin authentication runs entirely via your dedicated internal administrative gateway without external tracking.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the Login Page (No Google, pure dedicated admin login)
  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Visual Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
              <MarketLeadLogo size="md" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="h-3 w-3" />
              <span>Admin Portal Gateway</span>
            </div>

            <h1 className="text-xl font-bold text-white">Administrator Sign In</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Sign in with your administrator credentials to access the MarketLead scraper engine and commercial suite.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Demo Credentials Autofill Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <KeyRound className="h-3 w-3 text-teal-600" />
                <span>Quick Demo Admin Accounts</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {PRESET_ADMINS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    email === preset.email
                      ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600 font-semibold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{preset.role}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{preset.email}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Administrator Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@marketlead.io"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[10px] text-slate-400">Encrypted</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-teal-600" />}
                </button>
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Administrator Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUser['role'])}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                >
                  <option value="Super Admin">Super Admin (Full Root Access)</option>
                  <option value="Lead Ops Manager">Lead Ops Manager (Scraper & Enrichment)</option>
                  <option value="Commercial Executive">Commercial Executive (Proposals & Deals)</option>
                </select>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-[11px] text-teal-700 font-medium">Internal Gateway Only</span>
            </div>

            {/* Submit button */}
            <button
              id="admin-submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Privacy & No Google Notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              <span>Direct credentials login • No third-party OAuth tracking</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
