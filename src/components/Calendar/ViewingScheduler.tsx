import React, { useState, useMemo } from 'react';
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
  ShieldCheck,
  Download,
  Share2,
  X,
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

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
    const proposed = appointments.filter((a) => a.status === 'Proposed').length;
    return { total, confirmed, proposed };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (filterStatus === 'All') return true;
      return app.status === filterStatus;
    });
  }, [appointments, filterStatus]);

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

  const generateSuggestedSlotsSnippet = () => {
    const lead = leads.find((l) => l.id === selectedLeadId);
    const prop = properties.find((p) => p.id === selectedPropertyId);
    return `Hi ${lead?.name || 'there'}! Here are our available viewing slots for ${prop?.title || 'the property'}:\n1. Tomorrow at 10:30 AM (Private Walkthrough)\n2. Tomorrow at 2:00 PM (Senior Agent Showing)\n3. Saturday at 11:00 AM (VIP Tour)\n\nReply with your preferred slot and we will lock it in!`;
  };

  const handleExportICS = (slot: AppointmentSlot) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EstateFlow AI//Viewing Scheduler//EN
BEGIN:VEVENT
SUMMARY:EstateFlow Tour: ${slot.propertyTitle} (${slot.meetingType})
DESCRIPTION:Private property showing with ${slot.leadName}. Host Agent: ${slot.agentName}. Notes: ${slot.notes || 'VIP Viewing'}.
LOCATION:${slot.propertyLocation}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estateflow_tour_${slot.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/20 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Scheduled Tours
          </span>
          <div className="text-xl sm:text-2xl font-black text-white">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            Agency Calendar Active
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/20 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Confirmed Private Showings
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-300">{stats.confirmed}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Confirmed by AI or Buyer
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pending / Proposed
          </span>
          <div className="text-xl sm:text-2xl font-black text-indigo-300">{stats.proposed}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Awaiting Buyer Confirmation
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Direct Calendar Booking
          </span>
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="w-full mt-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Book New Showing</span>
          </button>
        </div>
      </div>

      {/* Filter and Schedule Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Viewing Schedule & Broker Availability
              </h2>
              <p className="text-xs text-slate-400">
                AI automatically synchronizes buyer confirmations from chat into viewing calendar slots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold mr-1">Filter:</span>
            {(['All', 'Confirmed', 'Proposed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === status
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {status} ({status === 'All' ? appointments.length : appointments.filter((a) => a.status === status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Scheduled Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-slate-900/80 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-xs">
            No appointments match this filter. Use the button above to schedule a new showing.
          </div>
        ) : (
          filteredAppointments.map((slot) => {
            const isConfirmed = slot.status === 'Confirmed';
            const prop = properties.find((p) => p.id === slot.propertyId);

            return (
              <div
                key={slot.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all group backdrop-blur-md hover:shadow-black/40"
              >
                <div>
                  {/* Status & Meeting Type */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
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
                      <span>{slot.status}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {slot.meetingType}
                    </span>
                  </div>

                  {/* Timing & Date Card */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        {slot.time}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{slot.durationMinutes} mins</span>
                    </div>
                    <p className="text-xs text-amber-300 font-bold">{slot.date}</p>
                  </div>

                  {/* Client & Property Details */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white text-sm block">{slot.leadName}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200 block truncate">{slot.propertyTitle}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{slot.propertyLocation}</span>
                      </div>
                    </div>
                  </div>

                  {slot.notes && (
                    <p className="mt-3.5 text-[11px] text-slate-300 italic bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      "{slot.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    Host: <span className="font-bold text-slate-200">{slot.agentName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportICS(slot)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Download .ics Calendar Invite (Apple Calendar / Google Calendar / Outlook)"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                    </button>

                    {!isConfirmed ? (
                      <button
                        onClick={() => onUpdateAppointmentStatus(slot.id, 'Confirmed')}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold hover:bg-emerald-500/30 transition cursor-pointer"
                      >
                        Confirm Slot
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule / Suggest New Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">Schedule Property Viewing Slot</h3>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Client *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (${l.budget.toLocaleString()} • {l.temperature})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Select Listing *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
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
                  <label className="block font-bold text-slate-300 mb-1">Tour Date *</label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Timing Slot *</label>
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
                  <label className="block font-bold text-slate-300 mb-1">Showing Format</label>
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
                  <label className="block font-bold text-slate-300 mb-1">Host Broker</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Special Notes / Valet Access</label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. VIP champagne reception, gate code 4092, elevator key ready..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* AI Auto-Proposal Generator Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-black text-amber-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI WhatsApp / SMS Slot Suggestion:
                </span>
                <p className="text-[11px] text-slate-300 whitespace-pre-line bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                  {generateSuggestedSlotsSnippet()}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black transition cursor-pointer shadow-md"
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
