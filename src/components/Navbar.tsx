import React from 'react';
import {
  Radar,
  Building2,
  ListFilter,
  MessageSquareText,
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  Bot,
  Zap,
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  LogOut
} from 'lucide-react';
import { BusinessType, CompanyProfile, AdminUser } from '../types';
import { MarketLeadLogo } from './MarketLeadLogo';

interface NavbarProps {
  activeTab: 'scraper' | 'company' | 'catalog' | 'conversations' | 'proposals' | 'admin';
  setActiveTab: (tab: 'scraper' | 'company' | 'catalog' | 'conversations' | 'proposals' | 'admin') => void;
  selectedBusinessType: BusinessType | null;
  companyProfile: CompanyProfile | null;
  openCompanyModal: () => void;
  isScraping: boolean;
  totalDemandsCount: number;
  currentUser: AdminUser | null;
  onLogout?: () => void;
  firestoreConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedBusinessType,
  companyProfile,
  openCompanyModal,
  isScraping,
  totalDemandsCount,
  currentUser,
  onLogout,
  firestoreConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              if (currentUser) {
                setActiveTab('scraper');
              } else {
                setActiveTab('admin');
              }
            }}
          >
            <MarketLeadLogo size="md" />
          </div>

          {/* Navigation Tabs */}
          {currentUser ? (
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="nav-tab-scraper"
                onClick={() => setActiveTab('scraper')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'scraper'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Radar className={`h-4 w-4 ${isScraping ? 'animate-spin text-amber-300' : ''}`} />
                <span>Scraper & Demands</span>
                {totalDemandsCount > 0 && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'scraper' ? 'bg-teal-700 text-white' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {totalDemandsCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-company"
                onClick={() => setActiveTab('company')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'company'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Company Page</span>
              </button>

              <button
                id="nav-tab-catalog"
                onClick={() => setActiveTab('catalog')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Business Types</span>
              </button>

              <button
                id="nav-tab-conversations"
                onClick={() => setActiveTab('conversations')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'conversations'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <MessageSquareText className="h-4 w-4" />
                <span>Outreach Hub</span>
              </button>

              <button
                id="nav-tab-proposals"
                onClick={() => setActiveTab('proposals')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'proposals'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Proposals</span>
              </button>

              {/* Dedicated Admin Page Tab */}
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Admin Panel</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">
              <Lock className="h-3.5 w-3.5 text-teal-600" />
              <span>Authentication Gateway • Sign in to access workspace modules</span>
            </div>
          )}

          {/* Right Action: Active Company / Business Type Pill & Admin Quick Status */}
          <div className="flex items-center space-x-2.5">
            {/* Firestore Cloud Sync Status */}
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600"
              title="Persistent cloud storage enabled with Firebase Firestore"
            >
              <Database className="h-3.5 w-3.5 text-teal-600" />
              <span>Firestore Sync</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {currentUser && (
              <button
                id="header-company-profile-btn"
                onClick={openCompanyModal}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-800 transition-colors shadow-xs cursor-pointer"
                title="Click to configure company profile"
              >
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                <div className="text-left">
                  <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                    {companyProfile?.companyName || 'My Company'}
                  </span>
                  <span className="block font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[170px]">
                    {selectedBusinessType?.business_type_name || 'Select Business Type'}
                  </span>
                </div>
              </button>
            )}

            {/* Admin Avatar / Login trigger */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <button
                  id="header-admin-portal-btn"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                  }`}
                  title={`Logged in as ${currentUser.name} (${currentUser.role})`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                </button>

                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out of Session"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                id="header-admin-portal-btn"
                onClick={() => setActiveTab('admin')}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 shadow-xs transition-all cursor-pointer"
                title="Sign in via Admin Portal"
              >
                <Lock className="h-3.5 w-3.5 text-teal-300" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        {currentUser ? (
          <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-200 overflow-x-auto space-x-1">
            <button
              onClick={() => setActiveTab('scraper')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'scraper' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Scraper
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'company' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Company
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'catalog' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'conversations' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Outreach
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'proposals' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Proposals
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-teal-600 text-white' : 'text-slate-600'
              }`}
            >
              Admin
            </button>
          </div>
        ) : (
          <div className="md:hidden flex items-center justify-center py-2 border-t border-slate-200 text-xs text-slate-500 font-medium">
            <Lock className="h-3 w-3 text-teal-600 mr-1.5" />
            <span>Sign in to access workspace</span>
          </div>
        )}
      </div>
    </header>
  );
};

