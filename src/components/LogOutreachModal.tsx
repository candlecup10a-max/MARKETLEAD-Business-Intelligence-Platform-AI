import React, { useState } from 'react';
import { X, Mail, Phone, Bot, MessageSquare, PhoneCall, Calendar, CheckCircle2, User, Building2 } from 'lucide-react';
import { CustomerDemand, MessageLog, CompanyProfile } from '../types';

interface LogOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (demandId: string, log: MessageLog) => void;
  demands: CustomerDemand[];
  initialDemandId?: string;
  companyProfile: CompanyProfile;
}

export const LogOutreachModal: React.FC<LogOutreachModalProps> = ({
  isOpen,
  onClose,
  onSave,
  demands,
  initialDemandId,
  companyProfile,
}) => {
  const [selectedDemandId, setSelectedDemandId] = useState<string>(
    initialDemandId || (demands[0]?.id || '')
  );

  const activeDemand = demands.find((d) => d.id === selectedDemandId) || demands[0];

  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'direct_chat' | 'a2a'>('email');
  const [direction, setDirection] = useState<'outgoing' | 'incoming'>('outgoing');
  const [subject, setSubject] = useState(
    activeDemand ? `Regarding: ${activeDemand.title}` : 'Commercial Discussion'
  );
  const [content, setContent] = useState('');
  const [customSender, setCustomSender] = useState(companyProfile.contactEmail || 'contact@apex-solutions.com');
  const [customRecipient, setCustomRecipient] = useState(activeDemand?.email || '');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!content.trim()) return;

    const targetDemand = demands.find((d) => d.id === selectedDemandId) || demands[0];
    const newLog: MessageLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      channel,
      direction,
      sender: direction === 'outgoing' ? customSender : (targetDemand?.contactPerson || 'Customer Lead'),
      recipient: direction === 'outgoing' ? (targetDemand?.email || customRecipient || 'Client') : customSender,
      subject: channel === 'email' ? (subject.trim() || `Regarding: ${targetDemand?.title || 'Commercial Inquiry'}`) : undefined,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + `, ${new Date().toLocaleDateString()}`,
    };

    onSave(targetDemand ? targetDemand.id : selectedDemandId, newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Log & Save Customer Outreach</h3>
              <p className="text-xs text-slate-500">
                Record an email, WhatsApp note, chat message, or negotiation log.
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

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-slate-50/30">
          {/* Target Customer */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Target Customer Lead</label>
            <select
              value={selectedDemandId}
              onChange={(e) => {
                setSelectedDemandId(e.target.value);
                const d = demands.find((item) => item.id === e.target.value);
                if (d) {
                  setSubject(`Regarding: ${d.title}`);
                  setCustomRecipient(d.email);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-teal-600 shadow-2xs"
            >
              {demands.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.customerCompany} — {d.contactPerson} ({d.title})
                </option>
              ))}
            </select>
          </div>

          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Outreach Channel</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'email', label: 'Email Outreach', icon: Mail, color: 'text-teal-600' },
                { id: 'whatsapp', label: 'WhatsApp', icon: Phone, color: 'text-emerald-600' },
                { id: 'direct_chat', label: 'Direct Chat / Call', icon: MessageSquare, color: 'text-amber-600' },
                { id: 'a2a', label: 'A2A Agent Log', icon: Bot, color: 'text-cyan-600' },
              ].map((c) => {
                const Icon = c.icon;
                const active = channel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id as any)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-teal-50/80 border-teal-500 text-teal-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${c.color} mb-1`} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direction */}
          <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Direction:</span>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="direction"
                checked={direction === 'outgoing'}
                onChange={() => setDirection('outgoing')}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-800 font-medium">Outgoing (Sent by our team)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="radio"
                name="direction"
                checked={direction === 'incoming'}
                onChange={() => setDirection('incoming')}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-800 font-medium">Incoming (Received from client)</span>
            </label>
          </div>

          {/* Subject (for email) */}
          {channel === 'email' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Proposal for Enterprise Infrastructure Scoping"
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-600 shadow-2xs"
              />
            </div>
          )}

          {/* Content / Message Body */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Outreach Message / Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste email text, WhatsApp transcript, client discussion summary, or meeting notes..."
              className="w-full p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-teal-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Footer */}
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
            disabled={!content.trim()}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Save Outreach Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
