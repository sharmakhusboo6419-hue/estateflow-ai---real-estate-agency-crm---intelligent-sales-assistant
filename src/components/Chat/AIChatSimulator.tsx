import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Building2,
  Calendar,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bot,
  User,
  Zap,
  ArrowRight,
  RefreshCw,
  MapPin,
  ChevronRight,
  Receipt,
  Maximize2,
  GraduationCap,
  CalendarCheck,
  Search,
  Filter,
} from 'lucide-react';
import { Property, Lead, ChatMessage, AppointmentSlot, LeadTemperature } from '../../types/realEstate';

interface AIChatSimulatorProps {
  properties: Property[];
  selectedProperty: Property;
  onSelectProperty: (property: Property) => void;
  activeLead: Lead | null;
  onLeadUpdated: (lead: Lead) => void;
  onAppointmentBooked: (appointment: AppointmentSlot) => void;
  hasGeminiKey: boolean;
  leads?: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

export const AIChatSimulator: React.FC<AIChatSimulatorProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  activeLead,
  onLeadUpdated,
  onAppointmentBooked,
  hasGeminiKey,
  leads = [],
  onSelectLead,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `Hello! Welcome to EstateFlow Luxury Real Estate. I am your property sales concierge for **${selectedProperty.title}**.\n\nI have complete architectural specifications, HOA schedules, mortgage breakdowns, and verified tour availability.\n\nHow can I assist your inquiry today?`,
      timestamp: 'Just now',
      suggestedSlots: [],
      propertyId: selectedProperty.id,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastDetectedBudget, setLastDetectedBudget] = useState<number | null>(activeLead?.budget || null);
  const [currentTemperature, setCurrentTemperature] = useState<LeadTemperature>(
    activeLead?.temperature || 'Warm'
  );
  const [lastIntent, setLastIntent] = useState<string>('Luxury Inquiry & Tour Request');
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadTempFilter, setLeadTempFilter] = useState<LeadTemperature | 'All'>('All');

  const messagesPaneRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  const scrollToBottom = () => {
    const pane = messagesPaneRef.current;
    if (pane) pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > previousMessageCount.current) scrollToBottom();
    previousMessageCount.current = messages.length;
  }, [messages]);

  // Sync state if activeLead changes externally
  useEffect(() => {
    if (activeLead) {
      setCurrentTemperature(activeLead.temperature);
      if (activeLead.budget) setLastDetectedBudget(activeLead.budget);
    }
  }, [activeLead]);

  const handlePropertyChange = (prop: Property) => {
    onSelectProperty(prop);
    setConfirmedSlot(null);
    const greetingMsg: ChatMessage = {
      id: `prop-switch-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `You are now viewing **${prop.title}** in ${prop.location} listed at **$${prop.price.toLocaleString()}**.\n\nFeaturing **${prop.bedrooms} beds, ${prop.bathrooms} baths, and ${prop.sqft.toLocaleString()} sq ft**.\n\nAsk me about down payments, monthly HOA, or available viewing windows.`,
      timestamp: 'Just now',
      propertyId: prop.id,
    };
    setMessages((prev) => [...prev, greetingMsg]);
  };

  const handleSelectLeadCard = (lead: Lead) => {
    if (onSelectLead) {
      onSelectLead(lead);
    }
    const prop = properties.find((p) => p.id === lead.interestedPropertyId) || properties[0];
    if (prop.id !== selectedProperty.id) {
      onSelectProperty(prop);
    }
    setConfirmedSlot(null);
    const switchMsg: ChatMessage = {
      id: `lead-switch-${Date.now()}`,
      leadId: lead.id,
      sender: 'ai',
      text: `Now assisting **${lead.name}** regarding **${prop.title}** ($${prop.price.toLocaleString()}).\n\nClient budget detected: **$${lead.budget.toLocaleString()}** (${lead.temperature} Tier). Ready for questions or tour scheduling!`,
      timestamp: 'Just now',
      propertyId: prop.id,
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
      propertyId: selectedProperty.id,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          property: selectedProperty,
          lead: activeLead,
          allProperties: properties,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || "I'd be pleased to arrange a private viewing for this listing.";
      const detectedBudget = data.detectedBudget;
      const leadTemperature = data.leadTemperature;
      const extractedIntent = data.extractedIntent;
      const slots = data.suggestedSlots || [];

      if (detectedBudget) setLastDetectedBudget(detectedBudget);
      if (leadTemperature) setCurrentTemperature(leadTemperature);
      if (extractedIntent) setLastIntent(extractedIntent);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        leadId: activeLead?.id || 'demo-lead',
        sender: 'ai',
        text: aiReply,
        timestamp: 'Just now',
        suggestedSlots: slots,
        propertyId: selectedProperty.id,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (activeLead && (detectedBudget || leadTemperature)) {
        const updatedLead: Lead = {
          ...activeLead,
          budget: detectedBudget || activeLead.budget,
          temperature: leadTemperature || activeLead.temperature,
          stage: slots.length > 0 ? 'Viewing Scheduled' : 'AI Engaged',
          aiScore: leadTemperature === 'Hot' ? 98 : leadTemperature === 'Warm' ? 84 : 45,
          aiSummary: `Discussed ${selectedProperty.title}. Intent: ${extractedIntent || 'Inquiry'}. Extracted budget: $${(detectedBudget || activeLead.budget).toLocaleString()}`,
          temperatureRationale: `AI detected ${leadTemperature || activeLead.temperature} signals during conversation.`,
        };
        onLeadUpdated(updatedLead);
      }
    } catch (err) {
      console.warn('Backend conversational assistant error:', err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        leadId: activeLead?.id || 'demo-lead',
        sender: 'ai',
        text: `Thank you for your question regarding **${selectedProperty.title}**. The property is listed at **$${selectedProperty.price.toLocaleString()}** with ${selectedProperty.bedrooms} bedrooms and ${selectedProperty.sqft.toLocaleString()} sq ft.\n\nOur broker **${selectedProperty.agentName}** has viewing windows available tomorrow at 10:30 AM or 2:00 PM. Would you like me to book either slot for you?`,
        timestamp: 'Just now',
        suggestedSlots: [
          'Tomorrow at 10:30 AM (In-person Guided Tour)',
          'Tomorrow at 2:00 PM (Senior Agent Walkthrough)',
        ],
        propertyId: selectedProperty.id,
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slotString: string) => {
    setConfirmedSlot(slotString);

    const confirmationMsg: ChatMessage = {
      id: `confirm-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `Appointment confirmed: **${slotString}** for **${selectedProperty.title}**.\n\nA calendar invite has been dispatched to host agent **${selectedProperty.agentName}**. Your dossier has been prioritized to **Hot VIP** tier.`,
      timestamp: 'Just now',
      propertyId: selectedProperty.id,
    };
    setMessages((prev) => [...prev, confirmationMsg]);

    const newAppointment: AppointmentSlot = {
      id: `slot-${Date.now()}`,
      leadId: activeLead?.id || 'lead-guest',
      leadName: activeLead?.name || 'Inquiring Buyer',
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.title,
      propertyLocation: selectedProperty.address,
      date: '2026-10-28',
      time: slotString.includes('10:30') ? '10:30 AM' : slotString.includes('2:00') ? '2:00 PM' : '11:00 AM',
      durationMinutes: 45,
      agentName: selectedProperty.agentName,
      meetingType: 'VIP Private Showing',
      status: 'Confirmed',
      notes: `Confirmed via AI Concierge for ${selectedProperty.title}.`,
      confirmedAt: new Date().toISOString(),
    };
    onAppointmentBooked(newAppointment);

    if (activeLead) {
      onLeadUpdated({
        ...activeLead,
        stage: 'Viewing Scheduled',
        temperature: 'Hot',
        aiScore: 98,
        aiSummary: `Appointment booked for ${slotString} at ${selectedProperty.title}. Lead upgraded to Hot VIP tier.`,
        temperatureRationale: 'Confirmed viewing slot via AI concierge with immediate intent.',
      });
    }
  };

  const quickPrompts = [
    { label: 'Price & HOA', icon: Receipt, text: `What is the price, HOA fees, and monthly mortgage for ${selectedProperty.title}?` },
    { label: 'Floor Plan', icon: Maximize2, text: `Can you give me the exact bedrooms, bathrooms, and square footage details for ${selectedProperty.title}?` },
    { label: 'Neighborhood', icon: GraduationCap, text: `What are the nearby school ratings and neighborhood amenities around ${selectedProperty.title}?` },
    { label: 'Book Showing ($1.5M)', icon: CalendarCheck, text: `My budget is $1.5M cash, I am relocating soon. What available viewing slots do you have tomorrow?` },
  ];

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      !leadSearch ||
      l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
      l.preferredLocation.toLowerCase().includes(leadSearch.toLowerCase());
    const matchesTemp = leadTempFilter === 'All' || l.temperature === leadTempFilter;
    return matchesSearch && matchesTemp;
  });

  return (
    <div className="h-[calc(100dvh-7.5rem)] flex flex-col space-y-3 animate-in fade-in duration-150">
      {/* 3-Pane Unified Real-Time CRM Inbox */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* PANE 1: Client Conversations Inbox (3 Cols on Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 surface-card rounded-lg flex-col overflow-hidden">
          <div className="p-3 border-b border-white/[0.06] space-y-2 shrink-0 bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-white">Prospect Inquiries</span>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded">
                {filteredLeads.length} active
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Filter prospects..."
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e]"
              />
            </div>

            {/* Temp quick filters */}
            <div className="flex items-center gap-1 text-[10px]">
              {(['All', 'Hot', 'Warm', 'Cold'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLeadTempFilter(t)}
                  className={`flex-1 py-0.5 rounded text-center transition cursor-pointer font-medium ${
                    leadTempFilter === t
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Leads list */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-none">
            {filteredLeads.map((lead) => {
              const isSelected = activeLead?.id === lead.id;
              const prop = properties.find((p) => p.id === lead.interestedPropertyId);

              return (
                <button
                  key={lead.id}
                  onClick={() => handleSelectLeadCard(lead)}
                  className={`w-full text-left p-2.5 transition cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-zinc-800/90 border-l-2 border-[#dfc195]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <img
                    src={lead.avatar}
                    alt={lead.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-zinc-100 truncate">{lead.name}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          lead.temperature === 'Hot'
                            ? 'bg-rose-400'
                            : lead.temperature === 'Warm'
                            ? 'bg-amber-400'
                            : 'bg-sky-400'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-[11px] font-semibold text-emerald-400">
                        ${(lead.budget / 1000).toFixed(0)}k
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">
                        {prop ? prop.title : lead.stage}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Center Conversational Stream (6 Cols on Desktop) */}
        <div className="lg:col-span-6 surface-card rounded-lg flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3 bg-zinc-950/80 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-[#dfc195] shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-xs text-white truncate">
                    {activeLead ? activeLead.name : 'Sales Concierge'}
                  </h3>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  Listing: <strong className="text-zinc-200">{selectedProperty.title}</strong> (${(selectedProperty.price / 1000).toFixed(0)}k)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `init-${Date.now()}`,
                    leadId: activeLead?.id || 'demo-lead',
                    sender: 'ai',
                    text: `Hello! I am ready to assist with **${selectedProperty.title}** specifications or available viewing slots.`,
                    timestamp: 'Just now',
                    propertyId: selectedProperty.id,
                  },
                ]);
                setConfirmedSlot(null);
              }}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] text-xs transition cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Prompters Bar */}
          <div className="bg-zinc-950/40 px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] whitespace-nowrap transition cursor-pointer font-medium"
                >
                  <Icon className="w-2.5 h-2.5 text-zinc-400" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Message History Stream */}
          <div ref={messagesPaneRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-black/20">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-6 h-6 rounded bg-zinc-900 border border-white/[0.08] flex items-center justify-center shrink-0 text-[#dfc195] mt-0.5">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs shadow-sm leading-relaxed ${
                      isAi
                        ? 'bg-[#141720] border border-white/[0.08] text-zinc-200'
                        : 'bg-zinc-800 border border-white/[0.1] text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1 text-[9px] text-zinc-400">
                      <span className="font-medium">
                        {isAi ? 'EstateFlow Concierge' : activeLead ? activeLead.name : 'Buyer'}
                      </span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-line text-xs font-normal">
                      {msg.text}
                    </div>

                    {/* Suggested Slots */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-white/[0.06] space-y-1.5">
                        <p className="text-[10px] font-medium text-zinc-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#dfc195]" />
                          Open showing windows:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {msg.suggestedSlots.map((slot, sIdx) => {
                            const isSelected = confirmedSlot === slot;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleSelectSlot(slot)}
                                disabled={!!confirmedSlot}
                                className={`text-left p-2 rounded border text-xs transition cursor-pointer flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                                    : 'bg-zinc-900/90 border-white/[0.08] hover:border-[#c8a97e]/60 text-zinc-200'
                                }`}
                              >
                                <span className="truncate pr-1 text-[11px]">{slot}</span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-[#dfc195] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-6 h-6 rounded bg-zinc-800 border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-300 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-white/[0.06] rounded-md px-3 py-1.5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dfc195] animate-ping" />
                Concierge is consulting inventory & schedule...
              </div>
            )}
          </div>

          {/* Message Input Bar */}
          <div className="p-2.5 bg-zinc-950 border-t border-white/[0.06] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about HOA fees, mortgages, schools, or request a tour time..."
                className="flex-1 bg-zinc-900 border border-white/[0.08] focus:border-[#c8a97e] rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-3.5 py-1.5 bg-[#c8a97e] hover:bg-[#dfc195] disabled:opacity-40 text-zinc-950 font-semibold rounded-md transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
              >
                <span>Send</span>
                <Send className="w-3 h-3 stroke-[2.2]" />
              </button>
            </form>
          </div>
        </div>

        {/* PANE 3: Property Specs & AI Intelligence Dossier (3 Cols on Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 surface-card rounded-lg flex-col overflow-y-auto p-3 space-y-3 scrollbar-none">
          {/* Active Listing Spec Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Active Listing
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                ${selectedProperty.price.toLocaleString()}
              </span>
            </div>

            <div className="relative aspect-video rounded-md overflow-hidden border border-white/[0.08]">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/70 text-[9px] text-white">
                {selectedProperty.propertyType}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-white truncate">{selectedProperty.title}</h4>
              <p className="text-[10px] text-zinc-400 truncate">{selectedProperty.location}</p>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center bg-black/20 p-1.5 rounded border border-white/[0.04] text-[10px]">
              <div>
                <span className="text-zinc-500 block">Beds</span>
                <span className="font-mono font-semibold text-white">{selectedProperty.bedrooms}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Baths</span>
                <span className="font-mono font-semibold text-white">{selectedProperty.bathrooms}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Area</span>
                <span className="font-mono font-semibold text-white">{selectedProperty.sqft}</span>
              </div>
            </div>

            {/* Property Switcher Chips */}
            <div className="pt-1">
              <span className="text-[10px] text-zinc-500 block mb-1">Switch Inventory:</span>
              <div className="grid grid-cols-3 gap-1">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePropertyChange(p)}
                    className={`p-1 rounded text-[10px] truncate border transition cursor-pointer ${
                      selectedProperty.id === p.id
                        ? 'bg-zinc-800 text-white border-[#dfc195]'
                        : 'bg-zinc-900/60 text-zinc-400 border-white/[0.06] hover:text-white'
                    }`}
                    title={p.title}
                  >
                    {p.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06]" />

          {/* Lead Intelligence Section */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
              Lead Intelligence
            </span>

            {activeLead && (
              <div className="p-2 rounded bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-xs block">{activeLead.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">${activeLead.budget.toLocaleString()}</span>
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                    activeLead.temperature === 'Hot'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      : activeLead.temperature === 'Warm'
                      ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                      : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                  }`}
                >
                  {activeLead.temperature}
                </span>
              </div>
            )}

            <div className="bg-black/25 p-2 rounded border border-white/[0.04] space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Target Budget:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  ${(lastDetectedBudget || 1850000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">AI Response:</span>
                <span className="font-mono text-emerald-400">0.35s instant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Host Broker:</span>
                <span className="text-zinc-200">{selectedProperty.agentName}</span>
              </div>
            </div>

            {confirmedSlot && (
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] space-y-0.5 animate-in fade-in">
                <span className="font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Tour Scheduled
                </span>
                <p className="font-mono text-zinc-300">{confirmedSlot}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
