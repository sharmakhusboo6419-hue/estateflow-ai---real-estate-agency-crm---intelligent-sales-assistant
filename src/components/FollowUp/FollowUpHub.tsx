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

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
  const matchedProperty = properties.find((p) => p.id === selectedLead?.interestedPropertyId) || properties[0];

  // Generate personalized AI follow-up message
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

  // Send follow-up and simulate client response
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

    // Simulate realistic client reply after 2.5 seconds
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
    }, 2500);
  };

  const filteredActivities = followUpActivities.filter((a) => {
    if (filterTemp === 'All') return true;
    return a.leadTemperature === filterTemp;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="w-6 h-6 text-amber-400" />
              Automated AI Follow-up Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              AI automatically nurtures Cold leads, accelerates Warm prospects, and closes Hot buyers before leads go cold.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Automated Follow-up Daemon Active
            </span>
          </div>
        </div>

        {/* 3 Temperature Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> HOT LEADS RULE
              </span>
              <span className="text-[10px] text-rose-400 font-semibold">Every 2-4 Hours</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Priority lock-in: Send available tour slots, seller financing updates, and urgent booking windows.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> WARM LEADS RULE
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">Every 24-48 Hours</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Nurture: Share 3D virtual tours, neighborhood guides, and weekend open house invitations.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" /> COLD LEADS RULE
              </span>
              <span className="text-[10px] text-sky-400 font-semibold">Weekly Cadence</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Re-engage: Automated price drop alerts on similar properties matching their budget threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio: Composer on Left, Feed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Left: AI Follow-up Studio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Follow-up Studio (Generator)
            </h3>
            <span className="text-xs text-slate-400">Powered by Gemini 3.8 Flash</span>
          </div>

          {/* Client & Property Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Client *</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  setMessage('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.temperature} • ${l.budget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Channel *</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['WhatsApp', 'SMS', 'Email'] as Channel[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`py-1 rounded-lg text-center font-semibold text-[11px] transition cursor-pointer ${
                      channel === c
                        ? 'bg-amber-500 text-slate-950 shadow'
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
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-white">{selectedLead.name}</span>
                <span className="text-slate-400 text-[11px] block">
                  Budget: ${selectedLead.budget.toLocaleString()} • Timeline: {selectedLead.timeline}
                </span>
              </div>
              <div>
                {selectedLead.temperature === 'Hot' && (
                  <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40">
                    🔥 Hot Lead
                  </span>
                )}
                {selectedLead.temperature === 'Warm' && (
                  <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                    🌤️ Warm Prospect
                  </span>
                )}
                {selectedLead.temperature === 'Cold' && (
                  <span className="text-xs font-bold text-sky-300 px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40">
                    ❄️ Cold Lead
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tone & Goal Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Urgent & Exclusive VIP">Urgent & Exclusive VIP</option>
                <option value="Warm & Proactive">Warm & Proactive</option>
                <option value="Professional & Data-Driven">Professional & Data-Driven</option>
                <option value="Casual & Low-Pressure">Casual & Low-Pressure</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Campaign Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Suggest available viewing slots">Suggest available viewing slots</option>
                <option value="Share 3D Matterport virtual tour">Share 3D Matterport virtual tour</option>
                <option value="Alert on recent price drops in area">Alert on recent price drops in area</option>
                <option value="Re-engage after 7 days of inactivity">Re-engage after 7 days of inactivity</option>
              </select>
            </div>
          </div>

          {/* One-Click AI Generate Button */}
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            {isGenerating ? 'AI Crafting Tailored Message...' : 'Generate Follow-Up with AI'}
          </button>

          {/* Message Preview & Editor */}
          {channel === 'Email' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject Line"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Message Body ({channel})
              </label>
              <span className="text-[11px] text-slate-500">{message.length} characters</span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Click 'Generate Follow-Up with AI' above or write custom message..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Dispatch Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Dispatches via agency {channel} business gateway
            </span>
            <button
              onClick={handleSendAndSimulate}
              disabled={!message.trim() || isSimulatingSend}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSimulatingSend ? 'Sending & Waiting for Client Reply...' : 'Send & Simulate Response'}
            </button>
          </div>
        </div>

        {/* Right: Live Follow-Up Activity Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/30 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Dispatched Follow-up Stream</h3>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {(['All', 'Hot', 'Warm', 'Cold'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTemp(t)}
                  className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                    filterTemp === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Stream list */}
          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No follow-ups recorded yet. Generate one on the left!
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{act.leadName}</span>
                      <span className="text-[10px] text-slate-400">via {act.channel}</span>
                      {act.leadTemperature === 'Hot' && (
                        <span className="text-[9px] font-bold text-rose-300 px-1.5 py-0.2 rounded bg-rose-500/20">
                          Hot
                        </span>
                      )}
                      {act.leadTemperature === 'Warm' && (
                        <span className="text-[9px] font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20">
                          Warm
                        </span>
                      )}
                      {act.leadTemperature === 'Cold' && (
                        <span className="text-[9px] font-bold text-sky-300 px-1.5 py-0.2 rounded bg-sky-500/20">
                          Cold
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{act.sentAt}</span>
                  </div>

                  {act.subject && (
                    <p className="font-semibold text-slate-300 text-[11px]">
                      Subject: {act.subject}
                    </p>
                  )}

                  <p className="text-slate-300 whitespace-pre-line bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed text-[11px]">
                    {act.message}
                  </p>

                  {/* Simulated Client Reply if Present */}
                  {act.clientReply && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Client Replied Back:
                      </div>
                      <p className="text-emerald-200 text-[11px] font-medium">
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
