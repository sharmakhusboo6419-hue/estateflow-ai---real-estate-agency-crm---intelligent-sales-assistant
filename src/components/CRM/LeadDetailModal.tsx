import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Flame,
  Sun,
  Snowflake,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  UserCheck,
  Tag,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Lead, LeadTemperature, PipelineStage, Property, AppointmentSlot, ChatMessage } from '../../types/realEstate';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  properties: Property[];
  appointments: AppointmentSlot[];
  chatHistory: ChatMessage[];
  onUpdateLead: (updatedLead: Lead) => void;
  onSuggestSlots: (lead: Lead) => void;
  onOpenChatWithLead: (lead: Lead) => void;
  onGenerateFollowUp: (lead: Lead) => void;
}

const STAGES: PipelineStage[] = [
  'New Lead',
  'AI Engaged',
  'Viewing Scheduled',
  'Offer & Negotiation',
  'Closed Won',
];

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  properties,
  appointments,
  chatHistory,
  onUpdateLead,
  onSuggestSlots,
  onOpenChatWithLead,
  onGenerateFollowUp,
}) => {
  if (!lead) return null;

  const [newNote, setNewNote] = useState('');
  const matchedProperty = properties.find((p) => p.id === lead.interestedPropertyId);
  const leadAppointments = appointments.filter((a) => a.leadId === lead.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = {
      ...lead,
      notes: [newNote.trim(), ...lead.notes],
    };
    onUpdateLead(updated);
    setNewNote('');
  };

  const handleTemperatureChange = (newTemp: LeadTemperature) => {
    const updated = {
      ...lead,
      temperature: newTemp,
      temperatureRationale: `Manually updated by agent to ${newTemp}`,
    };
    onUpdateLead(updated);
  };

  const handleStageChange = (newStage: PipelineStage) => {
    const updated = {
      ...lead,
      stage: newStage,
    };
    onUpdateLead(updated);
  };

  const isStale =
    lead.isStale ||
    lead.tags.includes('Needs Attention') ||
    (lead.daysSinceLastContact !== undefined && lead.daysSinceLastContact > 7);

  const handleResolveStale = () => {
    const updatedTags = lead.tags.filter((t) => t !== 'Needs Attention');
    const updated: Lead = {
      ...lead,
      lastContactAt: 'Just now',
      lastContactDate: new Date().toISOString(),
      daysSinceLastContact: 0,
      isStale: false,
      tags: updatedTags,
      notes: [`Agent reached out to client. Resolved 'Needs Attention' alert.`, ...lead.notes],
    };
    onUpdateLead(updated);
  };

  const currentStageIndex = STAGES.indexOf(lead.stage as PipelineStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="surface-elevated rounded-xl w-full max-w-4xl max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950/80 border-b border-white/[0.08] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-12 h-12 rounded-lg object-cover ring-1 ring-white/10"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{lead.name}</h2>
                <div className="flex items-center gap-1.5">
                  {lead.temperature === 'Hot' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Hot Buyer
                    </span>
                  )}
                  {lead.temperature === 'Warm' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Warm Prospect
                    </span>
                  )}
                  {lead.temperature === 'Cold' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 border border-sky-500/20 text-sky-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Cold Lead
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                    {lead.stage}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="flex items-center gap-1 text-zinc-300 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-zinc-400" /> {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-300 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-zinc-400" /> {lead.phone}
                </span>
                <span>•</span>
                <span className="text-zinc-400 text-[11px]">Host: {lead.assignedAgent}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Stale Lead Warning Banner */}
          {isStale && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-amber-200">
                    Needs Attention: Inactive &gt; 7 Days
                  </span>
                  <span className="text-[11px] text-zinc-400 ml-2">
                    {lead.daysSinceLastContact ? `${lead.daysSinceLastContact} days inactive` : '> 7 days uncontacted'}. Re-engage to protect pipeline momentum.
                  </span>
                </div>
              </div>

              <button
                onClick={handleResolveStale}
                className="px-3 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition cursor-pointer self-start sm:self-auto"
              >
                Clear Alert
              </button>
            </div>
          )}

          {/* Pipeline Stage Stepper */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-1.5">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              Deal Progression
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {STAGES.map((stg, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = lead.stage === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => handleStageChange(stg)}
                    className={`py-1.5 px-1 rounded-md text-center text-[10px] sm:text-xs font-medium transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      isCurrent
                        ? 'bg-zinc-800 text-white border border-white/[0.12] shadow-sm'
                        : isPassed
                        ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-950/60 text-zinc-500 hover:text-white'
                    }`}
                  >
                    <span className="truncate w-full">{stg}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/60 border border-white/[0.06] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Temperature:</span>
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-md border border-white/[0.06]">
                <button
                  onClick={() => handleTemperatureChange('Hot')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                    lead.temperature === 'Hot'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-zinc-400 hover:text-rose-300'
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => handleTemperatureChange('Warm')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                    lead.temperature === 'Warm'
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-amber-200'
                  }`}
                >
                  Warm
                </button>
                <button
                  onClick={() => handleTemperatureChange('Cold')}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer ${
                    lead.temperature === 'Cold'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-zinc-400 hover:text-sky-300'
                  }`}
                >
                  Cold
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenChatWithLead(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#dfc195] border border-white/[0.08] text-xs font-medium transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Concierge Chat
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] text-xs font-medium transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Tour
              </button>
              <button
                onClick={() => {
                  onClose();
                  onGenerateFollowUp(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                AI Outreach
              </button>
            </div>
          </div>

          {/* Grid Layout: Financial & Property Match */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Card: Financial Profile & Classification Rationale */}
            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#dfc195]" /> Financial Profile
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="text-zinc-400 text-[10px] block">Verified Budget</span>
                  <span className="font-mono text-sm font-semibold text-emerald-400">
                    ${lead.budget.toLocaleString()}
                  </span>
                </div>

                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="text-zinc-400 text-[10px] block">Purchase Timeline</span>
                  <span className="text-xs font-medium text-white mt-0.5 block">{lead.timeline}</span>
                </div>

                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="text-zinc-400 text-[10px] block">Financing Status</span>
                  <span className="text-xs font-medium text-zinc-200 flex items-center gap-1 mt-0.5">
                    {lead.preApproved ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Pre-Approved</span>
                      </>
                    ) : (
                      <span className="text-zinc-400">Cash / Unverified</span>
                    )}
                  </span>
                </div>

                <div className="bg-black/30 p-2.5 rounded-lg border border-white/[0.04]">
                  <span className="text-zinc-400 text-[10px] block">AI Intent Score</span>
                  <span className="font-mono text-sm font-semibold text-[#dfc195]">
                    {lead.aiScore} / 100
                  </span>
                </div>
              </div>

              {/* Temperature Rationale Box */}
              <div className="p-3 rounded-lg bg-black/20 border border-white/[0.04] text-xs space-y-0.5">
                <span className="font-medium text-[#dfc195] flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3" /> AI Classification Rationale:
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {lead.temperatureRationale}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]"
                  >
                    <Tag className="w-2.5 h-2.5 text-zinc-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: Matched Property */}
            <div className="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#dfc195]" /> Inquiring Property
              </h3>

              {matchedProperty ? (
                <div className="space-y-2.5">
                  <div className="relative rounded-lg overflow-hidden aspect-video border border-white/[0.06]">
                    <img
                      src={matchedProperty.imageUrl}
                      alt={matchedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-semibold text-xs border border-white/[0.1]">
                      ${matchedProperty.price.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-white">{matchedProperty.title}</h4>
                    <p className="text-[11px] text-zinc-400">{matchedProperty.address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs py-1">
                    <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-400 block">Beds</span>
                      <span className="font-mono font-semibold text-white text-xs">{matchedProperty.bedrooms}</span>
                    </div>
                    <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-400 block">Baths</span>
                      <span className="font-mono font-semibold text-white text-xs">{matchedProperty.bathrooms}</span>
                    </div>
                    <div className="p-1.5 rounded bg-black/30 border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-400 block">Area</span>
                      <span className="font-mono font-semibold text-white text-xs">{matchedProperty.sqft} sq ft</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  No single property locked yet. Client exploring portfolio.
                </div>
              )}
            </div>
          </div>

          {/* Appointments & Schedule Section */}
          <div className="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#dfc195]" /> Scheduled Tours
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="text-xs text-[#dfc195] hover:text-white font-medium cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Propose Slot
              </button>
            </div>

            {leadAppointments.length === 0 ? (
              <div className="text-center py-6 px-3 border border-dashed border-white/[0.08] rounded-lg text-zinc-500 text-xs">
                No viewing slots scheduled yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {leadAppointments.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg bg-black/30 border border-white/[0.06] flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-semibold text-white">{slot.time}</span>
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                            slot.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-[#dfc195]">{slot.date}</p>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                        {slot.propertyTitle}
                      </p>
                    </div>

                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        slot.status === 'Confirmed' ? 'text-emerald-400' : 'text-zinc-600'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Activity Log */}
          <div className="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Agency & Concierge Activity Log
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal note (e.g. Verified proof of funds, requested sunset walkthrough)..."
                className="flex-1 bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs rounded-lg transition cursor-pointer shadow-sm"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-1.5 pt-1 max-h-44 overflow-y-auto pr-0.5 scrollbar-none">
              {lead.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-xs text-zinc-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfc195] mt-1 shrink-0" />
                  <span className="leading-relaxed text-[11px]">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
