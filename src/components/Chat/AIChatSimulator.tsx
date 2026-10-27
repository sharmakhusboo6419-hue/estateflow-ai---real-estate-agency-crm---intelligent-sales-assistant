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
}

export const AIChatSimulator: React.FC<AIChatSimulatorProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  activeLead,
  onLeadUpdated,
  onAppointmentBooked,
  hasGeminiKey,
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
    { label: 'Price & HOA Breakdown', icon: Receipt, text: `What is the price, HOA fees, and monthly mortgage for ${selectedProperty.title}?` },
    { label: 'Floor Plan & Specs', icon: Maximize2, text: `Can you give me the exact bedrooms, bathrooms, and square footage details for ${selectedProperty.title}?` },
    { label: 'Schools & Vicinity', icon: GraduationCap, text: `What are the nearby school ratings and neighborhood amenities around ${selectedProperty.title}?` },
    { label: 'Book Viewing ($1.5M Cash)', icon: CalendarCheck, text: `My budget is $1.5M cash, I am relocating soon. What available viewing slots do you have tomorrow?` },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Property Selector Bar */}
      <div className="surface-card rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#dfc195]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Active Listing Context
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[#dfc195] bg-[#c8a97e]/10 px-2.5 py-0.5 rounded border border-[#c8a97e]/20 self-start sm:self-auto">
            {selectedProperty.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {properties.map((prop) => {
            const isSelected = selectedProperty.id === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => handlePropertyChange(prop)}
                className={`p-2 rounded-lg text-left border transition cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-zinc-850 border-[#c8a97e]/60 ring-1 ring-[#c8a97e]/30'
                    : 'bg-zinc-900/60 border-white/[0.06] hover:border-white/[0.14] hover:bg-zinc-900'
                }`}
              >
                <div className="relative w-full h-16 rounded overflow-hidden mb-1.5">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#dfc195] ring-2 ring-black" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-white truncate">{prop.title}</p>
                  <p className="font-mono text-xs font-semibold text-emerald-400 mt-0.5">
                    ${(prop.price / 1000).toFixed(0)}k
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {prop.bedrooms}B • {prop.sqft.toLocaleString()} sqft
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Chat Window + Real-time AI Intelligence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Cols: Client Chatbot Window */}
        <div className="lg:col-span-2 surface-card rounded-xl flex flex-col overflow-hidden min-h-[min(620px,calc(100dvh-12rem))] lg:h-[calc(100dvh-13rem)] lg:min-h-[640px]">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 bg-zinc-950/80 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.1] flex items-center justify-center text-[#dfc195]">
                <Bot className="w-4 h-4 stroke-[2]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white">EstateFlow Sales Concierge</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.2 rounded font-mono">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Listing: <span className="text-zinc-200 font-medium">{selectedProperty.title}</span> • Host: {selectedProperty.agentName}
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
                    text: `Hello! I am ready to answer any questions about **${selectedProperty.title}** or provide available tour slots.`,
                    timestamp: 'Just now',
                    propertyId: selectedProperty.id,
                  },
                ]);
                setConfirmedSlot(null);
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] transition cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-[11px]">Reset</span>
            </button>
          </div>

          {/* Quick Prompters Bar */}
          <div className="bg-zinc-950/50 p-2 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((q, idx) => {
              const Icon = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] whitespace-nowrap transition cursor-pointer font-medium"
                >
                  <Icon className="w-3 h-3 text-zinc-400" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Body */}
          <div ref={messagesPaneRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black/20">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded bg-zinc-900 border border-white/[0.08] flex items-center justify-center shrink-0 text-[#dfc195] mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3.5 shadow-sm ${
                      isAi
                        ? 'bg-[#141720] border border-white/[0.08] text-zinc-200'
                        : 'bg-zinc-800 border border-white/[0.1] text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-zinc-400">
                      <span className="font-medium tracking-tight">
                        {isAi ? 'Sales Concierge' : activeLead ? activeLead.name : 'Client'}
                      </span>
                      <span className="font-mono text-[9px]">{msg.timestamp}</span>
                    </div>

                    {/* Message Body */}
                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    {/* Suggested Slots Interactive Booking Cards */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                        <p className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#dfc195]" />
                          Reserve viewing slot:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.suggestedSlots.map((slot, sIdx) => {
                            const isSelected = confirmedSlot === slot;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleSelectSlot(slot)}
                                disabled={!!confirmedSlot}
                                className={`text-left p-2.5 rounded-lg border text-xs transition cursor-pointer flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium'
                                    : 'bg-zinc-900/90 border-white/[0.08] hover:border-[#c8a97e]/60 text-zinc-200'
                                }`}
                              >
                                <span className="truncate pr-1 text-[11px]">{slot}</span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
                    <div className="w-7 h-7 rounded bg-zinc-800 border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-300 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-[#dfc195]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#141720] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfc195] animate-ping" />
                  Generating listing data & verifying agent schedule...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-zinc-950 border-t border-white/[0.06]">
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
                placeholder="Ask about HOA fees, mortgage terms, schools, or schedule a tour..."
                className="flex-1 bg-zinc-900 border border-white/[0.08] focus:border-[#c8a97e] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-[#c8a97e] hover:bg-[#dfc195] disabled:opacity-40 text-zinc-950 font-semibold rounded-lg transition flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3 h-3 stroke-[2.2]" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Real-Time AI Intelligence Inspector */}
        <div className="surface-card rounded-xl p-4 space-y-4 flex flex-col justify-between lg:min-h-[640px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#dfc195]" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Lead Intelligence
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                Live Inspector
              </span>
            </div>

            {/* Client Context Profile Card */}
            {activeLead && (
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center gap-2.5">
                <img
                  src={activeLead.avatar}
                  alt={activeLead.name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">{activeLead.name}</h4>
                  <p className="text-[11px] text-zinc-400 truncate font-mono">{activeLead.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                    Stage: {activeLead.stage}
                  </span>
                </div>
              </div>
            )}

            {/* Calculated Temperature Tier Card */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-2">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                Calculated Temperature Tier
              </span>
              <div className="flex items-center gap-2">
                {currentTemperature === 'Hot' && (
                  <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>HOT LEAD (&gt;$1M / Immediate)</span>
                  </div>
                )}
                {currentTemperature === 'Warm' && (
                  <div className="flex items-center gap-2 text-amber-200 font-semibold text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>WARM PROSPECT ($450k+)</span>
                  </div>
                )}
                {currentTemperature === 'Cold' && (
                  <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs bg-sky-500/10 border border-sky-500/20 px-3 py-2 rounded-lg w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>COLD LEAD (&lt;$450k)</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Re-evaluated on every client response by budget extraction and urgency intent markers.
              </p>
            </div>

            {/* Budget & Intent Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Detected Budget</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {lastDetectedBudget ? `$${lastDetectedBudget.toLocaleString()}` : '$1.85M'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 block mb-0.5">Client Intent</span>
                <span className="text-xs font-medium text-zinc-200 truncate block">
                  {lastIntent}
                </span>
              </div>
            </div>

            {/* Benchmark */}
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400 text-[11px]">AI Response Time:</span>
                <span className="font-mono text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 0.35s
                </span>
              </div>
            </div>

            {/* Injected Property Knowledge */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-xs space-y-1.5">
              <span className="font-medium text-zinc-300 text-[11px] block">
                Listing Specifications:
              </span>
              <ul className="text-[11px] text-zinc-400 space-y-1">
                <li className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-mono text-zinc-200 font-medium">${selectedProperty.price.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>HOA Monthly:</span>
                  <span className="font-mono text-zinc-200 font-medium">${selectedProperty.hoaMonthly}/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Layout:</span>
                  <span className="text-zinc-200 font-medium">{selectedProperty.bedrooms} Bed, {selectedProperty.bathrooms} Bath</span>
                </li>
                <li className="flex justify-between">
                  <span>Host Agent:</span>
                  <span className="text-zinc-200 font-medium">{selectedProperty.agentName}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Confirmation Status */}
          {confirmedSlot && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-0.5 animate-in fade-in">
              <span className="font-medium flex items-center gap-1.5 text-xs text-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tour Scheduled
              </span>
              <p className="text-[11px] text-zinc-300 font-mono">
                {confirmedSlot}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
