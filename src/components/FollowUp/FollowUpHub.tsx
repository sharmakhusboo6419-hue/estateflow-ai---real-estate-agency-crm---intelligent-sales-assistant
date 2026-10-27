import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
  MessageSquare,
  Mail,
  Smartphone,
  Clock,
  CheckCircle2,
  RefreshCw,
  Building2,
  User,
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { Lead, Property, FollowUpActivity, Channel, LeadTemperature } from '../../types/realEstate';

interface FollowUpHubProps {
  leads: Lead[];
  properties: Property[];
  followUpActivities: FollowUpActivity[];
  onAddFollowUp: (activity: FollowUpActivity) => void;
  preselectedLead?: Lead | null;
}

export const FollowUpHub: React.FC<FollowUpHubProps> = ({
  leads,
  properties,
  followUpActivities,
  onAddFollowUp,
  preselectedLead,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    preselectedLead?.id || leads[0]?.id || ''
  );
  const [channel, setChannel] = useState<Channel>('WhatsApp');
  const [tone, setTone] = useState<string>('Warm & Proactive');
  const [goal, setGoal] = useState<string>('Suggest available viewing slots');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);
  const [filterTemp, setFilterTemp] = useState<LeadTemperature | 'All'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
  const matchedProperty = properties.find((p) => p.id === selectedLead?.interestedPropertyId) || properties[0];

  const handleGenerateAI = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/followup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: selectedLead,
          property: matchedProperty,
          channel,
          tone,
          goal,
        }),
      });

      const data = await response.json();
      setMessage(data.message || '');
      if (data.subject) setSubject(data.subject);
    } catch (err) {
      console.error('Follow-up generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendAndSimulate = () => {
    if (!selectedLead || !message.trim()) return;

    setIsSimulatingSend(true);

    const newActivity: FollowUpActivity = {
      id: `f-${Date.now()}`,
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      leadTemperature: selectedLead.temperature,
      propertyTitle: matchedProperty?.title || 'Portfolio Inquiry',
      channel,
      subject: channel === 'Email' ? subject : undefined,
      message: message.trim(),
      status: 'Sent',
      sentAt: 'Just now',
      goal,
    };

    onAddFollowUp(newActivity);

    setTimeout(() => {
      let simulatedReply = '';
      if (selectedLead.temperature === 'Hot') {
        simulatedReply = 'Hi! Thanks for checking in. Yes, Saturday at 11:00 AM works great for us. See you there!';
      } else if (selectedLead.temperature === 'Warm') {
        simulatedReply = 'Appreciate the update! Could you send over the estimated property tax breakdown too?';
      } else {
        simulatedReply = 'Thanks for the listings! I will take a look this weekend when free.';
      }

      const repliedActivity: FollowUpActivity = {
        ...newActivity,
        status: 'Client Replied',
        clientReply: simulatedReply,
      };

      onAddFollowUp(repliedActivity);
      setIsSimulatingSend(false);
      setMessage('');
    }, 2400);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredActivities = followUpActivities.filter((a) => {
    if (filterTemp === 'All') return true;
    return a.leadTemperature === filterTemp;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="surface-card rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#dfc195]" />
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Follow-up Cadence & Client Outreach
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Multichannel outbound engine: Accelerate hot buyers, nurture active warm prospects, and re-engage inactive leads.
            </p>
          </div>

          <span className="self-start md:self-auto text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Cadence Engine Active
          </span>
        </div>

        {/* 3 Temperature Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/[0.06] text-xs">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-300 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Hot Buyers Cadence
              </span>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
                2-4 Hours
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Lock in VIP tour windows, financing pre-approvals, and priority offers while interest is peaked.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-200 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Warm Prospects Cadence
              </span>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
                24-48 Hours
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Dispatch 3D Matterport tours, neighborhood school reports, and invitations to open weekend showings.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-300 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                Nurture Cadence
              </span>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
                7d Drip
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Automated price reductions and new listings alert matching client's initial budget ceiling.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio: Composer on Left, Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left: AI Follow-up Studio */}
        <div className="surface-card rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#dfc195]" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Follow-up Composer
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              Gemini 3.8 Flash
            </span>
          </div>

          {/* Client & Channel Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Target Client *</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  setMessage('');
                }}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.temperature} • ${l.budget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Delivery Channel *</label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-0.5 rounded-lg border border-white/[0.08]">
                {(['WhatsApp', 'SMS', 'Email'] as Channel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-1 rounded-md text-center text-xs font-medium transition cursor-pointer ${
                      channel === c
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Client Insight Bar */}
          {selectedLead && (
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-white text-xs">{selectedLead.name}</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">
                  Budget: <strong className="font-mono text-emerald-400">${selectedLead.budget.toLocaleString()}</strong> • Timeline: {selectedLead.timeline}
                </span>
              </div>
              <div>
                {selectedLead.temperature === 'Hot' && (
                  <span className="text-[11px] font-medium text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    Hot Lead
                  </span>
                )}
                {selectedLead.temperature === 'Warm' && (
                  <span className="text-[11px] font-medium text-amber-200 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Warm Prospect
                  </span>
                )}
                {selectedLead.temperature === 'Cold' && (
                  <span className="text-[11px] font-medium text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                    Cold Lead
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tone & Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
              >
                <option value="Urgent & Exclusive VIP">Urgent & Exclusive VIP</option>
                <option value="Warm & Proactive">Warm & Proactive</option>
                <option value="Professional & Data-Driven">Professional & Data-Driven</option>
                <option value="Casual & Low-Pressure">Casual & Low-Pressure</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Objective</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
              >
                <option value="Suggest available viewing slots">Suggest available viewing slots</option>
                <option value="Share 3D Matterport virtual tour">Share 3D Matterport virtual tour</option>
                <option value="Alert on recent price drops in area">Alert on recent price drops in area</option>
                <option value="Re-engage after 7 days of inactivity">Re-engage after 7 days of inactivity</option>
              </select>
            </div>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] disabled:opacity-40 text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{isGenerating ? 'Drafting Proposal...' : 'Generate Follow-Up with AI'}</span>
          </button>

          {/* Message Preview & Editor */}
          {channel === 'Email' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject Line"
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#c8a97e]"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-zinc-300">
                Drafted Message ({channel})
              </label>
              <span className="font-mono text-[10px] text-zinc-500">{message.length} chars</span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Click 'Generate Follow-Up with AI' above or draft custom message..."
              className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e] leading-relaxed font-sans"
            />
          </div>

          {/* Dispatch Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-500">
              Gateway: <span className="text-zinc-400">{channel} Business API</span>
            </span>
            <button
              onClick={handleSendAndSimulate}
              disabled={!message.trim() || isSimulatingSend}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{isSimulatingSend ? 'Simulating Response...' : 'Send & Simulate Reply'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Follow-Up Activity Feed */}
        <div className="surface-card rounded-xl p-4 sm:p-5 flex flex-col lg:min-h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3.5">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#dfc195]" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Follow-up Activity Feed
              </h3>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {(['All', 'Hot', 'Warm', 'Cold'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTemp(t)}
                  className={`px-2 py-0.5 rounded text-xs transition cursor-pointer ${
                    filterTemp === t ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Stream list */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-0.5 scrollbar-none">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                No follow-ups recorded yet. Generate one on the left.
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-zinc-900/80 border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-3 text-xs space-y-2 transition shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">{act.leadName}</span>
                      <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded border border-white/[0.06]">
                        {act.channel}
                      </span>
                      {act.leadTemperature === 'Hot' && (
                        <span className="text-[10px] font-medium text-rose-300 px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20">
                          Hot
                        </span>
                      )}
                      {act.leadTemperature === 'Warm' && (
                        <span className="text-[10px] font-medium text-amber-200 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                          Warm
                        </span>
                      )}
                      {act.leadTemperature === 'Cold' && (
                        <span className="text-[10px] font-medium text-sky-300 px-1.5 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">
                          Cold
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-500">{act.sentAt}</span>
                      <button
                        onClick={() => handleCopy(act.message, act.id)}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === act.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {act.subject && (
                    <p className="font-medium text-zinc-200 text-xs">
                      Subject: {act.subject}
                    </p>
                  )}

                  <p className="text-zinc-300 whitespace-pre-line bg-black/20 p-2.5 rounded border border-white/[0.04] leading-relaxed text-xs">
                    {act.message}
                  </p>

                  {/* Simulated Client Reply if Present */}
                  {act.clientReply && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded space-y-0.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-medium text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Buyer Response:
                      </div>
                      <p className="text-emerald-100 text-xs">
                        "{act.clientReply}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
