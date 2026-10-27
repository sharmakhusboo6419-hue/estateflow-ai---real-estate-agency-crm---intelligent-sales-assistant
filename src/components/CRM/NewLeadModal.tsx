import React, { useState } from 'react';
import { X, UserPlus, Flame, Sun, Snowflake, DollarSign, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { Lead, LeadTemperature, Property } from '../../types/realEstate';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onAddLead: (lead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  properties,
  onAddLead,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('850000');
  const [timeline, setTimeline] = useState('Within 30-60 days');
  const [preferredLocation, setPreferredLocation] = useState('Downtown Metro');
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [preApproved, setPreApproved] = useState(true);

  const budgetNum = Number(budget) || 0;
  let dynamicTemp: LeadTemperature = 'Cold';
  let tempRationale = '';
  if (budgetNum >= 1000000) {
    dynamicTemp = 'Hot';
    tempRationale = 'High-net-worth tier ($1M+). Prioritized for VIP tour scheduling and senior broker handling.';
  } else if (budgetNum >= 450000) {
    dynamicTemp = 'Warm';
    tempRationale = 'Core buyer sweet spot ($450k - $999k). Ready for active property matching and weekend tour proposals.';
  } else {
    dynamicTemp = 'Cold';
    tempRationale = 'Entry tier (<$450k). Enrolled into automated property price drop and new listing nurture drip.';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone.trim() || '+1 (555) 000-1234',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (budgetNum % 1000)}?auto=format&fit=crop&w=256&q=80`,
      budget: budgetNum,
      temperature: dynamicTemp,
      stage: 'New Lead',
      timeline,
      preferredLocation,
      preferredPropertyType: 'Any',
      interestedPropertyId: selectedPropertyId || undefined,
      preApproved,
      aiScore: dynamicTemp === 'Hot' ? 96 : dynamicTemp === 'Warm' ? 82 : 38,
      aiSummary: `New client added with budget of $${budgetNum.toLocaleString()}. Categorized as ${dynamicTemp} tier.`,
      temperatureRationale: tempRationale,
      lastContactAt: 'Just now',
      unreadCount: 0,
      notes: [`Lead registered manually into CRM. Timeline: ${timeline}.`],
      tags: [dynamicTemp === 'Hot' ? 'Priority Buyer' : dynamicTemp === 'Warm' ? 'Qualified' : 'Long-term'],
      assignedAgent: 'Marcus Sterling',
      createdAt: new Date().toISOString(),
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="surface-elevated rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
        <div className="p-4 bg-zinc-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#dfc195]" />
            <div>
              <h2 className="font-semibold text-white text-sm">Add Client to Pipeline</h2>
              <p className="text-[11px] text-zinc-400">Automated budget-based tier qualification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel & Robert Taylor"
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
              />
            </div>
          </div>

          {/* Budget with Live Feedback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">
                Target Budget ($ USD) *
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Calculates Tier</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>
              <input
                type="number"
                min="50000"
                step="25000"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono font-semibold focus:outline-none focus:border-[#c8a97e]"
              />
            </div>

            {/* Live Auto-Categorization Card */}
            <div className="mt-2 p-2.5 rounded-lg bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-400">Classified Tier:</span>
              {dynamicTemp === 'Hot' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> HOT LEAD ($1M+)
                </span>
              )}
              {dynamicTemp === 'Warm' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> WARM LEAD ($450k+)
                </span>
              )}
              {dynamicTemp === 'Cold' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300 px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> COLD LEAD (&lt;$450k)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Buying Horizon
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
              >
                <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                <option value="Within 30-60 days">Within 30-60 days</option>
                <option value="2-4 months">2-4 months</option>
                <option value="6+ months (Browsing)">6+ months (Browsing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Interested Property
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (${p.price.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="preApproved"
              checked={preApproved}
              onChange={(e) => setPreApproved(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-[#c8a97e] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="preApproved" className="text-xs text-zinc-300 cursor-pointer">
              Client has mortgage pre-approval letter or proof of funds
            </label>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 transition cursor-pointer shadow-sm"
            >
              Add to CRM Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
