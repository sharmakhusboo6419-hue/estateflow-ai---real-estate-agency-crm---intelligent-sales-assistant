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
  Info,
  RefreshCw,
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
      text: `Hello! Welcome to **EstateFlow Luxury Real Estate**. I am your instant property advisor for **${selectedProperty.title}**.\n\nI have complete architectural specs, floor plans, HOA fee breakdowns, and real-time viewing availability. How may I assist your search today?`,
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
  const [lastIntent, setLastIntent] = useState<string>('Information Gathering');
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);

  const messagesPaneRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  const scrollToBottom = () => {
    const pane = messagesPaneRef.current;
    if (pane) pane.scrollTo({ top: pane.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    // Do not scroll the document on initial mount. Only new conversation events
    // advance the contained transcript for a user already working in the chat.
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

      // If activeLead exists, update them dynamically in the CRM
      if (activeLead) {
        const updatedLead: Lead = {
          ...activeLead,
          budget: data.detectedBudget || activeLead.budget,
          temperature: data.leadTemperature || activeLead.temperature,
          interestedPropertyId: selectedProperty.id,
          lastContactAt: 'Just now',
          aiScore:
            data.leadTemperature === 'Hot'
              ? Math.max(activeLead.aiScore, 95)
              : data.leadTemperature === 'Warm'
              ? Math.max(activeLead.aiScore, 75)
              : activeLead.aiScore,
          aiSummary: `Client chatted about ${selectedProperty.title}. Intent: ${data.extractedIntent || 'Inquiry'}. Temperature: ${data.leadTemperature || activeLead.temperature}.`,
        };
        onLeadUpdated(updatedLead);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clicking an interactive slot suggested by the AI
  const handleSelectSlot = (slotString: string) => {
    setConfirmedSlot(slotString);

    // 1. Post user confirmation message
    const confirmUserMsg: ChatMessage = {
      id: `user-confirm-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'user',
      text: `I confirm the slot: "${slotString}". Please reserve it.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      propertyId: selectedProperty.id,
    };

    // 2. AI confirms immediately
    const confirmAiMsg: ChatMessage = {
      id: `ai-confirm-${Date.now()}`,
      leadId: activeLead?.id || 'demo-lead',
      sender: 'ai',
      text: `🎉 **Viewing Slot Confirmed!**\n\n- **Reserved Time:** ${slotString}\n- **Property:** ${selectedProperty.title} (${selectedProperty.address})\n- **Assigned Senior Broker:** ${selectedProperty.agentName} (${selectedProperty.agentPhone})\n- **Status:** Added to agency viewing calendar & calendar invite dispatched.\n\nWe look forward to meeting you!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      propertyId: selectedProperty.id,
      leadTemperature: 'Hot',
    };

    setMessages((prev) => [...prev, confirmUserMsg, confirmAiMsg]);
    setCurrentTemperature('Hot');
    setLastIntent('Viewing Confirmed');

    // Create appointment slot entry in the calendar
    const newAppointment: AppointmentSlot = {
      id: `slot-${Date.now()}`,
      leadId: activeLead?.id || 'lead-guest',
      leadName: activeLead?.name || 'Inquiring Buyer',
      propertyId: selectedProperty.id,
      propertyTitle: selectedProperty.title,
      propertyLocation: selectedProperty.address,
      date: '2026-10-27',
      time: slotString.includes('10:30') ? '10:30 AM' : slotString.includes('2:00') ? '2:00 PM' : '11:00 AM',
      durationMinutes: 45,
      agentName: selectedProperty.agentName,
      meetingType: 'VIP Private Showing',
      status: 'Confirmed',
      notes: `Confirmed via AI Chatbot for ${selectedProperty.title}. Lead tier upgraded to Hot.`,
      confirmedAt: new Date().toISOString(),
    };
    onAppointmentBooked(newAppointment);

    // Update lead in CRM to Viewing Scheduled
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
    { label: '💰 Price & Mortgage Breakdown', text: `What is the price, HOA fees, and monthly mortgage for ${selectedProperty.title}?` },
    { label: '📐 Exact Floor Plan & Sq Ft', text: `Can you give me the exact bedrooms, bathrooms, and square footage details for ${selectedProperty.title}?` },
    { label: '🏫 Schools & Neighborhood', text: `What are the nearby school ratings and neighborhood amenities around ${selectedProperty.title}?` },
    { label: '🗓️ I have $1.5M budget, can I tour tomorrow?', text: `My budget is $1.5M cash, I am relocating soon. What available viewing slots do you have tomorrow?` },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Property Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Current property context
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Choose a listing to update the active conversation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {properties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => handlePropertyChange(prop)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                selectedProperty.id === prop.id
                  ? 'bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <img
                src={prop.imageUrl}
                alt={prop.title}
                className="w-full h-16 rounded-lg object-cover mb-1.5"
              />
              <div>
                <p className="text-xs font-bold text-white truncate">{prop.title}</p>
                <p className="text-xs font-extrabold text-amber-300">
                  ${prop.price.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">
                  {prop.bedrooms}B • {prop.sqft} sqft
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Chat Window + Real-time AI Intelligence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
        {/* Left 2 Cols: Client Chatbot Window */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl shadow-slate-950/30 overflow-hidden min-h-[min(640px,calc(100dvh-11rem))] lg:h-[calc(100dvh-10rem)] lg:min-h-[640px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                  <Bot className="w-5 h-5 text-slate-950" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">EstateFlow AI Sales Specialist</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Instant 24/7 Response
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Inquiring on: <span className="text-slate-200 font-semibold">{selectedProperty.title}</span> • Agent: {selectedProperty.agentName}
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
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
                title="Reset conversation"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Quick Prompters Bar */}
          <div className="bg-slate-950/40 p-2.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Quick Inquiries:
            </span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div ref={messagesPaneRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-950/20">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center flex-shrink-0 text-slate-950 mt-1 shadow">
                      <Bot className="w-4 h-4 text-slate-950" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                      isAi
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                      <span className="font-bold">
                        {isAi ? 'EstateFlow AI Specialist' : activeLead ? activeLead.name : 'Client'}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Message Body with Markdown formatting support */}
                    <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </div>

                    {/* Suggested Slots Buttons if Present */}
                    {msg.suggestedSlots && msg.suggestedSlots.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          Click an available slot to instantly reserve:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.suggestedSlots.map((slot, sIdx) => {
                            const isSelected = confirmedSlot === slot;
                            return (
                              <button
                                key={sIdx}
                                onClick={() => handleSelectSlot(slot)}
                                disabled={!!confirmedSlot}
                                className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                                    : 'bg-slate-950 border-slate-700/80 hover:border-amber-500/80 hover:bg-slate-800/80 text-white'
                                }`}
                              >
                                <span className="truncate pr-1">{slot}</span>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950">
                  <Bot className="w-4 h-4 text-slate-950 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  AI retrieving property catalog details & calculating available slots...
                </div>
              </div>
            )}

          </div>

          {/* Input Box */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800">
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
                placeholder="Ask about price, HOA, bedrooms, schools, or request a tour time..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Real-Time AI Intelligence Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/30 space-y-5 flex flex-col justify-between lg:min-h-[640px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live AI Qualifier
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                Real-Time CRM Sync
              </span>
            </div>

            {/* Response Speed Comparison */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">AI Response Latency:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> ~0.4 seconds
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Human salesperson average:</span>
                <span className="text-rose-400 line-through">3.5 hours (Leads lost)</span>
              </div>
            </div>

            {/* Current Lead Temperature Gauge */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Calculated Temperature Tier
              </span>
              <div className="flex items-center gap-2">
                {currentTemperature === 'Hot' && (
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-sm bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 rounded-xl w-full">
                    <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                    HOT LEAD (Urgent / $1M+)
                  </div>
                )}
                {currentTemperature === 'Warm' && (
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl w-full">
                    <Sun className="w-4 h-4 text-amber-400" />
                    WARM PROSPECT ($450k-$1M)
                  </div>
                )}
                {currentTemperature === 'Cold' && (
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-sm bg-sky-500/20 border border-sky-500/40 px-3 py-1.5 rounded-xl w-full">
                    <Snowflake className="w-4 h-4 text-sky-400" />
                    COLD LEAD (Nurture / &lt;$450k)
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                AI categorizes dynamically whenever the client mentions budget, tour requests, or timeline.
              </p>
            </div>

            {/* Extracted Budget & Intent */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Extracted Budget</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {lastDetectedBudget ? `$${lastDetectedBudget.toLocaleString()}` : 'Detecting...'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current Intent</span>
                <span className="text-xs font-bold text-amber-300 truncate block">
                  {lastIntent}
                </span>
              </div>
            </div>

            {/* Injected Property Knowledge */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="font-bold text-slate-300 text-[11px] block">
                Catalog Knowledge Fed to AI:
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Price: ${selectedProperty.price.toLocaleString()}</li>
                <li>HOA Monthly: ${selectedProperty.hoaMonthly}/mo</li>
                <li>Layout: {selectedProperty.bedrooms} Bed, {selectedProperty.bathrooms} Bath</li>
                <li>Area: {selectedProperty.sqft} sq ft</li>
                <li>Host: {selectedProperty.agentName}</li>
              </ul>
            </div>
          </div>

          {/* Bottom Confirmation Status */}
          {confirmedSlot && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Appointment Synced to CRM
              </span>
              <p className="text-[11px] text-slate-300">
                Slot: <span className="font-semibold text-white">{confirmedSlot}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
