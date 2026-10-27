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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="surface-card rounded-xl p-4 sm:p-5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Total Scheduled Tours
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-white">{stats.total}</div>
          <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5 text-[#dfc195]" />
            Active Calendar Entries
          </p>
        </div>

        <div className="surface-card rounded-xl p-4 sm:p-5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Confirmed Showings
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">{stats.confirmed}</div>
          <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Confirmed & Verified
          </p>
        </div>

        <div className="surface-card rounded-xl p-4 sm:p-5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
            Pending / Proposed
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-indigo-300">{stats.proposed}</div>
          <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Awaiting Client Confirmation
          </p>
        </div>

        <div className="surface-card rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
            Direct Calendar Booking
          </span>
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Schedule Showing</span>
          </button>
        </div>
      </div>

      {/* Filter and Schedule Bar */}
      <div className="surface-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-[#dfc195]" />
            <div>
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">
                Viewing Schedule & Broker Availability
              </h2>
              <p className="text-xs text-zinc-400">
                AI automatically synchronizes client confirmations from concierge chat into calendar slots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 mr-1">Filter:</span>
            {(['All', 'Confirmed', 'Proposed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  filterStatus === status
                    ? 'bg-zinc-800 text-white border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {status} ({status === 'All' ? appointments.length : appointments.filter((a) => a.status === status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Scheduled Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full py-12 text-center surface-card rounded-xl text-zinc-500 text-xs">
            No appointments match this filter. Use the button above to schedule a new showing.
          </div>
        ) : (
          filteredAppointments.map((slot) => {
            const isConfirmed = slot.status === 'Confirmed';

            return (
              <div
                key={slot.id}
                className="surface-card surface-card-hover rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  {/* Status & Meeting Type */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-400" />
                      )}
                      <span>{slot.status}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      {slot.meetingType}
                    </span>
                  </div>

                  {/* Timing & Date Card */}
                  <div className="bg-zinc-950/70 p-3 rounded-lg border border-white/[0.06] mb-3 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#dfc195]" />
                        {slot.time}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">{slot.durationMinutes} mins</span>
                    </div>
                    <p className="font-mono text-xs text-[#dfc195]">{slot.date}</p>
                  </div>

                  {/* Client & Property Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-semibold text-zinc-100 text-xs">{slot.leadName}</span>
                    </div>

                    <div className="flex items-start gap-2 text-zinc-300">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-medium text-zinc-200 block truncate text-xs">{slot.propertyTitle}</span>
                        <span className="text-[11px] text-zinc-400 block truncate">{slot.propertyLocation}</span>
                      </div>
                    </div>
                  </div>

                  {slot.notes && (
                    <p className="mt-3 text-[11px] text-zinc-400 italic bg-black/20 p-2 rounded border border-white/[0.04]">
                      "{slot.notes}"
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-zinc-400">
                    Host: <span className="text-zinc-200 font-medium">{slot.agentName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleExportICS(slot)}
                      className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                      title="Download .ics Calendar Invite"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    {!isConfirmed ? (
                      <button
                        onClick={() => onUpdateAppointmentStatus(slot.id, 'Confirmed')}
                        className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium hover:bg-emerald-500/25 transition cursor-pointer text-[11px]"
                      >
                        Confirm Slot
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Synced
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="surface-elevated rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
            <div className="p-4 bg-zinc-950/80 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#dfc195]" />
                <h3 className="font-semibold text-white text-sm">Schedule Property Viewing Slot</h3>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-4 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block font-medium text-zinc-300 mb-1">Select Client *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (${l.budget.toLocaleString()} • {l.temperature})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Listing Property *</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${p.price.toLocaleString()} • {p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Tour Date *</label>
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Tour Time *</label>
                  <select
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Host Broker Agent</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-300 mb-1">Showing Notes</label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Special client preferences, gate access codes, etc."
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#c8a97e]"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold transition cursor-pointer shadow-sm"
                >
                  Confirm Showing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
