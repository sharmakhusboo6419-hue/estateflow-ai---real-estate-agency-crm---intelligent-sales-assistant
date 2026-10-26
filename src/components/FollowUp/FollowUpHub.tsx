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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Automated AI Follow-up Hub & Drip Engine
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous multichannel communication: Accelerate hot buyers, nurture warm prospects, and re-engage stale leads.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Automated Follow-up Engine Active
            </span>
          </div>
        </div>

        {/* 3 Temperature Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/20 to-slate-950 border border-rose-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-rose-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400" /> HOT BUYERS CADENCE
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full">
                2-4 Hours
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Lock in VIP tour windows, financing pre-approvals, and priority offers before buyer shifts interest.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/20 to-slate-950 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-400" /> WARM PROSPECTS CADENCE
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                24-48 Hours
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dispatch 3D Matterport tours, neighborhood school reports, and invitations to open weekend showings.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-950/20 to-slate-950 border border-sky-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-sky-300 flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-sky-400" /> COLD / NURTURE CADENCE
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full">
                Weekly Drip
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated price reductions and new listings alert matching client's initial budget ceiling.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio: Composer on Left, Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Left: AI Follow-up Studio */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                AI Follow-up Studio
              </h3>
            </div>
            <span className="text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Gemini 3.8 Flash
            </span>
          </div>

          {/* Client & Channel Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Target Client *</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  setMessage('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.temperature} • ${l.budget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Delivery Channel *</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(['WhatsApp', 'SMS', 'Email'] as Channel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-1.5 rounded-xl text-center font-bold text-xs transition cursor-pointer ${
                      channel === c
                        ? c === 'WhatsApp'
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : c === 'SMS'
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
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
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">{selectedLead.name}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">
                  Budget: <strong className="text-emerald-300">${selectedLead.budget.toLocaleString()}</strong> • Timeline: {selectedLead.timeline}
                </span>
              </div>
              <div>
                {selectedLead.temperature === 'Hot' && (
                  <span className="text-xs font-black text-rose-300 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40">
                    🔥 Hot Lead
                  </span>
                )}
                {selectedLead.temperature === 'Warm' && (
                  <span className="text-xs font-black text-amber-300 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                    🌤️ Warm Prospect
                  </span>
                )}
                {selectedLead.temperature === 'Cold' && (
                  <span className="text-xs font-black text-sky-300 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40">
                    ❄️ Cold Lead
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tone & Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Urgent & Exclusive VIP">Urgent & Exclusive VIP</option>
                <option value="Warm & Proactive">Warm & Proactive</option>
                <option value="Professional & Data-Driven">Professional & Data-Driven</option>
                <option value="Casual & Low-Pressure">Casual & Low-Pressure</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Campaign Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
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
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>{isGenerating ? 'AI Crafting Tailored Proposal...' : 'Generate Follow-Up with AI'}</span>
          </button>

          {/* Message Preview & Editor */}
          {channel === 'Email' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject Line"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Drafted Message ({channel})
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">{message.length} characters</span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Click 'Generate Follow-Up with AI' above or write custom message..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Dispatch Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Gateway: <strong className="text-slate-300">{channel} Business API</strong>
            </span>
            <button
              onClick={handleSendAndSimulate}
              disabled={!message.trim() || isSimulatingSend}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isSimulatingSend ? 'Simulating Response...' : 'Send & Simulate Reply'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Follow-Up Activity Feed */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col lg:min-h-[660px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Follow-up Activity Feed
              </h3>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {(['All', 'Hot', 'Warm', 'Cold'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTemp(t)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
                    filterTemp === t ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Stream list */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1 scrollbar-none">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs">
                No follow-ups recorded yet. Generate one on the left!
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 text-xs space-y-2.5 shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{act.leadName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        {act.channel}
                      </span>
                      {act.leadTemperature === 'Hot' && (
                        <span className="text-[10px] font-bold text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40">
                          Hot
                        </span>
                      )}
                      {act.leadTemperature === 'Warm' && (
                        <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                          Warm
                        </span>
                      )}
                      {act.leadTemperature === 'Cold' && (
                        <span className="text-[10px] font-bold text-sky-300 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40">
                          Cold
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{act.sentAt}</span>
                      <button
                        onClick={() => handleCopy(act.message, act.id)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy text"
                      >
                        {copiedId === act.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {act.subject && (
                    <p className="font-bold text-slate-200 text-xs">
                      Subject: {act.subject}
                    </p>
                  )}

                  <p className="text-slate-300 whitespace-pre-line bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed text-xs font-mono">
                    {act.message}
                  </p>

                  {/* Simulated Client Reply if Present */}
                  {act.clientReply && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Buyer Replied Back:
                      </div>
                      <p className="text-emerald-200 text-xs font-medium">
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
