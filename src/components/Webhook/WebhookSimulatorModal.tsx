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
      label: 'WhatsApp: $2.5M Cash Penthouse Buyer (Hot)',
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
      label: 'SMS: $650k Suburban Family Home (Warm)',
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
      label: 'WhatsApp: $320k Starter Condo Search (Cold)',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="surface-elevated rounded-xl w-full max-w-3xl max-h-[calc(100dvh-2rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-zinc-950/80 border-b border-white/[0.08] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/[0.1] text-indigo-400 flex items-center justify-center">
              <Webhook className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  SMS & WhatsApp Webhook Inbound Simulator
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.2 rounded">
                  Pipeline Inbound
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulate real-time webhooks from Twilio or Meta WhatsApp Cloud API to trigger the AI lead qualification pipeline.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Preset Buttons */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
              Select Scenario Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-2.5 rounded-lg text-left border transition text-xs cursor-pointer flex flex-col justify-between ${
                    selectedPresetId === preset.id
                      ? 'bg-zinc-800 border-white/[0.14] text-white shadow-sm'
                      : 'bg-zinc-900/60 border-white/[0.06] hover:border-white/[0.12] text-zinc-400'
                  }`}
                >
                  <span className="font-medium text-zinc-200 line-clamp-1">{preset.label}</span>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {preset.channel} • {preset.senderName.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form vs JSON View Tabs */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-zinc-800 text-white border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Payload Form
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'json'
                    ? 'bg-zinc-800 text-white border border-white/[0.1]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-3 h-3 text-zinc-400" />
                Raw JSON
              </button>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">POST /api/webhooks/incoming</span>
          </div>

          {activeTab === 'form' ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Gateway</label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-0.5 rounded-lg border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        setChannel('WhatsApp');
                        setProvider('WhatsApp Business Cloud API');
                      }}
                      className={`py-1 rounded-md font-medium text-center transition cursor-pointer ${
                        channel === 'WhatsApp'
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
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
                      className={`py-1 rounded-md font-medium text-center transition cursor-pointer ${
                        channel === 'SMS'
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Twilio SMS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#c8a97e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Sender Phone</label>
                  <input
                    type="text"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#c8a97e]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-300 mb-1">Target Property</label>
                  <select
                    value={targetPropertyTitle}
                    onChange={(e) => setTargetPropertyTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#c8a97e]"
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
                <label className="block font-medium text-zinc-300 mb-1">
                  Inbound Message Body *
                </label>
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c8a97e] leading-relaxed font-sans text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="bg-black/30 rounded-lg p-3 border border-white/[0.06] font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(getPayload(), null, 2)}</pre>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              onClick={handleDispatch}
              disabled={isProcessing || !messageText.trim()}
              className="w-full py-2.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {isProcessing
                  ? 'Processing Webhook & Qualifying Lead...'
                  : 'Dispatch Webhook & Execute AI Qualification'}
              </span>
            </button>
          </div>

          {/* Real-time Webhook Execution Trace & AI Results */}
          {executionResult && (
            <div className="bg-zinc-950/90 border border-white/[0.08] rounded-lg p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Webhook Pipeline Executed (HTTP 200 OK)
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Latency: {executionResult.executionTimeMs}ms
                </span>
              </div>

              {/* Step Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block font-normal">Detected Budget</span>
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    ${executionResult.detectedBudget.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block font-normal">Tier</span>
                  <span className="mt-0.5 inline-block">
                    {executionResult.temperature === 'Hot' && (
                      <span className="text-[10px] font-medium text-rose-300 px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20">
                        Hot Lead
                      </span>
                    )}
                    {executionResult.temperature === 'Warm' && (
                      <span className="text-[10px] font-medium text-amber-200 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                        Warm
                      </span>
                    )}
                    {executionResult.temperature === 'Cold' && (
                      <span className="text-[10px] font-medium text-sky-300 px-1.5 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">
                        Cold
                      </span>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block font-normal">Matched Listing</span>
                  <span className="text-xs font-medium text-zinc-200 truncate block mt-0.5">
                    {executionResult.propertyTitle}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block font-normal">Proposed Slots</span>
                  <span className="text-xs font-medium text-zinc-200 mt-0.5 block">
                    {executionResult.suggestedSlots.length} available
                  </span>
                </div>
              </div>

              {/* AI Auto-Response Dispatched via SMS/WhatsApp */}
              <div className="p-3 rounded bg-zinc-900/60 border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Send className="w-3 h-3 text-emerald-400" />
                    AI Auto-Dispatched Response ({channel}):
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    Dispatched
                  </span>
                </div>
                <p className="text-zinc-300 text-xs whitespace-pre-line leading-relaxed bg-black/20 p-2.5 rounded border border-white/[0.04] font-mono">
                  {executionResult.aiReplyText}
                </p>
              </div>

              {/* Rationale & CRM Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <p className="text-[11px] text-zinc-400 italic">
                  Rationale: "{executionResult.rationale}"
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChatWithLead(executionResult.leadId);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
                  >
                    Open in Chat
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onViewLeadInCRM(executionResult.leadId);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <span>View in CRM</span>
                    <ArrowRight className="w-3 h-3" />
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
