import React, { useState } from 'react';
import {
  X,
  Webhook,
  Smartphone,
  MessageSquare,
  Sparkles,
  Flame,
  Sun,
  Snowflake,
  CheckCircle2,
  ArrowRight,
  Clock,
  Send,
  Code,
  DollarSign,
  Building2,
  Zap,
} from 'lucide-react';
import { Property, WebhookPayload, WebhookProcessingResult } from '../../types/realEstate';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  onTriggerWebhook: (payload: WebhookPayload) => Promise<WebhookProcessingResult>;
  onViewLeadInCRM: (leadId: string) => void;
  onOpenChatWithLead: (leadId: string) => void;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  properties,
  onTriggerWebhook,
  onViewLeadInCRM,
  onOpenChatWithLead,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      id: 'hot-penthouse',
      label: '🔥 WhatsApp: $2.5M Cash Penthouse Buyer (Hot)',
      channel: 'WhatsApp' as const,
      provider: 'WhatsApp Business Cloud API' as const,
      senderName: 'Arthur & Beatrice Pendelton',
      senderPhone: '+1 (555) 881-2091',
      senderEmail: 'arthur.pendelton@capitalpartners.com',
      messageText:
        'Hello! We saw the listing for The Grand Azure Sky Penthouse online. We have a liquid cash budget of $2.5M and are relocating next month. Can Marcus Sterling arrange a private walkthrough tomorrow afternoon?',
      targetPropertyTitle: 'The Grand Azure Sky Penthouse',
    },
    {
      id: 'warm-family',
      label: '🌤️ SMS: $650k Suburban Family Home (Warm)',
      channel: 'SMS' as const,
      provider: 'Twilio SMS' as const,
      senderName: 'Sarah & David Jenkins',
      senderPhone: '+1 (555) 492-1100',
      senderEmail: 'sjenkins.arch@gmail.com',
      messageText:
        'Hi, inquiring about the Oakwood Family Residence ($620k). Our target budget is around $650k. What are the school ratings in the area and do you have any viewing slots open this Saturday morning?',
      targetPropertyTitle: 'Oakwood Family Residence',
    },
    {
      id: 'cold-firsttime',
      label: '❄️ WhatsApp: $320k Starter Condo Search (Cold)',
      channel: 'WhatsApp' as const,
      provider: 'WhatsApp Business Cloud API' as const,
      senderName: 'Liam Carter',
      senderPhone: '+1 (555) 223-9988',
      senderEmail: 'liam.carter98@outlook.com',
      messageText:
        'Hey there, just browsing your properties. My max budget is $320k for a 1-bedroom flat, not ready to buy yet (maybe in 6-8 months). Do you have price drop alerts?',
      targetPropertyTitle: 'The Beacon Terrace Flat',
    },
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(presets[0].id);
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS'>(presets[0].channel);
  const [provider, setProvider] = useState<'WhatsApp Business Cloud API' | 'Twilio SMS'>(
    presets[0].provider
  );
  const [senderName, setSenderName] = useState(presets[0].senderName);
  const [senderPhone, setSenderPhone] = useState(presets[0].senderPhone);
  const [senderEmail, setSenderEmail] = useState(presets[0].senderEmail);
  const [messageText, setMessageText] = useState(presets[0].messageText);
  const [targetPropertyTitle, setTargetPropertyTitle] = useState(presets[0].targetPropertyTitle);

  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionResult, setExecutionResult] = useState<WebhookProcessingResult | null>(null);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setExecutionResult(null);
    const p = presets.find((x) => x.id === presetId);
    if (p) {
      setChannel(p.channel);
      setProvider(p.provider);
      setSenderName(p.senderName);
      setSenderPhone(p.senderPhone);
      setSenderEmail(p.senderEmail);
      setMessageText(p.messageText);
      setTargetPropertyTitle(p.targetPropertyTitle);
    }
  };

  const getPayload = (): WebhookPayload => ({
    event: 'message.received',
    channel,
    provider,
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    senderName: senderName.trim() || 'Anonymous Client',
    senderPhone: senderPhone.trim() || '+1 (555) 000-0000',
    senderEmail: senderEmail.trim() || undefined,
    messageText: messageText.trim(),
    timestamp: new Date().toISOString(),
    targetPropertyTitle,
  });

  const handleDispatch = async () => {
    if (!messageText.trim()) return;
    setIsProcessing(true);
    setExecutionResult(null);

    const payload = getPayload();
    try {
      const result = await onTriggerWebhook(payload);
      setExecutionResult(result);
    } catch (err) {
      console.error('Webhook processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Webhook className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Incoming SMS / WhatsApp Webhook Simulator
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  AI Trigger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate real-time webhooks from Twilio or Meta WhatsApp Cloud API to trigger the AI lead qualification pipeline.
              </p>
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
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Scenario Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-2xl text-left border transition text-xs cursor-pointer flex flex-col justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-slate-200 line-clamp-1">{preset.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                    {preset.channel} • {preset.senderName.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form vs JSON View Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Webhook Parameters
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-amber-400" />
                Raw JSON Payload
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">POST /api/webhooks/incoming</span>
          </div>

          {activeTab === 'form' ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Channel & Gateway</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setChannel('WhatsApp');
                        setProvider('WhatsApp Business Cloud API');
                      }}
                      className={`py-2 rounded-xl font-bold text-center transition cursor-pointer ${
                        channel === 'WhatsApp'
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChannel('SMS');
                        setProvider('Twilio SMS');
                      }}
                      className={`py-2 rounded-xl font-bold text-center transition cursor-pointer ${
                        channel === 'SMS'
                          ? 'bg-indigo-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Twilio SMS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Sender Phone (E.164)
                  </label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Target Listing</label>
                  <select
                    value={targetPropertyTitle}
                    onChange={(e) => setTargetPropertyTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {properties.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title} (${p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Incoming Message Body (Client Inquiry) *
                </label>
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(getPayload(), null, 2)}</pre>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleDispatch}
              disabled={isProcessing || !messageText.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>
                {isProcessing
                  ? 'Processing Webhook & Running AI Lead Qualification...'
                  : 'Dispatch Webhook -> Trigger AI Lead Qualification'}
              </span>
            </button>
          </div>

          {/* Real-time Webhook Execution Trace & AI Results */}
          {executionResult && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Webhook Pipeline Executed (HTTP 200 OK)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">
                  Latency: {executionResult.executionTimeMs}ms
                </span>
              </div>

              {/* Step Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Detected Budget</span>
                  <span className="text-sm font-black text-emerald-300">
                    ${executionResult.detectedBudget.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Temperature Tier</span>
                  <span className="mt-1 inline-block">
                    {executionResult.temperature === 'Hot' && (
                      <span className="text-[10px] font-black text-rose-300 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" /> HOT LEAD
                      </span>
                    )}
                    {executionResult.temperature === 'Warm' && (
                      <span className="text-[10px] font-black text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" /> WARM LEAD
                      </span>
                    )}
                    {executionResult.temperature === 'Cold' && (
                      <span className="text-[10px] font-black text-sky-300 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center gap-1">
                        <Snowflake className="w-3 h-3 text-sky-400" /> COLD LEAD
                      </span>
                    )}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Matched Listing</span>
                  <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">
                    {executionResult.propertyTitle}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Proposed Slots</span>
                  <span className="text-xs font-bold text-amber-300 mt-0.5 block">
                    {executionResult.suggestedSlots.length} available
                  </span>
                </div>
              </div>

              {/* AI Auto-Response Dispatched via SMS/WhatsApp */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    AI Auto-Dispatched Response ({channel}):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Dispatched to Client
                  </span>
                </div>
                <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono">
                  {executionResult.aiReplyText}
                </p>
              </div>

              {/* Rationale & CRM Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-400 italic">
                  Rationale: "{executionResult.rationale}"
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChatWithLead(executionResult.leadId);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    Open in Chat
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onViewLeadInCRM(executionResult.leadId);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View in CRM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
