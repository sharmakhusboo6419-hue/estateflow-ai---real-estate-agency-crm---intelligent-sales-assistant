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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-lg shadow-black/50"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{lead.name}</h2>
                <div className="flex items-center gap-1.5">
                  {lead.temperature === 'Hot' && (
                    <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> Hot Buyer
                    </span>
                  )}
                  {lead.temperature === 'Warm' && (
                    <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> Warm Prospect
                    </span>
                  )}
                  {lead.temperature === 'Cold' && (
                    <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10">
                      <Snowflake className="w-3.5 h-3.5 text-sky-400" /> Cold Lead
                    </span>
                  )}
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {lead.stage}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                </span>
                <span>•</span>
                <span className="text-slate-400 font-medium">Host Agent: {lead.assignedAgent}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Stale Lead Warning Banner */}
          {isStale && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Needs Attention: Client Inactive &gt; 7 Days
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                      {lead.daysSinceLastContact ? `${lead.daysSinceLastContact} days inactive` : '> 7 days uncontacted'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No agency interaction recorded in over a week. Re-engage immediately to preserve purchase intent.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResolveStale}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
                >
                  Mark Contacted & Clear Alert
                </button>
              </div>
            </div>
          )}

          {/* Pipeline Stage Stepper */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Deal Progression Stepper
            </span>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STAGES.map((stg, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = lead.stage === stg;
                return (
                  <button
                    key={stg}
                    onClick={() => handleStageChange(stg)}
                    className={`py-2 px-1 rounded-xl text-center text-[10px] sm:text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : isPassed
                        ? 'bg-slate-800/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900/60 text-slate-500 hover:text-white'
                    }`}
                  >
                    <span className="truncate w-full">{stg}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Temperature:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => handleTemperatureChange('Hot')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Hot'
                      ? 'bg-rose-500 text-slate-950 shadow-sm'
                      : 'text-rose-300 hover:bg-slate-800'
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => handleTemperatureChange('Warm')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Warm'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  Warm
                </button>
                <button
                  onClick={() => handleTemperatureChange('Cold')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Cold'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-sky-300 hover:bg-slate-800'
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold hover:bg-indigo-500/30 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Propose Slots
              </button>
              <button
                onClick={() => {
                  onClose();
                  onGenerateFollowUp(lead);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Follow-up
              </button>
            </div>
          </div>

          {/* Grid Layout: Financial & Property Match */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Financial Profile & Classification Rationale */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Client Financials & Intent
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Liquid Buying Budget</span>
                  <span className="text-base font-black text-emerald-300">
                    ${lead.budget.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Purchase Horizon</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{lead.timeline}</span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Financing Verification</span>
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                    {lead.preApproved ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-extrabold">Pre-Approved</span>
                      </>
                    ) : (
                      <span className="text-amber-300 font-semibold">Cash / Seeking Lender</span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">AI Readiness Score</span>
                  <span className="text-base font-black text-amber-300">
                    {lead.aiScore} / 100
                  </span>
                </div>
              </div>

              {/* Temperature Rationale Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="font-extrabold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Classification Rationale:
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {lead.temperatureRationale}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {lead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    <Tag className="w-2.5 h-2.5 text-amber-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: Matched Property */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Inquiring Property
              </h3>

              {matchedProperty ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-800 shadow-md">
                    <img
                      src={matchedProperty.imageUrl}
                      alt={matchedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-amber-300 font-black text-xs border border-amber-500/30">
                      ${matchedProperty.price.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white">{matchedProperty.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{matchedProperty.address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Beds</span>
                      <span className="font-bold text-white">{matchedProperty.bedrooms}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Baths</span>
                      <span className="font-bold text-white">{matchedProperty.bathrooms}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Living Area</span>
                      <span className="font-bold text-white">{matchedProperty.sqft} sq ft</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {matchedProperty.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No single property locked yet. Client exploring agency portfolio.
                </div>
              )}
            </div>
          </div>

          {/* Appointments & Schedule Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Tour Appointments & Reserved Slots
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Propose New Slot
              </button>
            </div>

            {leadAppointments.length === 0 ? (
              <div className="text-center py-8 px-3 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No viewing slots scheduled yet. Tap "Propose New Slot" to dispatch available times!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leadAppointments.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-white">{slot.time}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            slot.status === 'Confirmed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-bold">{slot.date}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {slot.propertyTitle}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Host: {slot.agentName}</p>
                    </div>

                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 ${
                        slot.status === 'Confirmed' ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Activity Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Agency & AI Activity Log
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal note (e.g. Verified proof of funds, requested weekend sunset walkthrough)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md"
              >
                Log Note
              </button>
            </form>

            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1 scrollbar-none">
              {lead.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
