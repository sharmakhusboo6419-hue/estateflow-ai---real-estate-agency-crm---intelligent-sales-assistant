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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={lead.avatar}
              alt={lead.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-500/40 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">{lead.name}</h2>
                <div className="flex items-center gap-1.5">
                  {lead.temperature === 'Hot' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <Flame className="w-3.5 h-3.5 text-rose-400" /> Hot Buyer
                    </span>
                  )}
                  {lead.temperature === 'Warm' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> Warm Prospect
                    </span>
                  )}
                  {lead.temperature === 'Cold' && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      <Snowflake className="w-3.5 h-3.5 text-sky-400" /> Cold Lead
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {lead.stage}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}
                </span>
                <span>•</span>
                <span className="text-slate-400">Agent: {lead.assignedAgent}</span>
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
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">
                      Stale Lead Notification • Needs Attention
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                      {lead.daysSinceLastContact ? `${lead.daysSinceLastContact} days inactive` : '> 7 days uncontacted'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No agency interaction recorded in over 7 days. Re-engage promptly before this buyer slips to competing agencies.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleResolveStale}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Mark Contacted & Clear Alert
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Pipeline Stage:</span>
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="New Lead">New Lead</option>
                <option value="AI Engaged">AI Engaged</option>
                <option value="Viewing Scheduled">Viewing Scheduled</option>
                <option value="Offer & Negotiation">Offer & Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Archived / Cold">Archived / Cold</option>
              </select>

              <span className="text-xs font-semibold text-slate-400 ml-2">Temperature:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTemperatureChange('Hot')}
                  className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Hot'
                      ? 'bg-rose-500 text-slate-950'
                      : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                  }`}
                >
                  Hot
                </button>
                <button
                  onClick={() => handleTemperatureChange('Warm')}
                  className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Warm'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  Warm
                </button>
                <button
                  onClick={() => handleTemperatureChange('Cold')}
                  className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    lead.temperature === 'Cold'
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat Simulator
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold hover:bg-indigo-500/30 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Suggest Available Slots
              </button>
              <button
                onClick={() => {
                  onClose();
                  onGenerateFollowUp(lead);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Follow-up
              </button>
            </div>
          </div>

          {/* Grid Layout: Financial & Property Match + AI Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Financial Profile & Classification Rationale */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Client Financials & Intent
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Max Buying Budget</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    ${lead.budget.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Buying Timeline</span>
                  <span className="text-xs font-bold text-white">{lead.timeline}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Financing Status</span>
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                    {lead.preApproved ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Pre-Approved</span>
                      </>
                    ) : (
                      <span className="text-amber-300">Cash / Seeking Lender</span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">AI Qualification Score</span>
                  <span className="text-base font-extrabold text-amber-300">
                    {lead.aiScore}/100
                  </span>
                </div>
              </div>

              {/* Temperature Rationale Box */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1 text-[11px]">
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
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    <Tag className="w-2.5 h-2.5 text-amber-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: Matched Property */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Property of Interest
              </h3>

              {matchedProperty ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-800">
                    <img
                      src={matchedProperty.imageUrl}
                      alt={matchedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 font-extrabold text-xs border border-amber-500/30">
                      ${matchedProperty.price.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{matchedProperty.title}</h4>
                    <p className="text-xs text-slate-400">{matchedProperty.address}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Beds</span>
                      <span className="font-bold text-white">{matchedProperty.bedrooms}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Baths</span>
                      <span className="font-bold text-white">{matchedProperty.bathrooms}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Living Area</span>
                      <span className="font-bold text-white">{matchedProperty.sqft} sq ft</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {matchedProperty.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No single property locked yet. Client browsing full portfolio.
                </div>
              )}
            </div>
          </div>

          {/* Appointments & Schedule Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Tour Appointments & Suggested Slots
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onSuggestSlots(lead);
                }}
                className="text-xs text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
              >
                + Propose New Slot
              </button>
            </div>

            {leadAppointments.length === 0 ? (
              <div className="text-center py-6 px-3 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No viewing slots scheduled yet. Click "Suggest Available Slots" to propose timings!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leadAppointments.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{slot.time}</span>
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
                      <p className="text-xs text-slate-300 font-medium">{slot.date}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                        {slot.propertyTitle}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">Host: {slot.agentName}</p>
                    </div>

                    <CheckCircle2
                      className={`w-5 h-5 flex-shrink-0 ${
                        slot.status === 'Confirmed' ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Activity Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Agent & AI Notes Log
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log internal note (e.g. Spouse preferred sunset tour, verified proof of funds)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-2 pt-1">
              {lead.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
