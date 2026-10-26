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
  TrendingUp,
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
      text: `Hello! Welcome to **EstateFlow Luxury Real Estate**. I am your autonomous AI property concierge for **${selectedProperty.title}**.\n\nI have complete architectural blueprints, HOA fee schedules, mortgage formulas, and real-time viewing availability.\n\nHow can I assist your property search today?`,
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

  // When property selection changes, greet client with new property context
  const handlePropertyChange = (prop: Property) => {
    onSelectProperty(prop);
    setConfirmedSlot(null);
    const greetingMsg: ChatMessage = {
      id: `prop-switch-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `You are now inquiring about **${prop.title}** in ${prop.location} listed at **$${prop.price.toLocaleString()}**.\n\nIt features **${prop.bedrooms} beds, ${prop.bathrooms} baths, and ${prop.sqft.toLocaleString()} sq ft**.\n\nAsk me anything regarding property details, down payment estimates, or available viewing slots!`,
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
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        leadId: activeLead?.id || 'demo-lead',
        sender: 'ai',
        text: data.reply || 'Thank you for your interest! Let me check the schedule for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSlots: data.suggestedSlots || [],
        detectedBudget: data.detectedBudget,
        leadTemperature: data.leadTemperature,
        propertyId: selectedProperty.id,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (data.detectedBudget) {
        setLastDetectedBudget(data.detectedBudget);
      }
      if (data.leadTemperature) {
        setCurrentTemperature(data.leadTemperature);
      }
      if (data.extractedIntent) {
        setLastIntent(data.extractedIntent);
      }

      if (activeLead) {
        const updatedLead: Lead = {
          ...activeLead,
          budget: data.detectedBudget || activeLead.budget,
          temperature: data.leadTemperature || activeLead.temperature,
          interestedPropertyId: selectedProperty.id,
          lastContactAt: 'Just now',
          aiScore:
            data.leadTemperature === 'Hot'
              ? Math.max(activeLead.aiScore, 96)
              : data.leadTemperature === 'Warm'
              ? Math.max(activeLead.aiScore, 82)
              : activeLead.aiScore,
          aiSummary: `Client chatted about ${selectedProperty.title}. Intent: ${data.extractedIntent || 'Inquiry'}. Tier: ${data.leadTemperature || activeLead.temperature}.`,
        };
        onLeadUpdated(updatedLead);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slotString: string) => {
    setConfirmedSlot(slotString);

    const confirmUserMsg: ChatMessage = {
      id: `user-confirm-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'user',
      text: `I confirm the tour slot: "${slotString}". Please reserve it on my calendar.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      propertyId: selectedProperty.id,
    };

    const confirmAiMsg: ChatMessage = {
      id: `ai-confirm-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `🎉 **Viewing Slot Confirmed!**\n\n- **Reserved Window:** ${slotString}\n- **Property:** ${selectedProperty.title} (${selectedProperty.address})\n- **Assigned Host Agent:** ${selectedProperty.agentName} (${selectedProperty.agentPhone})\n- **Status:** Added to agency viewing calendar & calendar invite dispatched.\n\nWe look forward to welcoming you!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      propertyId: selectedProperty.id,
      leadTemperature: 'Hot',
    };

    setMessages((prev) => [...prev, confirmUserMsg, confirmAiMsg]);
    setCurrentTemperature('Hot');
    setLastIntent('Viewing Confirmed');

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
      notes: `Confirmed via AI Chatbot for ${selectedProperty.title}. Lead tier upgraded to Hot.`,
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
        temperatureRationale: 'Confirmed viewing slot via AI chatbot and expressed immediate intent.',
      });
    }
  };

  const quickPrompts = [
    { label: '💰 Price & HOA Breakdown', text: `What is the price, HOA fees, and monthly mortgage for ${selectedProperty.title}?` },
    { label: '📐 Exact Floor Plan & Sq Ft', text: `Can you give me the exact bedrooms, bathrooms, and square footage details for ${selectedProperty.title}?` },
    { label: '🏫 Schools & Neighborhood', text: `What are the nearby school ratings and neighborhood amenities around ${selectedProperty.title}?` },
    { label: '🗓️ I have $1.5M cash, can I tour tomorrow?', text: `My budget is $1.5M cash, I am relocating soon. What available viewing slots do you have tomorrow?` },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Property Selector Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Active Listing Context
              </h2>
              <p className="text-[11px] text-slate-400">
                Switch properties to inject custom specifications into the conversational AI
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Current: {selectedProperty.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {properties.map((prop) => {
            const isSelected = selectedProperty.id === prop.id;
            return (
              <button
                key={prop.id}
                onClick={() => handlePropertyChange(prop)}
                className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="relative w-full h-18 rounded-xl overflow-hidden mb-2">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate">{prop.title}</p>
                  <p className="text-xs font-black text-amber-300 mt-0.5">
                    ${(prop.price / 1000).toFixed(0)}k
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {prop.bedrooms}B • {prop.sqft.toLocaleString()} sqft
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Chat Window + Real-time AI Intelligence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
        {/* Left 2 Cols: Client Chatbot Window */}
        <div className="lg:col-span-2 bg-slate-900/95 border border-slate-800 rounded-3xl flex flex-col shadow-2xl backdrop-blur-xl overflow-hidden min-h-[min(650px,calc(100dvh-11rem))] lg:h-[calc(100dvh-12rem)] lg:min-h-[660px]">
          {/* Chat Header */}
          <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white">EstateFlow AI Sales Specialist</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Online • 24/7 Concierge
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Discussing: <span className="text-amber-300 font-bold">{selectedProperty.title}</span> • Host Agent: {selectedProperty.agentName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Prompters Bar */}
          <div className="bg-slate-950/60 p-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Prompts:
            </span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 whitespace-nowrap transition cursor-pointer font-medium hover:border-amber-500/40"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div ref={messagesPaneRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/30">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shrink-0 text-slate-950 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-slate-950" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 shadow-md ${
                      isAi
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200 backdrop-blur-md'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-semibold shadow-amber-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-75">
                      <span className="font-extrabold uppercase tracking-wider">
                        {isAi ? 'EstateFlow AI Specialist' : activeLead ? activeLead.name : 'Client'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Body with Markdown styling */}
                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    {/* Suggested Slots Interactive Booking Cards */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          Tap an available slot to instantly reserve on calendar:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.suggestedSlots.map((slot, sIdx) => {
                            const isSelected = confirmedSlot === slot;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleSelectSlot(slot)}
                                disabled={!!confirmedSlot}
                                className={`text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                                    : 'bg-slate-950 border-slate-800 hover:border-amber-500/80 hover:bg-slate-800 text-white'
                                }`}
                              >
                                <span className="truncate pr-1">{slot}</span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950">
                  <Bot className="w-4 h-4 text-slate-950 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  EstateFlow AI is calculating specifications & scheduling options...
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800">
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
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition ring-0 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-2xl transition flex items-center gap-1.5 text-xs shadow-md cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Real-Time AI Intelligence Inspector */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4 flex flex-col justify-between lg:min-h-[660px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Live AI Lead Qualifier
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Real-Time CRM
              </span>
            </div>

            {/* Client Context Profile Card */}
            {activeLead && (
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <img
                  src={activeLead.avatar}
                  alt={activeLead.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{activeLead.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{activeLead.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Stage: {activeLead.stage}
                  </span>
                </div>
              </div>
            )}

            {/* Calculated Temperature Tier Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Calculated Temperature Tier
              </span>
              <div className="flex items-center gap-2">
                {currentTemperature === 'Hot' && (
                  <div className="flex items-center gap-2.5 text-rose-300 font-black text-xs bg-rose-500/20 border border-rose-500/40 px-3.5 py-2.5 rounded-2xl w-full shadow-lg shadow-rose-500/10">
                    <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>HOT LEAD (&gt;$1M / Immediate)</span>
                  </div>
                )}
                {currentTemperature === 'Warm' && (
                  <div className="flex items-center gap-2.5 text-amber-300 font-black text-xs bg-amber-500/20 border border-amber-500/40 px-3.5 py-2.5 rounded-2xl w-full shadow-lg shadow-amber-500/10">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>WARM PROSPECT ($450k+)</span>
                  </div>
                )}
                {currentTemperature === 'Cold' && (
                  <div className="flex items-center gap-2.5 text-sky-300 font-black text-xs bg-sky-500/20 border border-sky-500/40 px-3.5 py-2.5 rounded-2xl w-full shadow-lg shadow-sky-500/10">
                    <Snowflake className="w-4 h-4 text-sky-400" />
                    <span>COLD LEAD (&lt;$450k)</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Dynamically re-scored on every client response by budget extraction and urgency markers.
              </p>
            </div>

            {/* Budget & Intent Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Detected Budget</span>
                <span className="text-base font-black text-emerald-300">
                  {lastDetectedBudget ? `$${lastDetectedBudget.toLocaleString()}` : '$1.85M'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Client Intent</span>
                <span className="text-xs font-bold text-amber-300 truncate block">
                  {lastIntent}
                </span>
              </div>
            </div>

            {/* Speed Benchmark Comparison */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-medium">AI Response Time:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 0.35s Instant
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Human salesperson average:</span>
                <span className="text-rose-400 line-through">3.5 hrs (Lost deal)</span>
              </div>
            </div>

            {/* Injected Property Knowledge */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="font-extrabold text-slate-300 text-[11px] block">
                Listing Knowledge Fed to AI:
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1">
                <li className="flex justify-between">
                  <span>Asking Price:</span>
                  <span className="text-white font-bold">${selectedProperty.price.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>HOA Monthly:</span>
                  <span className="text-white font-bold">${selectedProperty.hoaMonthly}/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Floor Plan:</span>
                  <span className="text-white font-bold">{selectedProperty.bedrooms} Bed, {selectedProperty.bathrooms} Bath</span>
                </li>
                <li className="flex justify-between">
                  <span>Host Agent:</span>
                  <span className="text-white font-bold">{selectedProperty.agentName}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Confirmation Status */}
          {confirmedSlot && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 animate-in fade-in">
              <span className="font-extrabold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tour Booked & Synced to Calendar!
              </span>
              <p className="text-[11px] text-slate-200">
                Time: <strong className="text-white">{confirmedSlot}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
