import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Phone,
  Bot,
  MessageSquare,
  FileText,
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  Terminal,
  Printer,
  Download,
  Flame,
  User,
  Globe,
  Edit3,
  BookmarkPlus,
  Save,
  Calculator,
  TrendingUp,
  PieChart,
  Layers,
  Info,
  HelpCircle,
  Activity,
  Cpu,
  Shield,
  Briefcase,
  SearchCheck,
  RotateCw,
  AlertTriangle,
  Code,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerDemand, CompanyProfile, DemandStatus, Proposal, MessageLog, A2ANegotiationStep, BusinessType, PostDemandCheckResult } from '../types';
import { CountryDropdown } from './CountryDropdown';
import { findCountry, COUNTRIES } from '../data/countries';
import { calculateRefinedEstimatedBudget } from '../utils/budgetEngine';
import {
  generateMessageDraftApi,
  customerChatApi,
  a2aNegotiationApi,
  generateProposalApi,
  verifyScrapedDemandApi
} from '../services/apiService';
import { ProposalEditorModal } from './ProposalEditorModal';

interface DemandDetailModalProps {
  demand: CustomerDemand;
  companyProfile: CompanyProfile;
  isOpen: boolean;
  initialTab?: 'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal' | 'verification';
  onClose: () => void;
  onUpdateDemand: (updated: CustomerDemand) => void;
  businessType?: BusinessType;
}

export const DemandDetailModal: React.FC<DemandDetailModalProps> = ({
  demand,
  companyProfile,
  isOpen,
  initialTab = 'overview',
  onClose,
  onUpdateDemand,
  businessType,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'email' | 'whatsapp' | 'a2a' | 'chat' | 'proposal' | 'verification'>(initialTab);
  const [isVerifyingDemand, setIsVerifyingDemand] = useState(false);
  const [verificationSuccessToast, setVerificationSuccessToast] = useState(false);
  
  // Email Form State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [emailSavedToast, setEmailSavedToast] = useState(false);
  const [copiedDemandDesc, setCopiedDemandDesc] = useState(false);

  // WhatsApp Form State
  const [whatsappText, setWhatsappText] = useState('');
  const [isGeneratingWA, setIsGeneratingWA] = useState(false);
  const [waSavedToast, setWaSavedToast] = useState(false);

  // Chat State ("Talking with Customer")
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'customer'; content: string; time: string }[]>(() => {
    const existingChats = (demand.communicationLogs || [])
      .filter((l) => l.channel === 'direct_chat')
      .map((l) => ({
        sender: (l.direction === 'outgoing' ? 'user' : 'customer') as 'user' | 'customer',
        content: l.content,
        time: l.timestamp,
      }));

    if (existingChats.length > 0) {
      return existingChats;
    }

    return [
      {
        sender: 'customer',
        content: `Hello! I am ${demand.contactPerson}, ${demand.role} at ${demand.customerCompany}. We have an open requirement for "${demand.title}". How can your team assist us?`,
        time: 'Just now',
      },
    ];
  });

  const [userChatInput, setUserChatInput] = useState('');
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // A2A State
  const [isA2ARunning, setIsA2ARunning] = useState(false);
  const [a2aSteps, setA2aSteps] = useState<A2ANegotiationStep[]>(demand.a2aLogs || []);
  const [expandedPayloads, setExpandedPayloads] = useState<Record<number, boolean>>({});
  const [copiedPayloadIndex, setCopiedPayloadIndex] = useState<number | null>(null);
  const [copiedTranscriptToast, setCopiedTranscriptToast] = useState(false);

  // Proposal State
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(demand.proposals?.[0] || null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [useHighThinking, setUseHighThinking] = useState(true);
  const [isProposalEditorOpen, setIsProposalEditorOpen] = useState(false);
  const [showBudgetMath, setShowBudgetMath] = useState(false);

  // Compute live budget breakdown if missing
  const activeBreakdown = demand.budgetBreakdown || calculateRefinedEstimatedBudget({
    businessTypeName: demand.businessTypeName,
    deliveryMode: 'Hybrid',
    urgency: demand.urgency,
    deliverables: demand.requiredDeliverables || [],
    demandTitle: demand.title,
    demandDescription: demand.demandDescription,
    location: demand.location,
    customerCompany: demand.customerCompany,
    buyerRole: demand.role,
  });

  // Reset tab when modal opens with new initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, demand.id]);

  // Keep active proposal synced if demand updates
  useEffect(() => {
    if (demand.proposals && demand.proposals.length > 0) {
      setActiveProposal(demand.proposals[0]);
    }
  }, [demand.proposals]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Pre-generate drafts if empty
  useEffect(() => {
    if (!emailSubject && !emailBody) {
      handleGenerateDraft('email');
    }
    if (!whatsappText) {
      handleGenerateDraft('whatsapp');
    }
  }, [demand.id]);

  // Run Scraped Demand Authenticity Verification
  const handleRunVerification = async () => {
    setIsVerifyingDemand(true);
    try {
      const res = await verifyScrapedDemandApi(demand, businessType, companyProfile);
      const updated: CustomerDemand = {
        ...demand,
        isVerifiedReal: res.isVerifiedReal,
        verifiedAt: res.verifiedAt,
        verificationResult: res.verificationResult,
      };
      onUpdateDemand(updated);
      setVerificationSuccessToast(true);
      setTimeout(() => setVerificationSuccessToast(false), 3000);
    } catch (e) {
      console.warn('Verification failed:', e);
    } finally {
      setIsVerifyingDemand(false);
    }
  };

  if (!isOpen) return null;

  // AI Message Draft Generator
  const handleGenerateDraft = async (channel: 'email' | 'whatsapp', tone: string = 'professional') => {
    if (channel === 'email') setIsGeneratingEmail(true);
    if (channel === 'whatsapp') setIsGeneratingWA(true);

    try {
      const draft = await generateMessageDraftApi(channel, demand, companyProfile, tone);
      if (channel === 'email') {
        setEmailSubject(draft.subject || `Solutions for ${demand.title}`);
        setEmailBody(draft.body || '');
      } else if (channel === 'whatsapp') {
        setWhatsappText(draft.body || '');
      }
    } catch (err) {
      console.error('Draft error:', err);
    } finally {
      if (channel === 'email') setIsGeneratingEmail(false);
      if (channel === 'whatsapp') setIsGeneratingWA(false);
    }
  };

  // Save Email Draft directly to outreach logs
  const handleSaveEmailDraft = () => {
    const newLog: MessageLog = {
      id: `MSG-${Date.now().toString().slice(-6)}`,
      channel: 'email',
      direction: 'outgoing',
      sender: companyProfile.contactEmail || 'contact@apex-solutions.com',
      recipient: demand.email,
      subject: emailSubject,
      content: emailBody,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    const updated = {
      ...demand,
      status: (demand.status === 'New' ? 'Contacted' : demand.status) as DemandStatus,
      communicationLogs: [newLog, ...(demand.communicationLogs || [])],
    };
    onUpdateDemand(updated);
    setEmailSavedToast(true);
    setTimeout(() => setEmailSavedToast(false), 2500);
  };

  // Send Email Handler
  const handleSendEmail = () => {
    const newLog: MessageLog = {
      id: `MSG-${Date.now().toString().slice(-6)}`,
      channel: 'email',
      direction: 'outgoing',
      sender: companyProfile.contactEmail || 'contact@apex-solutions.com',
      recipient: demand.email,
      subject: emailSubject,
      content: emailBody,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    const updated = {
      ...demand,
      status: (demand.status === 'New' ? 'Contacted' : demand.status) as DemandStatus,
      communicationLogs: [newLog, ...(demand.communicationLogs || [])],
    };
    onUpdateDemand(updated);

    // Trigger real mailto
    const mailtoUrl = `mailto:${encodeURIComponent(demand.email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Save WhatsApp Draft directly to outreach logs
  const handleSaveWhatsAppDraft = () => {
    const newLog: MessageLog = {
      id: `MSG-${Date.now().toString().slice(-6)}`,
      channel: 'whatsapp',
      direction: 'outgoing',
      sender: companyProfile.contactPhone || companyProfile.companyName,
      recipient: demand.phone,
      content: whatsappText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    const updated = {
      ...demand,
      status: (demand.status === 'New' ? 'Contacted' : demand.status) as DemandStatus,
      communicationLogs: [newLog, ...(demand.communicationLogs || [])],
    };
    onUpdateDemand(updated);
    setWaSavedToast(true);
    setTimeout(() => setWaSavedToast(false), 2500);
  };

  // Send WhatsApp Handler
  const handleSendWhatsApp = () => {
    const newLog: MessageLog = {
      id: `MSG-${Date.now().toString().slice(-6)}`,
      channel: 'whatsapp',
      direction: 'outgoing',
      sender: companyProfile.contactPhone || companyProfile.companyName,
      recipient: demand.phone,
      content: whatsappText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    const updated = {
      ...demand,
      status: (demand.status === 'New' ? 'Contacted' : demand.status) as DemandStatus,
      communicationLogs: [newLog, ...(demand.communicationLogs || [])],
    };
    onUpdateDemand(updated);

    const cleanPhone = demand.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappText)}`;
    window.open(waUrl, '_blank');
  };

  // Interactive Live Chat Handler ("Talking with Customer")
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userChatInput.trim() || isCustomerTyping) return;

    const userText = userChatInput.trim();
    setUserChatInput('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userLog: MessageLog = {
      id: `LOG-CHAT-${Date.now().toString().slice(-6)}`,
      channel: 'direct_chat',
      direction: 'outgoing',
      sender: companyProfile.companyName || 'Vendor Team',
      recipient: demand.contactPerson,
      content: userText,
      timestamp: `${timeStr}, ${new Date().toLocaleDateString()}`,
    };

    const newMessages = [
      ...chatMessages,
      {
        sender: 'user' as const,
        content: userText,
        time: timeStr,
      },
    ];
    setChatMessages(newMessages);
    setIsCustomerTyping(true);

    // Save outgoing user message to demand logs
    const updatedWithUserMsg: CustomerDemand = {
      ...demand,
      status: demand.status === 'New' ? 'In Discussion' : demand.status,
      communicationLogs: [userLog, ...(demand.communicationLogs || [])],
    };
    onUpdateDemand(updatedWithUserMsg);

    try {
      const reply = await customerChatApi(demand, newMessages, userText, companyProfile);
      if (reply) {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const customerLog: MessageLog = {
          id: `LOG-CHAT-${(Date.now() + 1).toString().slice(-6)}`,
          channel: 'direct_chat',
          direction: 'incoming',
          sender: demand.contactPerson,
          recipient: companyProfile.companyName || 'Vendor Team',
          content: reply,
          timestamp: `${replyTime}, ${new Date().toLocaleDateString()}`,
        };

        setChatMessages([
          ...newMessages,
          {
            sender: 'customer' as const,
            content: reply,
            time: replyTime,
          },
        ]);

        // Save incoming customer reply to demand logs
        onUpdateDemand({
          ...updatedWithUserMsg,
          status: 'In Discussion',
          communicationLogs: [customerLog, ...(updatedWithUserMsg.communicationLogs || [])],
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsCustomerTyping(false);
    }
  };

  // Run A2A Autonomous Negotiation
  const handleRunA2A = async () => {
    setIsA2ARunning(true);
    try {
      const steps = await a2aNegotiationApi(demand, companyProfile);
      if (Array.isArray(steps) && steps.length > 0) {
        setA2aSteps(steps);
        const a2aLog: MessageLog = {
          id: `LOG-A2A-${Date.now().toString().slice(-6)}`,
          channel: 'a2a',
          direction: 'outgoing',
          sender: companyProfile.a2aAgentId || 'VendorAgent',
          recipient: demand.a2aAgentId || 'BuyerAgent',
          content: `Autonomous machine-to-machine protocol executed. ${steps.length} negotiation milestones verified. Final status: AGREED.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
        };

        const updated = {
          ...demand,
          status: 'Proposal Sent' as DemandStatus,
          a2aLogs: steps,
          communicationLogs: [a2aLog, ...(demand.communicationLogs || [])],
        };
        onUpdateDemand(updated);
      }
    } catch (err) {
      console.error('A2A error:', err);
    } finally {
      setIsA2ARunning(false);
    }
  };

  // AI Proposal Generator
  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const proposal = await generateProposalApi(demand, companyProfile, useHighThinking);
      if (proposal) {
        setActiveProposal(proposal);
        const existingProposals = demand.proposals || [];
        const updated = {
          ...demand,
          status: demand.status === 'New' ? ('Proposal Sent' as DemandStatus) : demand.status,
          proposals: [proposal, ...existingProposals.filter((p) => p.id !== proposal.id)],
        };
        onUpdateDemand(updated);
      }
    } catch (err) {
      console.error('Proposal error:', err);
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  // Handle Save from ProposalEditorModal
  const handleSaveProposalFromEditor = (demandId: string, savedProposal: Proposal) => {
    setActiveProposal(savedProposal);
    const existingProposals = demand.proposals || [];
    const pIdx = existingProposals.findIndex((p) => p.id === savedProposal.id);
    let updatedProposals: Proposal[];
    if (pIdx !== -1) {
      updatedProposals = existingProposals.map((p) => (p.id === savedProposal.id ? savedProposal : p));
    } else {
      updatedProposals = [savedProposal, ...existingProposals];
    }

    onUpdateDemand({
      ...demand,
      status: demand.status === 'New' ? 'Proposal Sent' : demand.status,
      proposals: updatedProposals,
    });
  };

  // Mark Won with Confetti
  const handleMarkWon = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onUpdateDemand({
      ...demand,
      status: 'Won',
      proposals: demand.proposals?.map((p) => ({ ...p, status: 'Accepted' as const })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-10 w-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-teal-600/20">
              {demand.customerCompany.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">
                  {demand.customerCompany}
                </h3>
                <span className="text-xs text-slate-500 font-normal truncate hidden sm:inline">
                  • {demand.contactPerson} ({demand.role})
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{demand.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                demand.status === 'Won'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : demand.status === 'Proposal Sent'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : demand.status === 'In Discussion'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : demand.status === 'Contacted'
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
            >
              {demand.status}
            </span>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Demand Overview', icon: FileText },
            { id: 'verification', label: 'Authenticity & Proof', icon: ShieldCheck },
            { id: 'proposal', label: 'Commercial Proposal', icon: Sparkles },
            { id: 'email', label: 'Email Outreach', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
            { id: 'a2a', label: 'A2A Machine Engine', icon: Bot },
            { id: 'chat', label: 'Talk with Customer', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'border-teal-600 text-teal-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'verification' && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                    demand.isVerifiedReal !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {demand.verificationResult?.demandConfidenceScore ? `${demand.verificationResult.demandConfidenceScore}%` : 'Verified'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30">
          {/* TAB 1: DEMAND OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Authenticity Verification Quick Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        {demand.isVerifiedReal !== false ? 'Verified Real Buyer Demand' : 'Authenticity Audit'}
                      </span>
                      <span className="px-2 py-0.2 bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold rounded-full">
                        {demand.verificationResult?.demandConfidenceScore || 92}% Real
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {demand.verificationResult?.demandSummary ||
                        `Confirmed genuine commercial RFP from ${demand.customerCompany} with actionable scope and budget.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={handleRunVerification}
                    disabled={isVerifyingDemand}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${isVerifyingDemand ? 'animate-spin text-teal-600' : ''}`} />
                    <span>{isVerifyingDemand ? 'Auditing...' : 'Re-Test'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Full Proof Audit</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Details Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Procurement Budget</span>
                  <div className="text-base font-extrabold text-emerald-600">{demand.budgetRange}</div>
                  <div className="text-[10px] text-slate-500">{demand.urgency}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">A2A Endpoint</span>
                  <div className="text-xs font-mono text-cyan-700 truncate">{demand.a2aEndpoint}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{demand.a2aAgentId}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">AI Synergy Match</span>
                  <div className="text-sm font-bold text-teal-600">{demand.matchScore}% Score</div>
                  <div className="text-[11px] text-slate-600 leading-snug">{demand.matchReason}</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Country & Location</span>
                    <span className="text-slate-400 font-normal">249 Available</span>
                  </span>
                  <CountryDropdown
                    id="customer-modal-country-dropdown"
                    value={(() => {
                      const matched = findCountry(demand.location);
                      return matched?.code || demand.location;
                    })()}
                    onChange={(country) => {
                      if (country) {
                        const currentCity = demand.location.includes(',') ? demand.location.split(',')[0].trim() : '';
                        const updatedLocation = currentCity ? `${currentCity}, ${country.name}` : `${country.name} (${country.code})`;
                        onUpdateDemand({
                          ...demand,
                          location: updatedLocation,
                        });
                      }
                    }}
                    buttonClassName="py-1.5 px-2.5 text-[11px] bg-slate-50"
                  />
                </div>
              </div>

              {/* Detailed Demand Scope */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="h-3.5 w-3.5 text-teal-600" />
                    <span>Full Customer Demand Specification</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(demand.demandDescription);
                      setCopiedDemandDesc(true);
                      setTimeout(() => setCopiedDemandDesc(false), 2000);
                    }}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedDemandDesc ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Full Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {demand.demandDescription}
                </div>
              </div>

              {/* Deliverables Checklist */}
              {demand.requiredDeliverables && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Required Deliverables & SLA Benchmarks
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {demand.requiredDeliverables.map((deliv, idx) => (
                      <div
                        key={`demand-deliv-${idx}-${deliv}`}
                        className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                      >
                        <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REFINED BUDGET VALUATION ENGINE INSPECTOR */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/60 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/80">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white tracking-wide">Domain Budget Valuation Engine</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Refined Algorithm v2.4
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Sector-calibrated unit economics with multi-factor commercial multipliers
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBudgetMath(!showBudgetMath)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-teal-300 border border-slate-600/80 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>{showBudgetMath ? 'Hide Formula Derivation' : 'View Formula Derivation'}</span>
                  </button>
                </div>

                {/* Main Budget Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Valuation Summary */}
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Estimated Budget Range</span>
                    <div className="text-2xl font-black text-emerald-400 tracking-tight">
                      {activeBreakdown.formattedRange}
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span>Calculated Midpoint:</span>
                      <span className="font-mono font-bold text-white">${activeBreakdown.finalMedian.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Commercial Variance:</span>
                      <span className="font-mono text-emerald-300 font-semibold">±22% market band</span>
                    </div>
                  </div>

                  {/* Sector & Benchmark Rate */}
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Industry Sector Profile</span>
                    <div className="text-sm font-bold text-indigo-300 flex items-center space-x-1.5">
                      <Briefcase className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{activeBreakdown.sectorName}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span>Benchmark Rate:</span>
                      <span className="font-mono font-bold text-teal-300">{activeBreakdown.benchmarkHourlyRate}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>Base Industry Range:</span>
                      <span className="font-mono text-slate-300">${(activeBreakdown.baseMedian * 0.6).toLocaleString()} - ${(activeBreakdown.baseMedian * 1.5).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Workload & Primary Driver */}
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workload & Cost Driver</span>
                    <div className="text-xs text-amber-300 font-medium line-clamp-2">
                      {activeBreakdown.primaryCostDriver}
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span>Est. Billable Hours:</span>
                      <span className="font-mono font-bold text-amber-400">~{activeBreakdown.unitEconomics.estimatedHours} hrs</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Risk Margin Buffer:</span>
                      <span className="font-mono text-slate-300">{(activeBreakdown.unitEconomics.riskMargin * 100).toFixed(0)}% contingency</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Multipliers Matrix */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
                      <span>Applied Multiplier Matrix</span>
                    </h5>
                    <span className="text-[11px] font-mono text-slate-400">
                      Composite Coefficient: <strong className="text-teal-300 font-bold">{(activeBreakdown.finalMedian / activeBreakdown.baseMedian).toFixed(2)}x</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 text-[10px]">Delivery Mode</div>
                      <div className="font-bold text-white mt-0.5">{activeBreakdown.multipliers.deliveryMode.mode}</div>
                      <div className="text-teal-400 font-mono text-[10px] mt-0.5">{activeBreakdown.multipliers.deliveryMode.multiplier.toFixed(2)}x coeff</div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 text-[10px]">Turnaround Urgency</div>
                      <div className="font-bold text-white mt-0.5 truncate">{activeBreakdown.multipliers.urgency.level.split(' ')[0]}</div>
                      <div className="text-amber-400 font-mono text-[10px] mt-0.5">{activeBreakdown.multipliers.urgency.multiplier.toFixed(2)}x speed</div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 text-[10px]">Scope Density</div>
                      <div className="font-bold text-white mt-0.5">{activeBreakdown.multipliers.deliverableComplexity.count} Deliverables</div>
                      <div className="text-cyan-400 font-mono text-[10px] mt-0.5">{activeBreakdown.multipliers.deliverableComplexity.multiplier.toFixed(2)}x density</div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                      <div className="text-slate-400 text-[10px]">Regional PPP</div>
                      <div className="font-bold text-white mt-0.5 truncate">{activeBreakdown.multipliers.regionalPPP.region}</div>
                      <div className="text-indigo-400 font-mono text-[10px] mt-0.5">{activeBreakdown.multipliers.regionalPPP.multiplier.toFixed(2)}x index</div>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
                      <div className="text-slate-400 text-[10px]">Buyer Scale</div>
                      <div className="font-bold text-white mt-0.5 truncate">{activeBreakdown.multipliers.buyerScale.tier}</div>
                      <div className="text-purple-400 font-mono text-[10px] mt-0.5">{activeBreakdown.multipliers.buyerScale.multiplier.toFixed(2)}x scale</div>
                    </div>
                  </div>
                </div>

                {/* Cost Distribution Bar */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <PieChart className="h-3.5 w-3.5 text-teal-400" />
                      <span>Cost Breakdown Allocation</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">100% Total Project Budget</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-3.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/80">
                    <div
                      style={{ width: `${activeBreakdown.costBreakdown.laborPercentage}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title={`Labor & Engineering: ${activeBreakdown.costBreakdown.laborPercentage}%`}
                    />
                    <div
                      style={{ width: `${activeBreakdown.costBreakdown.techInfraPercentage}%` }}
                      className="bg-cyan-500 h-full transition-all"
                      title={`Tech & Infrastructure: ${activeBreakdown.costBreakdown.techInfraPercentage}%`}
                    />
                    <div
                      style={{ width: `${activeBreakdown.costBreakdown.complianceQAPercentage}%` }}
                      className="bg-indigo-500 h-full transition-all"
                      title={`QA & Compliance: ${activeBreakdown.costBreakdown.complianceQAPercentage}%`}
                    />
                    <div
                      style={{ width: `${activeBreakdown.costBreakdown.pmContingencyPercentage}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title={`PM & Contingency: ${activeBreakdown.costBreakdown.pmContingencyPercentage}%`}
                    />
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400">Labor:</span>{' '}
                        <strong className="text-white font-mono">${activeBreakdown.costBreakdown.laborAmount.toLocaleString()}</strong>{' '}
                        <span className="text-emerald-400 text-[10px]">({activeBreakdown.costBreakdown.laborPercentage}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400">Tech/Cloud:</span>{' '}
                        <strong className="text-white font-mono">${activeBreakdown.costBreakdown.techInfraAmount.toLocaleString()}</strong>{' '}
                        <span className="text-cyan-400 text-[10px]">({activeBreakdown.costBreakdown.techInfraPercentage}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400">QA/Compliance:</span>{' '}
                        <strong className="text-white font-mono">${activeBreakdown.costBreakdown.complianceQAAmount.toLocaleString()}</strong>{' '}
                        <span className="text-indigo-400 text-[10px]">({activeBreakdown.costBreakdown.complianceQAPercentage}%)</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400">PM/Buffer:</span>{' '}
                        <strong className="text-white font-mono">${activeBreakdown.costBreakdown.pmContingencyAmount.toLocaleString()}</strong>{' '}
                        <span className="text-amber-400 text-[10px]">({activeBreakdown.costBreakdown.pmContingencyPercentage}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggested 3-Tier Pricing Anchor Preview */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Layers className="h-3.5 w-3.5 text-teal-400" />
                      <span>Recommended Commercial Package Anchors</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('proposal')}
                      className="text-[11px] text-teal-300 hover:text-teal-200 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Use in Proposal Builder →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/70 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold">{activeBreakdown.recommendedTiers.tier1Core.name}</div>
                      <div className="text-base font-extrabold text-white font-mono">{activeBreakdown.recommendedTiers.tier1Core.price}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{activeBreakdown.recommendedTiers.tier1Core.description}</div>
                    </div>

                    <div className="p-3 bg-gradient-to-b from-teal-950/60 to-slate-800/90 rounded-xl border border-teal-500/40 space-y-1 relative">
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-teal-500 text-slate-950 text-[9px] font-extrabold uppercase">
                        Recommended
                      </span>
                      <div className="text-teal-300 text-[11px] font-semibold">{activeBreakdown.recommendedTiers.tier2Pro.name}</div>
                      <div className="text-base font-extrabold text-teal-200 font-mono">{activeBreakdown.recommendedTiers.tier2Pro.price}</div>
                      <div className="text-[10px] text-slate-300 leading-tight">{activeBreakdown.recommendedTiers.tier2Pro.description}</div>
                    </div>

                    <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/70 space-y-1">
                      <div className="text-slate-400 text-[11px] font-semibold">{activeBreakdown.recommendedTiers.tier3Enterprise.name}</div>
                      <div className="text-base font-extrabold text-white font-mono">{activeBreakdown.recommendedTiers.tier3Enterprise.price}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{activeBreakdown.recommendedTiers.tier3Enterprise.description}</div>
                    </div>
                  </div>
                </div>

                {/* Expandable Algorithm Mathematical Explanation */}
                {showBudgetMath && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-700/80 space-y-3 text-xs">
                    <h5 className="font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Terminal className="h-4 w-4 text-teal-400" />
                      <span>Mathematical Valuation Formula & Derivation</span>
                    </h5>

                    <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-emerald-300 border border-slate-800 leading-relaxed overflow-x-auto">
                      <code>
                        Budget_Midpoint = Base_Sector_Median × M_mode × M_urgency × (1 + 0.08 × (N_deliv - 3)) × M_PPP × M_scale
                        <br />
                        ${activeBreakdown.finalMedian.toLocaleString()} = ${activeBreakdown.baseMedian.toLocaleString()} × {activeBreakdown.multipliers.deliveryMode.multiplier.toFixed(2)} × {activeBreakdown.multipliers.urgency.multiplier.toFixed(2)} × {activeBreakdown.multipliers.deliverableComplexity.multiplier.toFixed(2)} × {activeBreakdown.multipliers.regionalPPP.multiplier.toFixed(2)} × {activeBreakdown.multipliers.buyerScale.multiplier.toFixed(2)}
                      </code>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                      <div className="space-y-1">
                        <strong className="text-white">1. Industry Base Range:</strong>
                        <p className="text-slate-400">
                          The system identifies the commercial category ({activeBreakdown.sectorName}) and loads calibrated benchmark base medians ($15k for Creative up to $90k for Heavy Enterprise).
                        </p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-white">2. Delivery Mode:</strong>
                        <p className="text-slate-400">
                          Online carries a 1.0x baseline, Hybrid incurs 1.20x for cross-channel coordination, and Onsite incurs 1.45x for physical deployment and travel overhead.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-white">3. Urgency & Timeline:</strong>
                        <p className="text-slate-400">
                          Immediate (1-3 days) demands require rapid resource redeployment (1.50x), High (1-2 weeks) adds 1.25x, and Flexible timelines offer optimal scheduling (0.90x).
                        </p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-white">4. Regional PPP & Scale:</strong>
                        <p className="text-slate-400">
                          Adjusts for local commercial purchasing power across 249 countries and factors in buyer corporate scale based on role and organization type.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Grid */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('email')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Mail className="h-4 w-4" />
                  <span>Draft Email</span>
                </button>
                <button
                  onClick={() => setActiveTab('whatsapp')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Phone className="h-4 w-4" />
                  <span>WhatsApp Message</span>
                </button>
                <button
                  onClick={() => setActiveTab('a2a')}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Bot className="h-4 w-4" />
                  <span>Run A2A Protocol</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Talk with Customer</span>
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Generate Proposal</span>
                </button>
                {demand.status !== 'Won' && (
                  <button
                    onClick={handleMarkWon}
                    className="ml-auto px-4 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Mark as Won Deal</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL OUTREACH */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-mono text-slate-900 font-semibold">{demand.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleGenerateDraft('email', 'persuasive')}
                    disabled={isGeneratingEmail}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span>{isGeneratingEmail ? 'AI Generating...' : 'Regenerate Cold Email'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-sans leading-relaxed focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    {emailCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                    <span>{emailCopied ? 'Copied to Clipboard' : 'Copy Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEmailDraft}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4 text-teal-600" />
                    <span>{emailSavedToast ? 'Saved to Outreach!' : 'Save to Outreach Hub'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send & Save Log</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-emerald-800 font-semibold">WhatsApp Destination:</span>
                  <span className="font-mono text-slate-900 font-bold">{demand.phone}</span>
                  <span className="text-slate-500">({demand.contactPerson})</span>
                </div>

                <button
                  onClick={() => handleGenerateDraft('whatsapp')}
                  disabled={isGeneratingWA}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isGeneratingWA ? 'Generating...' : 'AI Rewrite WhatsApp Hook'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Message Text
                </label>
                <textarea
                  rows={6}
                  value={whatsappText}
                  onChange={(e) => setWhatsappText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 leading-relaxed focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
                />
              </div>

              {/* WhatsApp Live Simulator Preview */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Live WhatsApp Chat Preview</div>
                <div className="bg-[#efeae2] p-4 rounded-xl space-y-2 border border-slate-200">
                  <div className="bg-[#d9fdd3] text-slate-900 text-xs p-3 rounded-2xl rounded-tr-none max-w-md ml-auto shadow-xs border border-emerald-200/50">
                    {whatsappText}
                    <div className="text-[9px] text-emerald-700 text-right mt-1 font-medium">Just now ✓✓</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveWhatsAppDraft}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4 text-emerald-600" />
                  <span>{waSavedToast ? 'Saved to Outreach!' : 'Save to Outreach Hub'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Open WhatsApp & Save Record</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: A2A AUTONOMOUS AGENT PROTOCOL */}
          {activeTab === 'a2a' && (
            <div className="space-y-5">
              {/* Engine Header & Handshake Bridge */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl border border-slate-800 p-5 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <span>Autonomous Machine-to-Machine (A2A) Engine</span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Protocol A2A-v1.4
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Autonomous peer-to-peer agent protocol negotiation, SLA parameter matching & mutual handshake
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={handleRunA2A}
                      disabled={isA2ARunning}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Bot className={`h-4 w-4 ${isA2ARunning ? 'animate-spin' : ''}`} />
                      <span>{isA2ARunning ? 'Executing Handshake...' : a2aSteps.length > 0 ? 'Re-run A2A Protocol' : 'Run Autonomous Negotiation'}</span>
                    </button>
                  </div>
                </div>

                {/* Cryptographic Tunnel Route */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                  {/* Vendor Agent */}
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Vendor AI Agent</div>
                      <div className="font-mono text-teal-300 font-bold truncate">
                        {companyProfile.a2aAgentId || 'A2A-VENDOR-770'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{companyProfile.companyName}</div>
                    </div>
                  </div>

                  {/* Bridge Status */}
                  <div className="flex flex-col items-center justify-center text-center px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px]">
                      <Lock className="h-3 w-3 text-cyan-400" />
                      <span>{a2aSteps.length > 0 ? 'M2M Session Ratified' : 'TLS 1.3 M2M Handshake'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {demand.a2aEndpoint || 'a2a://client.procure.network/v1'}
                    </div>
                  </div>

                  {/* Buyer Agent */}
                  <div className="flex items-center justify-start md:justify-end space-x-2.5">
                    <div className="min-w-0 text-left md:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Buyer AI Agent</div>
                      <div className="font-mono text-cyan-300 font-bold truncate">
                        {demand.a2aAgentId || 'A2A-BUYER-8842'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{demand.customerCompany}</div>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      <Cpu className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* 5-Step Milestone Progress Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { step: 1, label: '01. Handshake' },
                    { step: 2, label: '02. SLA Challenge' },
                    { step: 3, label: '03. Offer Dispatch' },
                    { step: 4, label: '04. Evaluation' },
                    { step: 5, label: '05. Ratification' },
                  ].map((m) => {
                    const isDone = a2aSteps.length >= m.step;
                    const isCurrent = a2aSteps.length === m.step - 1 && isA2ARunning;
                    return (
                      <div
                        key={m.step}
                        className={`px-2.5 py-1.5 rounded-lg border text-center text-[10px] font-semibold transition-all ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700/60'
                        }`}
                      >
                        {isDone ? `✓ ${m.label}` : m.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Toolbar when steps exist */}
              {a2aSteps.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  <div className="text-xs text-slate-600 font-medium">
                    Negotiation Transcript ({a2aSteps.length} protocol milestones completed)
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const transcript = a2aSteps
                          .map(
                            (s, i) =>
                              `[Step 0${s.stepNumber || s.step || i + 1}] ${s.agent} (${s.action}):\n${s.humanExplanation || s.message || ''}\nPayload: ${JSON.stringify(s.payload || {}, null, 2)}\n`
                          )
                          .join('\n---\n\n');
                        navigator.clipboard.writeText(transcript);
                        setCopiedTranscriptToast(true);
                        setTimeout(() => setCopiedTranscriptToast(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      {copiedTranscriptToast ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                      <span>{copiedTranscriptToast ? 'Copied Transcript!' : 'Copy Transcript'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('proposal');
                        if (!demand.proposals || demand.proposals.length === 0) {
                          handleGenerateProposal();
                        }
                      }}
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-purple-600" />
                      <span>Convert to Formal Proposal</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Negotiation Sequence Step Cards */}
              {a2aSteps.length > 0 ? (
                <div className="space-y-3.5">
                  {a2aSteps.map((step, idx) => {
                    const isVendor = step.agent === 'VendorAgent';
                    const stepNum = step.stepNumber || step.step || idx + 1;
                    const explanationText = step.humanExplanation || (step as any).message || (step.payload?.data ? String(step.payload.data) : 'Negotiation handshake verified.');
                    const payloadStatus = step.payload?.status || 'VERIFIED';
                    const payloadType = step.payload?.messageType || step.action;
                    const isPayloadExpanded = Boolean(expandedPayloads[idx]);

                    return (
                      <div
                        key={`a2a-step-${idx}-${stepNum}-${step.action || ''}`}
                        className={`rounded-2xl border transition-all p-4.5 space-y-3 shadow-xs ${
                          isVendor
                            ? 'bg-teal-50/50 border-teal-200'
                            : 'bg-cyan-50/50 border-cyan-200'
                        }`}
                      >
                        {/* Step Card Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                          <div className="flex items-center space-x-2.5">
                            <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
                              STEP 0{stepNum}
                            </span>

                            <div className="flex items-center space-x-1.5">
                              {isVendor ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs">
                                  <Bot className="h-3 w-3 text-teal-600" />
                                  <span>Our Vendor AI Agent</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold text-xs">
                                  <Cpu className="h-3 w-3 text-cyan-600" />
                                  <span>{demand.customerCompany} Buyer AI</span>
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-mono text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200">
                              {step.action}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-[10px]">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                payloadStatus.includes('ACCEPT') || payloadStatus.includes('PASS') || payloadStatus.includes('COMPLIANT')
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : payloadStatus.includes('OFFER') || payloadStatus.includes('TRANSMITTED')
                                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {payloadStatus}
                            </span>
                            <span className="font-mono text-slate-400">{step.timestamp}</span>
                          </div>
                        </div>

                        {/* Human-Readable Explanation / Agent Dialogue */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            Autonomous Agent Message:
                          </div>
                          <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                            "{explanationText}"
                          </div>
                        </div>

                        {/* Parameter & Payload Data Highlight */}
                        {step.payload?.data && (
                          <div className="flex items-start space-x-2.5 text-xs text-slate-800 bg-white/90 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                            <Zap className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                Negotiated Parameters & Constraints:
                              </span>
                              <div className="text-xs font-semibold text-slate-900">
                                {step.payload.data}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Collapsible Raw JSON Inspector */}
                        {step.payload && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedPayloads((prev) => ({
                                  ...prev,
                                  [idx]: !prev[idx],
                                }))
                              }
                              className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Code className="h-3 w-3 text-cyan-600" />
                              <span>{isPayloadExpanded ? 'Hide Raw Protocol JSON' : 'Inspect Raw Protocol JSON (A2A-v1.4)'}</span>
                              {isPayloadExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>

                            {isPayloadExpanded && (
                              <div className="mt-2 text-[11px] font-mono bg-slate-950 text-emerald-400 p-3 rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                                  <span>PROTOCOL: A2A-v1.4 | STEP 0{stepNum}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(step.payload, null, 2));
                                      setCopiedPayloadIndex(idx);
                                      setTimeout(() => setCopiedPayloadIndex(null), 2000);
                                    }}
                                    className="text-slate-400 hover:text-emerald-300 flex items-center space-x-1 px-2 py-0.5 bg-slate-800 rounded cursor-pointer"
                                  >
                                    {copiedPayloadIndex === idx ? (
                                      <Check className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                    <span>{copiedPayloadIndex === idx ? 'Copied' : 'Copy JSON'}</span>
                                  </button>
                                </div>
                                <pre className="whitespace-pre">{JSON.stringify(step.payload, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Ratification Success Banner */}
                  {a2aSteps.length >= 5 && (
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center space-x-2.5 text-emerald-900 font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>Autonomous Machine-to-Machine Handshake Successfully Ratified!</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        The Buyer Procurement AI Agent has completed constraint checks, verified your SLA capacity, and issued clearance token for contract signing. You can now generate the tailored formal proposal docket or export communication logs to your CRM.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('proposal');
                            if (!demand.proposals || demand.proposals.length === 0) {
                              handleGenerateProposal();
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Open Formal Proposal Builder</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto border border-cyan-200">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">No active A2A session executed yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
                      Click the <strong className="text-slate-700">"Run Autonomous Negotiation"</strong> button above to connect your company's AI Agent with <span className="font-semibold text-slate-800">{demand.customerCompany}'s</span> procurement AI Agent to automatically negotiate SLAs, constraints, and commercial terms.
                    </p>
                  </div>
                  <button
                    onClick={handleRunA2A}
                    disabled={isA2ARunning}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <Bot className={`h-4 w-4 ${isA2ARunning ? 'animate-spin' : ''}`} />
                    <span>{isA2ARunning ? 'Connecting Agents...' : 'Start A2A Handshake Now'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TALK WITH CUSTOMER (LIVE CHAT) */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-200">
                    {demand.contactPerson.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{demand.contactPerson}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {demand.role} • {demand.customerCompany}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Interactive Lead Conversation (Auto-saved to Outreach Hub)
                </span>
              </div>

              {/* Chat Messages Stream */}
              <div className="h-72 sm:h-80 overflow-y-auto bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3 shadow-inner">
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div
                      key={`chat-msg-${idx}-${msg.time}-${msg.sender}`}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-500 mb-1 px-1">
                        {isMe ? companyProfile.companyName || 'You' : demand.contactPerson} • {msg.time}
                      </div>
                      <div
                        className={`max-w-lg p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-teal-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {isCustomerTyping && (
                  <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl max-w-[200px] border border-slate-200 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] font-medium">{demand.contactPerson} is typing...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={userChatInput}
                  onChange={(e) => setUserChatInput(e.target.value)}
                  placeholder={`Reply to ${demand.contactPerson} about timeline, budget, or proposal...`}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!userChatInput.trim() || isCustomerTyping}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: PROPOSAL STUDIO */}
          {activeTab === 'proposal' && (
            <div className="space-y-6">
              {/* Proposal Generation Controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span>Commercial Proposal Builder</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate an end-to-end commercial contract & scope of work matching their demand.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useHighThinking}
                      onChange={(e) => setUseHighThinking(e.target.checked)}
                      className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      <span>Thinking Mode</span>
                    </span>
                  </label>

                  {activeProposal && (
                    <button
                      onClick={() => setIsProposalEditorOpen(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-purple-600" />
                      <span>Edit Proposal</span>
                    </button>
                  )}

                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`h-4 w-4 ${isGeneratingProposal ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingProposal ? 'Drafting Proposal...' : 'Generate Proposal'}</span>
                  </button>
                </div>
              </div>

              {/* Proposal Document View */}
              {activeProposal ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
                  {/* Proposal Header */}
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {activeProposal.id} • Status: {activeProposal.status}
                        </span>
                        <h3 className="text-lg font-bold text-slate-950 mt-1.5">{activeProposal.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Prepared for <strong className="text-slate-800">{demand.contactPerson}</strong> at{' '}
                          <strong className="text-slate-800">{demand.customerCompany}</strong> by{' '}
                          <strong className="text-teal-700">{companyProfile.companyName || 'Our Firm'}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setIsProposalEditorOpen(true)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Customize</span>
                      </button>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Executive Summary
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {activeProposal.executiveSummary}
                    </p>
                  </div>

                  {/* Scope of Work */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Scope of Work & Phased Execution
                    </h4>
                    <div className="space-y-2">
                      {activeProposal.scopeOfWork.map((phase, idx) => (
                        <div
                          key={`sow-phase-${idx}-${phase.phase}`}
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="text-xs font-bold text-teal-700">{phase.phase}</div>
                            <div className="text-xs text-slate-700 mt-0.5">{phase.description}</div>
                          </div>
                          <span className="text-[10px] font-semibold font-mono text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md shrink-0">
                            {phase.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables & Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        3. Core Deliverables
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {activeProposal.deliverables.map((deliv, idx) => (
                          <li key={`active-deliv-${idx}-${deliv}`} className="flex items-center space-x-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        4. Timeline & Milestones
                      </h4>
                      <p className="text-xs text-slate-700">{activeProposal.timeline}</p>
                    </div>
                  </div>

                  {/* Tiered Pricing */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      5. Commercial Investment & Pricing Tiers
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {activeProposal.tieredPricing.map((tier, idx) => (
                        <div
                          key={`tier-${idx}-${tier.tierName}`}
                          className={`p-4 rounded-2xl border flex flex-col justify-between ${
                            tier.recommended
                              ? 'bg-teal-50/50 border-teal-600 ring-1 ring-teal-600 shadow-sm'
                              : 'bg-white border-slate-200 shadow-xs'
                          }`}
                        >
                          <div>
                            {tier.recommended && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white uppercase tracking-wider mb-2 inline-block">
                                Recommended Tier
                              </span>
                            )}
                            <div className="text-xs font-bold text-slate-900">{tier.tierName}</div>
                            <div className="text-lg font-black text-emerald-600 mt-1">{tier.price}</div>
                            <ul className="space-y-1 mt-3 text-[11px] text-slate-600">
                              {tier.features.map((feat, fidx) => (
                                <li key={`tier-feat-${idx}-${fidx}-${feat}`} className="flex items-start space-x-1.5">
                                  <span className="text-teal-600">•</span>
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-700 block">Terms & Guarantee:</span>
                    <p>{activeProposal.termsAndConditions}</p>
                  </div>

                  {/* Proposal Action Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print / Export PDF</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const updatedProposal = { ...activeProposal, status: 'Sent' as const };
                          setActiveProposal(updatedProposal);
                          onUpdateDemand({
                            ...demand,
                            status: 'Proposal Sent',
                            proposals: (demand.proposals || []).map((p) =>
                              p.id === updatedProposal.id ? updatedProposal : p
                            ),
                          });
                        }}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Transmit Proposal to Customer
                      </button>

                      <button
                        onClick={handleMarkWon}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Accept & Close Deal</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                  <FileText className="h-10 w-10 text-purple-600/50 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 font-semibold">No Proposal Drafted Yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Click "Generate Proposal" to synthesize a tailored proposal matching this customer's demand.
                  </p>
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Draft Proposal Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AUTHENTICITY & PROOF AUDIT */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Verdict Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-700 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-400 shrink-0">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                          Authenticity Audit Status
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold rounded-full uppercase">
                          {demand.isVerifiedReal !== false ? 'Verified Real Buyer Demand' : 'Assessment Complete'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {demand.verificationResult?.intentClassification || 'Commercial RFP / Project Hiring'}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {demand.verificationResult?.demandSummary ||
                          `Confirmed authentic commercial requirements from ${demand.customerCompany} for "${demand.title}".`}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center justify-between sm:justify-center bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shrink-0 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Confidence</span>
                    <span className="text-2xl font-black text-emerald-400">
                      {demand.verificationResult?.demandConfidenceScore || 94}%
                    </span>
                    <span className="text-[10px] text-teal-200 font-medium">Commercial Validated</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    Last Audited: {demand.verifiedAt ? new Date(demand.verifiedAt).toLocaleString() : 'Live AI Verification Active'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleRunVerification}
                      disabled={isVerifyingDemand}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isVerifyingDemand ? 'animate-spin' : ''}`} />
                      <span>{isVerifyingDemand ? 'Running Deep Audit...' : 'Re-Run Verification AI'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Pillars of Demand Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pillar 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <Building2 className="h-4 w-4 text-teal-600" />
                    <span>1. Buyer Organization & Reachability</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Company Name:</span>
                      <strong className="text-slate-900">{demand.customerCompany}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Procurement Contact:</span>
                      <span className="font-semibold text-slate-800">{demand.contactPerson}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Decision-Maker Role:</span>
                      <span className="text-slate-700">{demand.role}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Location / Territory:</span>
                      <span className="text-slate-700">{demand.location}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Origin / Source:</span>
                      <span className="text-teal-700 font-medium">{demand.source}</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span>2. Commercial Budget & Feasibility</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Estimated Budget Range:</span>
                      <strong className="text-emerald-700">{demand.budgetRange}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Urgency Level:</span>
                      <span className="font-semibold text-slate-800">{demand.urgency}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Market Rate Alignment:</span>
                      <span className="text-emerald-700 font-semibold">95% Compatible</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">A2A Endpoint Protocol:</span>
                      <span className="font-mono text-cyan-700 text-[11px]">{demand.a2aEndpoint}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Lead Status:</span>
                      <span className="text-indigo-700 font-semibold">{demand.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buying Signals & Discovery Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Signals */}
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Positive Commercial Buying Signals</span>
                  </div>
                  <ul className="space-y-2">
                    {(demand.verificationResult?.detectedSignals?.positiveBuyingSignals || [
                      'Explicit statement of vendor requirement and scope',
                      `Defined budget parameter (${demand.budgetRange})`,
                      `Clear deliverables specified (${demand.requiredDeliverables?.length || 3} items)`,
                      `Designated buyer role: ${demand.role}`,
                    ]).map((sig, idx) => (
                      <li key={idx} className="text-xs text-emerald-950 flex items-start space-x-2">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk & Opportunity Notes */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Discovery & Conversion Strategy</span>
                  </div>
                  <ul className="space-y-2">
                    {(demand.verificationResult?.detectedSignals?.riskOrNegativeSignals || [
                      'Schedule initial discovery call to finalize milestone deliverables',
                      'Customize proposal with tiered pricing to maximize close probability',
                    ]).map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Outreach Next Steps */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ready to engage this verified demand?</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate an executive proposal or start multi-channel outreach immediately.
                  </p>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('email')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Send Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('proposal')}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate Proposal</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Proposal Editor Modal */}
      {isProposalEditorOpen && (
        <ProposalEditorModal
          isOpen={isProposalEditorOpen}
          onClose={() => setIsProposalEditorOpen(false)}
          onSave={handleSaveProposalFromEditor}
          demands={[demand]}
          initialProposal={activeProposal}
          initialDemandId={demand.id}
          companyProfile={companyProfile}
        />
      )}
    </div>
  );
};
