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
  UserCheck
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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scraper')}>
            <MarketLeadLogo size="md" />
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-tab-scraper"
              onClick={() => setActiveTab('scraper')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {currentUser ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Admin Panel</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-teal-600" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </nav>

          {/* Right Action: Active Company / Business Type Pill & Admin Quick Status */}
          <div className="flex items-center space-x-2.5">
            <button
              id="header-company-profile-btn"
              onClick={openCompanyModal}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-800 transition-colors shadow-xs"
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

            {/* Admin Avatar / Login trigger */}
            <button
              id="header-admin-portal-btn"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                currentUser
                  ? 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800 shadow-xs'
              }`}
              title={currentUser ? `Logged in as ${currentUser.name} (${currentUser.role})` : 'Sign in via Admin Page'}
            >
              {currentUser ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-teal-300" />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
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
            {currentUser ? 'Admin' : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};

