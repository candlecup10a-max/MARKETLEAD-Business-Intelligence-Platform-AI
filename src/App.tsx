import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BusinessTypeSelector } from './components/BusinessTypeSelector';
import { CompanyPage } from './components/CompanyPage';
import { ScraperDashboard } from './components/ScraperDashboard';
import { DemandDetailModal } from './components/DemandDetailModal';
import { ConversationsHub } from './components/ConversationsHub';
import { ProposalsVault } from './components/ProposalsVault';
import { AdminPage } from './components/AdminPage';
import { DEFAULT_BUSINESS_TYPES } from './data/defaultBusinessTypes';
import { BusinessType, CompanyProfile, CustomerDemand, DemandStatus, AdminUser, Proposal, MessageLog } from './types';
import { scrapeDemandsApi } from './services/apiService';

const STORAGE_KEYS = {
  USER: 'marketlead_admin_user',
  BUSINESS_TYPES: 'marketlead_business_types',
  PROFILES: 'marketlead_company_profiles',
  DEMANDS: 'marketlead_demands_by_business',
  SELECTED_TYPE_ID: 'marketlead_selected_type_id',
};

export function App() {
  // Business Types State with LocalStorage Persistence
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_TYPES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored business types:', e);
    }
    return DEFAULT_BUSINESS_TYPES;
  });

  // Selected Business Type
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.SELECTED_TYPE_ID);
      if (savedId) {
        const found = businessTypes.find((b) => b.business_id === savedId);
        if (found) return found;
      }
    } catch {}
    return (
      businessTypes[0] ||
      DEFAULT_BUSINESS_TYPES[0] || {
        business_id: 'BUS-0001',
        business_type_name: 'Software Development & IT Consulting',
        online_or_onsite: 'Hybrid',
        place: 'Business Center',
        approximately_area: '200 m2',
        popularity: 'Very High',
      }
    );
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'scraper' | 'company' | 'catalog' | 'conversations' | 'proposals' | 'admin'>('scraper');

  // Authenticated Admin User Session (Stored in localStorage)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error(e);
    }
  };

  // Company Profiles Cache (keyed by business_id) with LocalStorage Persistence
  const [companyProfiles, setCompanyProfiles] = useState<Record<string, CompanyProfile>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load company profiles:', e);
    }
    return {};
  });

  // Current Company Profile
  const currentCompanyProfile: CompanyProfile = companyProfiles[selectedBusinessType.business_id] || {
    companyName: `Apex ${selectedBusinessType.business_type_name.split(' ')[0]} Solutions`,
    tagline: `Next-generation certified ${selectedBusinessType.business_type_name.toLowerCase()} operations.`,
    businessCategory: selectedBusinessType.business_type_name,
    businessId: selectedBusinessType.business_id,
    location: selectedBusinessType.place === 'Virtual / Cloud Space' ? 'Global Cloud Operations' : 'Austin, TX & Worldwide',
    website: 'https://apex-enterprise-solutions.com',
    contactEmail: 'contact@apex-solutions.com',
    contactPhone: '+1 415 555 0199',
    a2aAgentId: `A2A-AGENT-${selectedBusinessType.business_id.replace(/[^0-9]/g, '') || '9901'}`,
    pricingModel: 'Milestone-Based Fixed Scope & Retainers',
    valueProposition: `We deliver enterprise-grade ${selectedBusinessType.business_type_name} with guaranteed turnaround times, verified quality assurance, and automated A2A procurement protocols.`,
    services: [
      `Full-Spectrum ${selectedBusinessType.business_type_name}`,
      '24/7 Quality SLA Assurance',
      'Autonomous Machine-to-Machine (A2A) Procurement',
      'Rapid Turnaround Execution',
    ],
    bio: `Apex Solutions is a tier-one commercial organization providing enterprise ${selectedBusinessType.business_type_name} to high-growth businesses and organizations.`,
  };

  // Demands state (keyed by business_id) with LocalStorage Persistence
  const [demandsByBusiness, setDemandsByBusiness] = useState<Record<string, CustomerDemand[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEMANDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          const sanitized: Record<string, CustomerDemand[]> = {};
          for (const [key, list] of Object.entries(parsed)) {
            if (Array.isArray(list)) {
              sanitized[key] = list.map((item: any) => ({
                ...item,
                leadOrigin: item.leadOrigin === 'user-imported' ? 'user-imported' : 'web-scraped',
              }));
            }
          }
          return sanitized;
        }
      }
    } catch (e) {
      console.warn('Failed to load demands by business:', e);
    }
    return {};
  });

  const [isScraping, setIsScraping] = useState<boolean>(false);

  // Modal State for Selected Customer Demand
  const [selectedDemand, setSelectedDemand] = useState<CustomerDemand | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal'>('overview');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMANDS, JSON.stringify(demandsByBusiness));
    } catch (e) {
      console.warn('Failed to save demands to localStorage:', e);
    }
  }, [demandsByBusiness]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(companyProfiles));
    } catch (e) {
      console.warn('Failed to save profiles to localStorage:', e);
    }
  }, [companyProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESS_TYPES, JSON.stringify(businessTypes));
    } catch (e) {
      console.warn('Failed to save business types to localStorage:', e);
    }
  }, [businessTypes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TYPE_ID, selectedBusinessType.business_id);
    } catch (e) {}
  }, [selectedBusinessType.business_id]);

  // Current Demands for the selected category
  const currentDemands = demandsByBusiness[selectedBusinessType.business_id] || [];

  // Scraper API Call (default up to 100 demands)
  const handleRunScraper = async (bt: BusinessType = selectedBusinessType, count: number = 100) => {
    setIsScraping(true);
    try {
      const demands = await scrapeDemandsApi(bt, count);
      if (Array.isArray(demands) && demands.length > 0) {
        setDemandsByBusiness((prev) => {
          const existingList: CustomerDemand[] = prev[bt.business_id] || [];
          // Preserve any existing communicationLogs and proposals if matching IDs exist
          const existingMap = new Map<string, CustomerDemand>(existingList.map((item) => [item.id, item]));
          const merged: CustomerDemand[] = demands.map((d) => {
            const match = existingMap.get(d.id);
            if (match) {
              return {
                ...d,
                status: match.status !== 'New' ? match.status : d.status,
                communicationLogs: match.communicationLogs?.length ? match.communicationLogs : d.communicationLogs,
                proposals: match.proposals?.length ? match.proposals : d.proposals,
                a2aLogs: match.a2aLogs?.length ? match.a2aLogs : d.a2aLogs,
              };
            }
            return d;
          });

          return {
            ...prev,
            [bt.business_id]: merged,
          };
        });
      }
    } catch (err) {
      console.error('Scraping error:', err);
    } finally {
      setIsScraping(false);
    }
  };

  // Initial load: scrape for default selected category if empty
  useEffect(() => {
    if (!demandsByBusiness[selectedBusinessType.business_id] || demandsByBusiness[selectedBusinessType.business_id].length === 0) {
      handleRunScraper(selectedBusinessType, 100);
    }
  }, [selectedBusinessType.business_id]);

  // Handle Select Business Type
  const handleSelectBusinessType = (bt: BusinessType) => {
    setSelectedBusinessType(bt);
    if (!demandsByBusiness[bt.business_id] || demandsByBusiness[bt.business_id].length === 0) {
      handleRunScraper(bt, 100);
    }
  };

  // Handle Add Custom Business Type
  const handleAddCustomBusinessType = (customBt: BusinessType) => {
    setBusinessTypes((prev) => [customBt, ...prev]);
    setSelectedBusinessType(customBt);
    handleRunScraper(customBt, 100);
  };

  // Handle Import CSV
  const handleImportCSV = (newTypes: BusinessType[]) => {
    setBusinessTypes((prev) => [...newTypes, ...prev]);
    if (newTypes.length > 0) {
      setSelectedBusinessType(newTypes[0]);
      handleRunScraper(newTypes[0], 100);
    }
  };

  // Handle Save Company Profile
  const handleSaveCompanyProfile = (profile: CompanyProfile) => {
    setCompanyProfiles((prev) => ({
      ...prev,
      [selectedBusinessType.business_id]: profile,
    }));
  };

  // Handle Open Customer Modal
  const handleOpenCustomerModal = (
    demand: CustomerDemand,
    initialTab: 'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal' = 'overview'
  ) => {
    setSelectedDemand(demand);
    setModalInitialTab(initialTab);
  };

  // Handle Update Demand (status, communication logs, proposals)
  const handleUpdateDemand = (updatedDemand: CustomerDemand) => {
    setDemandsByBusiness((prev) => {
      const next = { ...prev };
      // Search in all categories to update wherever this demand belongs
      let found = false;
      for (const [bizId, list] of Object.entries(next) as [string, CustomerDemand[]][]) {
        const idx = list.findIndex((d) => d.id === updatedDemand.id);
        if (idx !== -1) {
          const updatedList = [...list];
          updatedList[idx] = updatedDemand;
          next[bizId] = updatedList;
          found = true;
        }
      }
      if (!found) {
        const currentList = next[selectedBusinessType.business_id] || [];
        next[selectedBusinessType.business_id] = currentList.map((d) =>
          d.id === updatedDemand.id ? updatedDemand : d
        );
      }
      return next;
    });

    if (selectedDemand && selectedDemand.id === updatedDemand.id) {
      setSelectedDemand(updatedDemand);
    }
  };

  // Handle Save Proposal
  const handleSaveProposal = (demandId: string, proposal: Proposal) => {
    setDemandsByBusiness((prev) => {
      const next = { ...prev };
      for (const [bizId, list] of Object.entries(next) as [string, CustomerDemand[]][]) {
        const idx = list.findIndex((d) => d.id === demandId);
        if (idx !== -1) {
          const target = list[idx];
          const existingProposals = target.proposals || [];
          const pIdx = existingProposals.findIndex((p) => p.id === proposal.id);
          let updatedProposals: Proposal[];
          if (pIdx !== -1) {
            updatedProposals = existingProposals.map((p) => (p.id === proposal.id ? proposal : p));
          } else {
            updatedProposals = [proposal, ...existingProposals];
          }

          const updatedDemand: CustomerDemand = {
            ...target,
            status: target.status === 'New' ? 'Proposal Sent' : target.status,
            proposals: updatedProposals,
          };
          const updatedList = [...list];
          updatedList[idx] = updatedDemand;
          next[bizId] = updatedList;

          if (selectedDemand && selectedDemand.id === demandId) {
            setSelectedDemand(updatedDemand);
          }
          return next;
        }
      }
      return next;
    });
  };

  // Handle Delete Proposal
  const handleDeleteProposal = (demandId: string, proposalId: string) => {
    setDemandsByBusiness((prev) => {
      const next = { ...prev };
      for (const [bizId, list] of Object.entries(next) as [string, CustomerDemand[]][]) {
        const idx = list.findIndex((d) => d.id === demandId);
        if (idx !== -1) {
          const target = list[idx];
          const updatedDemand: CustomerDemand = {
            ...target,
            proposals: (target.proposals || []).filter((p) => p.id !== proposalId),
          };
          const updatedList = [...list];
          updatedList[idx] = updatedDemand;
          next[bizId] = updatedList;

          if (selectedDemand && selectedDemand.id === demandId) {
            setSelectedDemand(updatedDemand);
          }
          return next;
        }
      }
      return next;
    });
  };

  // Handle Save Outreach Log
  const handleSaveOutreachLog = (demandId: string, log: MessageLog) => {
    setDemandsByBusiness((prev) => {
      const next = { ...prev };
      for (const [bizId, list] of Object.entries(next) as [string, CustomerDemand[]][]) {
        const idx = list.findIndex((d) => d.id === demandId);
        if (idx !== -1) {
          const target = list[idx];
          const newStatus: DemandStatus =
            target.status === 'New'
              ? log.channel === 'email' || log.channel === 'whatsapp'
                ? 'Contacted'
                : 'In Discussion'
              : target.status;

          const updatedDemand: CustomerDemand = {
            ...target,
            status: newStatus,
            communicationLogs: [log, ...(target.communicationLogs || [])],
          };
          const updatedList = [...list];
          updatedList[idx] = updatedDemand;
          next[bizId] = updatedList;

          if (selectedDemand && selectedDemand.id === demandId) {
            setSelectedDemand(updatedDemand);
          }
          return next;
        }
      }
      return next;
    });
  };

  // Handle Delete Outreach Log
  const handleDeleteOutreachLog = (demandId: string, logId: string) => {
    setDemandsByBusiness((prev) => {
      const next = { ...prev };
      for (const [bizId, list] of Object.entries(next) as [string, CustomerDemand[]][]) {
        const idx = list.findIndex((d) => d.id === demandId);
        if (idx !== -1) {
          const target = list[idx];
          const updatedDemand: CustomerDemand = {
            ...target,
            communicationLogs: (target.communicationLogs || []).filter((l) => l.id !== logId),
          };
          const updatedList = [...list];
          updatedList[idx] = updatedDemand;
          next[bizId] = updatedList;

          if (selectedDemand && selectedDemand.id === demandId) {
            setSelectedDemand(updatedDemand);
          }
          return next;
        }
      }
      return next;
    });
  };

  const handleUpdateDemandStatus = (demandId: string, status: DemandStatus) => {
    setDemandsByBusiness((prev) => {
      const currentList = prev[selectedBusinessType.business_id] || [];
      const updatedList = currentList.map((d) => (d.id === demandId ? { ...d, status } : d));
      return {
        ...prev,
        [selectedBusinessType.business_id]: updatedList,
      };
    });
  };

  // Handle Add Real Demand / RFP
  const handleAddRealDemand = (demand: CustomerDemand) => {
    setDemandsByBusiness((prev) => {
      const currentList = prev[selectedBusinessType.business_id] || [];
      return {
        ...prev,
        [selectedBusinessType.business_id]: [demand, ...currentList.filter((d) => d.id !== demand.id)],
      };
    });
  };

  // Handle Batch Add Real Demands / RFPs
  const handleBatchAddRealDemands = (newDemands: CustomerDemand[]) => {
    setDemandsByBusiness((prev) => {
      const currentList = prev[selectedBusinessType.business_id] || [];
      const existingIds = new Set(newDemands.map((d) => d.id));
      return {
        ...prev,
        [selectedBusinessType.business_id]: [...newDemands, ...currentList.filter((d) => !existingIds.has(d.id))],
      };
    });
  };

  // Collect all proposals across all businesses
  const allDemandsAcrossAllTypes = Object.values(demandsByBusiness).flat();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBusinessType={selectedBusinessType}
        companyProfile={currentCompanyProfile}
        openCompanyModal={() => setActiveTab('company')}
        isScraping={isScraping}
        totalDemandsCount={currentDemands.length}
        currentUser={currentUser}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Scraper & Customer Demands (Default) */}
        {activeTab === 'scraper' && (
          <ScraperDashboard
            demands={currentDemands}
            selectedBusinessType={selectedBusinessType}
            companyProfile={currentCompanyProfile}
            onScrape={() => handleRunScraper(selectedBusinessType)}
            isScraping={isScraping}
            onSelectCustomer={handleOpenCustomerModal}
            onUpdateDemandStatus={handleUpdateDemandStatus}
            onAddDemand={handleAddRealDemand}
            onBatchAddDemands={handleBatchAddRealDemands}
          />
        )}

        {/* VIEW 2: Company Page */}
        {activeTab === 'company' && (
          <CompanyPage
            businessType={selectedBusinessType}
            companyProfile={currentCompanyProfile}
            onSaveProfile={handleSaveCompanyProfile}
            demands={currentDemands}
            proposals={currentDemands.flatMap((d) => d.proposals || [])}
            onTriggerScrape={() => handleRunScraper(selectedBusinessType)}
            isScraping={isScraping}
            onViewDemands={() => setActiveTab('scraper')}
          />
        )}

        {/* VIEW 3: Business Types Catalog & CSV Uploader */}
        {activeTab === 'catalog' && (
          <BusinessTypeSelector
            businessTypes={businessTypes}
            selectedBusinessType={selectedBusinessType}
            onSelectBusinessType={handleSelectBusinessType}
            onAddCustomBusinessType={handleAddCustomBusinessType}
            onImportCSV={handleImportCSV}
            onOpenCompanyPage={(bt) => {
              handleSelectBusinessType(bt);
              setActiveTab('company');
            }}
          />
        )}

        {/* VIEW 4: Outreach & Conversations Hub */}
        {activeTab === 'conversations' && (
          <ConversationsHub
            demands={allDemandsAcrossAllTypes}
            companyProfile={currentCompanyProfile}
            onSelectCustomer={handleOpenCustomerModal}
            onUpdateDemand={handleUpdateDemand}
            onSaveOutreachLog={handleSaveOutreachLog}
            onDeleteOutreachLog={handleDeleteOutreachLog}
          />
        )}

        {/* VIEW 5: Proposals Vault */}
        {activeTab === 'proposals' && (
          <ProposalsVault
            demands={allDemandsAcrossAllTypes}
            companyProfile={currentCompanyProfile}
            onSelectCustomer={handleOpenCustomerModal}
            onUpdateDemand={handleUpdateDemand}
            onSaveProposal={handleSaveProposal}
            onDeleteProposal={handleDeleteProposal}
          />
        )}

        {/* VIEW 6: Admin Page & Direct Credentials Login */}
        {activeTab === 'admin' && (
          <AdminPage
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
            selectedBusinessType={selectedBusinessType}
            totalDemandsCount={currentDemands.length}
          />
        )}
      </main>

      {/* Interactive Customer Detail & Multi-Channel Outreach Modal */}
      {selectedDemand && (
        <DemandDetailModal
          demand={selectedDemand}
          companyProfile={currentCompanyProfile}
          isOpen={!!selectedDemand}
          initialTab={modalInitialTab}
          onClose={() => setSelectedDemand(null)}
          onUpdateDemand={handleUpdateDemand}
        />
      )}
    </div>
  );
}

export default App;
