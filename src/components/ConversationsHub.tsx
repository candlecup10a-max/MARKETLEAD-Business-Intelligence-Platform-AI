import React, { useState } from 'react';
import {
  MessageSquareText,
  Mail,
  Phone,
  Bot,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Building2,
  Calendar,
  Globe,
  MapPin,
  Plus,
  Send,
  Trash2,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles
} from 'lucide-react';
import { CustomerDemand, CompanyProfile, MessageLog, DemandStatus } from '../types';
import { CountryDropdown } from './CountryDropdown';
import { findCountry, COUNTRIES } from '../data/countries';
import { LogOutreachModal } from './LogOutreachModal';

interface ConversationsHubProps {
  demands: CustomerDemand[];
  companyProfile: CompanyProfile;
  onSelectCustomer: (demand: CustomerDemand, tab: 'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal') => void;
  onUpdateDemand?: (demand: CustomerDemand) => void;
  onSaveOutreachLog?: (demandId: string, log: MessageLog) => void;
  onDeleteOutreachLog?: (demandId: string, logId: string) => void;
}

export const ConversationsHub: React.FC<ConversationsHubProps> = ({
  demands,
  companyProfile,
  onSelectCustomer,
  onUpdateDemand,
  onSaveOutreachLog,
  onDeleteOutreachLog,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'All' | 'email' | 'whatsapp' | 'a2a' | 'direct_chat'>('All');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDemandIds, setExpandedDemandIds] = useState<Set<string>>(new Set());

  // Log Outreach Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [targetLogDemandId, setTargetLogDemandId] = useState<string | undefined>(undefined);

  // Quick reply inputs keyed by demandId
  const [quickReplyInputs, setQuickReplyInputs] = useState<Record<string, string>>({});
  const [quickReplyChannel, setQuickReplyChannel] = useState<Record<string, 'email' | 'whatsapp' | 'direct_chat'>>({});

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

  // Collect all demands that have interaction logs, proposals, or A2A steps or are not 'New'
  const activeConversations = demands.filter((d) => {
    const hasLogs = d.communicationLogs && d.communicationLogs.length > 0;
    const hasA2A = d.a2aLogs && d.a2aLogs.length > 0;
    const hasProposals = d.proposals && d.proposals.length > 0;
    const hasStatus = d.status !== 'New';

    return hasLogs || hasA2A || hasProposals || hasStatus;
  });

  // Calculate outreach metrics
  const totalMessageLogs = demands.reduce(
    (acc, d) => acc + (d.communicationLogs?.length || 0),
    0
  );
  const totalA2ASessions = demands.filter((d) => d.a2aLogs && d.a2aLogs.length > 0).length;

  const filteredDemands = activeConversations.filter((d) => {
    const matchesSearch =
      d.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCountryCode && selectedCountryCode !== 'All') {
      const countryObj = COUNTRIES.find((c) => c.code.toLowerCase() === selectedCountryCode.toLowerCase());
      const locLower = d.location.toLowerCase();
      const matchesCountry =
        locLower.includes(selectedCountryCode.toLowerCase()) ||
        (countryObj ? locLower.includes(countryObj.name.toLowerCase()) : false);
      if (!matchesCountry) return false;
    }

    if (selectedChannel === 'All') return true;
    if (selectedChannel === 'email') return d.communicationLogs?.some((l) => l.channel === 'email') || d.status === 'Contacted';
    if (selectedChannel === 'whatsapp') return d.communicationLogs?.some((l) => l.channel === 'whatsapp');
    if (selectedChannel === 'a2a') return (d.a2aLogs && d.a2aLogs.length > 0);
    if (selectedChannel === 'direct_chat') return d.communicationLogs?.some((l) => l.channel === 'direct_chat') || d.status === 'In Discussion';

    return true;
  });

  const handleSaveLogInternal = (demandId: string, log: MessageLog) => {
    if (onSaveOutreachLog) {
      onSaveOutreachLog(demandId, log);
      return;
    }

    const targetDemand = demands.find((d) => d.id === demandId);
    if (!targetDemand || !onUpdateDemand) return;

    const newLogs = [log, ...(targetDemand.communicationLogs || [])];
    const newStatus: DemandStatus =
      targetDemand.status === 'New'
        ? log.channel === 'email' || log.channel === 'whatsapp'
          ? 'Contacted'
          : 'In Discussion'
        : targetDemand.status;

    onUpdateDemand({
      ...targetDemand,
      status: newStatus,
      communicationLogs: newLogs,
    });
  };

  const handleDeleteLogInternal = (demandId: string, logId: string) => {
    if (onDeleteOutreachLog) {
      onDeleteOutreachLog(demandId, logId);
      return;
    }

    const targetDemand = demands.find((d) => d.id === demandId);
    if (!targetDemand || !onUpdateDemand) return;

    onUpdateDemand({
      ...targetDemand,
      communicationLogs: (targetDemand.communicationLogs || []).filter((l) => l.id !== logId),
    });
  };

  const handleSendQuickReply = (demand: CustomerDemand) => {
    const text = quickReplyInputs[demand.id]?.trim();
    if (!text) return;

    const channel = quickReplyChannel[demand.id] || 'email';
    const newLog: MessageLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      channel,
      direction: 'outgoing',
      sender: companyProfile.contactEmail || 'contact@apex-solutions.com',
      recipient: channel === 'email' ? demand.email : demand.phone,
      subject: channel === 'email' ? `Re: ${demand.title}` : undefined,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    handleSaveLogInternal(demand.id, newLog);
    setQuickReplyInputs((prev) => ({ ...prev, [demand.id]: '' }));
  };

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Demand ID', 'Customer Company', 'Contact Person', 'Location', 'Channel', 'Direction', 'Sender', 'Recipient', 'Subject', 'Content', 'Timestamp'],
    ];

    demands.forEach((d) => {
      if (d.communicationLogs && d.communicationLogs.length > 0) {
        d.communicationLogs.forEach((l) => {
          rows.push([
            d.id,
            d.customerCompany,
            d.contactPerson,
            d.location,
            l.channel,
            l.direction,
            l.sender,
            l.recipient,
            l.subject || '',
            `"${l.content.replace(/"/g, '""')}"`,
            l.timestamp,
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marketlead_outreach_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
              Outreach & Comms Hub
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Customer Communications</h2>
          <p className="text-xs text-slate-500 mt-1">
            All sent and received communications (Email, WhatsApp, Chat, and A2A negotiations) are saved and tracked here.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Export all communication logs as CSV"
          >
            <Download className="h-4 w-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setTargetLogDemandId(demands[0]?.id);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Log & Save Outreach</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Engaged Leads</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
            <span>{activeConversations.length}</span>
            <span className="text-xs font-semibold text-slate-400">clients</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Logged Communications</span>
          <div className="text-2xl font-black text-teal-600 mt-1 flex items-baseline space-x-1.5">
            <span>{totalMessageLogs}</span>
            <span className="text-xs font-semibold text-teal-500">records</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">A2A Protocols Run</span>
          <div className="text-2xl font-black text-cyan-600 mt-1 flex items-baseline space-x-1.5">
            <span>{totalA2ASessions}</span>
            <span className="text-xs font-semibold text-cyan-500">sessions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Proposals Linked</span>
          <div className="text-2xl font-black text-purple-600 mt-1 flex items-baseline space-x-1.5">
            <span>{demands.filter((d) => d.proposals && d.proposals.length > 0).length}</span>
            <span className="text-xs font-semibold text-purple-500">demands</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contact, company, city, country..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>

          <div className="w-full sm:w-52">
            <CountryDropdown
              id="comms-country-filter"
              value={selectedCountryCode}
              onChange={(country) => setSelectedCountryCode(country ? country.code : 'All')}
              showAllOption={true}
              allOptionLabel="All 249 Countries"
              placeholder="Filter by country..."
              buttonClassName="py-2 px-2.5 text-xs bg-slate-50"
            />
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'All', label: 'All Channels', icon: MessageSquareText },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
            { id: 'direct_chat', label: 'Direct Chat', icon: MessageSquare },
            { id: 'a2a', label: 'A2A Agent', icon: Bot },
          ].map((c) => {
            const Icon = c.icon;
            const active = selectedChannel === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChannel(c.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversations List */}
      {filteredDemands.length > 0 ? (
        <div className="space-y-4">
          {filteredDemands.map((demand) => {
            const countryObj = findCountry(demand.location);
            const isExpanded = expandedDemandIds.has(demand.id);
            const logs = demand.communicationLogs || [];
            const a2aSteps = demand.a2aLogs || [];
            const proposals = demand.proposals || [];

            const currentChannel = quickReplyChannel[demand.id] || 'email';
            const currentReplyText = quickReplyInputs[demand.id] || '';

            return (
              <div
                key={demand.id}
                className="bg-white hover:border-teal-300 border border-slate-200 rounded-2xl p-5 md:p-6 transition-all duration-200 shadow-xs hover:shadow-md space-y-4"
              >
                {/* Demand Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {demand.contactPerson}
                      </span>
                      <span className="text-xs text-slate-500">({demand.role})</span>
                      <span className="text-xs text-teal-700 font-semibold">• {demand.customerCompany}</span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {demand.businessTypeName}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[10px] text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>{countryObj?.flag || '🌐'} {demand.location}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          demand.status === 'Won'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : demand.status === 'Proposal Sent'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : demand.status === 'In Discussion'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                        }`}
                      >
                        Status: {demand.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 hover:text-teal-600 cursor-pointer transition-colors"
                        onClick={() => onSelectCustomer(demand, 'overview')}>
                      {demand.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5 text-teal-600" />
                        <span>{demand.email}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{demand.phone}</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">Budget: {demand.budgetRange}</span>
                    </div>
                  </div>

                  {/* Summary Badges & Full Modal Button */}
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <button
                      onClick={() => {
                        setTargetLogDemandId(demand.id);
                        setIsLogModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Log outreach note or message"
                    >
                      <Plus className="h-3.5 w-3.5 text-slate-600" />
                      <span>Log Note</span>
                    </button>

                    <button
                      onClick={() => onSelectCustomer(demand, 'chat')}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border border-teal-200 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Live Studio</span>
                    </button>
                  </div>
                </div>

                {/* Communication History Preview / Timeline */}
                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Communication History ({logs.length + a2aSteps.length + proposals.length} saved entries)</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleDemandExpanded(demand.id)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          <span>Collapse Timeline</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>Expand Full Timeline</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Logs Timeline List */}
                  {logs.length > 0 || a2aSteps.length > 0 || proposals.length > 0 ? (
                    <div className="space-y-2">
                      {/* Show first log or all if expanded */}
                      {(isExpanded ? logs : logs.slice(0, 2)).map((log, idx) => (
                        <div
                          key={`hub-log-${log.id || idx}-${idx}`}
                          className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs relative group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                                  log.channel === 'email'
                                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                    : log.channel === 'whatsapp'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : log.channel === 'direct_chat'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                }`}
                              >
                                {log.channel === 'email' && <Mail className="h-2.5 w-2.5" />}
                                {log.channel === 'whatsapp' && <Phone className="h-2.5 w-2.5" />}
                                {log.channel === 'direct_chat' && <MessageSquare className="h-2.5 w-2.5" />}
                                {log.channel === 'a2a' && <Bot className="h-2.5 w-2.5" />}
                                <span className="uppercase">{log.channel}</span>
                              </span>

                              <span className="text-[10px] text-slate-500 font-medium">
                                {log.direction === 'outgoing' ? 'Sent to' : 'From'}: {log.recipient || log.sender}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                              <button
                                onClick={() => handleDeleteLogInternal(demand.id, log.id)}
                                className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                title="Delete log entry"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {log.subject && (
                            <div className="font-semibold text-slate-900 text-xs">
                              Subject: {log.subject}
                            </div>
                          )}

                          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                            {log.content}
                          </p>
                        </div>
                      ))}

                      {/* Proposals linked */}
                      {proposals.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {proposals.map((prop, pidx) => (
                            <div
                              key={`hub-prop-${prop.id || pidx}-${pidx}`}
                              onClick={() => onSelectCustomer(demand, 'proposal')}
                              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200 cursor-pointer transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Proposal: {prop.title} ({prop.status})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* A2A status */}
                      {a2aSteps.length > 0 && (
                        <div className="p-2.5 bg-cyan-50/50 rounded-xl border border-cyan-200 text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-cyan-900 font-medium">
                            <Bot className="h-4 w-4 text-cyan-600" />
                            <span>Autonomous A2A Protocol ({a2aSteps.length} negotiation steps completed)</span>
                          </div>
                          <button
                            onClick={() => onSelectCustomer(demand, 'a2a')}
                            className="text-xs font-bold text-cyan-700 hover:text-cyan-900 cursor-pointer"
                          >
                            Inspect Protocol
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-1">
                      No communications logged yet. Type a quick reply below or click "+ Log & Save Outreach" to add records.
                    </div>
                  )}

                  {/* Inline Quick Outreach Sender */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex items-center space-x-1 bg-white px-2 py-1.5 rounded-xl border border-slate-200 text-xs">
                      <select
                        value={currentChannel}
                        onChange={(e) =>
                          setQuickReplyChannel((prev) => ({
                            ...prev,
                            [demand.id]: e.target.value as any,
                          }))
                        }
                        className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer text-xs"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="direct_chat">Direct Chat</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      value={currentReplyText}
                      onChange={(e) =>
                        setQuickReplyInputs((prev) => ({
                          ...prev,
                          [demand.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendQuickReply(demand))}
                      placeholder={`Quick reply or outreach note to ${demand.contactPerson}...`}
                      className="flex-1 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendQuickReply(demand)}
                      disabled={!currentReplyText.trim()}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Save & Log</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <MessageSquareText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900 mb-1">No Active Outreach Records Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Click "+ Log & Save Outreach" above or select any customer demand to transmit emails, WhatsApp messages, or live discussions.
          </p>
          <button
            onClick={() => {
              setTargetLogDemandId(demands[0]?.id);
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Log First Outreach Message</span>
          </button>
        </div>
      )}

      {/* Log Outreach Modal */}
      {isLogModalOpen && (
        <LogOutreachModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSave={handleSaveLogInternal}
          demands={demands}
          initialDemandId={targetLogDemandId}
          companyProfile={companyProfile}
        />
      )}
    </div>
  );
};
