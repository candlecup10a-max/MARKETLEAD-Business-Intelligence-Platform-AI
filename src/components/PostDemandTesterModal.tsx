import React, { useState } from 'react';
import {
  X,
  SearchCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Tag
} from 'lucide-react';
import { BusinessType, CompanyProfile, CustomerDemand, PostDemandCheckResult } from '../types';
import { checkPostDemandApi } from '../services/apiService';

interface PostDemandTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDemand?: (demand: CustomerDemand) => void;
  selectedBusinessType: BusinessType;
  companyProfile: CompanyProfile | null;
}

const PRESET_SAMPLE_POSTS = [
  {
    label: 'Real RFP Buyer (High Demand)',
    type: 'positive',
    url: 'https://linkedin.com/posts/acme-procurement_hiring-bids',
    text: `Looking for an established web development agency or security firm to audit and overhaul our multi-tenant SaaS application before Q4 launch. We need ISO27001 readiness, full automated penetration testing, and SSO (Okta + SAML) integration. 
Budget approved: $35,000 - $60,000. 
Must start within 10 days. Please send capabilities deck and rate card to sarah.miller@acmesolutions.io or DM me.`,
  },
  {
    label: 'Vendor Self-Promotion (Zero Buyer Demand)',
    type: 'negative',
    url: 'https://twitter.com/devagency/status/1928371928',
    text: `🚀 Want 10x faster growth? We build high-converting landing pages and bespoke mobile apps for B2B brands. Our team has shipped 100+ projects with 99.9% uptime. DM me today for a 100% free audit and discovery call! #agency #design #dev #marketing`,
  },
  {
    label: 'Community Question / Advice (No Commercial Demand)',
    type: 'neutral',
    url: 'https://reddit.com/r/startups/comments/9823h1',
    text: `Hey founders, what tech stack do you recommend for building an MVP in 2026? We are thinking between Next.js and Remix. Just curious what has worked well for bootstrapped teams with no budget yet. Thanks for any advice!`,
  },
];

export const PostDemandTesterModal: React.FC<PostDemandTesterModalProps> = ({
  isOpen,
  onClose,
  onImportDemand,
  selectedBusinessType,
  companyProfile,
}) => {
  const [postText, setPostText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkResult, setCheckResult] = useState<PostDemandCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasImported, setHasImported] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!postText.trim()) {
      setErrorMsg('Please enter or paste a post/message to test for customer demand.');
      return;
    }

    setErrorMsg('');
    setCheckResult(null);
    setHasImported(false);
    setIsAnalyzing(true);

    try {
      const res = await checkPostDemandApi(postText, sourceUrl, selectedBusinessType, companyProfile);
      setCheckResult(res);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demand analysis encountered an issue.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = (sample: typeof PRESET_SAMPLE_POSTS[0]) => {
    setPostText(sample.text);
    setSourceUrl(sample.url);
    setCheckResult(null);
    setHasImported(false);
    setErrorMsg('');
  };

  const handleAddToPipeline = () => {
    if (checkResult?.extractedDemand && onImportDemand) {
      onImportDemand(checkResult.extractedDemand);
      setHasImported(true);
    }
  };

  const handleCopyReport = () => {
    if (!checkResult) return;
    const summary = `Demand Check Report:\nStatus: ${checkResult.hasDemand ? 'DEMAND DETECTED' : 'NO COMMERCIAL DEMAND'}\nConfidence: ${checkResult.demandConfidenceScore}%\nClassification: ${checkResult.intentClassification}\nSummary: ${checkResult.demandSummary}\nTarget Category: ${selectedBusinessType.business_type_name}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-6 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl">
                <SearchCheck className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold tracking-tight">Real Post Demand Verifier</h2>
                  <span className="px-2.5 py-0.5 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    AI Test Bench
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Paste any real post, tweet, RFP, or forum thread to instantly verify whether genuine buyer demand exists.
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

          {/* Quick presets */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Quick Test Presets:
            </span>
            {PRESET_SAMPLE_POSTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                  sample.type === 'positive'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80'
                    : sample.type === 'negative'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/80'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input block */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Enter / Paste Real Post Content:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Target: <strong className="text-indigo-600">{selectedBusinessType.business_type_name}</strong>
                </span>
              </div>
              <textarea
                rows={5}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Paste the raw text of a LinkedIn post, Tweet/X, Reddit thread, Upwork job, or email inquiry to verify if real commercial demand exists..."
                className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 font-mono transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Source URL / Link (Optional)</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://linkedin.com/posts/... or https://x.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Active Business Category</label>
                <div className="px-3 py-2 text-xs bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-900 font-medium flex items-center justify-between">
                  <span className="truncate">{selectedBusinessType.business_type_name}</span>
                  <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1.5" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !postText.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                  <span>Verifying Post Intent & Extracting Buying Signals...</span>
                </>
              ) : (
                <>
                  <SearchCheck className="h-4 w-4" />
                  <span>Analyze Post for Real Demand</span>
                </>
              )}
            </button>
          </div>

          {/* RESULTS CARD */}
          {checkResult && (
            <div className="pt-2 border-t border-slate-100 space-y-4">
              {/* Intent Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  checkResult.hasDemand
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-900'
                    : checkResult.intentClassification.includes('Selling')
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-900'
                    : 'bg-gradient-to-r from-slate-50 to-rose-50 border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      checkResult.hasDemand
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : checkResult.intentClassification.includes('Selling')
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {checkResult.hasDemand ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Demand Verdict
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          checkResult.hasDemand
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {checkResult.hasDemand ? 'REAL DEMAND FOUND' : 'NO COMMERCIAL DEMAND'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold mt-0.5">
                      {checkResult.intentClassification}
                    </h3>
                    <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                      {checkResult.demandSummary}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-200 shrink-0 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Confidence
                  </span>
                  <span
                    className={`text-xl font-black ${
                      checkResult.demandConfidenceScore >= 70
                        ? 'text-emerald-600'
                        : checkResult.demandConfidenceScore >= 40
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {checkResult.demandConfidenceScore}%
                  </span>
                </div>
              </div>

              {/* Signals breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Positive signals */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Positive Buying Signals ({checkResult.detectedSignals.positiveBuyingSignals.length})</span>
                  </div>
                  {checkResult.detectedSignals.positiveBuyingSignals.length > 0 ? (
                    <ul className="space-y-1.5">
                      {checkResult.detectedSignals.positiveBuyingSignals.map((sig, i) => (
                        <li key={i} className="text-[11px] text-emerald-900 flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No positive buyer signals found in this post.</p>
                  )}
                </div>

                {/* Risk or Missing Signals */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Risk Factors / Negative Signals</span>
                  </div>
                  <ul className="space-y-1.5">
                    {checkResult.detectedSignals.riskOrNegativeSignals.map((risk, i) => (
                      <li key={i} className="text-[11px] text-slate-700 flex items-start space-x-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Extracted Key Entities */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Extracted Lead & Procurement Metadata
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Fit Score: {checkResult.businessAlignment.fitScore}/100
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">POTENTIAL CLIENT</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {checkResult.keyEntities.potentialCustomerCompany || 'Unspecified Org'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">EST. BUDGET</span>
                    <span className="font-semibold text-emerald-700 truncate block">
                      {checkResult.keyEntities.estimatedBudgetLevel || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">TIMELINE</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {checkResult.keyEntities.urgencyTimeline || 'Flexible'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">LOCATION</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {checkResult.keyEntities.inferredLocation || 'Global'}
                    </span>
                  </div>
                </div>

                {checkResult.keyEntities.requiredServices.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Identified Service Requirements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {checkResult.keyEntities.requiredServices.map((srv, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[11px] font-medium"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Report Copied!' : 'Copy Analysis Summary'}</span>
                </button>

                {checkResult.hasDemand && checkResult.extractedDemand && (
                  <button
                    type="button"
                    onClick={handleAddToPipeline}
                    disabled={hasImported}
                    className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer ${
                      hasImported
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-500/25'
                    }`}
                  >
                    {hasImported ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Demand Added to Active Pipeline!</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Add Verified Demand to Pipeline & Generate Proposal</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
