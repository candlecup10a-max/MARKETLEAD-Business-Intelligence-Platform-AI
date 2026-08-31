import React, { useState, useMemo } from 'react';
import {
  Radar,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  Bot,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Share2,
  Send,
  Globe,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Download,
  Upload
} from 'lucide-react';
import { CustomerDemand, BusinessType, CompanyProfile, DemandStatus, UrgencyLevel } from '../types';
import { CountryDropdown } from './CountryDropdown';
import { findCountry, COUNTRIES } from '../data/countries';
import { ImportRealDemandModal } from './ImportRealDemandModal';

interface ScraperDashboardProps {
  demands: CustomerDemand[];
  selectedBusinessType: BusinessType;
  companyProfile: CompanyProfile;
  onScrape: (count?: number) => void;
  isScraping: boolean;
  onSelectCustomer: (demand: CustomerDemand, initialTab?: 'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal') => void;
  onUpdateDemandStatus: (demandId: string, status: DemandStatus) => void;
  onAddDemand?: (demand: CustomerDemand) => void;
  onBatchAddDemands?: (demands: CustomerDemand[]) => void;
}

export const ScraperDashboard: React.FC<ScraperDashboardProps> = ({
  demands,
  selectedBusinessType,
  companyProfile,
  onScrape,
  isScraping,
  onSelectCustomer,
  onUpdateDemandStatus,
  onAddDemand,
  onBatchAddDemands,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('All');
  const [timeFilterMonths, setTimeFilterMonths] = useState<number>(6);
  const [sortBy, setSortBy] = useState<'publishedDate' | 'matchScore' | 'urgency'>('publishedDate');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [originFilter, setOriginFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [scrapeBatchSize, setScrapeBatchSize] = useState<number>(100);
  const [expandedDemandIds, setExpandedDemandIds] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const toggleDemandExpanded = (id: string) => {
    setExpandedDemandIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandAll) {
      setExpandedDemandIds(new Set());
      setExpandAll(false);
    } else {
      const allIds = new Set(demands.map((d) => d.id));
      setExpandedDemandIds(allIds);
      setExpandAll(true);
    }
  };

  // Export to CSV helper
  const handleExportCsv = () => {
    if (demands.length === 0) return;
    const headers = ['ID', 'Company', 'Contact Person', 'Role', 'Email', 'Phone', 'Location', 'Title', 'Description', 'Budget', 'Urgency', 'Published Date', 'Source', 'Origin', 'Status', 'Match Score'];
    const rows = demands.map((d) => [
      `"${d.id}"`,
      `"${(d.customerCompany || '').replace(/"/g, '""')}"`,
      `"${(d.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(d.role || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${(d.phone || '').replace(/"/g, '""')}"`,
      `"${(d.location || '').replace(/"/g, '""')}"`,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      `"${(d.demandDescription || '').replace(/"/g, '""')}"`,
      `"${(d.budgetRange || '').replace(/"/g, '""')}"`,
      `"${(d.urgency || '').replace(/"/g, '""')}"`,
      `"${(d.publishedDate || '').replace(/"/g, '""')}"`,
      `"${(d.source || '').replace(/"/g, '""')}"`,
      `"${d.leadOrigin || 'web-scraped'}"`,
      `"${d.status}"`,
      d.matchScore,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_demands_${selectedBusinessType.business_id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Sort
  const filteredAndSortedDemands = useMemo(() => {
    // Current live calendar reference: August 2026
    const now = new Date('2026-08-28T12:00:00Z').getTime();
    const maxAgeMs = timeFilterMonths * 30 * 24 * 60 * 60 * 1000;

    let list = demands.filter((d) => {
      // Date filter (last X months)
      const pubTime = new Date(d.publishedDate).getTime();
      const withinRange = now - pubTime <= maxAgeMs + 7 * 24 * 60 * 60 * 1000; // grace period

      const matchSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.demandDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchUrgency = urgencyFilter === 'All' || d.urgency.startsWith(urgencyFilter);

      // Origin Filter
      let matchOrigin = true;
      if (originFilter === 'Real User Imported') {
        matchOrigin = d.leadOrigin === 'user-imported';
      } else if (originFilter === 'Live Web Scraped') {
        matchOrigin = d.leadOrigin === 'web-scraped' || !d.leadOrigin;
      }

      // Country filter across 249 countries
      let matchCountry = true;
      if (selectedCountryCode && selectedCountryCode !== 'All') {
        const countryObj = COUNTRIES.find((c) => c.code.toLowerCase() === selectedCountryCode.toLowerCase());
        const locLower = d.location.toLowerCase();
        matchCountry =
          locLower.includes(selectedCountryCode.toLowerCase()) ||
          (countryObj ? locLower.includes(countryObj.name.toLowerCase()) : false);
      }

      return withinRange && matchSearch && matchStatus && matchUrgency && matchOrigin && matchCountry;
    });

    // Sorting (strictly by publishedDate descending by default as per prompt)
    list.sort((a, b) => {
      if (sortBy === 'publishedDate') {
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      }
      if (sortBy === 'matchScore') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'urgency') {
        const score = (u: string) =>
          u.includes('Immediate') ? 4 : u.includes('High') ? 3 : u.includes('Medium') ? 2 : 1;
        return score(b.urgency) - score(a.urgency);
      }
      return 0;
    });

    return list;
  }, [demands, searchTerm, timeFilterMonths, sortBy, statusFilter, urgencyFilter, originFilter, selectedCountryCode]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedDemands.length / itemsPerPage) || 1;
  const paginatedDemands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDemands.slice(start, start + itemsPerPage);
  }, [filteredAndSortedDemands, currentPage, itemsPerPage]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    if (urgency.includes('Immediate')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping mr-1" />
          <span>{urgency}</span>
        </span>
      );
    }
    if (urgency.includes('High')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {urgency}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        {urgency}
      </span>
    );
  };

  const getStatusBadge = (status: DemandStatus) => {
    switch (status) {
      case 'New':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">New Lead</span>;
      case 'Contacted':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Contacted</span>;
      case 'In Discussion':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">In Discussion</span>;
      case 'Proposal Sent':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Proposal Sent</span>;
      case 'Won':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Won / Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const getOriginBadge = (origin?: 'web-scraped' | 'user-imported') => {
    if (origin === 'user-imported') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-600 mr-0.5" />
          <span>Real Client Demand</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 flex items-center space-x-1">
        <Globe className="h-3 w-3 text-cyan-600 mr-0.5" />
        <span>Live Web Scraped</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scraper Hero Control Center */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider flex items-center space-x-1">
                <Radar className="h-3 w-3 mr-1 animate-spin" />
                <span>Active Target Category</span>
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {selectedBusinessType.business_id} • {selectedBusinessType.online_or_onsite}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {selectedBusinessType.business_type_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time procurement engine crawling live internet RFP boards and ingesting user RFPs published in the <strong className="text-teal-300">last 6 months</strong>.
            </p>
          </div>

          {/* Scraper Action Button, Import Real RFP & Batch Size Controls */}
          <div className="flex flex-col items-stretch sm:items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* Import Real RFP / Demands Button */}
              <button
                id="import-real-demand-btn"
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center space-x-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Import Real Demand / RFP</span>
              </button>

              {/* Scrape Button */}
              <button
                id="run-web-scraper-btn"
                onClick={() => onScrape(scrapeBatchSize)}
                disabled={isScraping}
                className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
              >
                <Radar className={`h-4 w-4 ${isScraping ? 'animate-spin text-amber-300' : 'animate-pulse'}`} />
                <span>{isScraping ? `Scanning Web (${scrapeBatchSize})...` : `Scrape ${scrapeBatchSize} Leads`}</span>
              </button>
            </div>

            {/* Batch Limit Pill Selector & Export */}
            <div className="flex items-center justify-between sm:justify-end w-full gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center space-x-1 text-[11px] text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer transition-colors"
                title="Export current demands pipeline to CSV"
              >
                <Download className="h-3 w-3 text-teal-400" />
                <span>Export CSV</span>
              </button>

              <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Batch:</span>
                {[
                  { label: '100', val: 100 },
                  { label: '50', val: 50 },
                  { label: '25', val: 25 },
                  { label: '10', val: 10 },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setScrapeBatchSize(b.val)}
                    className={`px-1.5 py-0.5 rounded-lg font-semibold text-[10px] transition-colors cursor-pointer ${
                      scrapeBatchSize === b.val
                        ? 'bg-teal-500 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Scraper Status / Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <div className={`h-2.5 w-2.5 rounded-full ${isScraping ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>
              {isScraping ? `Crawling live internet demand feeds & B2B procurement sources for up to ${scrapeBatchSize} leads...` : `Pipeline Active • ${filteredAndSortedDemands.length} Demands Loaded`}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Timeframe: <strong>Last 6 Months (Newest First)</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-demands-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search demand title, requirements, company, city..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>

          {/* Filters, Country Scroll-Down & Sort */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Origin Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Type:</span>
              <select
                value={originFilter}
                onChange={(e) => {
                  setOriginFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-white text-slate-900">All Real Demands</option>
                <option value="Live Web Scraped" className="bg-white text-slate-900">Live Web Scraped RFPs</option>
                <option value="Real User Imported" className="bg-white text-slate-900">Real Client Demands</option>
              </select>
            </div>

            {/* 249 Country Scroll-Down Filter */}
            <div className="w-44 sm:w-52">
              <CountryDropdown
                id="scraper-country-filter"
                value={selectedCountryCode}
                onChange={(country) => {
                  setSelectedCountryCode(country ? country.code : 'All');
                  setCurrentPage(1);
                }}
                showAllOption={true}
                allOptionLabel="All 249 Countries"
                placeholder="Filter by country..."
                buttonClassName="py-1.5 px-2.5 text-[11px] bg-slate-50"
              />
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
              <Calendar className="h-3.5 w-3.5 text-teal-600 mr-1" />
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Date:</span>
              {[
                { label: '6M', val: 6 },
                { label: '3M', val: 3 },
                { label: '30D', val: 1 },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => {
                    setTimeFilterMonths(t.val);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                    timeFilterMonths === t.val
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="publishedDate" className="bg-white text-slate-900">Published Date</option>
                <option value="matchScore" className="bg-white text-slate-900">AI Match Score</option>
                <option value="urgency" className="bg-white text-slate-900">Urgency</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-white text-slate-900">All Statuses</option>
                <option value="New" className="bg-white text-slate-900">New Leads</option>
                <option value="Contacted" className="bg-white text-slate-900">Contacted</option>
                <option value="In Discussion" className="bg-white text-slate-900">In Discussion</option>
                <option value="Proposal Sent" className="bg-white text-slate-900">Proposal Sent</option>
                <option value="Won" className="bg-white text-slate-900">Won / Closed</option>
              </select>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Per Page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="6" className="bg-white text-slate-900">6</option>
                <option value="12" className="bg-white text-slate-900">12</option>
                <option value="25" className="bg-white text-slate-900">25</option>
                <option value="50" className="bg-white text-slate-900">50</option>
                <option value="100" className="bg-white text-slate-900">100 (All)</option>
              </select>
            </div>

            {/* Toggle Expand / Collapse All Descriptions */}
            <button
              type="button"
              id="toggle-expand-all-demands-btn"
              onClick={handleToggleExpandAll}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                expandAll
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Expand or collapse all demand descriptions to read in full without truncation"
            >
              {expandAll ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Collapse All Text</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-teal-600" />
                  <span>Expand All Full Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Demand Cards List (Ordered by Published Date) */}
      {paginatedDemands.length > 0 ? (
        <div className="space-y-4">
          {paginatedDemands.map((demand) => {
            const isExpanded = expandAll || expandedDemandIds.has(demand.id);

            return (
              <div
                key={demand.id}
                id={`customer-demand-card-${demand.id}`}
                className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-teal-300 rounded-2xl p-5 md:p-6 transition-all duration-200 shadow-xs hover:shadow-md group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Customer Info & Demand Specs */}
                  <div className="flex-1 space-y-3">
                    {/* Top Row: Date, Urgency, Status, Origin, Source */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center space-x-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span>Published: {formatDate(demand.publishedDate)}</span>
                      </span>

                      {getOriginBadge(demand.leadOrigin)}
                      {getUrgencyBadge(demand.urgency)}
                      {getStatusBadge(demand.status)}

                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Source: {demand.source}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3
                        onClick={() => onSelectCustomer(demand, 'overview')}
                        className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors cursor-pointer"
                      >
                        {demand.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-800">
                          {demand.contactPerson} ({demand.role})
                        </span>
                        <span>•</span>
                        <span className="text-teal-600 font-medium">{demand.customerCompany}</span>
                        <span>•</span>
                        <span className="inline-flex items-center space-x-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>
                            {(() => {
                              const countryObj = findCountry(demand.location);
                              return countryObj ? `${countryObj.flag} ${demand.location}` : demand.location;
                            })()}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Demand Description with Expand / Collapse Full Reading Mode */}
                    <div className="space-y-1.5">
                      <p
                        onClick={() => toggleDemandExpanded(demand.id)}
                        className={`text-xs sm:text-sm text-slate-700 leading-relaxed cursor-pointer transition-all ${
                          isExpanded ? 'whitespace-pre-line bg-teal-50/30 p-3 rounded-xl border border-teal-100 text-slate-800' : 'line-clamp-2 hover:text-slate-900'
                        }`}
                        title={isExpanded ? 'Click to collapse' : 'Click to expand full demand'}
                      >
                        {demand.demandDescription}
                      </p>

                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDemandExpanded(demand.id);
                          }}
                          className="text-xs font-bold text-teal-600 hover:text-teal-800 inline-flex items-center space-x-1 transition-colors cursor-pointer py-0.5"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span>Show less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span>Read full demand</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Deliverables Checklist */}
                    {demand.requiredDeliverables && demand.requiredDeliverables.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Required Deliverables:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {demand.requiredDeliverables.map((item, idx) => (
                            <div key={`scraper-deliv-${demand.id}-${idx}-${item}`} className="flex items-start space-x-1.5 text-xs text-slate-700">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Synergy & Match Rationale */}
                    <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-950 flex items-start space-x-2">
                      <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-teal-900 mr-1">AI Match Insight ({demand.matchScore}%):</span>
                        <span>{demand.matchReason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Commercial Value & Multi-Channel Action Panel */}
                  <div className="lg:w-72 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                    {/* Budget & Score Block */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Budget</span>
                        <span className="text-base font-extrabold text-slate-900">{demand.budgetRange}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">Synergy Score</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          demand.matchScore >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {demand.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Multi-Channel Outreach Actions */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Action & Channels
                      </span>

                      <div className="grid grid-cols-2 gap-1.5">
                        {/* 1. Generate Proposal Button */}
                        <button
                          id={`btn-proposal-${demand.id}`}
                          onClick={() => onSelectCustomer(demand, 'proposal')}
                          className="col-span-2 flex items-center justify-center space-x-1.5 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Generate Commercial Proposal</span>
                        </button>

                        {/* 2. Email Outreach */}
                        <button
                          id={`btn-email-${demand.id}`}
                          onClick={() => onSelectCustomer(demand, 'email')}
                          className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5 text-teal-600" />
                          <span>Email Lead</span>
                        </button>

                        {/* 3. WhatsApp Direct */}
                        <button
                          id={`btn-whatsapp-${demand.id}`}
                          onClick={() => onSelectCustomer(demand, 'whatsapp')}
                          className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {/* 4. A2A Agent Negotiation */}
                        <button
                          id={`btn-a2a-${demand.id}`}
                          onClick={() => onSelectCustomer(demand, 'a2a')}
                          className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Bot className="h-3.5 w-3.5 text-indigo-600" />
                          <span>A2A Agent</span>
                        </button>

                        {/* 5. Live Buyer Chat */}
                        <button
                          id={`btn-chat-${demand.id}`}
                          onClick={() => onSelectCustomer(demand, 'chat')}
                          className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-cyan-600" />
                          <span>Direct Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700">
              <span className="font-medium">
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredAndSortedDemands.length} total customer leads)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No demands match your current filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Try adjusting your search keywords, origin filter, country selection, or run the web scraper to fetch new customer demands.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCountryCode('All');
                setTimeFilterMonths(6);
                setStatusFilter('All');
                setOriginFilter('All');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Import Real RFP
            </button>
          </div>
        </div>
      )}

      {/* Modal for Importing Real Demands */}
      {isImportModalOpen && (
        <ImportRealDemandModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onAddDemand={(newDemand) => {
            if (onAddDemand) {
              onAddDemand(newDemand);
            }
          }}
          onBatchAddDemands={(newDemands) => {
            if (onBatchAddDemands) {
              onBatchAddDemands(newDemands);
            }
          }}
          companyProfile={companyProfile}
          selectedBusinessType={selectedBusinessType}
        />
      )}
    </div>
  );
};
