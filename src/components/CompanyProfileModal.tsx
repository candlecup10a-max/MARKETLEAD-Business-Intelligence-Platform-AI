import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  Globe,
  Award,
  Sparkles,
  Bot,
  CheckCircle2,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { CompanyProfile, BusinessType } from '../types';
import { CountryDropdown } from './CountryDropdown';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
  selectedBusinessType: BusinessType;
  businessTypes: BusinessType[];
  onSelectBusinessType: (bt: BusinessType) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  selectedBusinessType,
  businessTypes,
  onSelectBusinessType,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...profile });
  const [activeTab, setActiveTab] = useState<'profile' | 'a2a' | 'materials'>('profile');
  const [newMaterialInput, setNewMaterialInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddMaterial = () => {
    if (!newMaterialInput.trim()) return;
    setFormData({
      ...formData,
      marketingMaterials: [...(formData.marketingMaterials || []), newMaterialInput.trim()],
    });
    setNewMaterialInput('');
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      marketingMaterials: (formData.marketingMaterials || []).filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-600/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Company & Vendor Profile Configuration
              </h3>
              <p className="text-xs text-slate-500">
                Your business persona powers AI demand matching, proposal generation, and A2A autonomous protocols.
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

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-teal-600 text-teal-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            General Company Identity
          </button>
          <button
            onClick={() => setActiveTab('a2a')}
            className={`py-3 px-4 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'a2a'
                ? 'border-teal-600 text-teal-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            A2A Autonomous Agent Config
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`py-3 px-4 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'border-teal-600 text-teal-600 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Value Prop & Marketing Deck
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Active Business Type Sector Selection */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Business Industry / Sector
                </label>
                <select
                  value={selectedBusinessType.business_id}
                  onChange={(e) => {
                    const found = businessTypes.find((bt) => bt.business_id === e.target.value);
                    if (found) {
                      onSelectBusinessType(found);
                      setFormData({ ...formData, businessTypeId: found.business_id });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-teal-600"
                >
                  {businessTypes.map((bt) => (
                    <option key={bt.business_id} value={bt.business_id}>
                      {bt.business_type_name} ({bt.delivery_mode})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Select your primary industry category from the 500+ registered business registry.
                </p>
              </div>

              {/* Company Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline / Specialty</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span>Commercial Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>Direct Phone / WhatsApp</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Globe className="h-3 w-3 text-slate-400" />
                    <span>Website Domain</span>
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
              </div>

              {/* Location Country Dropdown (All 249 Countries) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Headquarters Country & Region</span>
                  <span className="text-[10px] text-slate-500 font-normal">All 249 ISO Nations Available</span>
                </label>
                <CountryDropdown
                  id="company-hq-country-dropdown"
                  value={formData.countryCode || 'US'}
                  onChange={(country) => {
                    if (country) {
                      setFormData({
                        ...formData,
                        countryCode: country.code,
                        countryName: country.name,
                        location: `${formData.location?.split(',')[0]?.trim() || 'Headquarters'}, ${country.name}`,
                      });
                    }
                  }}
                />
              </div>

              {/* Company Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Executive Overview & Scope</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 leading-relaxed shadow-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'a2a' && (
            <div className="space-y-4">
              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 text-xs text-teal-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-teal-800">
                  <Bot className="h-4 w-4 text-teal-600" />
                  <span>Agent-to-Agent Autonomous Protocol Profile</span>
                </div>
                <p>
                  When customer demands are discovered, their procurement agent will initiate a machine-readable protocol handshake against your endpoint.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Agent Identifier</label>
                  <input
                    type="text"
                    value={formData.a2aAgentId || 'A2A-VENDOR-770'}
                    onChange={(e) => setFormData({ ...formData, a2aAgentId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">A2A Direct Protocol Endpoint</label>
                  <input
                    type="text"
                    value={formData.a2aEndpoint || 'a2a://apex-solutions.procure.network/v1/agent'}
                    onChange={(e) => setFormData({ ...formData, a2aEndpoint: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Commercial Turnaround SLA
                  </label>
                  <input
                    type="text"
                    value={formData.standardTurnaround || '2 - 3 Weeks'}
                    onChange={(e) => setFormData({ ...formData, standardTurnaround: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Payment & Retainer Terms</label>
                  <input
                    type="text"
                    value={formData.defaultPaymentTerms || '50% upfront / 50% on milestone sign-off'}
                    onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Value Propositions & Capabilities Checklist
                </label>
                <div className="space-y-2">
                  {(formData.marketingMaterials || []).map((mat, idx) => (
                    <div
                      key={`mat-${idx}-${mat}`}
                      className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 shadow-xs"
                    >
                      <span className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-teal-600 shrink-0" />
                        <span>{mat}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newMaterialInput}
                    onChange={(e) => setNewMaterialInput(e.target.value)}
                    placeholder="Add certification, capability, or credential (e.g. ISO 27001 Certified)..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
