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
  UserPlus,
  Sparkles,
  Bot,
  Download,
  Webhook,
  AlertTriangle,
  Database,
  LogIn,
  LogOut,
  Cloud,
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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner with Agency Stats & Real-time AI Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agency Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  EstateFlow AI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Agency OS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Sales Chatbot • Lead Qualification CRM • Auto Follow-ups
              </p>
            </div>
          </div>

          {/* Quick Metrics & Simulated Inbound Trigger */}
          <div className="flex items-center gap-3">
            {/* Live Lead Temperature Tally */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg p-1 text-xs">
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Hot ({hotCount})
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Warm ({warmCount})
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                Cold ({coldCount})
              </span>
              {staleCount > 0 && (
                <button
                  onClick={() => setActiveTab('crm')}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 font-bold border border-amber-500/40 animate-pulse transition cursor-pointer"
                  title="Stale leads requiring agent contact (> 7 days inactive)"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Needs Attention ({staleCount})
                </button>
              )}
            </div>

            {/* AI Engine Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden lg:inline">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'AI Sales Assistant Active'}
              </span>
            </div>

            {/* Cloud Firestore Status Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300"
              title="Persistent Cloud Firestore Active (radiant-rarity-wln7n / asia-southeast1)"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Firestore: radiant-rarity-wln7n</span>
              <span className="xl:hidden">Firestore</span>
            </div>

            {/* Google Authentication Control */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Agent'}
                    className="w-5 h-5 rounded-full ring-1 ring-amber-400/50"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.displayName?.[0] || 'A'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-slate-200 text-[11px] leading-tight truncate max-w-[80px]">
                    {currentUser.displayName || 'Agent'}
                  </p>
                  <span className="text-[9px] text-emerald-400 font-medium">Cloud Synced</span>
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
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                title="Sign in with Google to sync CRM leads & calendar to Firebase Firestore in real-time"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Google Sign In</span>
              </button>
            )}

            {/* Mock Webhook Trigger Button */}
            <button
              onClick={onOpenWebhookSimulator}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shadow-sm transition-all cursor-pointer"
              title="Mock an incoming SMS or WhatsApp webhook event to trigger the AI lead qualification flow"
            >
              <Webhook className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Mock Webhook (SMS/WA)</span>
              <span className="md:hidden">Webhook</span>
            </button>

            {/* Download Project ZIP button */}
            <a
              href="/api/download-zip"
              download="estateflow-ai-crm.zip"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Download clean project zip file to push to GitHub"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>

            {/* Test Simulation Button */}
            <button
              onClick={onSimulateInboundLead}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Simulate a new potential buyer texting the agency about a luxury property"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Simulate Inbound Lead</span>
              <span className="sm:hidden">+ Lead</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'crm'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            CRM Pipeline & Leads
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            AI Chatbot Simulator
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Viewing Slots & Calendar
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'followup'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            AI Automated Follow-up
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Property Inventory ({6})
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            How It Works & System Tour
          </button>
        </div>
      </div>
    </header>
  );
};
