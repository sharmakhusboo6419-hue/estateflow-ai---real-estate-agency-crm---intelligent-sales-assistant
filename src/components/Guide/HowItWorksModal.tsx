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
  Sparkles,
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hero Explainer Banner */}
      <div className="surface-card rounded-xl p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#c8a97e]/10 text-[#dfc195] border border-[#c8a97e]/20 text-xs font-mono font-medium">
          <Zap className="w-3 h-3 text-[#dfc195]" /> Architecture & Workflow
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
          How EstateFlow AI Powers High-Performance Brokerages
        </h1>
        <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Real estate agencies lose over 60% of prospective buyers due to multi-hour response delays. EstateFlow AI bridges this gap with 24/7 instant client concierge service, budget extraction into Hot, Warm, and Cold tiers, automated tour scheduling, and disciplined follow-up cadences.
        </p>

        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('chat')}
            className="px-4 py-2 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Launch Sales Concierge</span>
          </button>
          <button
            onClick={onSimulateLead}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs border border-white/[0.08] transition flex items-center gap-2 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Inbound Lead</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: AI Instant Property Expert */}
        <div className="surface-card rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] text-[#dfc195] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pillar 1</span>
              <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                Instant Listing Intelligence
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Provides immediate answers to complex architectural and financial inquiries with full listing context:
            </p>

            <ul className="text-xs text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Extracts exact floor plans, square footage, and outdoor terrace specifications.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Calculates 20% down payments, monthly mortgage estimates, and HOA dues dynamically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Surfaces neighborhood insights, verified school ratings, and transit access.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('chat')}
            className="text-xs text-[#dfc195] hover:text-white font-medium flex items-center gap-1 pt-2 cursor-pointer"
          >
            Open Sales Concierge <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Budget-Based Segregation */}
        <div className="surface-card rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pillar 2</span>
              <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                Automated Temperature Tiering
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Segments prospects across verified purchasing budgets, timeline urgency, and financial readiness:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <span className="font-semibold text-rose-300 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Hot Leads ($1M+ or &lt;30 days)
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Priority buyers with liquid cash or jumbo pre-approval. Routed immediately to senior brokers.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="font-semibold text-amber-200 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Warm Prospects ($450k – $999k)
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Core active buyers. Engaged in listing comparisons and weekend tour scheduling.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <span className="font-semibold text-sky-300 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Cold Leads (&lt;$450k / 6+ months)
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Long-tail searchers enrolled into low-frequency price drop alerts and new release digests.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('crm')}
            className="text-xs text-[#dfc195] hover:text-white font-medium flex items-center gap-1 pt-1 cursor-pointer"
          >
            Inspect Pipeline Board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: AI Viewing Slot Suggestion */}
        <div className="surface-card rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pillar 3</span>
              <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                Instant Appointment Booking
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Eliminates phone tag by proposing available agent showing windows directly inside conversation:
            </p>

            <ul className="text-xs text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Fetches real-time showing slots based on listing agent calendar availability.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Client confirms appointment with a single tap in the chat stream.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Syncs to viewing schedule with .ics calendar invite generation.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs text-[#dfc195] hover:text-white font-medium flex items-center gap-1 pt-2 cursor-pointer"
          >
            View Calendar Schedule <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 4: Automated AI Follow-ups */}
        <div className="surface-card rounded-xl p-5 sm:p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] text-emerald-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Pillar 4</span>
              <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5">
                Multichannel Outreach Cadence
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Prevents deal decay by executing automated follow-ups calibrated to each buyer's urgency tier:
            </p>

            <ul className="text-xs text-zinc-400 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Supports WhatsApp, SMS, and Email with channel-specific tone of voice.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Synthesizes persuasive, personalized copy based on property specs and budget.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Logs buyer responses and automatically resolves inactive lead alerts.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigateTab('followup')}
            className="text-xs text-[#dfc195] hover:text-white font-medium flex items-center gap-1 pt-2 cursor-pointer"
          >
            Explore Cadence Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
