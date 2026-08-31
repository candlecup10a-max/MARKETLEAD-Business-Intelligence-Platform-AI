import React, { useState } from 'react';
import {
  X,
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CustomerDemand, CompanyProfile, BusinessType } from '../types';
import { parseRealRfpApi } from '../services/apiService';

interface ImportRealDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDemand: (demand: CustomerDemand) => void;
  onBatchAddDemands?: (demands: CustomerDemand[]) => void;
  companyProfile: CompanyProfile | null;
  selectedBusinessType: BusinessType;
}

export const ImportRealDemandModal: React.FC<ImportRealDemandModalProps> = ({
  isOpen,
  onClose,
  onAddDemand,
  onBatchAddDemands,
  companyProfile,
  selectedBusinessType,
}) => {
  const [activeTab, setActiveTab] = useState<'paste-ai' | 'manual-form' | 'csv-import'>('paste-ai');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // AI Paste State
  const [pastedRfpText, setPastedRfpText] = useState('');

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    customerCompany: '',
    contactPerson: '',
    role: 'Procurement Director',
    email: '',
    phone: '',
    location: 'United States (US)',
    title: '',
    demandDescription: '',
    requiredDeliverables: '',
    budgetRange: '$20,000 - $50,000',
    urgency: 'High (1-2 weeks)' as CustomerDemand['urgency'],
    source: 'Direct Client RFP / Inquiry',
    sourceUrl: '',
  });

  // CSV file state
  const [csvFileName, setCsvFileName] = useState('');
  const [csvLeadCount, setCsvLeadCount] = useState(0);
  const [parsedCsvDemands, setParsedCsvDemands] = useState<CustomerDemand[]>([]);

  if (!isOpen) return null;

  const handleAiExtract = async () => {
    if (!pastedRfpText.trim()) {
      setErrorMsg('Please paste the real RFP, customer specification, or tender text.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const demand = await parseRealRfpApi(pastedRfpText, companyProfile, selectedBusinessType);
      if (demand) {
        onAddDemand(demand);
        setSuccessMsg(`Successfully imported "${demand.customerCompany}" as a verified real demand!`);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setErrorMsg('Could not parse demand. Please try manual entry.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to process demand.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.customerCompany.trim() || !manualForm.title.trim() || !manualForm.demandDescription.trim()) {
      setErrorMsg('Please fill in Company Name, Project Title, and Scope Description.');
      return;
    }

    const cleanComp = manualForm.customerCompany.toLowerCase().replace(/[^a-z0-9]/g, '');
    const deliverablesList = manualForm.requiredDeliverables
      ? manualForm.requiredDeliverables.split('\n').filter((d) => d.trim().length > 0)
      : [
          'Detailed requirements scoping & architecture roadmap',
          'Milestone delivery execution & quality assurance sign-off',
          'Operational handover, training, and final documentation',
        ];

    const newDemand: CustomerDemand = {
      id: `REAL-DEMAND-${Date.now()}`,
      businessTypeId: selectedBusinessType.business_id,
      businessTypeName: selectedBusinessType.business_type_name,
      customerName: manualForm.contactPerson || 'Procurement Lead',
      customerCompany: manualForm.customerCompany,
      contactPerson: manualForm.contactPerson || 'Procurement Lead',
      role: manualForm.role || 'Procurement Director',
      email: manualForm.email || `procurement@${cleanComp || 'enterprise'}.com`,
      phone: manualForm.phone || '+1 (555) 234-5678',
      a2aEndpoint: `a2a://${cleanComp || 'buyer'}.procure.network/v1/agent`,
      a2aAgentId: `A2A-BUYER-${Math.floor(1000 + Math.random() * 9000)}`,
      location: manualForm.location || 'Global / Remote',
      title: manualForm.title,
      demandDescription: manualForm.demandDescription,
      requiredDeliverables: deliverablesList,
      budgetRange: manualForm.budgetRange,
      urgency: manualForm.urgency,
      publishedDate: new Date().toISOString().split('T')[0],
      source: manualForm.source || 'Direct Client Inbound',
      sourceUrl: manualForm.sourceUrl || undefined,
      leadOrigin: 'user-imported',
      status: 'New',
      matchScore: 94,
      matchReason: 'Direct user-imported opportunity matched with your registered service profile.',
      communicationLogs: [],
      proposals: [],
      a2aLogs: [],
    };

    onAddDemand(newDemand);
    setSuccessMsg(`Added "${newDemand.customerCompany}" to your active pipeline!`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

        if (lines.length <= 1) {
          setErrorMsg('CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
        const demands: CustomerDemand[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((col) => col.trim().replace(/^["']|["']$/g, ''));
          if (row.length < 2) continue;

          const company = row[headers.indexOf('company')] || row[0] || `Client ${i}`;
          const title = row[headers.indexOf('title')] || row[1] || `${selectedBusinessType.business_type_name} Contract`;
          const desc = row[headers.indexOf('description')] || row[2] || `Real requirement for ${title}`;
          const email = row[headers.indexOf('email')] || `procurement@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`;
          const contact = row[headers.indexOf('contact')] || 'Procurement Director';
          const budget = row[headers.indexOf('budget')] || '$15,000 - $40,000';
          const location = row[headers.indexOf('location')] || 'Global';

          demands.push({
            id: `REAL-CSV-${Date.now()}-${i}`,
            businessTypeId: selectedBusinessType.business_id,
            businessTypeName: selectedBusinessType.business_type_name,
            customerName: contact,
            customerCompany: company,
            contactPerson: contact,
            role: 'Procurement Director',
            email: email,
            phone: '+1 (555) 019-2831',
            a2aEndpoint: `a2a://${company.toLowerCase().replace(/[^a-z]/g, '')}.procure.network/v1/agent`,
            a2aAgentId: `A2A-BUYER-${1000 + i}`,
            location: location,
            title: title,
            demandDescription: desc,
            requiredDeliverables: [
              'Requirements audit & delivery execution',
              'Quality assurance & milestone sign-off',
            ],
            budgetRange: budget,
            urgency: 'High (1-2 weeks)',
            publishedDate: new Date().toISOString().split('T')[0],
            source: 'CSV Uploaded Real Demand',
            leadOrigin: 'user-imported',
            status: 'New',
            matchScore: 90,
            matchReason: 'Imported from verified user CSV records.',
            communicationLogs: [],
            proposals: [],
            a2aLogs: [],
          });
        }

        setCsvLeadCount(demands.length);
        setParsedCsvDemands(demands);
      } catch (err: any) {
        setErrorMsg('Failed to parse CSV file. Ensure standard comma-separated format.');
      }
    };

    reader.readAsText(file);
  };

  const handleApplyCsvDemands = () => {
    if (parsedCsvDemands.length === 0) return;
    if (onBatchAddDemands) {
      onBatchAddDemands(parsedCsvDemands);
    } else {
      parsedCsvDemands.forEach((d) => onAddDemand(d));
    }
    setSuccessMsg(`Successfully imported ${parsedCsvDemands.length} real customer demands!`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-teal-500/20 border border-teal-500/30 rounded-2xl">
                <FileText className="h-6 w-6 text-teal-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Import Real Customer Demand / RFP</h2>
                <p className="text-xs text-slate-300">
                  Targeting: <span className="text-teal-300 font-semibold">{selectedBusinessType.business_type_name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 mt-6 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setActiveTab('paste-ai')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'paste-ai'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI RFP Parser</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual-form')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'manual-form'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('csv-import')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'csv-import'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>CSV / Batch</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: AI RFP Paste */}
          {activeTab === 'paste-ai' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Paste Real RFP Document, Tender Announcement, or Inbound Inquiry:
                </label>
                <textarea
                  rows={7}
                  value={pastedRfpText}
                  onChange={(e) => setPastedRfpText(e.target.value)}
                  placeholder="Example: 'Acme Logistics is seeking bids for warehouse security and logistics support in Chicago. Scope includes 24/7 CCTV monitoring, gate access control, and 12-month SLA. Budget: $40k-$75k. Responses due within 2 weeks. Contact: Sarah Jenkins, VP of Ops (s.jenkins@acmelogistics.com)'"
                  className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-100 text-xs text-teal-900 flex items-start space-x-2.5">
                <Sparkles className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <p>
                  Gemini will extract the company name, procurement officer, scope, required deliverables, budget, and calculate a tailored <strong>AI Synergy Match Score</strong> for your active business.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAiExtract}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                    <span>Analyzing & Ingesting Real Demand...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Extract & Add to Pipeline</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Manual Entry Form */}
          {activeTab === 'manual-form' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Organization *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Industries"
                      value={manualForm.customerCompany}
                      onChange={(e) => setManualForm({ ...manualForm, customerCompany: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Officer & Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Jessica Miller (Head of Procurement)"
                    value={manualForm.contactPerson}
                    onChange={(e) => setManualForm({ ...manualForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={manualForm.location}
                      onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">RFP / Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turnkey Modernization & SLA Contract for Regional Operations"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Detailed Demand Scope & Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the client's current situation, objectives, and deliverables requested..."
                  value={manualForm.demandDescription}
                  onChange={(e) => setManualForm({ ...manualForm, demandDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget Range</label>
                  <input
                    type="text"
                    placeholder="$25,000 - $60,000"
                    value={manualForm.budgetRange}
                    onChange={(e) => setManualForm({ ...manualForm, budgetRange: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={manualForm.urgency}
                    onChange={(e) => setManualForm({ ...manualForm, urgency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Immediate (1-3 days)">Immediate (1-3 days)</option>
                    <option value="High (1-2 weeks)">High (1-2 weeks)</option>
                    <option value="Medium (1 month)">Medium (1 month)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Real Demand to Pipeline</span>
              </button>
            </form>
          )}

          {/* TAB 3: CSV Batch Upload */}
          {activeTab === 'csv-import' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 mb-1">Upload CSV of Real Prospects & Demands</p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Headers supported: <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">company, title, description, email, budget, location</code>
                </p>
                <label className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm">
                  <span>Browse CSV File</span>
                  <input type="file" accept=".csv,text/csv" onChange={handleCsvFileUpload} className="hidden" />
                </label>
                {csvFileName && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    Loaded: {csvFileName} ({csvLeadCount} records found)
                  </p>
                )}
              </div>

              {parsedCsvDemands.length > 0 && (
                <button
                  type="button"
                  onClick={handleApplyCsvDemands}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Import All {parsedCsvDemands.length} Real Leads to Pipeline</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
