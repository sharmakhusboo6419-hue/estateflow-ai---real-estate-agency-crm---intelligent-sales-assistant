import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Sparkles,
  Phone,
  Mail,
  CalendarCheck,
} from 'lucide-react';
import { AppointmentSlot, Lead, Property } from '../../types/realEstate';

interface ViewingSchedulerProps {
  appointments: AppointmentSlot[];
  leads: Lead[];
  properties: Property[];
  onAddAppointment: (appointment: AppointmentSlot) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentSlot['status']) => void;
  preselectedLead?: Lead | null;
}

export const ViewingScheduler: React.FC<ViewingSchedulerProps> = ({
  appointments,
  leads,
  properties,
  onAddAppointment,
  onUpdateAppointmentStatus,
  preselectedLead,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Confirmed' | 'Proposed'>('All');
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Form states for proposing new slots
  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLead?.id || leads[0]?.id || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    preselectedLead?.interestedPropertyId || properties[0]?.id || ''
  );
  const [tourDate, setTourDate] = useState('2026-10-28');
  const [tourTime, setTourTime] = useState('11:00 AM');
  const [meetingType, setMeetingType] = useState<AppointmentSlot['meetingType']>('VIP Private Showing');
  const [agentName, setAgentName] = useState('Marcus Sterling');
  const [customNote, setCustomNote] = useState('');

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === selectedLeadId);
    const prop = properties.find((p) => p.id === selectedPropertyId);

    if (!lead || !prop) return;

    const newSlot: AppointmentSlot = {
      id: `slot-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyLocation: prop.address,
      date: tourDate,
      time: tourTime,
      durationMinutes: 45,
      agentName,
      meetingType,
      status: 'Confirmed',
      notes: customNote || 'Tour scheduled via agency calendar manager.',
      confirmedAt: new Date().toISOString(),
    };

    onAddAppointment(newSlot);
    setIsSlotModalOpen(false);
    setCustomNote('');
  };

  // AI Slot Recommender generator for quick 3 slots
  const generateSuggestedSlotsSnippet = () => {
    const lead = leads.find((l) => l.id === selectedLeadId);
    const prop = properties.find((p) => p.id === selectedPropertyId);
    return `Hi ${lead?.name || 'there'}! Here are our available viewing slots for ${prop?.title || 'the property'}:\n1. Tomorrow at 10:30 AM (Private Walkthrough)\n2. Tomorrow at 2:00 PM (Senior Agent Showing)\n3. Saturday at 11:00 AM (VIP Tour)\n\nReply with your preferred slot and we will lock it in!`;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header & Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-amber-400" />
              Property Viewing Calendar & AI Timing Slots
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              AI automatically suggests available timing slots to clients when interest is confirmed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Viewing Slot
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Filter:</span>
          {(['All', 'Confirmed', 'Proposed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterStatus === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status} ({status === 'All' ? appointments.length : appointments.filter((a) => a.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Scheduled Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-sm">
            No appointments found under this filter.
          </div>
        ) : (
          filteredAppointments.map((slot) => {
            const isConfirmed = slot.status === 'Confirmed';
            return (
              <div
                key={slot.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md flex flex-col justify-between transition group"
              >
                <div>
                  {/* Status & Meeting Type */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isConfirmed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {slot.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {slot.meetingType}
                    </span>
                  </div>

                  {/* Timing & Date */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        {slot.time}
                      </span>
                      <span className="text-xs text-slate-400">{slot.durationMinutes} mins</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{slot.date}</p>
                  </div>

                  {/* Client & Property Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="font-bold text-white">{slot.leadName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{slot.propertyTitle}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{slot.propertyLocation}</span>
                    </div>
                  </div>

                  {slot.notes && (
                    <p className="mt-3 text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      "{slot.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Host: {slot.agentName}</span>
                  {!isConfirmed ? (
                    <button
                      onClick={() => onUpdateAppointmentStatus(slot.id, 'Confirmed')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold hover:bg-emerald-500/30 transition cursor-pointer"
                    >
                      Confirm Slot
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Calendar Synced
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule / Suggest New Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Schedule Property Viewing Slot</h3>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Client *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (${l.budget.toLocaleString()} • {l.temperature})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Property *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tour Date *</label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Timing Slot *</label>
                  <select
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                    <option value="11:30 AM">11:30 AM (Late Morning)</option>
                    <option value="2:00 PM">2:00 PM (Afternoon Showing)</option>
                    <option value="3:30 PM">3:30 PM (Mid Afternoon)</option>
                    <option value="5:00 PM">5:00 PM (Sunset Viewing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Showing Format</label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as AppointmentSlot['meetingType'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="VIP Private Showing">VIP Private Showing</option>
                    <option value="In-Person Walkthrough">In-Person Walkthrough</option>
                    <option value="Virtual 3D Tour">Virtual 3D Tour</option>
                    <option value="Buyer Consultation">Buyer Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assigned Agent</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Special Notes / Valet</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. VIP champagne reception, gate code 4092, pet friendly showing..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* AI Auto-Proposal Generator Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI WhatsApp / SMS Slot Suggestion:
                </span>
                <p className="text-[11px] text-slate-400 whitespace-pre-line bg-slate-900 p-2 rounded border border-slate-800">
                  {generateSuggestedSlotsSnippet()}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
                >
                  Confirm & Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
