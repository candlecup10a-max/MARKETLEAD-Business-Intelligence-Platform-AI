import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, CheckCircle2, Sparkles, DollarSign, Building2, Calendar, ShieldCheck, Calculator } from 'lucide-react';
import { CustomerDemand, Proposal, CompanyProfile } from '../types';
import { calculateRefinedEstimatedBudget } from '../utils/budgetEngine';

interface ProposalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demandId: string, proposal: Proposal) => void;
  demands: CustomerDemand[];
  initialProposal?: Proposal | null;
  initialDemandId?: string;
  companyProfile: CompanyProfile;
}

export const ProposalEditorModal: React.FC<ProposalEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  demands,
  initialProposal,
  initialDemandId,
  companyProfile,
}) => {
  const isEditing = !!initialProposal;

  // Selected Target Demand
  const [selectedDemandId, setSelectedDemandId] = useState<string>(
    initialDemandId || initialProposal?.customerDemandId || (demands[0]?.id || '')
  );

  const activeDemand = demands.find((d) => d.id === selectedDemandId) || demands[0];

  // Proposal Fields
  const [title, setTitle] = useState(
    initialProposal?.title || (activeDemand ? `Commercial Proposal: ${activeDemand.title}` : 'Commercial Scope of Work')
  );
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Accepted' | 'Under Review'>(
    initialProposal?.status || 'Draft'
  );
  const [executiveSummary, setExecutiveSummary] = useState(
    initialProposal?.executiveSummary ||
      (activeDemand
        ? `This comprehensive proposal outlines the turnkey operational delivery for ${activeDemand.customerCompany}, addressing all stated procurement objectives with guaranteed timeline and quality assurance.`
        : '')
  );
  const [understandingOfRequirements, setUnderstandingOfRequirements] = useState(
    initialProposal?.understandingOfRequirements ||
      (activeDemand?.demandDescription || 'Client requires enterprise-grade execution with verified milestone deliverables.')
  );
  const [timeline, setTimeline] = useState(
    initialProposal?.timeline || (activeDemand?.urgency ? `Target Completion: ${activeDemand.urgency}` : '2 - 4 Weeks')
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialProposal?.termsAndConditions ||
      'Standard commercial terms: 50% upon project kickoff, 50% upon final acceptance testing. SLA guarantees 99.9% uptime and 24/7 dedicated support.'
  );

  // Deliverables
  const [deliverables, setDeliverables] = useState<string[]>(
    initialProposal?.deliverables ||
      (activeDemand?.requiredDeliverables && activeDemand.requiredDeliverables.length > 0
        ? [...activeDemand.requiredDeliverables]
        : ['Turnkey System Architecture', 'Production Deployment & Validation', 'Handover Documentation & Staff Training'])
  );
  const [newDeliverableInput, setNewDeliverableInput] = useState('');

  // Scope of Work Phases
  const [scopeOfWork, setScopeOfWork] = useState<{ phase: string; description: string; duration: string }[]>(
    initialProposal?.scopeOfWork || [
      {
        phase: 'Phase 1: Discovery & Requirements Finalization',
        description: 'Deep-dive audit, scoping technical parameters, and establishing delivery milestones.',
        duration: '3 - 5 Days',
      },
      {
        phase: 'Phase 2: Core Engineering & Implementation',
        description: 'End-to-end execution, integration, and security verification.',
        duration: '2 - 3 Weeks',
      },
      {
        phase: 'Phase 3: QA Validation, Acceptance & Handover',
        description: 'User acceptance testing, SLA validation, and executive training handover.',
        duration: '1 Week',
      },
    ]
  );

  // Tiered Pricing
  const [tieredPricing, setTieredPricing] = useState<
    { tierName: string; price: string; features: string[]; recommended?: boolean }[]
  >(
    initialProposal?.tieredPricing || [
      {
        tierName: 'Standard Tier',
        price: activeDemand?.budgetRange ? `$${parseInt(activeDemand.budgetRange.replace(/[^0-9]/g, '') || '10000', 10) * 0.7}` : '$15,000',
        features: ['Core deliverables included', 'Standard 14-day delivery', 'Email & Ticket SLA Support'],
        recommended: false,
      },
      {
        tierName: 'Professional (Recommended)',
        price: activeDemand?.budgetRange || '$28,000',
        features: ['All core deliverables + custom tuning', 'Accelerated 7-day delivery', 'Dedicated Account Executive & 24/7 SLA', 'Comprehensive Warranty'],
        recommended: true,
      },
      {
        tierName: 'Enterprise Scale',
        price: activeDemand?.budgetRange ? `$${parseInt(activeDemand.budgetRange.replace(/[^0-9]/g, '') || '10000', 10) * 1.5}` : '$45,000',
        features: ['Full Turnkey Operations + Multi-region setup', 'Immediate Priority Turnaround', 'A2A Automated Machine Protocols', '1-Year Extended SLA & Unlimited Maintenance'],
        recommended: false,
      },
    ]
  );

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim()) return;
    setDeliverables([...deliverables, newDeliverableInput.trim()]);
    setNewDeliverableInput('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, idx) => idx !== index));
  };

  const handleAddScopePhase = () => {
    setScopeOfWork([
      ...scopeOfWork,
      {
        phase: `Phase ${scopeOfWork.length + 1}: Custom Milestone`,
        description: 'Milestone description and deliverables.',
        duration: '1 - 2 Weeks',
      },
    ]);
  };

  const handleRemoveScopePhase = (index: number) => {
    setScopeOfWork(scopeOfWork.filter((_, idx) => idx !== index));
  };

  const handleUpdateScopePhase = (index: number, field: 'phase' | 'description' | 'duration', value: string) => {
    const updated = [...scopeOfWork];
    updated[index][field] = value;
    setScopeOfWork(updated);
  };

  const handleUpdateTier = (index: number, field: 'tierName' | 'price' | 'recommended', value: any) => {
    const updated = [...tieredPricing];
    if (field === 'recommended' && value === true) {
      updated.forEach((t) => (t.recommended = false));
    }
    updated[index] = { ...updated[index], [field]: value };
    setTieredPricing(updated);
  };

  const handleSave = () => {
    const targetDemand = demands.find((d) => d.id === selectedDemandId) || demands[0];
    const proposalId = initialProposal?.id || `PROP-${Date.now().toString().slice(-6)}`;

    const newProposal: Proposal = {
      id: proposalId,
      customerDemandId: targetDemand ? targetDemand.id : 'DEMAND-CUSTOM',
      customerName: targetDemand ? targetDemand.contactPerson : 'Client Lead',
      customerCompany: targetDemand ? targetDemand.customerCompany : 'Client Organization',
      title: title.trim() || `Proposal for ${targetDemand?.customerCompany || 'Client'}`,
      executiveSummary: executiveSummary.trim(),
      understandingOfRequirements: understandingOfRequirements.trim(),
      scopeOfWork,
      deliverables,
      timeline: timeline.trim(),
      tieredPricing,
      termsAndConditions: termsAndConditions.trim(),
      createdDate: initialProposal?.createdDate || new Date().toISOString().split('T')[0],
      status,
    };

    onSave(targetDemand ? targetDemand.id : selectedDemandId, newProposal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit & Save Commercial Proposal' : 'Create & Save New Proposal'}
              </h3>
              <p className="text-xs text-slate-500">
                Save directly to Proposals Vault and associate with customer demand.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/40">
          {/* Target Customer Selection & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Target Customer / RFP Demand <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedDemandId}
                onChange={(e) => {
                  setSelectedDemandId(e.target.value);
                  const d = demands.find((item) => item.id === e.target.value);
                  if (d && !isEditing) {
                    setTitle(`Commercial Proposal: ${d.title}`);
                    setUnderstandingOfRequirements(d.demandDescription);
                    if (d.requiredDeliverables?.length) {
                      setDeliverables([...d.requiredDeliverables]);
                    }
                  }
                }}
                disabled={isEditing}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 shadow-2xs"
              >
                {demands.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.customerCompany} — {d.contactPerson} ({d.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Proposal Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600 shadow-2xs"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Client</option>
                <option value="Under Review">Under Client Review</option>
                <option value="Accepted">Accepted / Won</option>
              </select>
            </div>
          </div>

          {/* Proposal Title & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Proposal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Cloud Migration & 24/7 SLA"
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Estimated Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. 3 Weeks / Immediate"
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Executive Summary</label>
            <textarea
              rows={3}
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              placeholder="High-level commercial overview presented to buyer leadership..."
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>

          {/* Scope of Work Phases */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Scope of Work Phases & Milestones
              </span>
              <button
                type="button"
                onClick={handleAddScopePhase}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Phase</span>
              </button>
            </div>

            <div className="space-y-3">
              {scopeOfWork.map((s, idx) => (
                <div key={`scope-phase-${idx}`} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={s.phase}
                      onChange={(e) => handleUpdateScopePhase(idx, 'phase', e.target.value)}
                      placeholder="Phase Name"
                      className="flex-1 font-bold text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-900"
                    />
                    <input
                      type="text"
                      value={s.duration}
                      onChange={(e) => handleUpdateScopePhase(idx, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="w-28 text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700"
                    />
                    {scopeOfWork.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScopePhase(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={s.description}
                    onChange={(e) => handleUpdateScopePhase(idx, 'description', e.target.value)}
                    placeholder="Milestone description and deliverables..."
                    className="w-full text-xs bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Required Deliverables
            </span>

            <div className="space-y-1.5">
              {deliverables.map((item, idx) => (
                <div key={`deliv-${idx}-${item}`} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <span className="text-slate-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newDeliverableInput}
                onChange={(e) => setNewDeliverableInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDeliverable())}
                placeholder="Add deliverable (e.g. 24/7 SLA Dashboard)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tiered Pricing Packages */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Tiered Pricing Matrix
              </span>
              {activeDemand && (
                <button
                  type="button"
                  onClick={() => {
                    const breakdown = activeDemand.budgetBreakdown || calculateRefinedEstimatedBudget({
                      businessTypeName: activeDemand.businessTypeName,
                      deliveryMode: 'Hybrid',
                      urgency: activeDemand.urgency,
                      deliverables: activeDemand.requiredDeliverables || [],
                      demandTitle: activeDemand.title,
                      demandDescription: activeDemand.demandDescription,
                      location: activeDemand.location,
                      customerCompany: activeDemand.customerCompany,
                      buyerRole: activeDemand.role,
                    });
                    setTieredPricing([
                      {
                        tierName: breakdown.recommendedTiers.tier1Core.name,
                        price: breakdown.recommendedTiers.tier1Core.price,
                        features: [
                          'Core deliverables & standard QA',
                          'Weekly milestone syncs',
                          'Standard email & phone support',
                        ],
                        recommended: false,
                      },
                      {
                        tierName: breakdown.recommendedTiers.tier2Pro.name,
                        price: breakdown.recommendedTiers.tier2Pro.price,
                        features: [
                          'Complete end-to-end deliverables',
                          'Accelerated priority timeline',
                          'Dedicated Senior Project Director',
                          '24/7 SLA escalation support',
                          'Full custom documentation & training',
                        ],
                        recommended: true,
                      },
                      {
                        tierName: breakdown.recommendedTiers.tier3Enterprise.name,
                        price: breakdown.recommendedTiers.tier3Enterprise.price,
                        features: [
                          'Everything in Professional',
                          '12-month ongoing retainer & maintenance',
                          'Quarterly strategic reviews & optimization',
                          'Custom API & automated agent integrations',
                        ],
                        recommended: false,
                      },
                    ]);
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Calculator className="h-3 w-3" />
                  <span>Recalibrate via Budget Engine</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tieredPricing.map((tier, idx) => (
                <div
                  key={`tier-${idx}-${tier.tierName}`}
                  className={`p-3 rounded-xl border space-y-2 ${
                    tier.recommended ? 'bg-purple-50/40 border-purple-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={tier.tierName}
                      onChange={(e) => handleUpdateTier(idx, 'tierName', e.target.value)}
                      className="font-bold text-xs bg-white px-2 py-1 rounded border border-slate-200 w-full mr-2"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Price Quotation:</label>
                    <input
                      type="text"
                      value={tier.price}
                      onChange={(e) => handleUpdateTier(idx, 'price', e.target.value)}
                      className="font-extrabold text-xs text-emerald-700 bg-white px-2 py-1 rounded border border-slate-200 w-full"
                    />
                  </div>

                  <label className="flex items-center space-x-1.5 text-[11px] text-slate-700 cursor-pointer pt-1">
                    <input
                      type="radio"
                      name="recommendedTier"
                      checked={tier.recommended || false}
                      onChange={() => handleUpdateTier(idx, 'recommended', true)}
                    />
                    <span>Mark as Recommended</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Terms, SLA & Payment Schedule</label>
            <textarea
              rows={2}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isEditing ? 'Save Proposal Changes' : 'Save Proposal to Vault'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
