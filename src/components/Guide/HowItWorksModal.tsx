import React from 'react';
import {
  HelpCircle,
  Zap,
  Flame,
  Sun,
  Snowflake,
  Calendar,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface HowItWorksProps {
  onNavigateTab: (tab: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties') => void;
  onSimulateLead: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksProps> = ({
  onNavigateTab,
  onSimulateLead,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Explainer Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Complete System Overview & Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How EstateFlow AI Powers Real Estate Agencies
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real estate agencies lose over 60% of potential buyers because salespersons take hours to answer inquiries. EstateFlow AI bridges the gap by answering instantly 24/7, auto-qualifying budgets into <span className="text-rose-400 font-semibold">Hot</span>, <span className="text-amber-400 font-semibold">Warm</span>, and <span className="text-sky-400 font-semibold">Cold</span> tiers, proposing available viewing slots, and running automated follow-ups.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('chat')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Try Client Chat Simulator
            </button>
            <button
              onClick={onSimulateLead}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Simulate Inbound Buyer Lead
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Breakdown requested by User */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: AI Instant Property Expert */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pillar 1</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Instant AI Property Knowledge Bot
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of buyers waiting for an agent to check brochures, the AI has instant access to your entire inventory:
          </p>

          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Answers exact square footage, floor plans, outdoor terraces, and ceiling heights.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Calculates 20% down payments, monthly mortgage estimates, and monthly HOA dues on the fly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Provides neighborhood insights, school ratings, and transit walking times.</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigateTab('chat')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 pt-2 cursor-pointer"
          >
            Open Live Chat Simulator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Budget-Based Segregation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Pillar 2</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Cold, Warm & Hot Budget Segregation
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The AI analyzes client conversations in real-time and segments leads by budget, timeline, and financing status:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="font-bold text-rose-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> Hot Leads ($1M+ or &lt;30 days)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Priority buyers with liquid cash or jumbo pre-approval. Routed to Senior Brokers within 15 minutes.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Warm Prospects ($450k – $999k)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Core sweet-spot buyers. Engaged in property comparisons and ready for weekend viewing slots.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
              <span className="font-bold text-sky-300 flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" /> Cold Leads (&lt;$450k / 6+ months)
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Long-tail searchers saved from slipping away via automated low-frequency price drop digests.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('crm')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 pt-1 cursor-pointer"
          >
            Inspect Kanban CRM Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: AI Viewing Slot Suggestion */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pillar 3</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Interactive Available Timing Slots
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates 10-message phone tag. When the client expresses interest or says "can I see it?":
          </p>

          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>AI immediately fetches 3 to 4 open showing slots based on the agent's real schedule.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Client clicks a slot button directly in chat to confirm.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Appointment is automatically synced to the calendar and the lead is marked as "Viewing Scheduled".</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 pt-2 cursor-pointer"
          >
            View Schedule Calendar <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 4: Automated AI Follow-ups */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Pillar 4</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Multi-Channel Automated AI Follow-ups
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Keeps clients from slipping away by tailoring messaging cadences to their temperature tier:
          </p>

          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Supports WhatsApp, SMS, and Email with channel-specific conversational formatting.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>AI crafts high-converting copy in seconds (e.g. "We have 2 other inquiries, held a slot for you").</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Tracks client replies and logs engagement history in the CRM dossier.</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigateTab('followup')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 pt-2 cursor-pointer"
          >
            Explore Follow-up Engine <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
