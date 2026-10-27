import React, { useState } from 'react';
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
  LogIn,
  LogOut,
  Radio,
  Menu,
  X,
  Plus,
  Compass,
  ArrowRight,
  ChevronRight,
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
  onOpenNewLeadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  leads,
  onSimulateInboundLead,
  onOpenWebhookSimulator,
  hasGeminiKey,
  onOpenNewLeadModal,
}) => {
  const { currentUser, signInWithGoogle, signOut, syncStatus } = useFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hotCount = leads.filter((l) => l.temperature === 'Hot').length;
  const warmCount = leads.filter((l) => l.temperature === 'Warm').length;
  const coldCount = leads.filter((l) => l.temperature === 'Cold').length;
  const staleCount = leads.filter(
    (l) => l.isStale || l.tags?.includes('Needs Attention')
  ).length;

  const navItems: Array<{
    id: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    liveDot?: boolean;
    description?: string;
  }> = [
    { id: 'crm', label: 'Pipeline & Deals', icon: Users, badge: leads.length, description: 'Client stages & qualification' },
    { id: 'chat', label: 'Client Concierge', icon: MessageSquare, liveDot: true, description: '24/7 AI sales assistant' },
    { id: 'calendar', label: 'Viewing Schedule', icon: Calendar, description: 'Tours & broker calendar' },
    { id: 'followup', label: 'Follow-up Cadence', icon: Send, description: 'Multichannel automated drip' },
    { id: 'properties', label: 'Inventory Portfolio', icon: Building2, badge: 6, description: 'Listings & specifications' },
    { id: 'guide', label: 'System Tour', icon: HelpCircle, description: 'Architecture & documentation' },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'crm':
        return { title: 'Pipeline & Deals', subtitle: 'Automated Buyer Tiering & Deal Progression' };
      case 'chat':
        return { title: 'Client Concierge', subtitle: 'Conversational Sales Specialist & Instant Slot Booking' };
      case 'calendar':
        return { title: 'Viewing Schedule', subtitle: 'Tour Bookings & Host Broker Availability' };
      case 'followup':
        return { title: 'Follow-up Cadence', subtitle: 'Multichannel Outbound Studio & Dispatch Stream' };
      case 'properties':
        return { title: 'Inventory Portfolio', subtitle: 'Architectural Specifications & Listing Knowledge' };
      case 'guide':
        return { title: 'System Tour', subtitle: 'Real-time Autonomous Real Estate Architecture' };
    }
  };

  const { title, subtitle } = getTabTitle();

  const handleSelectNav = (id: 'crm' | 'chat' | 'calendar' | 'followup' | 'properties' | 'guide') => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP PERSISTENT LEFT SIDEBAR                           */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 z-40 bg-[#0b0d13] border-r border-white/[0.08] flex-col justify-between">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.12] flex items-center justify-center text-[#dfc195] shadow-inner">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">EstateFlow</span>
                  <span className="text-[9px] font-mono font-semibold text-[#dfc195] bg-[#c8a97e]/10 border border-[#c8a97e]/25 px-1 py-0.2 rounded">
                    CRM
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Real Estate Agency OS</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400" title="Real-time synchronized">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
            <div>
              <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                Workspaces
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectNav(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer group ${
                        isActive
                          ? 'bg-zinc-800/90 text-white border border-white/[0.1] shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 transition-colors shrink-0 ${
                            isActive ? 'text-[#dfc195]' : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        />
                        <span className="truncate tracking-tight">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge !== undefined && (
                          <span
                            className={`font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              isActive
                                ? 'bg-[#c8a97e]/20 text-[#dfc195]'
                                : 'bg-zinc-850 text-zinc-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.liveDot && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Inbound Triggers Section */}
            <div>
              <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                Live Inbound Testing
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={onSimulateInboundLead}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#c8a97e]/10 hover:bg-[#c8a97e]/20 text-zinc-200 border border-[#c8a97e]/25 text-xs font-medium transition cursor-pointer text-left group"
                  title="Simulate high-intent buyer inquiring via WhatsApp"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#dfc195]" />
                    <span className="text-[11px] font-semibold text-[#dfc195]">Simulate Buyer</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#dfc195] opacity-75 group-hover:opacity-100" />
                </button>

                <button
                  onClick={onOpenWebhookSimulator}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] text-xs font-medium transition cursor-pointer text-left"
                  title="Test Twilio or Meta WhatsApp incoming webhook"
                >
                  <div className="flex items-center gap-2">
                    <Webhook className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px]">Webhook Test</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <a
                  href="/api/download-zip"
                  download="estateflow-ai-crm.zip"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.06] text-xs font-medium transition cursor-pointer text-left"
                  title="Export project zip"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[11px]">Export Project</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* User Account & Cloud Sync Footer */}
          <div className="p-3 border-t border-white/[0.08] bg-zinc-950/60 shrink-0">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-white/[0.08]">
                <div className="flex items-center gap-2 min-w-0">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Agent'}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#c8a97e] text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0">
                      {currentUser.displayName?.[0] || 'A'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-xs truncate">
                      {currentUser.displayName || 'Broker Agent'}
                    </p>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Firestore Synced
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  title="Sign out of Firebase"
                  className="p-1 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer"
                title="Sign in with Google to sync CRM data in real-time"
              >
                <LogIn className="w-3.5 h-3.5 text-[#dfc195]" />
                <span>Google Cloud Sync</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE DRAWER OVERLAY                                     */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0b0d13] border-r border-white/[0.08] flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.12] flex items-center justify-center text-[#dfc195]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">EstateFlow CRM</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectNav(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-zinc-800 text-white border border-white/[0.1]'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#dfc195]' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <button
                  onClick={() => {
                    onSimulateInboundLead();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#c8a97e] text-zinc-950 text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Buyer Lead</span>
                </button>

                <button
                  onClick={() => {
                    onOpenWebhookSimulator();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 text-xs font-medium"
                >
                  <Webhook className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Webhook Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TOPBAR (SPANS WORKSPACE, OFFSET BY SIDEBAR ON DESKTOP)    */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 w-full lg:pl-64 bg-[#090a0f]/95 border-b border-white/[0.08] backdrop-blur-xl">
        <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left Title & Mobile Toggle */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                {title}
              </h1>
              <p className="text-[11px] text-zinc-400 truncate hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right Live Ticker & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Ticker: Hot, Warm, Cold */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/90 border border-white/[0.06] text-xs">
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-zinc-300 hover:text-white transition font-medium cursor-pointer"
                title="View Hot leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-[11px] text-zinc-400">Hot</span>
                <span className="font-mono text-[11px] font-semibold text-rose-300">{hotCount}</span>
              </button>
              <div className="w-px h-3 bg-white/[0.08]" />
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-zinc-300 hover:text-white transition font-medium cursor-pointer"
                title="View Warm leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-[11px] text-zinc-400">Warm</span>
                <span className="font-mono text-[11px] font-semibold text-amber-300">{warmCount}</span>
              </button>
              <div className="w-px h-3 bg-white/[0.08]" />
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-zinc-300 hover:text-white transition font-medium cursor-pointer"
                title="View Cold leads in CRM"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[11px] text-zinc-400">Cold</span>
                <span className="font-mono text-[11px] font-semibold text-sky-300">{coldCount}</span>
              </button>
            </div>

            {/* Stale Alert Pill */}
            {staleCount > 0 && (
              <button
                onClick={() => setActiveTab('crm')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-medium transition cursor-pointer"
                title="Stale leads requiring agent outreach"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Attention:</span>
                <span className="font-mono font-bold">{staleCount}</span>
              </button>
            )}

            {/* AI Engine Status */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-300">
                {hasGeminiKey ? 'Gemini 3.8 Flash' : 'Simulated AI'}
              </span>
            </div>

            {/* Primary Action Button: Add Prospect */}
            {onOpenNewLeadModal && (
              <button
                onClick={onOpenNewLeadModal}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Add Prospect</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
