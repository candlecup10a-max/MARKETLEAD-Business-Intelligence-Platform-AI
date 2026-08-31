import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Printer,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Search,
  Filter,
  Layers,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerDemand, Proposal, CompanyProfile } from '../types';
import { ProposalEditorModal } from './ProposalEditorModal';

interface ProposalsVaultProps {
  demands: CustomerDemand[];
  companyProfile: CompanyProfile;
  onSelectCustomer: (demand: CustomerDemand, tab: 'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal') => void;
  onUpdateDemand: (demand: CustomerDemand) => void;
  onSaveProposal?: (demandId: string, proposal: Proposal) => void;
  onDeleteProposal?: (demandId: string, proposalId: string) => void;
}

export const ProposalsVault: React.FC<ProposalsVaultProps> = ({
  demands,
  companyProfile,
  onSelectCustomer,
  onUpdateDemand,
  onSaveProposal,
  onDeleteProposal,
}) => {
  const [expandedProposalIds, setExpandedProposalIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Sent' | 'Under Review' | 'Accepted'>('All');
  
  // Proposal Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [editingDemandId, setEditingDemandId] = useState<string | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleProposalExpanded = (id: string) => {
    setExpandedProposalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Collect all proposals across demands
  const allProposalsWithDemand: { proposal: Proposal; demand: CustomerDemand }[] = [];
  demands.forEach((d) => {
    if (d.proposals && d.proposals.length > 0) {
      d.proposals.forEach((p) => {
        allProposalsWithDemand.push({ proposal: p, demand: d });
      });
    }
  });

  // Calculate Metrics
  const totalProposalsCount = allProposalsWithDemand.length;
  const wonProposalsCount = allProposalsWithDemand.filter(
    (item) => item.proposal.status === 'Accepted' || item.demand.status === 'Won'
  ).length;

  // Filtered Proposals
  const filteredProposals = allProposalsWithDemand.filter(({ proposal, demand }) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demand.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'All') return true;
    return proposal.status === statusFilter;
  });

  const handleMarkWon = (demand: CustomerDemand, proposal: Proposal) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    const updatedDemand = {
      ...demand,
      status: 'Won' as const,
      proposals: demand.proposals?.map((p) =>
        p.id === proposal.id ? { ...p, status: 'Accepted' as const } : p
      ),
    };
    onUpdateDemand(updatedDemand);
  };

  const handleSaveProposalInternal = (demandId: string, savedProposal: Proposal) => {
    if (onSaveProposal) {
      onSaveProposal(demandId, savedProposal);
      return;
    }

    const targetDemand = demands.find((d) => d.id === demandId);
    if (!targetDemand) return;

    const existingIndex = targetDemand.proposals?.findIndex((p) => p.id === savedProposal.id) ?? -1;
    let updatedProposals: Proposal[] = [];

    if (existingIndex >= 0 && targetDemand.proposals) {
      updatedProposals = targetDemand.proposals.map((p) => (p.id === savedProposal.id ? savedProposal : p));
    } else {
      updatedProposals = [savedProposal, ...(targetDemand.proposals || [])];
    }

    onUpdateDemand({
      ...targetDemand,
      status: targetDemand.status === 'New' ? 'Proposal Sent' : targetDemand.status,
      proposals: updatedProposals,
    });
  };

  const handleDeleteProposalInternal = (demandId: string, proposalId: string) => {
    if (window.confirm('Are you sure you want to delete this saved proposal?')) {
      if (onDeleteProposal) {
        onDeleteProposal(demandId, proposalId);
        return;
      }
      const targetDemand = demands.find((d) => d.id === demandId);
      if (!targetDemand) return;

      onUpdateDemand({
        ...targetDemand,
        proposals: (targetDemand.proposals || []).filter((p) => p.id !== proposalId),
      });
    }
  };

  const handleDuplicateProposal = (demand: CustomerDemand, proposal: Proposal) => {
    const duplicated: Proposal = {
      ...proposal,
      id: `PROP-${Date.now().toString().slice(-6)}`,
      title: `${proposal.title} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
    };
    handleSaveProposalInternal(demand.id, duplicated);
  };

  const handleDownloadProposalText = (proposal: Proposal, demand: CustomerDemand) => {
    const textContent = `
=====================================================
COMMERCIAL PROPOSAL: ${proposal.title}
Proposal ID: ${proposal.id}
Created Date: ${proposal.createdDate}
Status: ${proposal.status}
=====================================================

PREPARED FOR:
Client: ${demand.contactPerson} (${demand.role})
Company: ${demand.customerCompany}
Location: ${demand.location}

PREPARED BY:
Company: ${companyProfile.companyName}
Contact: ${companyProfile.contactEmail} | ${companyProfile.contactPhone}

-----------------------------------------------------
EXECUTIVE SUMMARY:
${proposal.executiveSummary}

-----------------------------------------------------
UNDERSTANDING OF REQUIREMENTS:
${proposal.understandingOfRequirements}

-----------------------------------------------------
SCOPE OF WORK PHASES:
${proposal.scopeOfWork.map((s, i) => `Phase ${i + 1}: ${s.phase} [Duration: ${s.duration}]\n${s.description}`).join('\n\n')}

-----------------------------------------------------
KEY DELIVERABLES:
${proposal.deliverables.map((d) => `• ${d}`).join('\n')}

-----------------------------------------------------
TIERED PRICING MATRIX:
${proposal.tieredPricing.map((t) => `[${t.tierName}${t.recommended ? ' - RECOMMENDED' : ''}] Price: ${t.price}\nFeatures:\n${t.features.map((f) => `  - ${f}`).join('\n')}`).join('\n\n')}

-----------------------------------------------------
TERMS, PAYMENT SCHEDULE & SLA:
${proposal.termsAndConditions}
=====================================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${proposal.id}-${demand.customerCompany.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintProposal = (proposal: Proposal, demand: CustomerDemand) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0f172a; padding: 40px; }
            h1 { font-size: 24px; color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 8px; }
            h2 { font-size: 16px; margin-top: 24px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .tier { border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 10px; }
            .recommended { background: #f0fdf4; border-color: #10b981; }
            ul { margin-top: 4px; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div>
              <h1>${proposal.title}</h1>
              <p><strong>Proposal ID:</strong> ${proposal.id} | <strong>Date:</strong> ${proposal.createdDate}</p>
            </div>
            <div>
              <p><strong>Prepared For:</strong> ${demand.contactPerson} (${demand.customerCompany})</p>
              <p><strong>Prepared By:</strong> ${companyProfile.companyName}</p>
            </div>
          </div>
          <h2>Executive Summary</h2>
          <p>${proposal.executiveSummary}</p>
          <h2>Scope of Work</h2>
          ${proposal.scopeOfWork.map((s) => `<div><strong>${s.phase}</strong> (${s.duration})<p>${s.description}</p></div>`).join('')}
          <h2>Deliverables</h2>
          <ul>${proposal.deliverables.map((d) => `<li>${d}</li>`).join('')}</ul>
          <h2>Pricing Packages</h2>
          ${proposal.tieredPricing.map((t) => `<div class="tier ${t.recommended ? 'recommended' : ''}"><strong>${t.tierName}:</strong> ${t.price} ${t.recommended ? '<em>(Recommended)</em>' : ''}<ul>${t.features.map((f) => `<li>${f}</li>`).join('')}</ul></div>`).join('')}
          <h2>Terms & Conditions</h2>
          <p>${proposal.termsAndConditions}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
              Commercial Proposals Vault
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Proposals & Statements of Work</h2>
          <p className="text-xs text-slate-500 mt-1">
            All generated and customized commercial proposals are saved permanently across customer demands.
          </p>
        </div>

        {/* Action Button: Create New Proposal */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingProposal(null);
              setEditingDemandId(demands[0]?.id);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center space-x-2 cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create & Save Proposal</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Saved Proposals</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
            <span>{totalProposalsCount}</span>
            <span className="text-xs font-semibold text-slate-400">dockets</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Won & Accepted</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline space-x-1.5">
            <span>{wonProposalsCount}</span>
            <span className="text-xs font-semibold text-emerald-500">deals closed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Under Review / Sent</span>
          <div className="text-2xl font-black text-teal-600 mt-1 flex items-baseline space-x-1.5">
            <span>{allProposalsWithDemand.filter((p) => p.proposal.status === 'Sent' || p.proposal.status === 'Under Review').length}</span>
            <span className="text-xs font-semibold text-teal-500">active in pipeline</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Drafts In Progress</span>
          <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline space-x-1.5">
            <span>{allProposalsWithDemand.filter((p) => p.proposal.status === 'Draft').length}</span>
            <span className="text-xs font-semibold text-amber-500">ready to transmit</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search proposal title, client, company, docket ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span>Status:</span>
          </span>
          {(['All', 'Draft', 'Sent', 'Under Review', 'Accepted'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProposals.map(({ proposal, demand }) => {
            const isWon = demand.status === 'Won' || proposal.status === 'Accepted';
            const isExpanded = expandedProposalIds.has(proposal.id);

            return (
              <div
                key={proposal.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                  isWon
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: ID, Date, Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {proposal.id}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{proposal.createdDate}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <select
                        value={proposal.status}
                        onChange={(e) => {
                          const updated = { ...proposal, status: e.target.value as any };
                          handleSaveProposalInternal(demand.id, updated);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                          isWon
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : proposal.status === 'Sent'
                            ? 'bg-teal-100 text-teal-800 border-teal-300'
                            : proposal.status === 'Under Review'
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Accepted">Accepted / Won</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Customer Information */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">{proposal.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>Prepared for:</span>
                      <strong className="text-slate-800 font-semibold">{demand.contactPerson}</strong>
                      <span>•</span>
                      <span className="text-purple-700 font-medium">{demand.customerCompany}</span>
                      <span>•</span>
                      <span className="text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
                        {demand.location}
                      </span>
                    </div>
                  </div>

                  {/* Executive Summary with Expand / Collapse */}
                  <div className="space-y-1">
                    <p
                      onClick={() => toggleProposalExpanded(proposal.id)}
                      className={`text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer transition-all ${
                        isExpanded ? 'whitespace-pre-line bg-purple-50/30 border-purple-200' : 'line-clamp-2'
                      }`}
                      title={isExpanded ? 'Click to collapse' : 'Click to read full summary'}
                    >
                      {proposal.executiveSummary}
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleProposalExpanded(proposal.id)}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 inline-flex items-center space-x-1 cursor-pointer py-0.5"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          <span>Collapse summary & scope</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          <span>Expand full summary & scope</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Scope of Work & Deliverables */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                      {/* Scope phases */}
                      {proposal.scopeOfWork && proposal.scopeOfWork.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Scope Phases ({proposal.scopeOfWork.length})
                          </span>
                          <div className="space-y-1 text-xs">
                            {proposal.scopeOfWork.map((s, idx) => (
                              <div key={`vault-scope-${idx}-${s.phase}`} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="font-semibold text-slate-800 flex justify-between">
                                  <span>{s.phase}</span>
                                  <span className="text-[10px] text-teal-700 font-mono">{s.duration}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5">{s.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deliverables tags */}
                      {proposal.deliverables && proposal.deliverables.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Key Deliverables
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {proposal.deliverables.map((d, idx) => (
                              <span key={`vault-deliv-${idx}-${d}`} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                                ✓ {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Tiers Preview */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    {proposal.tieredPricing.map((t, idx) => (
                      <div
                        key={`vault-tier-${idx}-${t.tierName}`}
                        className={`p-2 rounded-xl text-xs transition-all ${
                          t.recommended
                            ? 'bg-purple-50 border border-purple-300 text-purple-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] text-slate-500 truncate">{t.tierName}</div>
                        <div className="font-extrabold text-emerald-700 text-xs mt-0.5">{t.price}</div>
                        {t.recommended && (
                          <span className="text-[9px] font-bold text-purple-700 block mt-0.5">Recommended</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    {/* Edit Proposal */}
                    <button
                      onClick={() => {
                        setEditingProposal(proposal);
                        setEditingDemandId(demand.id);
                        setIsEditorOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Edit Proposal Details"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicateProposal(demand, proposal)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Duplicate Proposal"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {/* Download Text */}
                    <button
                      onClick={() => handleDownloadProposalText(proposal, demand)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Download Proposal Document (TXT)"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    {/* Print */}
                    <button
                      onClick={() => handlePrintProposal(proposal, demand)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Print / Save as PDF"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteProposalInternal(demand.id, proposal.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Delete Proposal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectCustomer(demand, 'proposal')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Studio</span>
                    </button>

                    {!isWon && (
                      <button
                        onClick={() => handleMarkWon(demand, proposal)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Won</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {allProposalsWithDemand.length === 0 ? 'No Saved Proposals Yet' : 'No Matching Proposals'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {allProposalsWithDemand.length === 0
              ? 'Click "+ Create & Save Proposal" above or select any demand from the Scraper dashboard to generate a commercial proposal.'
              : 'Try clearing your search query or adjusting the status filter.'}
          </p>
          <button
            onClick={() => {
              setEditingProposal(null);
              setEditingDemandId(demands[0]?.id);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Proposal</span>
          </button>
        </div>
      )}

      {/* Interactive Proposal Editor Modal */}
      {isEditorOpen && (
        <ProposalEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingProposal(null);
          }}
          onSave={handleSaveProposalInternal}
          demands={demands}
          initialProposal={editingProposal}
          initialDemandId={editingDemandId}
          companyProfile={companyProfile}
        />
      )}
    </div>
  );
};
