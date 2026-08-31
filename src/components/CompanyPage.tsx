import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  Mail,
  Phone,
  Bot,
  Globe,
  MapPin,
  Tag,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Radar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users
} from 'lucide-react';
import { BusinessType, CompanyProfile, CustomerDemand, Proposal } from '../types';
import { CountryDropdown } from './CountryDropdown';
import { Country, findCountry, COUNTRIES } from '../data/countries';

interface CompanyPageProps {
  businessType: BusinessType;
  companyProfile: CompanyProfile;
  onSaveProfile: (profile: CompanyProfile) => void;
  demands: CustomerDemand[];
  proposals: Proposal[];
  onTriggerScrape: () => void;
  isScraping: boolean;
  onViewDemands: () => void;
}

export const CompanyPage: React.FC<CompanyPageProps> = ({
  businessType,
  companyProfile,
  onSaveProfile,
  demands,
  proposals,
  onTriggerScrape,
  isScraping,
  onViewDemands,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    const matched = findCountry(companyProfile.location);
    return matched?.code || 'US';
  });
  const [newServiceInput, setNewServiceInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    setFormData(companyProfile);
    const matched = findCountry(companyProfile.location);
    if (matched) {
      setSelectedCountryCode(matched.code);
    }
  }, [companyProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    if (!formData.services.includes(newServiceInput.trim())) {
      setFormData({
        ...formData,
        services: [...formData.services, newServiceInput.trim()],
      });
    }
    setNewServiceInput('');
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== serviceToRemove),
    });
  };

  // AI Auto-Brand Generator for this business type
  const handleAIGenerateBranding = () => {
    setIsGeneratingAI(true);
    const bName = businessType.business_type_name;
    const cleanName = bName.split(' ')[0];

    setTimeout(() => {
      const generatedProfile: CompanyProfile = {
        ...formData,
        companyName: `Apex ${cleanName} Dynamics`,
        tagline: `Next-generation certified ${bName.toLowerCase()} solutions tailored for rapid scaling.`,
        location: businessType.place === 'Virtual / Cloud Space' ? 'Global Cloud Operations' : 'San Francisco & London',
        website: `https://apex-${cleanName.toLowerCase()}-solutions.com`,
        contactEmail: `procurement@apex-${cleanName.toLowerCase()}.com`,
        contactPhone: '+1 415 800 9420',
        a2aAgentId: `A2A-AGENT-${Math.floor(1000 + Math.random() * 9000)}`,
        pricingModel: 'Milestone-Based Fixed Scope & Monthly SLA Retainers',
        valueProposition: `We deliver enterprise-grade ${bName} operations with guaranteed turnaround times, transparent milestone tracking, and dedicated technical leadership.`,
        services: [
          `Full-Lifecycle ${bName} Execution`,
          `Custom SLA & 24/7 Quality Assurance`,
          `Rapid Milestone Turnaround (1-2 weeks)`,
          `Automated A2A Procurement Integration`,
          `Post-Deployment Optimization & Support`,
        ],
        bio: `Apex ${cleanName} Dynamics is an established commercial leader specializing in ${bName}. Serving B2B enterprises, retail chains, and government contractors across North America and Europe.`,
      };
      setFormData(generatedProfile);
      onSaveProfile(generatedProfile);
      setIsGeneratingAI(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 400);
  };

  // Stats for this company
  const totalLeads = demands.length;
  const contactedCount = demands.filter((d) => d.status !== 'New').length;
  const wonCount = demands.filter((d) => d.status === 'Won').length;
  const totalProposals = proposals.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-teal-600/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-md shrink-0">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                  Company Management Page
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {businessType.business_id}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {formData.companyName || 'My Company Portal'}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {formData.tagline || `Specializing in ${businessType.business_type_name}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="ai-auto-brand-btn"
              onClick={handleAIGenerateBranding}
              disabled={isGeneratingAI}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-teal-500/20 hover:from-amber-500/30 hover:to-teal-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isGeneratingAI ? 'Generating...' : 'AI Auto-Brand Profile'}</span>
            </button>

            <button
              id="company-page-scrape-btn"
              onClick={onTriggerScrape}
              disabled={isScraping}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              <Radar className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Scraping Leads...' : 'Scrape Customers Now'}</span>
            </button>
          </div>
        </div>

        {/* Live Company Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/80">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>Scraped Demands</span>
              <Users className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalLeads}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Last 6 months</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>Contacted Leads</span>
              <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <div className="text-xl font-bold text-white">{contactedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Email / WhatsApp / A2A</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>Active Proposals</span>
              <FileCheck2 className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white">{totalProposals}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Commercial dockets</div>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
            <div className="flex items-center justify-between text-slate-300 text-xs mb-1">
              <span>Won / Closed Deals</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">{wonCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Converted customers</div>
          </div>
        </div>
      </div>

      {/* Form & Profile Configuration */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Primary Company Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span>Core Brand & Business Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Acme Technical Solutions"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Business Category
                </label>
                <input
                  type="text"
                  disabled
                  value={`${businessType.business_type_name} (${businessType.online_or_onsite})`}
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Elevator Pitch
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Certified enterprise provider delivering high-efficiency execution"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Value Proposition (Used by AI for Proposals & Outreaches)
              </label>
              <textarea
                rows={3}
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                placeholder="Highlight your domain strengths, certifications, speed, guarantees..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pricing Strategy & Standard Terms
              </label>
              <input
                type="text"
                value={formData.pricingModel}
                onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                placeholder="e.g. Fixed Scope Milestone + Retainers ($10k - $50k)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Company Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Background, founding year, key clientele, geographic coverage..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Services & Capabilities Pill Manager */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Tag className="h-4 w-4 text-teal-600" />
              <span>Service Capabilities & Deliverable Offerings</span>
            </h3>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newServiceInput}
                onChange={(e) => setNewServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddService();
                  }
                }}
                placeholder="Add a core service (e.g. 24/7 Rapid Prototyping, Enterprise SLA)..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Add Service
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.services.map((s, idx) => (
                <span
                  key={`svc-${idx}-${s}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-medium"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(s)}
                    className="hover:text-red-500 text-teal-600 text-xs font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Communication Endpoints & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Bot className="h-4 w-4 text-teal-600" />
              <span>Outreach & Agent Channels</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Mail className="h-3 w-3 text-slate-500" />
                <span>Contact Email</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                <span>WhatsApp / Phone Number</span>
              </label>
              <div className="flex space-x-2">
                <div className="w-36 shrink-0">
                  <CountryDropdown
                    id="company-phone-country-dropdown"
                    value={selectedCountryCode}
                    onChange={(country) => {
                      if (country) {
                        setSelectedCountryCode(country.code);
                        // Update dial code in phone if not already present
                        const cleanNumber = formData.contactPhone.replace(/^\+\d+[\s-]*/, '');
                        setFormData({
                          ...formData,
                          contactPhone: `${country.dialCode} ${cleanNumber || '415 555 0199'}`.trim(),
                        });
                      }
                    }}
                    showDialCode={true}
                    placeholder="Dial Code"
                    buttonClassName="px-2.5 py-2 text-[11px]"
                  />
                </div>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+1 415 555 0199"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Bot className="h-3 w-3 text-teal-600" />
                <span>Autonomous A2A Agent ID</span>
              </label>
              <input
                type="text"
                value={formData.a2aAgentId}
                onChange={(e) => setFormData({ ...formData, a2aAgentId: e.target.value })}
                placeholder="A2A-AGENT-9941"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Used for automated Machine-to-Machine procurement handshakes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Globe className="h-3 w-3 text-slate-500" />
                <span>Website URL</span>
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://mycompany.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <CountryDropdown
                id="company-country-select"
                label="Headquarters / Primary Country"
                value={selectedCountryCode}
                onChange={(country) => {
                  if (country) {
                    setSelectedCountryCode(country.code);
                    const currentCity = formData.location.includes(',') ? formData.location.split(',')[0].trim() : '';
                    const newLocation = currentCity ? `${currentCity}, ${country.name}` : `${country.name} (${country.code})`;
                    setFormData({
                      ...formData,
                      location: newLocation,
                    });
                  }
                }}
                placeholder="Select country (249 available)..."
              />

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span>City / Regional Office Location</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Austin, TX & Global Operations"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                id="save-company-profile-btn"
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                <Save className="h-4 w-4" />
                <span>{isSaved ? 'Company Profile Saved!' : 'Save Company Page'}</span>
              </button>
              {isSaved && (
                <p className="text-[11px] text-emerald-600 text-center mt-2 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Profile updated & ready for customer matching</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scraper Quick Actions
            </h4>
            <button
              type="button"
              onClick={onViewDemands}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>View Scraped Customer Demands</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
