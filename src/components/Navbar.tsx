import React from 'react';
import {
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Send,
  HelpCircle,
  Flame,
  Sun,
  Snowflake,
  Sparkles,
  Bot,
  Download,
  Webhook,
  AlertTriangle,
  Database,
  LogIn,
  LogOut,
  Radio,
} from 'lucide-react';
import { Lead } from '../types/realEstate';
import { useFirebase } from '../firebase/FirebaseContext';

interface NavbarProps {
  activeTab: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide';
  setActiveTab: (tab: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide') => void;
  leads: Lead[];
  onSimulateInboundLead: () => void;
  onOpenWebhookSimulator: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  leads,
  onSimulateInboundLead,
  onOpenWebhookSimulator,
  hasGeminiKey,
}) => {
  const { currentUser, signInWithGoogle, signOut, syncStatus } = useFirebase();

  const hotCount = leads.filter((l) => l.temperature === 'Hot').length;
  const warmCount = leads.filter((l) => l.temperature === 'Warm').length;
  const coldCount = leads.filter((l) => l.temperature === 'Cold').length;
  const staleCount = leads.filter(
    (l) => l.isStale || l.tags?.includes('Needs Attention')
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 text-white shadow-2xl shadow-slate-950/60 backdrop-blur-2xl">
      {/* Top Bar with Agency Brand, Live Metrics & Quick Triggers */}
      <div className="max-w-[92rem] mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-3 min-h-16 py-2.5">
          {/* Logo & Agency Brand */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/30">
                <Building2 className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  EstateFlow AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-inner">
                  Agency OS v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Autonomous Real Estate Sales Assistant • AI Lead Qualification • Instant Booking
              </p>
            </div>
          </div>

          {/* Quick Metrics & Action Controls */}
          <div className="flex items-center justify-end gap-2 sm:gap-2.5 min-w-0 overflow-x-auto scrollbar-none py-1">
            {/* Live Lead Temperature Tally with interactive quick-filter */}
            <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-rose-300 hover:bg-rose-500/10 transition font-semibold"
                title="View Hot leads in CRM"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Hot</span>
                <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {hotCount}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-amber-300 hover:bg-amber-500/10 transition font-semibold"
                title="View Warm leads in CRM"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Warm</span>
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {warmCount}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-sky-300 hover:bg-sky-500/10 transition font-semibold"
                title="View Cold leads in CRM"
              >
                <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                <span>Cold</span>
                <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {coldCount}
                </span>
              </button>
            </div>

            {/* Stale Leads Attention Badge */}
            {staleCount > 0 && (
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 font-bold text-xs shadow-sm transition animate-pulse cursor-pointer"
                title="Stale leads requiring agent contact (> 7 days inactive)"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Needs Attention</span>
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {staleCount}
                </span>
              </button>
            )}

            {/* AI Engine Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-slate-200">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'AI Agent Ready'}
              </span>
            </div>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Agent'}
                    className="w-6 h-6 rounded-full ring-1 ring-amber-400/50 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    {currentUser.displayName?.[0] || 'A'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-slate-200 text-xs leading-none truncate max-w-[90px]">
                    {currentUser.displayName || 'Agent'}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                    <Radio className="w-2.5 h-2.5" /> Synced
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign out of Firebase"
                  className="p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                title="Sign in with Google to sync CRM leads & calendar to Firebase Firestore in real-time"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Google Cloud Sync</span>
              </button>
            )}

            {/* Mock Webhook Trigger Button */}
            <button
              onClick={onOpenWebhookSimulator}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Test incoming SMS or WhatsApp webhook event to trigger AI lead qualification"
            >
              <Webhook className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Webhook Test</span>
              <span className="md:hidden">Webhook</span>
            </button>

            {/* Download Project ZIP button */}
            <a
              href="/api/download-zip"
              download="estateflow-ai-crm.zip"
              className="hidden 2xl:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Download clean project zip file to push to GitHub"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Code</span>
            </a>

            {/* Test Simulation Button */}
            <button
              onClick={onSimulateInboundLead}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-amber-300/50"
              title="Simulate a new potential buyer texting the agency about a luxury property"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span className="hidden sm:inline">Simulate Inbound Lead</span>
              <span className="sm:hidden">+ Lead</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Primary navigation"
          className="relative flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none"
        >
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'crm'
                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border border-amber-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>CRM Pipeline</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'crm' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border border-amber-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>AI Sales Chatbot</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border border-amber-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Viewing Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'followup'
                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border border-amber-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <Send className="w-4 h-4 text-rose-400" />
            <span>Automated Follow-ups</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border border-amber-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4 text-violet-400" />
            <span>Property Portfolio</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              6
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>System Tour & Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
