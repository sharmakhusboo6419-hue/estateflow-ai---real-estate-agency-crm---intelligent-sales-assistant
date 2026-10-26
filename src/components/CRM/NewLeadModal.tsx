import React, { useState } from 'react';
import { X, UserPlus, Flame, Sun, Snowflake, DollarSign, Building2 } from 'lucide-react';
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

  // Dynamic temperature calculator as user inputs budget
  const budgetNum = Number(budget) || 0;
  let dynamicTemp: LeadTemperature = 'Cold';
  let tempRationale = '';
  if (budgetNum >= 1000000) {
    dynamicTemp = 'Hot';
    tempRationale = 'High-net-worth tier ($1M+). Prioritized for immediate VIP viewing and senior broker handling.';
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
      aiScore: dynamicTemp === 'Hot' ? 95 : dynamicTemp === 'Warm' ? 75 : 35,
      aiSummary: `New client added with budget of $${budgetNum.toLocaleString()}. Categorized as ${dynamicTemp} lead.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-white text-base">Add New Client to CRM</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rachel & Robert Taylor"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Budget with Live AI Temperature Feedback */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Target Budget ($ USD) *
              </label>
              <span className="text-[11px] text-slate-400">Determines lead temperature tier</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                min="50000"
                step="25000"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Live Auto-Categorization Card */}
            <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">AI Temperature:</span>
                {dynamicTemp === 'Hot' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-300 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> HOT LEAD ($1M+)
                  </span>
                )}
                {dynamicTemp === 'Warm' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> WARM LEAD ($450k-$1M)
                  </span>
                )}
                {dynamicTemp === 'Cold' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-sky-300 px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40">
                    <Snowflake className="w-3.5 h-3.5 text-sky-400" /> COLD LEAD (&lt;$450k)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Buying Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                <option value="Within 30-60 days">Within 30-60 days</option>
                <option value="2-4 months">2-4 months</option>
                <option value="6+ months (Browsing)">6+ months (Browsing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Property Interest
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
              className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="preApproved" className="text-xs text-slate-300 cursor-pointer">
              Client already has mortgage pre-approval letter or proof of funds
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition cursor-pointer"
            >
              Add to CRM Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
